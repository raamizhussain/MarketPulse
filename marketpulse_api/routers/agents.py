from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from marketpulse_api.core.database import get_db
from marketpulse_api.schemas.agents import (
    AgentRecommendationResponse,
    AgentStatsResponse,
    AnalyzeRequest
)
from marketpulse_api.services.agent_service import (
    run_live_agent_debate,
    get_recent_recommendations,
    get_agent_statistics
)

router = APIRouter(prefix="/agents", tags=["Multi-Agent Committee & Reasoning"])


@router.get("/latest-recommendation", response_model=AgentRecommendationResponse)
async def get_latest_recommendation(
    symbol: str = Query("AAPL", description="Target stock ticker"),
    db: AsyncSession = Depends(get_db)
):
    """Executes or retrieves the latest adversarial debate and Judge synthesis for the given asset."""
    return await run_live_agent_debate(db, symbol)


@router.get("/recommendation-history", response_model=List[AgentRecommendationResponse])
async def get_recommendation_history(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves chronological archive of multi-agent debate decisions and reasoning vectors."""
    return await get_recent_recommendations(db, limit)


@router.get("/agent-stats", response_model=AgentStatsResponse)
async def get_agent_stats():
    """Returns predictive win rate accuracy and alignment calibration for Bull, Bear, and Judge agents."""
    return await get_agent_statistics()


@router.post("/analyze", response_model=AgentRecommendationResponse)
async def trigger_agent_analysis(
    req: AnalyzeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Triggers an on-demand LangGraph debate with custom sentiment overrides or RAG retrieval options."""
    return await run_live_agent_debate(db, req.symbol, req.custom_sentiment_override)
