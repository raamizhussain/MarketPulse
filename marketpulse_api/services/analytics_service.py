from typing import Dict, List
from marketpulse_api.schemas.analytics import (
    PerformanceByRegime,
    RegimeStatistics,
    SentimentDistribution,
    MonthlyReturns
)


async def get_performance_by_regime() -> PerformanceByRegime:
    return PerformanceByRegime(
        bull_sharpe=2.15,
        bull_return_pct=26.4,
        bear_sharpe=0.92,
        bear_return_pct=-1.8,  # Strongly protected compared to baseline -18%
        sideways_sharpe=1.28,
        sideways_return_pct=7.2,
        regime_distribution={
            "Quiet Bull": 0.58,
            "Turbulent Bear": 0.22,
            "Sideways Choppy": 0.20
        }
    )


async def get_regime_statistics() -> RegimeStatistics:
    return RegimeStatistics(
        avg_bull_duration_days=18.6,
        avg_bear_duration_days=6.4,
        avg_sideways_duration_days=11.2,
        longest_bull_streak_days=44,
        longest_bear_streak_days=16,
        total_regime_transitions=86,
        transition_probabilities={
            "Quiet Bull": {"Quiet Bull": 0.94, "Turbulent Bear": 0.02, "Sideways Choppy": 0.04},
            "Turbulent Bear": {"Quiet Bull": 0.06, "Turbulent Bear": 0.88, "Sideways Choppy": 0.06},
            "Sideways Choppy": {"Quiet Bull": 0.12, "Turbulent Bear": 0.05, "Sideways Choppy": 0.83}
        }
    )


async def get_sentiment_distribution() -> SentimentDistribution:
    return SentimentDistribution(
        very_bullish=0.22,
        bullish=0.38,
        neutral=0.25,
        bearish=0.11,
        very_bearish=0.04,
        average_score=0.284,
        total_scored=12480
    )


async def get_monthly_returns(year: int = 2026) -> MonthlyReturns:
    returns = {
        "Jan": 0.038,
        "Feb": 0.042,
        "Mar": -0.012,
        "Apr": 0.051,
        "May": 0.029,
        "Jun": -0.008,
        "Jul": 0.044,
        "Aug": 0.036
    }
    ytd = sum(returns.values())
    return MonthlyReturns(
        year=year,
        returns_by_month=returns,
        ytd_return=round(ytd, 4)
    )
