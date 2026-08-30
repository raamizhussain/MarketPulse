from typing import List, Optional
from fastapi import APIRouter, Query

from marketpulse_api.schemas.analytics import (
    PerformanceByRegime,
    RegimeStatistics,
    SentimentDistribution,
    MonthlyReturns,
    CorrelationMatrix
)
from marketpulse_api.services.analytics_service import (
    get_performance_by_regime,
    get_regime_statistics,
    get_sentiment_distribution,
    get_monthly_returns
)
from marketpulse_api.services.risk_service import calculate_asset_correlation_matrix

router = APIRouter(prefix="/analytics", tags=["Quantitative Analytics & Regime Research"])


@router.get("/performance-by-regime", response_model=PerformanceByRegime)
async def fetch_performance_by_regime():
    """Returns Sharpe ratio and cumulative returns segmented across Bull, Bear, and Sideways regimes."""
    return await get_performance_by_regime()


@router.get("/regime-statistics", response_model=RegimeStatistics)
async def fetch_regime_statistics():
    """Returns average duration (days), streak length, and transition probability matrix."""
    return await get_regime_statistics()


@router.get("/sentiment-distribution", response_model=SentimentDistribution)
async def fetch_sentiment_distribution():
    """Returns historical distribution across Very Bullish, Bullish, Neutral, Bearish, and Very Bearish."""
    return await get_sentiment_distribution()


@router.get("/monthly-returns", response_model=MonthlyReturns)
async def fetch_monthly_returns(year: int = Query(2026, ge=2020, le=2030)):
    """Returns institutional monthly performance attribution breakdown."""
    return await get_monthly_returns(year)


@router.get("/correlation-matrix", response_model=CorrelationMatrix)
async def fetch_correlation_matrix():
    """Calculates cross-asset correlation matrix and warns on excessive portfolio concentration."""
    return calculate_asset_correlation_matrix()
