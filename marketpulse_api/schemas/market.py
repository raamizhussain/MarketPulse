from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class CurrentRegimeResponse(BaseModel):
    symbol: str
    regime: str  # "bull", "bear", "sideways"
    regime_state: int  # 0, 1, 2
    regime_name: str  # "Quiet Bull", "Turbulent Bear", "Sideways Choppy"
    confidence: float
    volatility: float
    log_return: float
    price: float
    timestamp: datetime


class SentimentResponse(BaseModel):
    symbol: str
    sentiment_score: float  # -1.0 to 1.0
    sentiment_label: str  # "bullish", "bearish", "neutral"
    articles_analyzed: int
    top_headlines: List[dict]
    timestamp: datetime


class PricePoint(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    regime_state: Optional[int] = 0
    regime_label: Optional[str] = "Quiet Bull"


class PriceHistoryResponse(BaseModel):
    symbol: str
    period: str
    count: int
    data: List[PricePoint]


class RegimeHistoryPoint(BaseModel):
    timestamp: datetime
    symbol: str
    regime_state: int
    regime: str
    confidence: float
    volatility: float


class TickerSummary(BaseModel):
    symbol: str
    price: float
    change_24h: float
    change_24h_pct: float
    regime: str
    regime_state: int
    sentiment_score: float
    sentiment_label: str
    volatility: float
    volume_24h: int
    last_updated: datetime


class LiveMarketSnapshot(BaseModel):
    regime: str
    regime_confidence: float
    sentiment_score: float
    sentiment_label: str
    active_tickers: List[TickerSummary]
    timestamp: datetime
