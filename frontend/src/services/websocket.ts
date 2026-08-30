type MessageHandler = (data: any) => void;

class RealtimeClient {
  private socket: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimer: any = null;
  private simTimer: any = null;
  private isConnected: boolean = false;
  private maxReconnectAttempts: number = 3;
  private reconnectAttempts: number = 0;

  constructor() {
    this.initSocket();
    this.startSimulationTicker();
  }

  private initSocket() {
    let wsUrl = import.meta.env.VITE_WS_URL;
    // On Vercel serverless lambdas, WebSockets are unsupported, so rely on simulation ticker
    if (!wsUrl && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return;
    }

    if (!wsUrl && typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}/ws/market-data`;
    }

    if (!wsUrl) return;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('⚡ MarketPulse Realtime Engine Connected via WebSocket.');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlers.forEach((handler) => handler(data));
        } catch (e) {
          console.warn('Failed to parse WebSocket frame:', e);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.isConnected = false;
        if (this.socket) {
          try {
            this.socket.close();
          } catch {
            // ignore
          }
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return; // Stop spamming reconnects if server doesn't support WebSockets
    }
    if (this.reconnectTimer) return;
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.initSocket();
    }, 10000);
  }

  private startSimulationTicker() {
    if (this.simTimer) return;
    const symbols = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS'];
    this.simTimer = setInterval(() => {
      if (!this.isConnected) {
        const randSym = symbols[Math.floor(Math.random() * symbols.length)];
        const isINR = randSym.includes('.NS');
        const base = isINR ? 1285.50 : 242.50;
        const tickDelta = (Math.random() - 0.49) * (isINR ? 1.5 : 0.4);
        const tickData = {
          type: 'TICKER_UPDATE',
          symbol: randSym,
          price: Number((base + tickDelta).toFixed(2)),
          timestamp: new Date().toISOString()
        };
        this.handlers.forEach((handler) => handler(tickData));
      }
    }, 4000);
  }

  public subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  public getStatus(): boolean {
    return this.isConnected;
  }
}

export const realtime = new RealtimeClient();
