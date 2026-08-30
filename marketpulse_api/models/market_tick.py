from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime

from marketpulse_api.core.database import Base


class MarketTick(Base):
    __tablename__ = "fact_market_ticks_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(12), nullable=False, index=True)
    price = Column(Float, nullable=False)
    volume = Column(Integer, default=0, nullable=False)
    log_return = Column(Float, default=0.0, nullable=False)
    realized_volatility = Column(Float, default=0.0, nullable=False)
    hidden_state = Column(Integer, default=0, nullable=False)  # 0=Quiet Bull, 1=Turbulent Bear, 2=Sideways
    sentiment_score = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
