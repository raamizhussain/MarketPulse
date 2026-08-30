import {
  UserProfile,
  TickerSummary,
  CurrentRegime,
  SentimentData,
  PricePoint,
  AgentRecommendation,
  AgentStats,
  Strategy,
  Trade,
  EquityCurvePoint,
  AlertRule,
  AlertHistoryItem,
  CorrelationMatrixData,
  SystemHealth,
  ModelTelemetry,
  ApiKeyItem
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1');

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('mp_access_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        try {
          const errJson = await response.json();
          errorMsg = errJson.detail || errorMsg;
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }
      return await response.json();
    } catch (err: any) {
      console.warn(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    return this.request<{ access_token: string; refresh_token: string; expires_in: number }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, fullName: string, tier: string = 'pro') {
    return this.request<{ access_token: string; refresh_token: string; expires_in: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, subscription_tier: tier }),
    });
  }

  async sendOTP(email: string, purpose: string = 'login') {
    return this.request<{ message: string; otp_preview: string; expires_in: number }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
  }

  async verifyOTP(email: string, otpCode: string, fullName?: string, tier: string = 'pro') {
    return this.request<{ access_token: string; refresh_token: string; expires_in: number }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp_code: otpCode, full_name: fullName, subscription_tier: tier }),
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/me');
  }

  async updateProfile(fullName?: string, timezone?: string): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ full_name: fullName, timezone }),
    });
  }

  async upgradeTier(tier: string, billingCycle: string = 'monthly', paymentMethod?: string): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/upgrade-tier', {
      method: 'POST',
      body: JSON.stringify({ tier, billing_cycle: billingCycle, payment_method: paymentMethod }),
    });
  }

  async getInvoices(): Promise<Array<{ id: string; invoice_number: string; tier: string; amount_usd: number; amount_inr: number; status: string; payment_method: string; created_at: string }>> {
    return this.request<any[]>('/auth/invoices');
  }

  async getApiKeys(): Promise<ApiKeyItem[]> {
    return this.request<ApiKeyItem[]>('/auth/api-keys');
  }

  async createApiKey(name: string): Promise<ApiKeyItem> {
    return this.request<ApiKeyItem>('/auth/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // --- Market Data ---
  async getTickers(region: string = 'ALL'): Promise<TickerSummary[]> {
    return this.request<TickerSummary[]>(`/market/tickers?region=${region}`);
  }

  async searchStocks(query: string = '', region: string = 'ALL'): Promise<Array<{ symbol: string; name: string; exchange: string; country: string; currency: string }>> {
    return this.request<Array<{ symbol: string; name: string; exchange: string; country: string; currency: string }>>(`/market/search?query=${encodeURIComponent(query)}&region=${region}`);
  }

  async getCurrentRegime(symbol: string = 'AAPL'): Promise<CurrentRegime> {
    return this.request<CurrentRegime>(`/market/current-regime?symbol=${symbol}`);
  }

  async getSentiment(symbol: string = 'AAPL'): Promise<SentimentData> {
    return this.request<SentimentData>(`/market/sentiment/${symbol}`);
  }

  async getPriceHistory(symbol: string = 'AAPL', period: string = '30d'): Promise<{ count: number; data: PricePoint[] }> {
    return this.request<{ count: number; data: PricePoint[] }>(`/market/price-history?symbol=${symbol}&period=${period}`);
  }

  async getRegimeHistory(days: number = 30, symbol: string = 'AAPL') {
    return this.request<any[]>(`/market/regime-history?days=${days}&symbol=${symbol}`);
  }

  // --- Multi-Agent Committee ---
  async getLatestRecommendation(symbol: string = 'AAPL'): Promise<AgentRecommendation> {
    return this.request<AgentRecommendation>(`/agents/latest-recommendation?symbol=${symbol}`);
  }

  async getRecommendationHistory(limit: number = 20): Promise<AgentRecommendation[]> {
    return this.request<AgentRecommendation[]>(`/agents/recommendation-history?limit=${limit}`);
  }

  async getAgentStats(): Promise<AgentStats> {
    return this.request<AgentStats>('/agents/agent-stats');
  }

  async triggerAnalysis(symbol: string, overrideSentiment?: number): Promise<AgentRecommendation> {
    return this.request<AgentRecommendation>('/agents/analyze', {
      method: 'POST',
      body: JSON.stringify({ symbol, custom_sentiment_override: overrideSentiment }),
    });
  }

  // --- Strategies & Portfolio ---
  async getStrategies(): Promise<Strategy[]> {
    return this.request<Strategy[]>('/strategies');
  }

  async getStrategyById(id: string): Promise<Strategy> {
    return this.request<Strategy>(`/strategies/${id}`);
  }

  async blendModel(symbols: string[], riskLevel: string = 'moderate', strategyName?: string): Promise<any> {
    return this.request<any>('/strategies/blend-model', {
      method: 'POST',
      body: JSON.stringify({ symbols, risk_level: riskLevel, strategy_name: strategyName }),
    });
  }

  async getWarehouseTelemetry(): Promise<any> {
    return this.request<any>('/strategies/warehouse');
  }

  async createStrategy(data: Partial<Strategy>): Promise<Strategy> {
    return this.request<Strategy>('/strategies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStrategy(id: string, data: Partial<Strategy>): Promise<Strategy> {
    return this.request<Strategy>(`/strategies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStrategy(id: string) {
    return this.request<{ message: string; id: string }>(`/strategies/${id}`, {
      method: 'DELETE',
    });
  }

  async getStrategyTrades(id: string, symbol?: string, action?: string, limit: number = 50): Promise<Trade[]> {
    let url = `/strategies/${id}/trades?limit=${limit}`;
    if (symbol) url += `&symbol=${symbol}`;
    if (action) url += `&action=${action}`;
    return this.request<Trade[]>(url);
  }

  async getStrategyEquityCurve(id: string, days: number = 90): Promise<EquityCurvePoint[]> {
    return this.request<EquityCurvePoint[]>(`/strategies/${id}/equity-curve?days=${days}`);
  }

  // --- Real-Time Paper Trading ---
  async getPaperPortfolio(symbol?: string): Promise<any> {
    const url = symbol ? `/trading/portfolio?symbol=${encodeURIComponent(symbol)}` : '/trading/portfolio';
    return this.request<any>(url);
  }

  async placePaperOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    shares: number,
    orderType: string = 'MARKET',
    productType: string = 'CNC'
  ): Promise<any> {
    return this.request<any>('/trading/order', {
      method: 'POST',
      body: JSON.stringify({ symbol, side, shares, order_type: orderType, product_type: productType }),
    });
  }

  async depositPaperFunds(amountUsd: number = 0, amountInr: number = 0): Promise<any> {
    return this.request<any>('/trading/funds/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount_usd: amountUsd, amount_inr: amountInr }),
    });
  }

  async resetPaperPortfolio(): Promise<any> {
    return this.request<any>('/trading/reset', {
      method: 'POST',
    });
  }

  // --- Alerts & Risk ---
  async getAlertRules(): Promise<AlertRule[]> {
    return this.request<AlertRule[]>('/alerts/config');
  }

  async createAlertRule(data: Partial<AlertRule>): Promise<AlertRule> {
    return this.request<AlertRule>('/alerts/config', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAlertRule(ruleId: string) {
    return this.request<{ message: string }>(`/alerts/config/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async getAlertHistory(): Promise<AlertHistoryItem[]> {
    return this.request<AlertHistoryItem[]>('/alerts/history');
  }

  async acknowledgeAlert(alertId: string): Promise<AlertHistoryItem> {
    return this.request<AlertHistoryItem>(`/alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
    });
  }

  // --- Analytics ---
  async getPerformanceByRegime() {
    return this.request<any>('/analytics/performance-by-regime');
  }

  async getRegimeStats() {
    return this.request<any>('/analytics/regime-statistics');
  }

  async getSentimentDistribution() {
    return this.request<any>('/analytics/sentiment-distribution');
  }

  async getMonthlyReturns(year: number = 2026) {
    return this.request<any>(`/analytics/monthly-returns?year=${year}`);
  }

  async getCorrelationMatrix(): Promise<CorrelationMatrixData> {
    return this.request<CorrelationMatrixData>('/analytics/correlation-matrix');
  }

  // --- Admin ---
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/admin/health');
  }

  async getModelTelemetry(): Promise<ModelTelemetry> {
    return this.request<ModelTelemetry>('/admin/models');
  }

  async getAdminUsers(): Promise<any[]> {
    return this.request<any[]>('/admin/users');
  }

  // --- Exports ---
  getExportTradesUrl(strategyId: string): string {
    return `${API_BASE}/export/trades?strategy_id=${strategyId}`;
  }

  getExportReportUrl(strategyId: string): string {
    return `${API_BASE}/export/performance-report?strategy_id=${strategyId}`;
  }
}

export const api = new ApiClient();
