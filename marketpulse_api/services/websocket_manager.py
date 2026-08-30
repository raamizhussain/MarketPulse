import json
import logging
from typing import Dict, List, Set, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages active WebSocket connections grouped by channel topic."""

    def __init__(self):
        self.channels: Dict[str, Set[WebSocket]] = {
            "market-data": set(),
            "agent-updates": set(),
            "portfolio-updates": set()
        }

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.channels:
            self.channels[channel] = set()
        self.channels[channel].add(websocket)
        logger.info(f"WebSocket client connected to channel: {channel} (Total: {len(self.channels[channel])})")

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.channels and websocket in self.channels[channel]:
            self.channels[channel].remove(websocket)
            logger.info(f"WebSocket client disconnected from channel: {channel}")

    async def broadcast(self, channel: str, message: Any):
        """Broadcasts a JSON message to all connected clients in a specific channel."""
        if channel not in self.channels or not self.channels[channel]:
            return

        payload = message if isinstance(message, str) else json.dumps(message, default=str)
        disconnected_clients = []

        for connection in list(self.channels[channel]):
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message to WebSocket client: {e}")
                disconnected_clients.append(connection)

        for dead_client in disconnected_clients:
            self.disconnect(dead_client, channel)


ws_manager = WebSocketManager()
