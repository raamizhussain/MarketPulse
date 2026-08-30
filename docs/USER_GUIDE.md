# MarketPulse AI - Institutional User Guide & Operations Manual

## Welcome to MarketPulse AI
MarketPulse is a production-grade multi-agent quantitative intelligence and trading execution system that dynamically identifies market regimes using Gaussian Hidden Markov Models (HMM) and orchestrates LLM agent committees (Bull, Bear, and Judge) to provide actionable trading signals and portfolio risk management.

---

## 1. Authentication & Role-Based Access

MarketPulse features institutional-grade authentication with RBAC (Role-Based Access Control):

- **Institutional Trader:** Full multi-agent consensus, automated Kelly sizing, high-frequency walk-forward simulation, live WebSocket streaming, CSV/HTML exports.
- **Retail Trader:** Core regime intelligence, FinBERT sentiment feed, walk-forward backtest simulations.
- **System Admin / Staff:** Infrastructure health diagnostics, quantitative model telemetry, user tenancy controls.

> **Quick Demo Sign-In:** On the login page, click any of the 1-click quick login buttons to immediately access pre-seeded demo accounts.

---

## 2. Terminal Navigation & Interface Overview

### A. Live Market & Multi-Agent Dashboard (`/`)
- **Regime Banner:** Displays the current active regime (Quiet Bull 🟢, Turbulent Bear 🔴, Sideways Choppy 🟡) along with model confidence and realized volatility.
- **Interactive Price Chart:** High-resolution SVG candlestick/line price chart with color-coded HMM regime bands.
- **FinBERT News Feed:** Real-time sentiment analysis scored from -1.0 to +1.0 for each breaking financial news headline.
- **Multi-Agent Consensus Arena:** Real-time side-by-side LangGraph debate between the **Bull Persona** (growth catalysts) and **Bear Persona** (macro headwinds), synthesized by the **Judge Node** into a final trade action and Kelly-optimal allocation %.

---

### B. Strategy Backtesting & Quantitative Audit (`/strategy`)
- **Walk-Forward Performance Metrics:** Cumulative Return %, Annualized Sharpe Ratio, Sortino Ratio, Win Rate %, Maximum Peak-to-Trough Drawdown.
- **Comparative Equity Curve:** Real-time SVG chart showing the MarketPulse Adaptive Strategy outperforming the Buy & Hold baseline.
- **Trade Execution Ledger:** Transparent chronological audit trail with entry price, exit price, PnL %, HMM regime, and multi-agent reasoning summary.
- **One-Click Exports:**
  - **Export CSV:** Downloads complete structured trade data for Excel / Python analysis.
  - **Download Tear Sheet:** Generates an executive printable HTML report with quantitative tear sheets.

---

### C. Multi-Strategy Portfolio Manager (`/multi-strategy`)
- **Concurrent Strategy Deployment:** Create and run independent quantitative strategies across custom asset baskets.
- **Allocation Budget Bar:** Live tracking of aggregate portfolio allocation with concentration alerts if total allocation exceeds 100%.
- **Lifecycle Controls:** Instant pause, resume, and archive controls for individual automated models.

---

### D. Risk Intelligence & Safety Alerts (`/risk-alerts`)
- **Configurable Risk Rules:** Set automated alert triggers for:
  - Market regime transitions into Turbulent Bear (🔴).
  - FinBERT news panic drops (&lt; -0.3).
  - Maximum drawdown threshold breaches.
  - Low Judge confidence scores (&lt; 60%).
- **Active Notifications Feed:** Real-time stream with 1-click acknowledgment.
- **Cross-Asset Correlation Heatmap:** Matrix displaying pairwise Pearson correlations to identify portfolio concentration risks.

---

### E. Historical Analysis & Model Calibration (`/historical`)
- **Performance Attribution by Regime:** Empirical Sharpe ratios and alpha returns across Bull, Bear, and Sideways regimes.
- **Regime Duration & Persistence:** Average days spent in each regime and longest streak statistics.
- **HMM Transition Probability Matrix:** Visualizes the Markov state transition matrix ($A_{ij}$).
- **Agent Calibration Tracker:** Individual win rates and historical accuracy for Bull, Bear, and Judge nodes.

---

### F. Developer API & Security Settings (`/settings`)
- **Programmatic API Keys:** Create `mp_live_...` API keys for algorithmic trading integrations via Python scripts or automated bots.
- **Webhook Dispatcher:** Configure Slack / Discord webhook URLs to receive instant trade notifications and regime shift alerts.
- **Subscription Tier Overview:** View active SaaS tier features and limits.

---

### G. Staff Administration & Telemetry (`/admin`)
*(Visible to Admin users only)*
- **Infrastructure Status:** Uptime counter, API error rates, data warehouse synchronization lag.
- **Quantitative Model Telemetry:** HMM convergence status, FinBERT latency ms, Groq LLM roundtrip ms, ChromaDB vectors indexed.
- **User Directory:** Account management, active strategy counts, and role assignment.
