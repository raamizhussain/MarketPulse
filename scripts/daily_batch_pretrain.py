"""
MarketPulse AI — Daily Batch Pre-Training & Model Update Job
Designed to run off-peak (e.g. 2:00 AM UTC) on AWS EC2/ECS or as a cron task.
"""

import sys
import os
import asyncio
import logging
from datetime import datetime, timezone

# Ensure project root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from marketpulse_api.core.database import async_session_factory
from marketpulse_api.services.pretraining_service import seed_and_train_stock_universe, query_pretrained_catalog

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (BatchTrainer): %(message)s"
)
logger = logging.getLogger("daily_batch_pretrain")


async def run_daily_pretraining():
    logger.info("🚀 Starting MarketPulse AI Daily Pre-Training Pipeline...")
    start_time = datetime.now(timezone.utc)

    async with async_session_factory() as session:
        try:
            count = await seed_and_train_stock_universe(session)
            catalog = await query_pretrained_catalog(session, limit=100)
            elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            logger.info(f"✅ Successfully updated {count} stock intelligence models across US & Indian markets in {elapsed:.2f}s.")
            logger.info(f"📊 Active Pre-Trained Model Warehouse Catalog contains {len(catalog)} ready-to-trade assets.")
        except Exception as e:
            logger.error(f"❌ Error during batch model training: {e}", exc_info=True)
            raise


if __name__ == "__main__":
    asyncio.run(run_daily_pretraining())
