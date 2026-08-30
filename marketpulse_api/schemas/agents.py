from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class AgentRecommendationResponse(BaseModel):
    id: str
    symbol: str
    bull_argument: str
    bear_argument: str
    judge_recommendation: str
    recommendation_label: str  # BUY, SELL, HOLD, CASH
    confidence: float
    agents_aligned: bool
    regime: str
    sentiment_score: float
    price: float
    volatility: float
    historical_episodes: Optional[List[str]] = []
    catalyst_thresholds: Optional[str] = None
    timestamp: datetime


class AgentAccuracyStat(BaseModel):
    agent_name: str
    role: str
    win_rate: float
    total_calls: int
    avg_confidence: float
    favorable_regimes: List[str]


class AgentStatsResponse(BaseModel):
    bull_accuracy: float
    bear_accuracy: float
    judge_accuracy: float
    total_debates_run: int
    alignment_rate: float
    agents: List[AgentAccuracyStat]


class AnalyzeRequest(BaseModel):
    symbol: str = "AAPL"
    include_rag: bool = True
    custom_sentiment_override: Optional[float] = None
