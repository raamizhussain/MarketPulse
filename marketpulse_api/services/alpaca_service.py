import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from marketpulse_api.core.config import settings

logger = logging.getLogger("marketpulse.alpaca")

ALPACA_DATA_URL = "https://data.alpaca.markets/v2"

async def fetch_alpaca_live_quote(symbol: str) -> Optional[Dict[str, Any]]:
    """Fetches real-time trade & quote tick from Alpaca IEX data feed."""
    api_key = settings.ALPACA_API_KEY
    secret_key = settings.ALPACA_SECRET_KEY
    if not api_key or not secret_key:
        return None

    # Alpaca only supports US equity symbols (e.g. AAPL, NVDA)
    if ".NS" in symbol.upper() or ".BO" in symbol.upper():
        return None

    clean_sym = symbol.upper().strip()
    headers = {
        "APCA-API-KEY-ID": api_key,
        "APCA-API-SECRET-KEY": secret_key
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"{ALPACA_DATA_URL}/stocks/{clean_sym}/trades/latest", headers=headers)
            if res.status_code == 200:
                data = res.json()
                trade = data.get("trade", {})
                price = trade.get("p")
                size = trade.get("s", 0)
                timestamp = trade.get("t")
                if price:
                    return {
                        "symbol": clean_sym,
                        "price": float(price),
                        "size": int(size),
                        "timestamp": timestamp or datetime.now(timezone.utc).isoformat(),
                        "source": "alpaca"
                    }
    except Exception as e:
        logger.warning(f"Alpaca quote fetch error for {clean_sym}: {e}")

    return None


async def fetch_alpaca_news(symbol: str, limit: int = 5) -> Optional[List[Dict[str, Any]]]:
    """Fetches real live streaming news headlines for a stock ticker from Alpaca News API."""
    api_key = settings.ALPACA_API_KEY
    secret_key = settings.ALPACA_SECRET_KEY
    if not api_key or not secret_key:
        return None

    clean_sym = symbol.replace(".NS", "").replace(".BO", "").upper().strip()
    headers = {
        "APCA-API-KEY-ID": api_key,
        "APCA-API-SECRET-KEY": secret_key
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(
                f"{ALPACA_DATA_URL}/news",
                headers=headers,
                params={"symbols": clean_sym, "limit": limit}
            )
            if res.status_code == 200:
                data = res.json()
                news_items = data.get("news", [])
                formatted = []
                for item in news_items:
                    formatted.append({
                        "headline": item.get("headline", ""),
                        "summary": item.get("summary", ""),
                        "source": item.get("source", "Alpaca News"),
                        "url": item.get("url", ""),
                        "created_at": item.get("created_at", datetime.now(timezone.utc).isoformat())
                    })
                return formatted
    except Exception as e:
        logger.warning(f"Alpaca news fetch error for {clean_sym}: {e}")

    return None
