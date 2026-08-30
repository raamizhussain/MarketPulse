# ⚡ MarketPulse AI — Institutional Multi-Agent Trading Intelligence Platform

[![CI/CD Pipeline](https://github.com/raamizhussain/MarketPulse/actions/workflows/ci.yml/badge.svg)](https://github.com/raamizhussain/MarketPulse/actions)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/release/python-3110/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MarketPulse AI transforms qualitative financial intelligence into high-conviction quantitative execution. By uniting **Gaussian Hidden Markov Models (HMM)** for probabilistic regime detection with a **LangGraph Multi-Agent Committee** (Bull, Bear, Judge personas) and **FinBERT NLP**, MarketPulse dynamically adapts position sizing via the **Kelly Criterion** and shields portfolios against regime collapse.

---

## 🏛️ Platform Architecture

```
                               ┌────────────────────────┐
                               │  Alpaca Realtime Feed  │
                               └───────────┬────────────┘
                                           │
                        ┌──────────────────▼──────────────────┐
                        │   PostgreSQL / Timescale Partition  │
                        └──────────────────┬──────────────────┘
                                           │
            ┌──────────────────────────────┼──────────────────────────────┐
            │                              │                              │
 ┌──────────▼──────────┐        ┌──────────▼──────────┐        ┌──────────▼──────────┐
 │  3-State HMM Engine │        │ FinBERT NLP Polarity│        │ ChromaDB Vector RAG │
 └──────────┬──────────┘        └──────────┬──────────┘        └──────────┬──────────┘
            │                              │                              │
            └──────────────────────────────┼──────────────────────────────┘
                                           │
                        ┌──────────────────▼──────────────────┐
                        │   LangGraph Multi-Agent Committee   │
                        │    (Bull vs Bear -> Judge Node)     │
                        └──────────────────┬──────────────────┘
                                           │
                        ┌──────────────────▼──────────────────┐
                        │   Kelly Criterion Position Sizer    │
                        └──────────────────┬──────────────────┘
                                           │
            ┌──────────────────────────────┴──────────────────────────────┐
            │                                                             │
 ┌──────────▼──────────┐                                       ┌──────────▼──────────┐
 │ FastAPI REST & WS   │                                       │ React 18 Institutional│
 │   Microservice API  │                                       │   Terminal Dashboard │
 └─────────────────────┘                                       └─────────────────────┘
```

---

## 🚀 Key Features

- **Gaussian HMM Regime Detection:** Classifies market dynamics in real-time into *Quiet Bull (🟢)*, *Turbulent Bear (🔴)*, and *Sideways Choppy (🟡)* states with transition matrices.
- **Multi-Agent Consensus Arena:** LLM agents (Bull Persona & Bear Persona) engage in structured debate, synthesizing historical analogues from ChromaDB and FinBERT sentiment into a final recommendation by the Judge node.
- **Kelly Criterion Dynamic Sizing:** Optimizes capital allocation dynamically across conservative, moderate, and aggressive risk profiles.
- **Walk-Forward Strategy Backtesting:** Validates models with realistic transaction costs, slippage, Sharpe ratios, Sortino ratios, and peak-to-trough drawdown limits.
- **Multi-Strategy Portfolio Manager:** Concurrently deploys, balances, and monitors multiple algorithmic strategies across asset baskets with concentration guardrails.
- **Risk Intelligence & Active Alerts:** Configurable real-time triggers for regime shifts, news sentiment drops, and drawdown breaches, paired with cross-asset correlation heatmaps.
- **Developer API & Webhooks:** Programmatic `mp_live_...` API keys and Slack/Discord webhook dispatchers for algorithmic integration.
- **Institutional Reporting:** Instant 1-click CSV trade exports and executive HTML tear sheet reports.

---

## 🛠️ Quickstart

### Running with Docker Compose (Recommended)

```bash
docker-compose up --build
```

Access the application:
- **Web Terminal:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 1-Click Demo Credentials:
- **Institutional Trader:** `demo@marketpulse.ai` / `password123`
- **Retail Trader:** `retail@marketpulse.ai` / `password123`
- **System Administrator:** `admin@marketpulse.ai` / `password123`

---

## 🧪 Automated Testing

MarketPulse includes an end-to-end automated test suite covering authentication, market regimes, agent debates, Kelly sizing, and export generation:

```bash
pytest tests/ -v
```

---

## 📚 Documentation Links
- [OpenAPI & WebSocket Specification](docs/API_DOCUMENTATION.md)
- [Institutional User Guide](docs/USER_GUIDE.md)
- [Architecture & Deployment Manual](docs/ARCHITECTURE_AND_DEPLOYMENT.md)
