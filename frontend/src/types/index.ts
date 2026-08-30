export type MarketRegimeType = 'Quiet Bull' | 'Turbulent Bear' | 'Sideways Choppy';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'analyst';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  timezone: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface TickerSummary {
  symbol: string;
  price: number;
  change_24h: number;
  change_24h_pct: number;
  regime: string;
  regime_state: number;
  sentiment_score: number;
  sentiment_label: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
  volume_24h: number;
  last_updated: string;
}

export interface CurrentRegime {
  symbol: string;
  regime: 'bull' | 'bear' | 'sideways';
  regime_state: number;
  regime_name: MarketRegimeType;
  confidence: number;
  volatility: number;
  log_return: number;
  price: number;
  timestamp: string;
}

export interface SentimentData {
  symbol: string;
  sentiment_score: number;
  sentiment_label: 'bullish' | 'bearish' | 'neutral';
  articles_analyzed: number;
  top_headlines: Array<{
    headline: string;
    score: number;
    created_at: string;
  }>;
  timestamp: string;
}

export interface PricePoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  regime_state?: number;
  regime_label?: string;
}

export interface AgentRecommendation {
  id: string;
  symbol: string;
  bull_argument: string;
  bear_argument: string;
  judge_recommendation: string;
  recommendation_label: 'BUY' | 'SELL' | 'HOLD' | 'CASH';
  confidence: number;
  agents_aligned: boolean;
  regime: string;
  sentiment_score: number;
  price: number;
  volatility: number;
  historical_episodes?: string[];
  catalyst_thresholds?: string;
  timestamp: string;
}

export interface AgentStats {
  bull_accuracy: number;
  bear_accuracy: number;
  judge_accuracy: number;
  total_debates_run: number;
  alignment_rate: number;
  agents: Array<{
    agent_name: string;
    role: string;
    win_rate: number;
    total_calls: number;
    avg_confidence: number;
    favorable_regimes: string[];
  }>;
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  allocation_percentage: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  stocks: string[];
  rebalance_frequency: 'daily' | 'weekly' | 'realtime';
  initial_capital: number;
  current_equity: number;
  cash_balance: number;
  max_drawdown_limit: number;
  stop_loss_pct: number;
  take_profit_pct: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  performance?: StrategyPerformance;
}

export interface StrategyPerformance {
  strategy_id: string;
  strategy_name: string;
  initial_capital: number;
  current_equity: number;
  total_return: number;
  total_return_pct: number;
  baseline_return_pct: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  profit_factor: number;
  avg_trade_pnl: number;
  monthly_returns: Record<string, number>;
}

export interface Trade {
  id: string;
  strategy_id: string;
  timestamp: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  quantity: number;
  price: number;
  pnl: number;
  pnl_percent: number;
  recommendation_confidence: number;
  regime_at_trade: string;
  sentiment_at_trade: number;
  notes?: string;
  tags?: string;
}

export interface EquityCurvePoint {
  timestamp: string;
  strategy_equity: number;
  baseline_equity: number;
  regime_state: number;
  drawdown: number;
}

export interface AlertRule {
  id: string;
  user_id: string;
  alert_type: 'regime_change' | 'sentiment_drop' | 'drawdown_exceed' | 'low_confidence';
  threshold_value: number;
  symbol?: string;
  channel: 'in_app' | 'webhook' | 'email';
  webhook_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface AlertHistoryItem {
  id: string;
  alert_id?: string;
  user_id: string;
  triggered_at: string;
  trigger_value: number;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_acknowledged: boolean;
  acknowledged_at?: string;
}

export interface CorrelationMatrixData {
  symbols: string[];
  matrix: number[][];
  warnings: string[];
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime_seconds: number;
  data_ingestion_lag_seconds: number;
  active_users_count: number;
  total_strategies_active: number;
  database_connected: boolean;
  redis_connected: boolean;
  api_error_rate_pct: number;
  timestamp: string;
}

export interface ModelTelemetry {
  hmm_convergence_status: string;
  hmm_last_trained: string;
  hmm_states_count: number;
  finbert_latency_ms: number;
  agent_latency_ms: number;
  rag_vectors_indexed: number;
  calibration_score: number;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used?: string;
  is_active: boolean;
  raw_key?: string;
}
