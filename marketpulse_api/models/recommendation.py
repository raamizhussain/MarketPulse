import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text

from marketpulse_api.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    symbol = Column(String(12), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    bull_argument = Column(Text, nullable=False)
    bear_argument = Column(Text, nullable=False)
    judge_recommendation = Column(Text, nullable=False)
    confidence = Column(Float, default=0.75, nullable=False)
    agents_aligned = Column(Boolean, default=False, nullable=False)
    recommendation_label = Column(String(10), default="HOLD", nullable=False)  # BUY, SELL, HOLD, CASH
    regime = Column(String(50), default="Quiet Bull", nullable=False)
    sentiment_score = Column(Float, default=0.0, nullable=False)
    price = Column(Float, default=0.0, nullable=False)
    volatility = Column(Float, default=0.0, nullable=False)
    catalyst_thresholds = Column(Text, nullable=True)
