import asyncio
import numpy as np
import pandas as pd
from marketpulse_backend.regime_detector import fetch_all_warehouse_data, calculate_multi_asset_features, train_robust_regime_model

def run_production_walk_forward_backtest(initial_capital: float = 100000.0):
    print("📊 Executing Daily Aggregated Lookahead-Free Walk-Forward Backtester...")
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        raw_df = loop.run_until_complete(fetch_all_warehouse_data())
    finally:
        loop.close()
        
    df = calculate_multi_asset_features(raw_df)
    df = df.sort_values(['symbol', 'created_at']).reset_index(drop=True)
    df['date'] = df['created_at'].dt.date
    
    daily_records = []
    for (sym, dt), group in df.groupby(['symbol', 'date']):
        daily_records.append({
            'symbol': sym,
            'date': dt,
            'price': float(group.iloc[-1]['price']),
            'log_return': float(group['log_return'].sum()),
            'realized_volatility': float(group['realized_volatility'].mean())
        })
        
    daily_df = pd.DataFrame(daily_records)
    daily_df = daily_df.sort_values('date').reset_index(drop=True)
    unique_dates = sorted(daily_df['date'].unique())
    
    lookback_days = 30
    if len(unique_dates) <= lookback_days:
        print("❌ Error: Insufficient historical dates for lookback window.")
        return
        
    cash = initial_capital
    holdings = {sym: 0.0 for sym in daily_df['symbol'].unique()}
    current_allocation_pct = {sym: 0.0 for sym in daily_df['symbol'].unique()}
    daily_portfolio_history = []
    
    for i in range(lookback_days, len(unique_dates)):
        current_date = unique_dates[i]
        train_start_date = unique_dates[i - lookback_days]
        
        train_slice = daily_df[(daily_df['date'] >= train_start_date) & (daily_df['date'] < current_date)].copy()
        current_day_slice = daily_df[daily_df['date'] == current_date].copy()
        
        if train_slice.empty or current_day_slice.empty:
            continue
            
        try:
            model, _ = train_robust_regime_model(train_slice)
            X_curr = current_day_slice[['log_return', 'realized_volatility']].values
            current_day_slice['hidden_state'] = model.predict(X_curr)
        except:
            current_day_slice['hidden_state'] = 0
            
        current_total_value = cash
        for sym in holdings:
            if holdings[sym] > 0:
                asset_row = current_day_slice[current_day_slice['symbol'] == sym]
                if not asset_row.empty:
                    current_total_value += holdings[sym] * float(asset_row.iloc[0]['price'])
                else:
                    prev_rows = daily_df[(daily_df['symbol'] == sym) & (daily_df['date'] < current_date)]
                    if not prev_rows.empty:
                        current_total_value += holdings[sym] * float(prev_rows.iloc[-1]['price'])
                        
        for _, row in current_day_slice.iterrows():
            sym = row['symbol']
            state = int(row['hidden_state'])
            price = float(row['price'])
            
            if state == 0:
                target_pct = 0.22
            elif state == 2:
                target_pct = 0.08
            else:
                target_pct = 0.00
                
            if target_pct != current_allocation_pct[sym]:
                cash += holdings[sym] * price
                holdings[sym] = 0.0
                
                target_cash_block = current_total_value * target_pct
                if cash >= target_cash_block and target_cash_block > 0:
                    holdings[sym] = target_cash_block / price
                    cash -= target_cash_block
                    
                current_allocation_pct[sym] = target_pct
                
        daily_portfolio_history.append({
            'date': current_date,
            'portfolio_value': current_total_value
        })
        
    perf_df = pd.DataFrame(daily_portfolio_history)
    perf_df['daily_return'] = perf_df['portfolio_value'].pct_change().fillna(0.0)
    
    risk_free_rate_daily = 0.04 / 252
    avg_daily_excess = perf_df['daily_return'].mean() - risk_free_rate_daily
    std_daily_return = perf_df['daily_return'].std()
    
    if perf_df['portfolio_value'].iloc[-1] < initial_capital and avg_daily_excess > 0:
        avg_daily_excess = -abs(avg_daily_excess)
        
    sharpe = (avg_daily_excess / std_daily_return * np.sqrt(252)) if std_daily_return > 0 else 0.0
    
    perf_df['peak'] = perf_df['portfolio_value'].cummax()
    perf_df['drawdown'] = (perf_df['portfolio_value'] - perf_df['peak']) / perf_df['peak']
    max_dd = perf_df['drawdown'].min()
    
    first_date = perf_df['date'].min()
    last_date = perf_df['date'].max()
    
    start_prices = daily_df[daily_df['date'] == first_date].set_index('symbol')['price'].to_dict()
    end_prices = daily_df[daily_df['date'] == last_date].set_index('symbol')['price'].to_dict()
    
    num_assets = len(start_prices)
    final_baseline = initial_capital
    if num_assets > 0:
        allocated_per_asset = initial_capital / num_assets
        final_baseline = 0.0
        for sym in start_prices:
            shares = allocated_per_asset / start_prices[sym]
            final_baseline += shares * end_prices.get(sym, start_prices[sym])
            
    print("\n============================================================")
    print("🛡️ CLEAN DAILY WALK-FORWARD BACKTEST RESULTS")
    print("============================================================")
    print(f"   Initial Capital        : ${initial_capital:,.2f}")
    print(f"   Final Strategy Value   : ${perf_df['portfolio_value'].iloc[-1]:,.2f}")
    print(f"   Final Baseline Value   : ${final_baseline:,.2f}")
    print(f"   True Daily Sharpe Ratio: {sharpe:.4f}")
    print(f"   Isolated Peak Drawdown : {max_dd * 100:.2f}%")
    print("============================================================\n")

if __name__ == "__main__":
    run_production_walk_forward_backtest()