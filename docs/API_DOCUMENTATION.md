# MarketPulse AI - OpenAPI & WebSocket Specification

## 1. Overview & Base URLs
MarketPulse AI provides high-performance REST and real-time WebSocket endpoints for institutional quantitative trading, multi-agent committee debate streaming, and HMM regime intelligence.

- **REST API Base URL:** `http://localhost:8000/api/v1` (or `https://api.marketpulse.ai/api/v1`)
- **Interactive Swagger UI:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`
- **WebSocket Gateway:** `ws://localhost:8000/ws`

---

## 2. Authentication & Authorization

All authenticated requests require a Bearer token or programmatic API Key header:

### Bearer Token
```http
Authorization: Bearer <jwt_access_token>
```

### Programmatic API Key Header
```http
X-API-Key: mp_live_abc123...
```

### Endpoints:
- `POST /api/v1/auth/register`: Create a new user account.
- `POST /api/v1/auth/login`: Authenticate and receive `access_token` and `refresh_token`.
- `POST /api/v1/auth/refresh`: Exchange a valid refresh token for a new access token.
- `GET /api/v1/auth/me`: Get current authenticated user profile and subscription tier.
- `POST /api/v1/auth/api-keys`: Generate a new programmatic API key.
- `GET /api/v1/auth/api-keys`: List active API keys for the current user.
- `DELETE /api/v1/auth/api-keys/{key_id}`: Revoke an API key.

---

## 3. Market Intelligence & HMM Regimes

### `GET /api/v1/market/current-regime`
Returns the current HMM regime classification for the requested ticker.
- **Query Params:** `symbol` (e.g. `AAPL`, `NVDA`, `TSLA`, `MSFT`)
- **Response Format:**
```json
{
  "symbol": "AAPL",
  "regime": "Quiet Bull",
  "regime_state": 0,
  "regime_name": "Quiet Bull",
  "confidence": 0.88,
  "volatility": 0.00142,
  "log_return": 0.0034,
  "price": 242.85,
  "timestamp": "2026-08-29T14:30:00Z"
}
```

### `GET /api/v1/market/sentiment/{symbol}`
Returns FinBERT NLP news sentiment polarity and aggregated article count.

### `GET /api/v1/market/price-history`
Returns historical OHLCV bars with synchronized HMM regime state classifications.
- **Query Params:** `symbol`, `period` (`1d`, `7d`, `30d`, `90d`, `1y`)

### `GET /api/v1/market/tickers`
Returns market overview cards for all supported core ticker assets.

---

## 4. Multi-Agent Reasoning Committee

### `GET /api/v1/agents/latest-recommendation`
Triggers or retrieves the latest LangGraph Bull-Bear-Judge consensus debate.
- **Query Params:** `symbol`
- **Response Format:**
```json
{
  "symbol": "NVDA",
  "bull_argument": "Exponential Blackwell GPU demand and datacenter revenue expansion...",
  "bear_argument": "Short-term valuation multiple compression and supply chain risks...",
  "historical_analogues": [
    "Historical analogue: Previous regime transition at log return +0.12% resulted in mean-reversion within 5 periods."
  ],
  "judge_synthesis": "Balanced quantitative synthesis indicates accumulation...",
  "recommendation_label": "BUY",
  "confidence": 0.84,
  "disagreement_score": 0.32,
  "suggested_allocation_pct": 24.5,
  "timestamp": "2026-08-29T14:30:00Z"
}
```

### `GET /api/v1/agents/agent-stats`
Returns historical predictive win rates and accuracy metrics for the Bull, Bear, and Judge agent nodes.

---

## 5. Quantitative Strategies & Kelly Sizing

- `GET /api/v1/strategies`: List all strategies deployed by current user.
- `POST /api/v1/strategies`: Deploy a new algorithmic strategy.
- `GET /api/v1/strategies/{id}`: Retrieve strategy parameters.
- `PATCH /api/v1/strategies/{id}`: Update strategy status (`is_active: false` to pause).
- `DELETE /api/v1/strategies/{id}`: Archive strategy.
- `GET /api/v1/strategies/{id}/performance`: Walk-forward quantitative metrics (Sharpe, Sortino, Win Rate, Max Drawdown).
- `GET /api/v1/strategies/{id}/trades`: Executed trade audit log.
- `GET /api/v1/strategies/{id}/equity-curve`: Daily backtest portfolio valuation time series.

---

## 6. Risk Engine & Alerts

- `GET /api/v1/alerts/config`: Get configured risk alert rules.
- `POST /api/v1/alerts/config`: Arm a new alert trigger rule.
- `DELETE /api/v1/alerts/config/{id}`: Delete an alert rule.
- `GET /api/v1/alerts/history`: Active notification feed.
- `PATCH /api/v1/alerts/{id}/acknowledge`: Mark notification as acknowledged.
- `GET /api/v1/analytics/correlation-matrix`: Cross-asset Pearson correlation matrix and concentration warnings.

---

## 7. Data Exports

- `GET /api/v1/export/trades?strategy_id={id}`: Export full trade ledger to CSV format.
- `GET /api/v1/export/performance-report?strategy_id={id}`: Download printable institutional executive HTML tear sheet.

---

## 8. WebSockets Live Streaming

MarketPulse provides three dedicated real-time WebSocket channels:

1. **Market Data Stream:** `/ws/market-data`
   - Real-time tick updates, price jumps, and micro-regime transitions.
2. **Agent Updates Stream:** `/ws/agent-updates`
   - Real-time Bull/Bear/Judge debate arguments as LangGraph nodes execute.
3. **Portfolio Updates Stream:** `/ws/portfolio-updates`
   - Real-time Kelly position sizing rebalances, trade fills, and drawdown threshold warnings.
