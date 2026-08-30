import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from marketpulse_api.core.config import settings

logger = logging.getLogger("marketpulse.alpaca")

ALPACA_DATA_URL = "https://data.alpaca.markets/v2"
ALPACA_NEWS_URL = "https://data.alpaca.markets/v1beta1/news"
ALPACA_PAPER_URL = "https://paper-api.alpaca.markets/v2"

def _get_headers() -> Dict[str, str]:
    return {
        "APCA-API-KEY-ID": settings.ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": settings.ALPACA_SECRET_KEY
    }

async def fetch_alpaca_live_quote(symbol: str) -> Optional[Dict[str, Any]]:
    """Fetches real-time trade & quote tick from Alpaca IEX data feed."""
    if not settings.ALPACA_API_KEY or not settings.ALPACA_SECRET_KEY:
        return None

    # Alpaca only supports US equity symbols (e.g. AAPL, NVDA)
    if ".NS" in symbol.upper() or ".BO" in symbol.upper():
        return None

    clean_sym = symbol.upper().strip()

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"{ALPACA_DATA_URL}/stocks/{clean_sym}/trades/latest", headers=_get_headers())
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
    if not settings.ALPACA_API_KEY or not settings.ALPACA_SECRET_KEY:
        return None

    clean_sym = symbol.replace(".NS", "").replace(".BO", "").upper().strip()

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(
                ALPACA_NEWS_URL,
                headers=_get_headers(),
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


async def fetch_alpaca_account() -> Optional[Dict[str, Any]]:
    """Fetches live paper trading account balance & margin status from Alpaca."""
    if not settings.ALPACA_API_KEY or not settings.ALPACA_SECRET_KEY:
        return None

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"{ALPACA_PAPER_URL}/account", headers=_get_headers())
            if res.status_code == 200:
                return res.json()
    except Exception as e:
        logger.warning(f"Alpaca account fetch error: {e}")

    return None


async def execute_alpaca_order(symbol: str, qty: int, side: str, order_type: str = "market", time_in_force: str = "day") -> Optional[Dict[str, Any]]:
    """Executes a real paper trade on Alpaca Markets."""
    if not settings.ALPACA_API_KEY or not settings.ALPACA_SECRET_KEY:
        return None

    if ".NS" in symbol.upper() or ".BO" in symbol.upper():
        return None

    clean_sym = symbol.upper().strip()
    payload = {
        "symbol": clean_sym,
        "qty": qty,
        "side": side.lower(),
        "type": order_type.lower(),
        "time_in_force": time_in_force
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.post(f"{ALPACA_PAPER_URL}/orders", headers=_get_headers(), json=payload)
            if res.status_code in [200, 201]:
                return res.json()
    except Exception as e:
        logger.warning(f"Alpaca order execution error for {clean_sym}: {e}")

    return None
