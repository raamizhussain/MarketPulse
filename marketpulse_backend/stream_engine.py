import asyncio
from datetime import datetime, timedelta, timezone
import asyncpg
from pydantic import BaseModel
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from alpaca.data.historical import StockHistoricalDataClient

import os

# Database Credentials
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
DB_HOST = os.getenv("POSTGRES_HOST", "127.0.0.1")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "marketpulse_db")

# Alpaca API Keys
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "")

class PriceTick(BaseModel):
    symbol: str
    price: float
    volume: int
    created_at: datetime

# =====================================================================
# STAGE 1: HISTORICAL BACKFILL ENGINE (Fixed for Free Tier)
# =====================================================================
# =====================================================================
# STAGE 1: DEEP HISTORICAL BACKFILL ENGINE (1-Year Architecture)
# =====================================================================
async def backfill_historical_data(db_pool: asyncpg.Pool, symbols: list):
    """Downloads 1 Year of historical bars per symbol and commits them to the warehouse."""
    print("⏳ Stage 1: Initializing deep 1-Year warehouse backfill via Alpaca...")
    client = StockHistoricalDataClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
    
    # Establish a 365-day deep historical lookup window
    end_time = datetime.now(timezone.utc) - timedelta(minutes=15)
    start_time = end_time - timedelta(days=365)
    
    total_records_inserted = 0
    
    # Process each stock individually to safely manage high-volume payloads
    for symbol in symbols:
        print(f"📥 Pulling 365 days of historical minute bars for {symbol}...")
        
        request_params = StockBarsRequest(
            symbol_or_symbols=[symbol],
            timeframe=TimeFrame.Minute,
            start=start_time,
            end=end_time,
            feed="iex"
        )
        
        try:
            loop = asyncio.get_running_loop()
            bars = await loop.run_in_executor(None, lambda: client.get_stock_bars(request_params))
            
            records_to_insert = []
            if symbol in bars.data:
                for bar in bars.data[symbol]:
                    records_to_insert.append((
                        symbol,
                        round(float(bar.close), 2),
                        int(bar.volume),
                        bar.timestamp.replace(tzinfo=None)
                    ))
            
            if records_to_insert:
                async with db_pool.acquire() as conn:
                    await conn.executemany(
                        """
                        INSERT INTO fact_market_ticks (symbol, price, volume, created_at)
                        VALUES ($1, $2, $3, $4);
                        """,
                        records_to_insert
                    )
                print(f"   ⚡ Cached {len(records_to_insert)} bars for {symbol}.")
                total_records_inserted += len(records_to_insert)
            else:
                print(f"   ⚠️ No historical items found for {symbol}.")
                
            # Quick pause between network cycles to maintain a healthy API request cadence
            await asyncio.sleep(2)
                
        except Exception as e:
            print(f"❌ Error backfilling {symbol}: {e}")
            
    print(f"✅ Deep Backfill Complete! Successfully committed {total_records_inserted} total records to PostgreSQL.")

# =====================================================================
# STAGE 2: LIVE STREAM PRODUCER (Fixed for Free Tier)
# =====================================================================
async def alpaca_live_producer(queue: asyncio.Queue, symbols: list):
    """Fetches real-time price changes dynamically utilizing Alpaca IEX data feed."""
    print("🌍 Stage 2: Deploying real-time market listener loop...")
    client = StockHistoricalDataClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
    
    while True:
        try:
            loop = asyncio.get_running_loop()
            
            # Fetch the latest available minute window bar
            end_time = datetime.now(timezone.utc) - timedelta(minutes=15) # Keep 15m delay for free data accounts
            start_time = end_time - timedelta(minutes=10)
            
            request_params = StockBarsRequest(
                symbol_or_symbols=symbols,
                timeframe=TimeFrame.Minute,
                start=start_time,
                end=end_time,
                feed="iex"  # <-- FORCE FREE DATA CHANNELS
            )
            
            bars = await loop.run_in_executor(None, lambda: client.get_stock_bars(request_params))
            
            for symbol in symbols:
                if symbol in bars.data and len(bars.data[symbol]) > 0:
                    latest_bar = bars.data[symbol][-1]
                    
                    tick = PriceTick(
                        symbol=symbol,
                        price=round(float(latest_bar.close), 2),
                        volume=int(latest_bar.volume),
                        created_at=datetime.now()
                    )
                    await queue.put(tick)
                    print(f"🛰️ [ALPACA FETCH] Live tick captured for {symbol}: ${tick.price}")
                    
        except Exception as e:
            print(f"⚠️ Live Producer Engine warning: {e}. Retrying shortly...")
            
        # Pause for 30 seconds between polling frames to stay safe within request boundaries
        await asyncio.sleep(30)

# =====================================================================
# CONSUMER: Asynchronous Pipeline Committer
# =====================================================================
async def database_consumer(queue: asyncio.Queue, db_pool: asyncpg.Pool):
    print("🧠 Database Consumer Active. Monitoring shared pipeline...")
    
    while True:
        tick: PriceTick = await queue.get()
        current_time = tick.created_at.strftime('%H:%M:%S')
        
        async with db_pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO fact_market_ticks (symbol, price, volume, created_at)
                VALUES ($1, $2, $3, $4);
                """,
                tick.symbol, tick.price, tick.volume, tick.created_at
            )
            
        print(f"[{current_time}] 💾 [WAREHOUSE WRITE] {tick.symbol} -> DB Saved @ ${tick.price}")
        queue.task_done()

# =====================================================================
# PIPELINE INITIALIZATION Entry
# =====================================================================
async def main():
    target_symbols = ["AAPL", "TSLA", "NVDA", "MSFT"]
    
    print("🔌 Connecting to data warehouse pool...")
    db_pool = await asyncpg.create_pool(
        user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, database=DB_NAME,
        min_size=2, max_size=5
    )
    
    # Clean the warehouse first to ensure a pristine backfill
    async with db_pool.acquire() as conn:
        print("🧹 Wiping warehouse to clear old scrap rows...")
        await conn.execute("TRUNCATE TABLE fact_market_ticks RESTART IDENTITY CASCADE;")
    
    # 1. Execute the historical backfill process
    await backfill_historical_data(db_pool, target_symbols)
    
    # 2. Open our async queue pipeline and start our concurrent execution workers
    shared_pipeline = asyncio.Queue(maxsize=500)
    
    try:
        await asyncio.gather(
            alpaca_live_producer(shared_pipeline, target_symbols),
            database_consumer(shared_pipeline, db_pool)
        )
    finally:
        print("\n🔒 Closing database channels safely...")
        await db_pool.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("MarketPulse pipeline shutdown safely.")