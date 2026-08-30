# ⚡ MarketPulse AI — Institutional Multi-Agent Quantitative Trading Platform

[![CI/CD Pipeline](https://github.com/raamizhussain/MarketPulse/actions/workflows/ci.yml/badge.svg)](https://github.com/raamizhussain/MarketPulse/actions)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/release/python-3110/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-black.svg)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MarketPulse AI transforms qualitative financial intelligence into high-conviction quantitative execution. By uniting **Gaussian Hidden Markov Models (HMM)** for probabilistic regime detection with a **LangGraph Multi-Agent Committee** (Bull, Bear, Judge personas), **FinBERT NLP**, and a **Zerodha Kite / Angel One Grade Real-Time Paper Brokerage Desk**, MarketPulse dynamically adapts capital allocation and shields portfolios against regime shifts.

---

## 🏛️ System Architecture

```
                                ┌────────────────────────┐
                                │ Live US & NSE Quotes   │
                                └───────────┬────────────┘
                                            │
                        ┌───────────────────▼───────────────────┐
                        │   Supabase Cloud / PostgreSQL Pool    │
                        └───────────────────┬───────────────────┘
                                            │
            ┌───────────────────────────────┼───────────────────────────────┐
            │                               │                               │
 ┌──────────▼──────────┐         ┌──────────▼──────────┐         ┌──────────▼──────────┐
 │ 3-State HMM Engine  │         │ FinBERT NLP Polarity│         │ ChromaDB Memory RAG │
 └──────────┬──────────┘         └──────────┬──────────┘         └──────────┬──────────┘
            │                               │                               │
            └───────────────────────────────┼───────────────────────────────┘
                                            │
                        ┌───────────────────▼───────────────────┐
                        │    LangGraph Multi-Agent Arena        │
                        │    (Bull vs Bear -> Judge Synthesis)  │
                        └───────────────────┬───────────────────┘
                                            │
            ┌───────────────────────────────┴───────────────────────────────┐
            │                                                               │
 ┌──────────▼───────────────────────────┐        ┌──────────────────────────▼──────────┐
 │ Real-Time Paper Brokerage Desk       │        │ React 18 / Tailwind Editorial UI    │
 │ (Angel One & Zerodha Kite Grade)     │        │ (Vercel Global Edge CDN)            │
 └──────────────────────────────────────┘        └─────────────────────────────────────┘
```

---

## 🚀 Key Platform Capabilities

### 1. 💼 Real-Time Paper Brokerage & Execution Desk
- **Angel One & Zerodha Kite Grade UI**: 3-column institutional terminal with live search and multi-market filtering (🇺🇸 US & 🇮🇳 NSE).
- **5-Level Bid/Ask Market Depth Ladder**: Real-time Level 2 order book streaming 5 buy vs 5 sell tiers with buyer/seller pressure ratio bars.
- **Product Types & Leverage**: Compounding with **CNC (Delivery)** or active day trading with **MIS (5x Leverage)**.
- **Live Demat Portfolio & Holdings**: Real-time unrealized P&L, day's returns, 1-click Average Up/Down, and Instant Square-Off.
- **Statutory Taxes & Charges**: Realistic deduction of STT, GST, SEBI turnover fees, and flat ₹20 brokerage.

### 2. 🧠 Multi-Agent Reasoning Committee (LangGraph)
- **Bull Persona**: Identifies breakout momentums, revenue acceleration, and bullish catalysts.
- **Bear Persona**: Stresses downside risks, elevated valuation multiples, and macro headwinds.
- **Chief Judge**: Retrieves historical analogues from ChromaDB and synthesizes an optimal trade thesis with Kelly Criterion sizing.

### 3. 📊 Gaussian HMM Market Regime Detection
- Probabilistically classifies market regimes into:
  - 🟢 **Quiet Bull**: Low volatility upward trends.
  - 🔴 **Turbulent Bear**: High volatility downward crashes.
  - 🟡 **Sideways Choppy**: Mean-reverting consolidations.

### 4. 🗄️ Pre-Trained Stock Model Warehouse
- Indexes 5,000+ US and Indian stocks with 5-year OHLCV backtests and pre-computed Markov parameters.
- Instant model blending (<50ms) for multi-asset strategies.

---

## 🛠️ Quickstart

### Local Development (FastAPI + React)

1. **Backend**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
   pip install -r requirements.txt
   cp .env.example .env      # Configure your environment secrets
   uvicorn marketpulse_api.main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ☁️ 1-Click Production Cloud Deployment

### 1. Database: Supabase (Cloud PostgreSQL)
- Create a free project at **[supabase.com](https://supabase.com)**.
- Copy your connection string: `postgresql://postgres.[REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### 2. Backend: Render / Railway
- Connect this GitHub repo (`raamizhussain/MarketPulse`).
- Environment variables:
  ```env
  DATABASE_URL=postgresql+asyncpg://postgres.[REF]:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
  SECRET_KEY=your-secure-random-64-char-jwt-secret-key
  GROQ_API_KEY=your_groq_api_key_here
  ENVIRONMENT=production
  ```

### 3. Frontend: Vercel
- Import repo on **[vercel.com](https://vercel.com)** $\to$ set Root Directory to `frontend`.
- Add Environment Variable:
  ```env
  VITE_API_URL=https://your-backend-api.onrender.com
  ```

---

## 🧪 Automated Testing

Run the full end-to-end quantitative test suite:

```bash
pytest tests/ -v
```

---

## ⚖️ Legal & Compliance
MarketPulse AI is built for educational, quantitative simulation, and research purposes. We are not a registered SEBI/SEC financial investment advisor. Paper trading accounts use virtual currency ($100k USD / ₹80L INR).
