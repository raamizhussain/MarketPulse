import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from marketpulse_api.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # regime_change, sentiment_drop, drawdown_exceed, low_confidence
    threshold_value = Column(Float, default=0.0, nullable=False)
    symbol = Column(String(12), nullable=True)  # Specific ticker or ALL
    channel = Column(String(50), default="in_app", nullable=False)  # in_app, webhook, email
    webhook_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="alerts")
    history = relationship("AlertHistory", back_populates="alert", cascade="all, delete-orphan")


class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    triggered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    trigger_value = Column(Float, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="warning", nullable=False)  # info, warning, critical
    is_acknowledged = Column(Boolean, default=False, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)

    alert = relationship("Alert", back_populates="history")
