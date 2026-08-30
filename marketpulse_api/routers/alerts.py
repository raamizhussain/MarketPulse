from typing import List
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from marketpulse_api.core.database import get_db
from marketpulse_api.models.user import User
from marketpulse_api.schemas.alerts import (
    AlertRuleCreate,
    AlertRuleResponse,
    AlertHistoryItem,
    AlertAcknowledgeRequest
)
from marketpulse_api.services.risk_service import (
    create_alert_rule,
    get_user_alert_rules,
    get_user_alert_history,
    acknowledge_alert,
    delete_alert_rule
)
from marketpulse_api.routers.deps import get_current_user

router = APIRouter(prefix="/alerts", tags=["Risk Management & Real-Time Alerts"])


@router.post("/config", response_model=AlertRuleResponse, status_code=status.HTTP_201_CREATED)
async def set_alert_rule(
    data: AlertRuleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Sets a new risk threshold rule (Regime Shift, Drawdown Breach, Sentiment Drop)."""
    return await create_alert_rule(db, current_user.id, data)


@router.get("/config", response_model=List[AlertRuleResponse])
async def list_alert_rules(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves all active risk alert configurations for the authenticated user."""
    return await get_user_alert_rules(db, current_user.id)


@router.get("/history", response_model=List[AlertHistoryItem])
async def list_alert_history(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches real-time alert trigger history and notification events."""
    return await get_user_alert_history(db, current_user.id, limit)


@router.patch("/{alert_id}/acknowledge", response_model=AlertHistoryItem)
async def acknowledge_active_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Marks a triggered alert notification as read/acknowledged."""
    return await acknowledge_alert(db, alert_id, current_user.id)


@router.delete("/config/{rule_id}")
async def remove_alert_rule(
    rule_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deletes an alert rule configuration."""
    return await delete_alert_rule(db, rule_id, current_user.id)
