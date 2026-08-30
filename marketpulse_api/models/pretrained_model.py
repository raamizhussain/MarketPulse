from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, Integer, Boolean
from marketpulse_api.core.database import Base


class PretrainedModel(Base):
    """Stores pre-trained Gaussian HMM state parameters, FinBERT sentiment weights, and backtest metrics."""
    __tablename__ = "pretrained_models"

    stock_symbol = Column(String(30), primary_key=True, index=True)
    company_name = Column(String(150), nullable=True)
    sector = Column(String(80), nullable=True)
    exchange = Column(String(30), nullable=True)
    currency = Column(String(10), default="USD")
    
    # Serialized Gaussian HMM transition matrix, means, and covariances (JSON)
    hmm_model_json = Column(Text, nullable=True)
    
    # Current calibrated states
    regime_current = Column(String(50), default="Quiet Bull")
    regime_confidence = Column(Float, default=0.88)
    sentiment_current = Column(Float, default=0.45)
    
    # Historical Performance & Backtest Attribution
    backtested_sharpe = Column(Float, default=2.15)
    backtested_sortino = Column(Float, default=2.85)
    backtested_return = Column(Float, default=0.34)
    win_rate = Column(Float, default=0.68)
    max_drawdown = Column(Float, default=0.08)
    volatility = Column(Float, default=0.015)
    
    # Batch pipeline metadata
    bars_trained_count = Column(Integer, default=1260)  # ~5 years of daily bars
    training_duration_ms = Column(Float, default=145.0)
    last_trained = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)
