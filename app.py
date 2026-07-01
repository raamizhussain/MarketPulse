import streamlit as tf
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime
from marketpulse_backend.regime_detector import fetch_all_warehouse_data, calculate_multi_asset_features, train_robust_regime_model
from marketpulse_backend.sentiment_analyzer import fetch_ticker_news_sentiment
from marketpulse_backend.multi_agent_core import run_multi_agent_pipeline

tf.set_page_config(page_title="MarketPulse AI", layout="wide")

tf.title("📈 MarketPulse AI: Institutional Quantitative Dashboard")
tf.markdown("---")

@tf.cache_data(ttl=60)
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
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                try:
                    news_df = loop.run_until_complete(fetch_ticker_news_sentiment(selected_sym, days_back=3))
                finally:
                    loop.close()
                    
                avg_sent = news_df['sentiment'].mean() if not news_df.empty else 0.0
                
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
                tf.text_area("Committee Judgment", result['final_judgment'], height=350)
                
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
        
        tf.subheader("🛡️ Backtester Performance Baseline Validation")
        b1, b2, b3, b4 = tf.columns(4)
        b1.metric("Strategy Value", "$104,505.37", "+4.51%")
        b2.metric("Baseline Value", "$116,485.65", "+16.49%")
        b3.metric("Daily Sharpe Ratio", "0.1505")
        b4.metric("Max Peak Drawdown", "-12.83%", "Protected")

except Exception as ex:
    tf.error(f"Failed to load visual workspace context: {ex}")