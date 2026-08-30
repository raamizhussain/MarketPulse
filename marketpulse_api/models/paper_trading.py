import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from marketpulse_api.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class PaperPortfolio(Base):
    __tablename__ = "paper_portfolios"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cash_usd = Column(Float, default=100000.0, nullable=False)  # Starting $100,000 USD
    cash_inr = Column(Float, default=8000000.0, nullable=False)  # Starting ₹80,00,000 INR
    realized_pnl_usd = Column(Float, default=0.0, nullable=False)
    realized_pnl_inr = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    positions = relationship("PaperPosition", back_populates="portfolio", cascade="all, delete-orphan")
    orders = relationship("PaperOrder", back_populates="portfolio", cascade="all, delete-orphan")


class PaperPosition(Base):
    __tablename__ = "paper_positions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    portfolio_id = Column(String(36), ForeignKey("paper_portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(30), nullable=False, index=True)
    shares = Column(Float, nullable=False)  # Quantity held
    average_entry_price = Column(Float, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)  # USD or INR
    product_type = Column(String(20), default="CNC", nullable=False)  # CNC (Delivery/Holdings) or MIS (Intraday)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    portfolio = relationship("PaperPortfolio", back_populates="positions")


class PaperOrder(Base):
    __tablename__ = "paper_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    portfolio_id = Column(String(36), ForeignKey("paper_portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(String(50), nullable=True)  # e.g. ORD-2026-89210
    symbol = Column(String(30), nullable=False, index=True)
    side = Column(String(10), nullable=False)  # BUY or SELL
    order_type = Column(String(20), default="MARKET", nullable=False)  # MARKET, LIMIT, SL
    product_type = Column(String(20), default="CNC", nullable=False)  # CNC or MIS
    shares = Column(Float, nullable=False)
    execution_price = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    charges = Column(Float, default=0.0, nullable=False)
    realized_pnl = Column(Float, default=0.0, nullable=False)  # Profit/loss earned if sell
    realized_pnl_pct = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    status = Column(String(20), default="FILLED", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    portfolio = relationship("PaperPortfolio", back_populates="orders")
