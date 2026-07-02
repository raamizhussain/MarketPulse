import streamlit as tf
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime
from marketpulse_backend.regime_detector import fetch_all_warehouse_data, calculate_multi_asset_features, train_robust_regime_model
from marketpulse_backend.sentiment_analyzer import fetch_ticker_news_sentiment_sync
from marketpulse_backend.multi_agent_core import run_multi_agent_pipeline

tf.set_page_config(page_title="MarketPulse AI", layout="wide")

tf.title("📈 MarketPulse AI: Institutional Quantitative Dashboard")
tf.markdown("---")

@tf.cache_data(ttl=300)
def load_ui_data():
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        raw = loop.run_until_complete(fetch_all_warehouse_data())
    finally:
        loop.close()
    proc = calculate_multi_asset_features(raw)
    model, final_df = train_robust_regime_model(proc)
    return final_df

def calculate_dynamic_backtest_metrics(df_full: pd.DataFrame, target_symbol: str, initial_capital: float = 100000.0):
    df_asset = df_full[df_full['symbol'] == target_symbol].copy()
    df_asset = df_asset.sort_values('created_at').reset_index(drop=True)
    df_asset['date'] = df_asset['created_at'].dt.date
    
    daily_records = []
    for dt, group in df_asset.groupby('date'):
        daily_records.append({
            'date': dt,
            'price': float(group.iloc[-1]['price']),
            'log_return': float(group['log_return'].sum()),
            'realized_volatility': float(group['realized_volatility'].mean()),
            'hidden_state': int(group.iloc[-1]['hidden_state'])
        })
    daily_df = pd.DataFrame(daily_records)
    
    cash = initial_capital
    shares = 0.0
    allocation_pct = 0.0
    history = []
    
    for idx, row in daily_df.iterrows():
        price = row['price']
        state = int(row['hidden_state'])
        current_val = cash + (shares * price)
        
        if state == 0:
            target_pct = 0.85
        elif state == 2:
            target_pct = 0.30
        else:
            target_pct = 0.0
            
        if target_pct != allocation_pct:
            cash += shares * price
            shares = 0.0
            target_block = current_val * target_pct
            if cash >= target_block and target_block > 0:
                shares = target_block / price
                cash -= target_block
            allocation_pct = target_pct
            
        history.append(cash + (shares * price))
        
    daily_df['portfolio_value'] = history
    daily_df['daily_return'] = daily_df['portfolio_value'].pct_change().fillna(0.0)
    
    rf_daily = 0.04 / 252
    excess = daily_df['daily_return'].mean() - rf_daily
    std_ret = daily_df['daily_return'].std()
    
    final_strat = daily_df['portfolio_value'].iloc[-1] if not daily_df.empty else initial_capital
    if final_strat < initial_capital and excess > 0:
        excess = -abs(excess)
        
    sharpe = (excess / std_ret * np.sqrt(252)) if std_ret > 0 else 0.0
    
    daily_df['peak'] = daily_df['portfolio_value'].cummax()
    daily_df['drawdown'] = (daily_df['portfolio_value'] - daily_df['peak']) / daily_df['peak']
    max_dd = daily_df['drawdown'].min() if not daily_df.empty else 0.0
    
    start_p = daily_df['price'].iloc[0] if not daily_df.empty else 1.0
    end_p = daily_df['price'].iloc[-1] if not daily_df.empty else 1.0
    final_base = (initial_capital / start_p) * end_p
    
    return final_strat, final_base, sharpe, max_dd

