import asyncio
import asyncpg

DB_USER = "postgres"
DB_PASSWORD = "password"
DB_HOST = "127.0.0.1"
DB_PORT = "5433"
DB_NAME = "marketpulse_db"

async def initialize_warehouse():
    print("🔑 Connecting to PostgreSQL...")
    conn = await asyncpg.connect(
        user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT, database=DB_NAME
    )
    
    # 🧹 DELETING OLD DATA
    print("🧹 Wiping out old mock data from the warehouse...")
    await conn.execute("TRUNCATE TABLE fact_market_ticks RESTART IDENTITY CASCADE;")
    
    print("🏗️ Ensuring table structures are ready...")
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS fact_market_ticks (
            id BIGSERIAL,
            symbol VARCHAR(12) NOT NULL,
            price NUMERIC(12, 4) NOT NULL,
            volume INT NOT NULL,
            created_at TIMESTAMP NOT NULL,
            PRIMARY KEY (id, created_at)
        ) PARTITION BY RANGE (created_at);
    """)
    
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS fact_market_ticks_default 
        PARTITION OF fact_market_ticks DEFAULT;
    """)
    
    await conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_ticks_brin 
        ON fact_market_ticks USING BRIN (created_at);
    """)
    
    print("✅ Database cleared and reset successfully!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(initialize_warehouse())