from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from marketpulse_api.core.database import get_db
from marketpulse_api.routers.deps import get_current_user
from marketpulse_api.models.user import User
from marketpulse_api.services.paper_trading_service import (
    get_or_create_paper_portfolio,
    execute_paper_order,
    deposit_virtual_funds,
    reset_paper_portfolio
)

router = APIRouter(prefix="/trading", tags=["Paper Trading"])


class PaperOrderRequest(BaseModel):
    symbol: str = Field(..., description="Stock symbol, e.g. NVDA, AAPL, RELIANCE.NS")
    side: str = Field(..., description="BUY or SELL")
    shares: float = Field(..., gt=0, description="Number of shares to trade")
    order_type: Optional[str] = "MARKET"
    product_type: Optional[str] = "CNC"  # CNC (Delivery/Holding) or MIS (Intraday)


class DepositFundsRequest(BaseModel):
    amount_usd: Optional[float] = 0.0
    amount_inr: Optional[float] = 0.0


@router.get("/portfolio")
async def get_portfolio(
    symbol: Optional[str] = Query(None, description="Active stock symbol for depth ladder"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches Zerodha/Groww-style holdings, intraday positions, 5-level market depth ladder, and P&L metrics."""
    return await get_or_create_paper_portfolio(db, current_user.id, active_symbol=symbol)


@router.post("/order")
async def place_order(
    data: PaperOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Executes a realistic paper trade with leverage, statutory charges, and detailed profit/loss accounting."""
    return await execute_paper_order(
        db=db,
        user_id=current_user.id,
        symbol=data.symbol,
        side=data.side,
        shares=data.shares,
        order_type=data.order_type or "MARKET",
        product_type=data.product_type or "CNC"
    )


@router.post("/funds/deposit")
async def deposit_funds(
    data: DepositFundsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deposits simulated virtual capital into the paper trading portfolio."""
    return await deposit_virtual_funds(
        db=db,
        user_id=current_user.id,
        amount_usd=data.amount_usd or 0.0,
        amount_inr=data.amount_inr or 0.0
    )


@router.post("/reset")
async def reset_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Resets paper trading portfolio back to starting cash balance ($100,000 USD / ₹80,00,000 INR)."""
    return await reset_paper_portfolio(db, current_user.id)