try:
    data_df = load_ui_data()
    
    col1, col2 = tf.columns([1, 3])
    
    with col1:
        tf.header("⚙️ Control Panel")
        symbols = sorted(data_df['symbol'].unique())
        selected_sym = tf.selectbox("Select Target Asset", symbols, index=0)
        
        sym_df = data_df[data_df['symbol'] == selected_sym].sort_values('created_at')
        latest_row = sym_df.iloc[-1]
        
        tf.metric("Active Price", f"${latest_row['price']:.2f}")
        
        state_map = {0: "Quiet Bull (🟢)", 1: "Turbulent Bear (🔴)", 2: "Sideways Choppy (🟡)"}
        tf.metric("Inferred HMM Regime", state_map[int(latest_row['hidden_state'])])
        
        tf.markdown("---")
        tf.subheader("⚖️ Multi-Agent Advisory")
        
        if tf.button("Trigger LangGraph Committee Debate"):
            with tf.spinner("Orchestrating adversarial agent node vectors via Groq..."):
                try:
                    news_df = fetch_ticker_news_sentiment_sync(selected_sym, days_back=3)
                except Exception as ex:
                    tf.warning(f"News sentiment unavailable. Details: {ex}")
                    news_df = pd.DataFrame(columns=["sentiment"])
                    
                if not news_df.empty and "sentiment" in news_df.columns:
                    sentiment_values = pd.to_numeric(news_df["sentiment"], errors="coerce").dropna()
                    avg_sent = float(sentiment_values.mean()) if not sentiment_values.empty else 0.0
                else:
                    avg_sent = 0.0
                
                agent_inputs = {
                    "symbol": selected_sym,
                    "price": float(latest_row['price']),
                    "log_return": float(latest_row['log_return']),
                    "volatility": float(latest_row['realized_volatility']),
                    "regime_state": int(latest_row['hidden_state']),
                    "sentiment_score": float(avg_sent),
                    "bull_argument": "",
                    "bear_argument": "",
                    "final_judgment": ""
                }
                
                result = run_multi_agent_pipeline(agent_inputs)
                tf.text_area("Committee Judgment", result.get('final_judgment', 'Committee completed without a final judgment.'), height=350)
                
    with col2:
        tf.header("📊 Analytical Timeline & Structural Overlay")
        
        fig = go.Figure()
        colors = {0: 'rgba(0, 200, 100, 0.15)', 1: 'rgba(255, 50, 50, 0.15)', 2: 'rgba(255, 200, 0, 0.15)'}
        
        fig.add_trace(go.Scatter(
            x=sym_df['created_at'], y=sym_df['price'],
            mode='lines', name='Asset Price', line=dict(color='#1f77b4', width=2)
        ))
        
        for state in [0, 1, 2]:
            state_mask = sym_df['hidden_state'] == state
            if state_mask.any():
                fig.add_trace(go.Scatter(
                    x=sym_df.loc[state_mask, 'created_at'],
                    y=sym_df.loc[state_mask, 'price'],
                    mode='markers',
                    name=state_map[state],
                    marker=dict(size=4, color=colors[state].replace('0.15', '1.0')),
                    opacity=0.6
                ))
                
        fig.update_layout(
            template="plotly_dark",
            xaxis_title="Timeline",
            yaxis_title="Price ($)",
            margin=dict(l=20, r=20, t=40, b=20),
            height=500,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        tf.plotly_chart(fig, use_container_width=True)
        
        strat_val, base_val, strat_sharpe, strat_dd = calculate_dynamic_backtest_metrics(data_df, selected_sym)
        strat_perf = ((strat_val - 100000.0) / 100000.0) * 100.0
        base_perf = ((base_val - 100000.0) / 100000.0) * 100.0
        
        tf.subheader("🛡️ Backtester Performance Baseline Validation")
        b1, b2, b3, b4 = tf.columns(4)
        b1.metric("Strategy Value", f"${strat_val:,.2f}", f"{strat_perf:+.2f}%")
        b2.metric("Baseline Value", f"${base_val:,.2f}", f"{base_perf:+.2f}%")
        b3.metric("Daily Sharpe Ratio", f"{strat_sharpe:.4f}")
        b4.metric("Max Peak Drawdown", f"{strat_dd * 100.0:.2f}%", "Protected" if strat_dd > -0.20 else "High Risk")

except Exception as ex:
    tf.error(f"Failed to load visual workspace context: {ex}")