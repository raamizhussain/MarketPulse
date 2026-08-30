from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from marketpulse_api.core.database import get_db
from marketpulse_api.models.user import User
from marketpulse_api.schemas.strategy import (
    StrategyCreateRequest,
    StrategyUpdateRequest,
    StrategyResponse,
    StrategyPerformanceResponse,
    TradeResponse,
    EquityCurvePoint
)
from marketpulse_api.services.strategy_service import (
    create_strategy,
    get_user_strategies,
    get_strategy_by_id,
    update_strategy,
    delete_strategy,
    get_strategy_trades,
    get_strategy_equity_curve,
    simulate_strategy_metrics
)
from marketpulse_api.routers.deps import get_current_user

router = APIRouter(prefix="/strategies", tags=["Trading Strategies & Execution Portfolios"])


@router.post("", response_model=StrategyResponse, status_code=status.HTTP_201_CREATED)
async def create_new_strategy(
    data: StrategyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new automated quantitative regime-trading strategy."""
    return await create_strategy(db, current_user.id, data)


@router.get("", response_model=List[StrategyResponse])
async def list_strategies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lists all active and archived trading strategies owned by the authenticated user."""
    return await get_user_strategies(db, current_user.id)


@router.get("/{strategy_id}", response_model=StrategyResponse)
async def get_strategy_details(
    strategy_id: str = Path(..., description="Unique Strategy UUID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches full configuration and performance parameters for a specific strategy."""
    return await get_strategy_by_id(db, strategy_id, current_user.id)


@router.patch("/{strategy_id}", response_model=StrategyResponse)
async def modify_strategy(
    strategy_id: str,
    data: StrategyUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates risk parameters, allocation %, active status, or stock basket."""
    return await update_strategy(db, strategy_id, current_user.id, data)


@router.delete("/{strategy_id}")
async def remove_strategy(
    strategy_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deactivates and removes a strategy from the user's active portfolio."""
    return await delete_strategy(db, strategy_id, current_user.id)


@router.post("/blend-model")
async def blend_model_from_warehouse(
    data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Zero-Latency Multi-Asset Model Blender (<100ms):
    Fetches pre-trained HMM weights & FinBERT sentiment from database warehouse and blends predictions.
    """
    from marketpulse_api.services.pretraining_service import blend_pretrained_multi_asset_model
    symbols = data.get("symbols", ["AAPL", "NVDA", "TSLA"])
    risk_level = data.get("risk_level", "moderate")
    name = data.get("strategy_name")
    return await blend_pretrained_multi_asset_model(db, symbols, risk_level, name)


@router.get("/warehouse")
async def get_warehouse_telemetry(db: AsyncSession = Depends(get_db)):
    """Returns real-time pre-trained model warehouse metrics and sync status."""
    from marketpulse_api.services.pretraining_service import get_pretraining_warehouse_telemetry
    return await get_pretraining_warehouse_telemetry(db)


@router.get("/{strategy_id}/performance", response_model=StrategyPerformanceResponse)
async def get_strategy_performance(
    strategy_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Calculates live Sharpe, Sortino, max drawdown, and monthly return metrics."""
    s = await get_strategy_by_id(db, strategy_id, current_user.id)
    return s.performance


@router.get("/{strategy_id}/trades", response_model=List[TradeResponse])
async def list_strategy_trades(
    strategy_id: str,
    symbol: Optional[str] = Query(None, description="Filter by ticker"),
    action: Optional[str] = Query(None, description="Filter by action (BUY, SELL)"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns sortable and filterable real-time trade logs for the strategy."""
    return await get_strategy_trades(db, strategy_id, current_user.id, symbol, action, limit)


@router.get("/{strategy_id}/equity-curve", response_model=List[EquityCurvePoint])
async def get_equity_curve(
    strategy_id: str,
    days: int = Query(90, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns high-resolution time series for strategy equity vs buy-and-hold baseline with regime bands."""
    return await get_strategy_equity_curve(db, strategy_id, current_user.id, days)

