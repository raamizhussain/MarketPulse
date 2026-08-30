from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class StrategyCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = "Automated HMM + FinBERT momentum strategy"
    allocation_percentage: float = Field(25.0, ge=1.0, le=100.0)
    risk_tolerance: str = Field("moderate", pattern="^(conservative|moderate|aggressive)$")
    stocks: List[str] = Field(default=["AAPL", "TSLA", "NVDA", "MSFT"])
    rebalance_frequency: str = Field("daily", pattern="^(daily|weekly|realtime)$")
    initial_capital: float = Field(100000.0, ge=1000.0)
    max_drawdown_limit: float = Field(0.15, ge=0.01, le=0.50)
    stop_loss_pct: float = Field(0.05, ge=0.01, le=0.25)
    take_profit_pct: float = Field(0.10, ge=0.01, le=0.50)


class StrategyUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    allocation_percentage: Optional[float] = None
    risk_tolerance: Optional[str] = None
    stocks: Optional[List[str]] = None
    rebalance_frequency: Optional[str] = None
    max_drawdown_limit: Optional[float] = None
    stop_loss_pct: Optional[float] = None
    take_profit_pct: Optional[float] = None
    is_active: Optional[bool] = None


class TradeResponse(BaseModel):
    id: str
    strategy_id: str
    timestamp: datetime
    action: str  # BUY, SELL, HOLD
    symbol: str
    quantity: float
    price: float
    pnl: float
    pnl_percent: float
    recommendation_confidence: float
    regime_at_trade: str
    sentiment_at_trade: float
    notes: Optional[str] = None
    tags: Optional[str] = None

    class Config:
        from_attributes = True


class EquityCurvePoint(BaseModel):
    timestamp: datetime
    strategy_equity: float
    baseline_equity: float
    regime_state: int
    drawdown: float


class StrategyPerformanceResponse(BaseModel):
    strategy_id: str
    strategy_name: str
    initial_capital: float
    current_equity: float
    total_return: float
    total_return_pct: float
    baseline_return_pct: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    win_rate: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    profit_factor: float
    avg_trade_pnl: float
    monthly_returns: dict


class StrategyResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    allocation_percentage: float
    risk_tolerance: str
    stocks: List[str]
    rebalance_frequency: str
    initial_capital: float
    current_equity: float
    cash_balance: float
    max_drawdown_limit: float
    stop_loss_pct: float
    take_profit_pct: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
    performance: Optional[StrategyPerformanceResponse] = None

    class Config:
        from_attributes = True
