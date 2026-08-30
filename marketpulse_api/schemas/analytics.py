from datetime import datetime
from typing import Dict, List
from pydantic import BaseModel


class PerformanceByRegime(BaseModel):
    bull_sharpe: float
    bull_return_pct: float
    bear_sharpe: float
    bear_return_pct: float
    sideways_sharpe: float
    sideways_return_pct: float
    regime_distribution: Dict[str, float]


class RegimeStatistics(BaseModel):
    avg_bull_duration_days: float
    avg_bear_duration_days: float
    avg_sideways_duration_days: float
    longest_bull_streak_days: int
    longest_bear_streak_days: int
    total_regime_transitions: int
    transition_probabilities: Dict[str, Dict[str, float]]


class SentimentDistribution(BaseModel):
    very_bullish: float  # >= 0.5
    bullish: float       # 0.1 to 0.5
    neutral: float       # -0.1 to 0.1
    bearish: float       # -0.5 to -0.1
    very_bearish: float  # <= -0.5
    average_score: float
    total_scored: int


class MonthlyReturns(BaseModel):
    year: int
    returns_by_month: Dict[str, float]  # "Jan": 0.045, "Feb": -0.012
    ytd_return: float


class AssetCorrelation(BaseModel):
    symbol_a: str
    symbol_b: str
    correlation: float


class CorrelationMatrix(BaseModel):
    symbols: List[str]
    matrix: List[List[float]]
    warnings: List[str]
