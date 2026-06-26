import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import asyncio
from marketpulse_backend.regime_detector import (
    fetch_all_warehouse_data, 
    calculate_multi_asset_features, 
    train_robust_regime_model
)
# 💡 Import our brand new live sentiment extraction function!
from marketpulse_backend.sentiment_analyzer import fetch_ticker_news_sentiment

st.set_page_config(
    page_title="MarketPulse AI | Quant Regime Command Core",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling for an institutional layout
st.markdown("""
    <style>
    .main { background-color: #0e1117; color: #ffffff; }
    div.stButton > button:first-child {
        background-color: #3498db; color: white; border-radius: 4px;
    }
    .reportview-container .main .block-container{ padding-top: 1rem; }
    </style>
""", unsafe_allow_html=True)

# =====================================================================
# DATA SYNCHRONIZATION PIPELINE LAYER
# =====================================================================
@st.cache_data(ttl=60)
def load_and_model_market_data():
    """Extracts rows from PostgreSQL and processes the HMM regimes synchronously."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        raw_df = loop.run_until_complete(fetch_all_warehouse_data())
    finally:
        loop.close()
        
    if raw_df.empty:
        return pd.DataFrame()
        
    processed_df = calculate_multi_asset_features(raw_df)
    _, final_df = train_robust_regime_model(processed_df)
    return final_df

@st.cache_data(ttl=300) # Cache news for 5 minutes to remain respectful of API bounds
def load_live_sentiment(symbol: str):
    """Fetches real-time financial sentiment records via Alpaca News Wire."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        news_df = loop.run_until_complete(fetch_ticker_news_sentiment(symbol, days_back=7))
    finally:
        loop.close()
    return news_df

# =====================================================================
# DASHBOARD CONTROLS & SIDEBAR
# =====================================================================
st.title("📈 MarketPulse AI")
st.subheader("Multi-Modal Quant Regime Core & Sentiment Analytics Platform")
st.markdown("---")

with st.spinner("🔄 Querying PostgreSQL Warehouse & Calibrating Market Models..."):
    data_matrix = load_and_model_market_data()

if data_matrix.empty:
    st.error("❌ Critical System Warning: Data Warehouse is empty!")
    st.stop()

st.sidebar.header("🛠️ Pipeline Configurations")
available_symbols = list(data_matrix['symbol'].unique())
selected_ticker = st.sidebar.selectbox("🎯 Target Financial Instrument", available_symbols, index=0)

# Filter database rows for the selected asset view
asset_view = data_matrix[data_matrix['symbol'] == selected_ticker].sort_values('created_at').copy()

# Pull live wire reports concurrently for our asset selection
news_view = load_live_sentiment(selected_ticker)

# =====================================================================
# METRIC HIGHLIGHT TILES
# =====================================================================
latest_bar = asset_view.iloc[-1]
current_state = int(latest_bar['hidden_state'])
current_vol = float(latest_bar['realized_volatility'])

# Calculate the recent average media mood score
avg_mood = news_view['sentiment'].mean() if not news_view.empty else 0.0

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric(label=f"💰 {selected_ticker} Latest Close", value=f"${latest_bar['price']:.2f}")
with col2:
    state_label = "🔴 TURBULENT (High Risk)" if current_state == 1 else "🟢 STABLE (Low Risk)"
    st.metric(label="🧠 Active AI Market Regime", value=state_label)
with col3:
    st.metric(label="📊 Current Realized Volatility", value=f"{current_vol:.4f}")
with col4:
    if avg_mood > 0.05:
        mood_txt = f" BULLISH ({avg_mood:+.2f})"
    elif avg_mood < -0.05:
        mood_txt = f" BEARISH ({avg_mood:+.2f})"
    else:
        mood_txt = f" NEUTRAL ({avg_mood:+.2f})"
    st.metric(label="📰 Media Sentiment Score", value=mood_txt)

st.markdown("###")

# =====================================================================
# TIME-SERIES INTERACTIVE PLOTLY CHART
# =====================================================================
st.markdown(f"### 🕒 Real-Time Regime Overlay Chart for {selected_ticker}")

fig = make_subplots(rows=2, cols=1, shared_xaxes=True, vertical_spacing=0.08, row_heights=[0.7, 0.3])

fig.add_trace(go.Scatter(x=asset_view['created_at'], y=asset_view['price'], name="Asset Price", line=dict(color="#94a3b8", width=1.5)), row=1, col=1)

# Highlights states dynamically (Red = Crisis environment, Translucent Blue = Normal)
colors = np.where(asset_view['hidden_state'] == 1, 'rgba(239, 68, 68, 0.2)', 'rgba(59, 130, 246, 0.03)')
fig.add_trace(go.Bar(x=asset_view['created_at'], y=asset_view['price'], marker=dict(color=colors.tolist(), line_width=0), hoverinfo='skip', showlegend=False), row=1, col=1)

fig.add_trace(go.Scatter(x=asset_view['created_at'], y=asset_view['realized_volatility'], name="Realized Volatility", line=dict(color="#38bdf8", width=1.2)), row=2, col=1)

fig.update_layout(template="plotly_dark", height=600, margin=dict(l=20, r=20, t=10, b=10), legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1), hovermode="x unified")
fig.update_yaxes(title_text="Price ($)", row=1, col=1)
fig.update_yaxes(title_text="Volatility Scale", row=2, col=1)

st.plotly_chart(fig, use_container_width=True)

# =====================================================================
# LOWER SECTION: SPLIT SCREEN (HISTORIC TIMELINE VS LIVE MEDIA WIRE)
# =====================================================================
col_left, col_right = st.columns(2)

with col_left:
    st.markdown("### 📋 Historic Timeline Records Cached")
    st.dataframe(
        asset_view[['created_at', 'price', 'log_return', 'realized_volatility', 'hidden_state']]
        .tail(50)
        .sort_values('created_at', ascending=False),
        use_container_width=True,
        height=400
    )

with col_right:
    st.markdown(f"### 📰 Breaking {selected_ticker} News Wire & Sentiment Analytics")
    if news_view.empty:
        st.info("No recent news logs available for this ticker block.")
    else:
        # Loop through headlines and style them based on whether they are positive or negative
        for _, row in news_view.head(10).iterrows():
            score = row['sentiment']
            if score > 0.1:
                badge = f"🟢 **Bullish ({score:+.2f})**"
            elif score < -0.1:
                badge = f"🔴 **Bearish ({score:+.2f})**"
            else:
                badge = f"⚪ **Neutral ({score:+.2f})**"
                
            st.markdown(f"⏱️ *{row['created_at'].strftime('%Y-%m-%d %H:%M')}* | {badge}")
            st.markdown(f"📢 **{row['headline']}** *(Source: {row['source']})*")
            st.markdown("---")