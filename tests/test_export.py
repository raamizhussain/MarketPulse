import pytest
from httpx import AsyncClient, ASGITransport
from marketpulse_api.main import app


@pytest.mark.asyncio
async def test_exports():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@marketpulse.ai",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        strats_res = await ac.get("/api/v1/strategies", headers=headers)
        strat_id = strats_res.json()[0]["id"]

        # 1. Export CSV
        csv_res = await ac.get(f"/api/v1/export/trades?strategy_id={strat_id}", headers=headers)
        assert csv_res.status_code == 200
        assert "text/csv" in csv_res.headers.get("content-type", "")
        csv_text = csv_res.text
        assert "Trade ID" in csv_text
        assert "Execution Price" in csv_text

        # 2. Export HTML Report
        report_res = await ac.get(f"/api/v1/export/performance-report?strategy_id={strat_id}", headers=headers)
        assert report_res.status_code == 200
        assert "text/html" in report_res.headers.get("content-type", "")
        assert "MarketPulse AI" in report_res.text
