from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query

from marketpulse_api.schemas.market import (
    CurrentRegimeResponse,
    SentimentResponse,
    PriceHistoryResponse,
    RegimeHistoryPoint,
    TickerSummary,
    LiveMarketSnapshot
)
from marketpulse_api.services.market_service import (
    get_current_regime,
    get_ticker_sentiment,
    get_price_history,
    get_regime_history,
    get_active_tickers_summary,
    get_live_market_snapshot
)
from marketpulse_api.services.live_quote_service import search_stocks

router = APIRouter(prefix="/market", tags=["Market Data & HMM Regime Intelligence"])


@router.get("/search")
async def search_market_stocks(
    query: str = Query("", description="Ticker or company name search"),
    region: str = Query("ALL", description="Region filter: US, IN, ALL")
):
    """Searches stock universe across US and Indian equities with fuzzy autocomplete."""
    return search_stocks(query=query, region=region, limit=20)


@router.get("/current-regime", response_model=CurrentRegimeResponse)
async def fetch_current_regime(symbol: str = Query("AAPL", description="Stock ticker symbol")):
    """Returns the active HMM regime classification (Quiet Bull, Turbulent Bear, Sideways) with confidence."""
    return await get_current_regime(symbol)


@router.get("/sentiment/{symbol}", response_model=SentimentResponse)
async def fetch_sentiment(symbol: str):
    """Returns real-time FinBERT headline sentiment score (-1.0 to +1.0) and top scored news items."""
    return await get_ticker_sentiment(symbol)


@router.get("/price-history", response_model=PriceHistoryResponse)
async def fetch_price_history(
    symbol: str = Query("AAPL", description="Target stock ticker"),
    period: str = Query("30d", description="Time window: 1d, 7d, 30d, 90d, 1y")
):
    """Returns OHLCV price series overlaid with historical HMM regime state classifications."""
    return await get_price_history(symbol, period)


@router.get("/regime-history", response_model=List[RegimeHistoryPoint])
async def fetch_regime_history(
    symbol: str = Query("AAPL", description="Target stock ticker"),
    days: int = Query(30, ge=1, le=365)
):
    """Returns historical regime transitions and transition confidence timelines."""
    return await get_regime_history(days, symbol)


@router.get("/tickers", response_model=List[TickerSummary])
async def fetch_active_tickers(region: str = Query("ALL", description="Region filter: US, IN, ALL")):
    """Returns high-level institutional market overview for tracked assets across US and Indian markets."""
    return await get_active_tickers_summary(region=region)


@router.get("/snapshot", response_model=LiveMarketSnapshot)
async def fetch_market_snapshot():
    """Returns instant macro-level market overview including aggregate sentiment and dominant regime."""
    return await get_live_market_snapshot()

