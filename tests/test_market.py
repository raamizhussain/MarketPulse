import pytest
from httpx import AsyncClient, ASGITransport
from marketpulse_api.main import app


@pytest.mark.asyncio
async def test_market_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Current Regime
        regime_res = await ac.get("/api/v1/market/current-regime?symbol=AAPL")
        assert regime_res.status_code == 200
        reg_data = regime_res.json()
        assert reg_data["symbol"] == "AAPL"
        assert reg_data["regime_state"] in [0, 1, 2]
        assert "regime_name" in reg_data

        # 2. Sentiment
        sent_res = await ac.get("/api/v1/market/sentiment/AAPL")
        assert sent_res.status_code == 200
        sent_data = sent_res.json()
        assert -1.0 <= sent_data["sentiment_score"] <= 1.0
        assert sent_data["sentiment_label"] in ["bullish", "bearish", "neutral"]

        # 3. Price History
        hist_res = await ac.get("/api/v1/market/price-history?symbol=AAPL&period=30d")
        assert hist_res.status_code == 200
        hist_data = hist_res.json()
        assert hist_data["count"] > 0
        assert len(hist_data["data"]) > 0

        # 4. Tickers Overview
        tickers_res = await ac.get("/api/v1/market/tickers")
        assert tickers_res.status_code == 200
        assert len(tickers_res.json()) >= 4
