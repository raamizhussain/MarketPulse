from datetime import datetime
from typing import List, Dict, Any
from pydantic import BaseModel


class SystemHealthResponse(BaseModel):
    status: str  # "healthy", "degraded", "down"
    uptime_seconds: float
    data_ingestion_lag_seconds: float
    active_users_count: int
    total_strategies_active: int
    database_connected: bool
    redis_connected: bool
    api_error_rate_pct: float
    timestamp: datetime


class ModelTelemetry(BaseModel):
    hmm_convergence_status: str
    hmm_last_trained: datetime
    hmm_states_count: int
    finbert_latency_ms: float
    agent_latency_ms: float
    rag_vectors_indexed: int
    calibration_score: float


class UserAdminView(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    subscription_tier: str
    is_active: bool
    strategies_count: int
    created_at: datetime
    last_login: datetime | None

    class Config:
        from_attributes = True
