import asyncio
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from marketpulse_api.services.websocket_manager import ws_manager
from marketpulse_api.services.market_service import get_active_tickers_summary

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Real-Time WebSockets"])


@router.websocket("/ws/market-data")
async def websocket_market_data(websocket: WebSocket):
    """Real-time stream pushing live price ticks, HMM regime transitions, and FinBERT sentiment."""
    await ws_manager.connect(websocket, "market-data")
    try:
        while True:
            # Broadcast snapshot every 5-10 seconds
            tickers = await get_active_tickers_summary()
            payload = {
                "type": "market_tick",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "tickers": [t.model_dump() for t in tickers]
            }
            await websocket.send_text(json.dumps(payload, default=str))
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "market-data")
    except Exception as e:
        logger.warning(f"Market data websocket error: {e}")
        ws_manager.disconnect(websocket, "market-data")


@router.websocket("/ws/agent-updates")
async def websocket_agent_updates(websocket: WebSocket):
    """Real-time stream pushing new Bull/Bear arguments and Judge trade decisions."""
    await ws_manager.connect(websocket, "agent-updates")
    try:
        while True:
            # Heartbeat / periodic update
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "agent-updates")
    except Exception:
        ws_manager.disconnect(websocket, "agent-updates")


@router.websocket("/ws/portfolio-updates")
async def websocket_portfolio_updates(websocket: WebSocket):
    """Real-time stream pushing trade executions, P&L ticks, and drawdown alerts."""
    await ws_manager.connect(websocket, "portfolio-updates")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, "portfolio-updates")
    except Exception:
        ws_manager.disconnect(websocket, "portfolio-updates")
