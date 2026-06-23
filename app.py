import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import asyncio
import asyncpg
from marketpulse_backend.regime_detector import (
    fetch_all_warehouse_data, 
    calculate_multi_asset_features, 
    train_robust_regime_model
)

# Set up page configurations for an enterprise-ready wide dashboard layout
st.set_page_config(
    page_title="MarketPulse AI | Quant Regime Command Core",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling for an institutional financial look
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
@st.cache_data(ttl=60)  # Cache data for 60 seconds to optimize DB connection load
def load_and_model_market_data():
    """Wrapper function to execute backend processing within Streamlit's sync context."""
    # Run our async database ingestion through a synchronous loop container
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        raw_df = loop.run_until_complete(fetch_all_warehouse_data())
    finally:
        loop.close()
        
    if raw_df.empty:
        return pd.DataFrame()
        
    # Pass data through our engineered features and trained fallback core
    processed_df = calculate_multi_asset_features(raw_df)
    _, final_df = train_robust_regime_model(processed_df)
    return final_df

# =====================================================================
# DASHBOARD HEADER & CONTROL STRUCTURES
# =====================================================================
st.title("📈 MarketPulse AI")
st.subheader("Institutional Multi-Asset Risk Regime Analytics Platform")
st.markdown("---")

with st.spinner("🔄 Querying PostgreSQL Warehouse & Synchronizing AI Models..."):
    data_matrix = load_and_model_market_data()

if data_matrix.empty:
    st.error("❌ Critical System Warning: Data Warehouse is empty! Ensure your stream_engine is running.")
    st.stop()

# SIDEBAR CONFIGURATION CONTROLS
st.sidebar.header("🛠️ Pipeline Configurations")
available_symbols = list(data_matrix['symbol'].unique())
selected_ticker = st.sidebar.selectbox("🎯 Target Financial Instrument", available_symbols, index=0)

# Filter the master matrix down to our chosen asset view
asset_view = data_matrix[data_matrix['symbol'] == selected_ticker].sort_values('created_at').copy()

# =====================================================================
# METRIC HIGHLIGHT TILES
# =====================================================================
latest_bar = asset_view.iloc[-1]
current_state = int(latest_bar['hidden_state'])
current_vol = float(latest_bar['realized_volatility'])

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(label=f"💰 {selected_ticker} Latest Price", value=f"${latest_bar['price']:.2f}")
with col2:
    state_label = "🔴 TURBULENT (High Risk)" if current_state == 1 else "🟢 STABLE (Low Risk)"
    st.metric(label="🧠 Active AI Market Regime", value=state_label)
with col3:
    st.metric(label="📊 Current Realized Volatility", value=f"{current_vol:.4f}")
with col4:
    total_bars_tracked = len(asset_view)
    st.metric(label="📥 Data Points In Cache", value=f"{total_bars_tracked:,}")

st.markdown("###")

# =====================================================================
# INTERACTIVE TIME-SERIES PLOTLY CHART
# =====================================================================
st.markdown(f"### 🕒 Real-Time Regime Overlay Chart for {selected_ticker}")

# Create a dual-axis subplotted chart: Price chart on top, Volatility profile on bottom
fig = make_subplots(
    rows=2, cols=1, 
    shared_xaxes=True, 
    vertical_spacing=0.08,
    row_heights=[0.7, 0.3]
)

# 💡 Trace 1: Draw the asset closing price trajectory line
fig.add_trace(
    go.Scatter(x=asset_view['created_at'], y=asset_view['price'], name="Asset Price", line=dict(color="#94a3b8", width=1.5)),
    row=1, col=1
)

# 💡 Trace 2: Color background bars dynamically to indicate the hidden regime states
# State 0 = Quiet (Light translucent blue), State 1 = Turbulent (Translucent crimson red)
colors = np.where(asset_view['hidden_state'] == 1, 'rgba(239, 68, 68, 0.2)', 'rgba(59, 130, 246, 0.03)')

fig.add_trace(
    go.Bar(
        x=asset_view['created_at'], 
        y=asset_view['price'], 
        marker=dict(color=colors.tolist(), line_width=0),
        hoverinfo='skip',
        showlegend=False
    ),
    row=1, col=1
)

# 💡 Trace 3: Add rolling volatility matrix tracing line on row 2
fig.add_trace(
    go.Scatter(x=asset_view['created_at'], y=asset_view['realized_volatility'], name="Realized Volatility", line=dict(color="#38bdf8", width=1.2)),
    row=2, col=1
)

# Fine-tune layout parameters for institutional aesthetics
fig.update_layout(
    template="plotly_dark",
    height=650,
    margin=dict(l=20, r=20, t=10, b=10),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    hovermode="x unified"
)

fig.update_yaxes(title_text="Price ($)", row=1, col=1)
fig.update_yaxes(title_text="Volatility Scale", row=2, col=1)

st.plotly_chart(fig, use_container_width=True)

# =====================================================================
# HISTORIC METRIC DATAFRAME BLOCK
# =====================================================================
st.markdown("### 📋 Historic Timeline Records Cached")
st.dataframe(
    asset_view[['created_at', 'price', 'log_return', 'realized_volatility', 'hidden_state']]
    .tail(100)
    .sort_values('created_at', ascending=False),
    use_container_width=True
)