import json
import uuid
from datetime import datetime, timezone
from typing import List
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from marketpulse_api.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    allocation_percentage = Column(Float, default=25.0, nullable=False)
    risk_tolerance = Column(String(50), default="moderate", nullable=False)  # conservative, moderate, aggressive
    stocks_json = Column(Text, default=json.dumps(["AAPL", "TSLA", "NVDA", "MSFT"]), nullable=False)
    rebalance_frequency = Column(String(50), default="daily", nullable=False)  # daily, weekly, realtime
    initial_capital = Column(Float, default=100000.0, nullable=False)
    current_equity = Column(Float, default=100000.0, nullable=False)
    cash_balance = Column(Float, default=100000.0, nullable=False)
    max_drawdown_limit = Column(Float, default=0.15, nullable=False)
    stop_loss_pct = Column(Float, default=0.05, nullable=False)
    take_profit_pct = Column(Float, default=0.10, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="strategies")
    trades = relationship("Trade", back_populates="strategy", cascade="all, delete-orphan", order_by="desc(Trade.timestamp)")

    @property
    def stocks(self) -> List[str]:
        try:
            return json.loads(self.stocks_json)
        except Exception:
            return ["AAPL", "TSLA", "NVDA", "MSFT"]

    @stocks.setter
    def stocks(self, val: List[str]):
        self.stocks_json = json.dumps(val)
