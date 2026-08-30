import pytest
from httpx import AsyncClient, ASGITransport
from marketpulse_api.main import app
from marketpulse_api.services.strategy_service import calculate_kelly_position_size


def test_kelly_criterion_calculation():
    # Conservative Kelly (Quarter-Kelly)
    k_cons = calculate_kelly_position_size(win_rate=0.65, win_loss_ratio=1.8, risk_tolerance="conservative")
    assert 0.05 <= k_cons <= 0.25

    # Moderate Kelly (Half-Kelly)
    k_mod = calculate_kelly_position_size(win_rate=0.65, win_loss_ratio=1.8, risk_tolerance="moderate")
    assert k_mod > k_cons

    # Aggressive Kelly (Three-Quarter Kelly)
    k_agg = calculate_kelly_position_size(win_rate=0.65, win_loss_ratio=1.8, risk_tolerance="aggressive")
    assert k_agg >= k_mod


@pytest.mark.asyncio
async def test_strategies_crud():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "demo@marketpulse.ai",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. List user strategies
        strats_res = await ac.get("/api/v1/strategies", headers=headers)
        assert strats_res.status_code == 200
        strategies = strats_res.json()
        assert len(strategies) >= 1
        strat_id = strategies[0]["id"]

        # 2. Performance details
        perf_res = await ac.get(f"/api/v1/strategies/{strat_id}/performance", headers=headers)
        assert perf_res.status_code == 200
        perf = perf_res.json()
        assert "sharpe_ratio" in perf
        assert perf["sharpe_ratio"] > 0

        # 3. Trades list
        trades_res = await ac.get(f"/api/v1/strategies/{strat_id}/trades", headers=headers)
        assert trades_res.status_code == 200
        assert len(trades_res.json()) > 0

        # 4. Equity curve
        curve_res = await ac.get(f"/api/v1/strategies/{strat_id}/equity-curve?days=30", headers=headers)
        assert curve_res.status_code == 200
        assert len(curve_res.json()) == 30
