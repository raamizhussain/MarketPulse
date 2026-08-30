import pytest
from httpx import AsyncClient, ASGITransport
from marketpulse_api.main import app


@pytest.mark.asyncio
async def test_alerts_and_analytics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@marketpulse.ai",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Alert Rules
        rules_res = await ac.get("/api/v1/alerts/config", headers=headers)
        assert rules_res.status_code == 200
        assert len(rules_res.json()) >= 1

        # 2. Alert History
        history_res = await ac.get("/api/v1/alerts/history", headers=headers)
        assert history_res.status_code == 200
        alerts = history_res.json()
        assert len(alerts) >= 1

        # 3. Acknowledge Alert
        alert_id = alerts[0]["id"]
        ack_res = await ac.patch(f"/api/v1/alerts/{alert_id}/acknowledge", headers=headers)
        assert ack_res.status_code == 200
        assert ack_res.json()["is_acknowledged"] is True

        # 4. Correlation Matrix
        corr_res = await ac.get("/api/v1/analytics/correlation-matrix")
        assert corr_res.status_code == 200
        corr_data = corr_res.json()
        assert len(corr_data["symbols"]) >= 4
        assert len(corr_data["matrix"]) >= 4
