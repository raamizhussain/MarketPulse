import pytest
from httpx import AsyncClient, ASGITransport
from marketpulse_api.main import app


@pytest.mark.asyncio
async def test_auth_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Root & Health
        res = await ac.get("/")
        assert res.status_code == 200
        assert res.json()["status"] == "operational"

        # 2. Login with demo user
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@marketpulse.ai",
            "password": "password123"
        })
        assert login_res.status_code == 200
        tokens = login_res.json()
        assert "access_token" in tokens
        assert "refresh_token" in tokens

        token = tokens["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Get profile /me
        me_res = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        profile = me_res.json()
        assert profile["email"] == "demo@marketpulse.ai"

        # 4. Generate API Key
        key_res = await ac.post("/api/v1/auth/api-keys", headers=headers, json={"name": "Pytest Key"})
        assert key_res.status_code == 201
        key_data = key_res.json()
        assert key_data["raw_key"] is not None
        assert key_data["raw_key"].startswith("mp_live_")

        # 5. List API Keys
        list_keys = await ac.get("/api/v1/auth/api-keys", headers=headers)
        assert list_keys.status_code == 200
        assert len(list_keys.json()) >= 1
