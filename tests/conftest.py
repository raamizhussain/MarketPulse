import pytest
import pytest_asyncio
from marketpulse_api.core.database import engine, Base, async_session_factory
from marketpulse_api.services.auth_service import seed_demo_users


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Initializes SQLite test tables and seeds institutional demo data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        await seed_demo_users(session)

    yield

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()
