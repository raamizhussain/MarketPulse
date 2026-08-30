from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class AlertRuleCreate(BaseModel):
    alert_type: str = Field(..., pattern="^(regime_change|sentiment_drop|drawdown_exceed|low_confidence)$")
    threshold_value: float = 0.0
    symbol: Optional[str] = "ALL"
    channel: str = Field("in_app", pattern="^(in_app|webhook|email)$")
    webhook_url: Optional[str] = None
    is_active: bool = True


class AlertRuleResponse(BaseModel):
    id: str
    user_id: str
    alert_type: str
    threshold_value: float
    symbol: Optional[str]
    channel: str
    webhook_url: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertHistoryItem(BaseModel):
    id: str
    alert_id: Optional[str]
    user_id: str
    triggered_at: datetime
    trigger_value: float
    message: str
    severity: str  # info, warning, critical
    is_acknowledged: bool
    acknowledged_at: Optional[datetime]

    class Config:
        from_attributes = True


class AlertAcknowledgeRequest(BaseModel):
    is_acknowledged: bool = True
