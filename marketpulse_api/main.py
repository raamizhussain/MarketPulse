import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from marketpulse_api.core.config import settings
from marketpulse_api.core.database import engine, Base, async_session_factory
from marketpulse_api.services.auth_service import seed_demo_users
from marketpulse_api.services.market_service import get_active_tickers_summary
from marketpulse_api.services.strategy_service import get_user_strategies
from marketpulse_api.routers import (
    auth,
    market,
    agents,
    strategies,
    alerts,
    analytics,
    export,
    admin,
    websockets,
    paper_trading
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("marketpulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting MarketPulse AI Quantitative API Platform...")

    # 1. Initialize DB schema tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database schema initialized successfully.")

    # 2. Seed default institutional demo users
    async with async_session_factory() as session:
        try:
            await seed_demo_users(session)
            logger.info("Demo users initialized.")
        except Exception as e:
            logger.warning(f"Demo user seeding note: {e}")

        # 3. Seed and index Pre-Trained Model Warehouse (US + Indian Equities)
        try:
            from marketpulse_api.services.pretraining_service import seed_and_train_stock_universe
            count = await seed_and_train_stock_universe(session)
            logger.info(f"Pre-Trained Stock Model Warehouse initialized with {count} models.")
        except Exception as e:
            logger.warning(f"Pretraining seeding note: {e}")

    yield

    logger.info("🛑 Shutting down MarketPulse AI services...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    return response

# Production Error Sanitization
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact support or retry shortly."}
    )

# Register REST Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(market.router, prefix=settings.API_V1_STR)
app.include_router(agents.router, prefix=settings.API_V1_STR)
app.include_router(strategies.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(export.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(paper_trading.router, prefix=settings.API_V1_STR)

# Register WebSockets Router
app.include_router(websockets.router)


@app.get("/", tags=["System Root"])
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs",
        "api_v1_root": settings.API_V1_STR,
        "regime_engine": "3-State KMeans-Seeded HMM (Gaussian)",
        "sentiment_engine": "FinBERT Financial NLP + Groq Llama 3.3",
        "agent_core": "LangGraph Multi-Agent Disagreement Committee (Bull, Bear, Judge)"
    }


@app.get("/health", tags=["System Root"])
async def health():
    return {"status": "healthy", "service": "marketpulse-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("marketpulse_api.main:app", host="0.0.0.0", port=8000, reload=True)
