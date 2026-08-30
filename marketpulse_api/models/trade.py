import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from marketpulse_api.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Trade(Base):
    __tablename__ = "trades"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    strategy_id = Column(String(36), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    action = Column(String(10), nullable=False)  # BUY, SELL, HOLD
    symbol = Column(String(12), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    pnl = Column(Float, default=0.0, nullable=False)
    pnl_percent = Column(Float, default=0.0, nullable=False)
    recommendation_confidence = Column(Float, default=0.75, nullable=False)
    regime_at_trade = Column(String(50), default="Quiet Bull", nullable=False)
    sentiment_at_trade = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    tags = Column(String(255), default="automated,hmm_regime", nullable=True)

    strategy = relationship("Strategy", back_populates="trades")
