import pytest
from httpx import AsyncClient, ASGITransport
from marketpulse_api.main import app


@pytest.mark.asyncio
async def test_agent_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Latest Recommendation
        rec_res = await ac.get("/api/v1/agents/latest-recommendation?symbol=NVDA")
        assert rec_res.status_code == 200
        rec = rec_res.json()
        assert rec["symbol"] == "NVDA"
        assert len(rec["bull_argument"]) > 0
        assert len(rec["bear_argument"]) > 0
        assert rec["recommendation_label"] in ["BUY", "SELL", "HOLD", "CASH"]
        assert 0.0 <= rec["confidence"] <= 1.0

        # 2. Agent Stats
        stats_res = await ac.get("/api/v1/agents/agent-stats")
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["bull_accuracy"] > 0.5
        assert stats["bear_accuracy"] > 0.5
        assert stats["judge_accuracy"] > 0.5
        assert len(stats["agents"]) == 3
