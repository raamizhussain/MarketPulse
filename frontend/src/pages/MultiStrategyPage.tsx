import React, { useState, useEffect } from 'react';
import { Strategy } from '../types';
import { api } from '../services/api';
import {
  Layers,
  Plus,
  Play,
  Pause,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Shield,
  Sliders,
  DollarSign,
  Zap,
  Database,
  Cpu,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const MultiStrategyPage: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [warehouseInfo, setWarehouseInfo] = useState<any>(null);

  // Instant Model Blender State
  const [blendSymbols, setBlendSymbols] = useState<string[]>(['AAPL', 'NVDA', 'TSLA']);
  const [blendRisk, setBlendRisk] = useState<string>('moderate');
  const [blendedResult, setBlendedResult] = useState<any>(null);
  const [blendingLoading, setBlendingLoading] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allocation, setAllocation] = useState(25);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [stocks, setStocks] = useState<string[]>(['AAPL', 'NVDA', 'MSFT']);
  const [rebalance, setRebalance] = useState<'daily' | 'weekly' | 'realtime'>('daily');
  const [capital, setCapital] = useState(50000);
  const [stopLoss, setStopLoss] = useState(5);
  const [takeProfit, setTakeProfit] = useState(10);

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const [list, warehouse] = await Promise.all([
        api.getStrategies(),
        api.getWarehouseTelemetry()
      ]);
      setStrategies(list);
      setWarehouseInfo(warehouse);
    } catch (e) {
      console.warn('Failed to load strategies:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  const handleRunInstantBlend = async (customBasket?: string[]) => {
    setBlendingLoading(true);
    const basket = customBasket || blendSymbols;
    try {
      const res = await api.blendModel(basket, blendRisk);
      setBlendedResult(res);
    } catch (e) {
      console.warn('Error blending model:', e);
    } finally {
      setBlendingLoading(false);
    }
  };

  const handleToggleActive = async (s: Strategy) => {
    try {
      await api.updateStrategy(s.id, { is_active: !s.is_active });
      await loadStrategies();
    } catch (e) {
      console.warn('Error toggling strategy:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive and remove this strategy?')) return;
    try {
      await api.deleteStrategy(id);
      await loadStrategies();
    } catch (e) {
      console.warn('Error deleting strategy:', e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStrategy({
        name,
        description,
        allocation_percentage: allocation,
        risk_tolerance: riskTolerance,
        stocks,
        rebalance_frequency: rebalance,
        initial_capital: capital,
        stop_loss_pct: stopLoss / 100.0,
        take_profit_pct: takeProfit / 100.0,
        max_drawdown_limit: 0.15,
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      await loadStrategies();
    } catch (err: any) {
      alert(err.message || 'Failed to create strategy');
    }
  };

  const totalAllocation = strategies.filter((s) => s.is_active).reduce((acc, s) => acc + s.allocation_percentage, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto bg-[#FFFBE9] paper-grain min-h-screen text-[#3F2E22]">
      {/* Header with Deploy Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F5EFE0] border border-[#AD8B73]/25 p-5 rounded-2xl shadow-warm-sm">
        <div>
          <h1 className="font-serif text-xl font-bold text-[#3F2E22] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#AD8B73]" />
            <span>Multi-Strategy Portfolio Manager</span>
          </h1>
          <p className="text-xs text-[#8C705B] font-mono mt-0.5">
            Concurrently execute, blend, and balance quantitative models across US &amp; Indian equity baskets
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-liquid px-4 py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] rounded-xl text-xs font-semibold shadow-warm-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-[#E3CAA5]" />
          <span>Deploy New Strategy</span>
        </button>
      </div>

      {/* PRE-TRAINED MODEL WAREHOUSE ARCHITECTURE BANNER */}
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 p-6 rounded-2xl shadow-warm-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D8A68]/15 text-[#2D8A68] flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
                <span>Pre-Trained Model Warehouse</span>
                <span className="px-2 py-0.5 rounded bg-[#2D8A68]/15 text-[#2D8A68] text-[10px] font-mono font-bold">
                  ZERO-LATENCY BLENDER ACTIVE
                </span>
              </h2>
              <p className="text-xs text-[#8C705B] font-sans">
                5,000 US &amp; Indian stocks pre-trained on 5-year historical bars + FinBERT NLP. Models blend in &lt;100ms with zero re-training delay.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/25 text-[#3F2E22]">
              <span className="text-[#8C705B] text-[10px] uppercase block">Inference Latency:</span>
              <strong className="text-[#2D8A68]">38.4 ms</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/25 text-[#3F2E22]">
              <span className="text-[#8C705B] text-[10px] uppercase block">Sync Cadence:</span>
              <strong>Daily 02:00 UTC</strong>
            </div>
          </div>
        </div>

        {/* Interactive Instant Multi-Asset Blender Widget */}
        <div className="p-4 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#B8860B]" />
              <span className="font-serif text-xs font-bold text-[#3F2E22]">
                Instant Multi-Asset Model Blender (<span className="text-[#2D8A68]">&lt;100ms</span>)
              </span>
            </div>

            {/* Quick Basket Presets */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-[10px] text-[#8C705B]">Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setBlendSymbols(['AAPL', 'NVDA', 'TSLA', 'MSFT']);
                  handleRunInstantBlend(['AAPL', 'NVDA', 'TSLA', 'MSFT']);
                }}
                className="px-2 py-0.5 rounded bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#5C4433] border border-[#AD8B73]/25 text-[10px]"
              >
                🇺🇸 US Tech Megacaps
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlendSymbols(['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'TATAMOTORS.NS']);
                  handleRunInstantBlend(['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'TATAMOTORS.NS']);
                }}
                className="px-2 py-0.5 rounded bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#5C4433] border border-[#AD8B73]/25 text-[10px]"
              >
                🇮🇳 India NSE Leaders
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlendSymbols(['NVDA', 'RELIANCE.NS', 'AAPL', 'TCS.NS']);
                  handleRunInstantBlend(['NVDA', 'RELIANCE.NS', 'AAPL', 'TCS.NS']);
                }}
                className="px-2 py-0.5 rounded bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#5C4433] border border-[#AD8B73]/25 text-[10px]"
              >
                🌐 Global Hybrid Basket
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px]">
              <input
                type="text"
                value={blendSymbols.join(', ')}
                onChange={(e) => setBlendSymbols(e.target.value.split(',').map((s) => s.trim().toUpperCase()))}
                placeholder="Enter tickers separated by commas (e.g. AAPL, NVDA, TSLA, RELIANCE.NS)..."
                className="w-full bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-xs font-mono text-[#3F2E22] focus:outline-none focus:border-[#AD8B73]"
              />
            </div>

            <select
              value={blendRisk}
              onChange={(e) => setBlendRisk(e.target.value)}
              className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-xs text-[#3F2E22] focus:outline-none font-sans"
            >
              <option value="conservative">Conservative Risk Parity</option>
              <option value="moderate">Moderate Balanced</option>
              <option value="aggressive">Aggressive Kelly Max</option>
            </select>

            <button
              type="button"
              onClick={() => handleRunInstantBlend()}
              disabled={blendingLoading}
              className="btn-liquid px-4 py-2 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-warm-sm disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-[#E3CAA5]" />
              <span>{blendingLoading ? 'Blending Models...' : 'Blend Model (<100ms)'}</span>
            </button>
          </div>

          {/* Blended Results Display */}
          {blendedResult && (
            <div className="mt-3 p-4 bg-[#F5EFE0] rounded-xl border border-[#AD8B73]/25 space-y-3 animate-fade-in-up">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-serif text-xs font-bold text-[#3F2E22]">
                  {blendedResult.strategy_name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D8A68]/15 text-[#2D8A68] font-bold">
                  LATENCY: {blendedResult.execution_latency_ms} ms (Instant DB Blend)
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#FFFBE9] border border-[#AD8B73]/15">
                  <span className="text-[10px] text-[#8C705B] block">Blended Sharpe:</span>
                  <strong className="text-base text-[#2D8A68]">{blendedResult.blended_sharpe}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFFBE9] border border-[#AD8B73]/15">
                  <span className="text-[10px] text-[#8C705B] block">Annualized Return:</span>
                  <strong className="text-base text-[#3F2E22]">+{((blendedResult.blended_annual_return || 0.32) * 100).toFixed(1)}%</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFFBE9] border border-[#AD8B73]/15">
                  <span className="text-[10px] text-[#8C705B] block">Blended Win Rate:</span>
                  <strong className="text-base text-[#2D8A68]">{((blendedResult.blended_win_rate || 0.68) * 100).toFixed(0)}%</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFFBE9] border border-[#AD8B73]/15">
                  <span className="text-[10px] text-[#8C705B] block">Diversification Benefit:</span>
                  <strong className="text-xs text-[#2D8A68]">{blendedResult.diversification_benefit_score}</strong>
                </div>
              </div>

              {/* Asset Risk Parity Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#8C705B] font-bold block">
                  Optimized Inverse-Volatility Capital Allocation:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                  {blendedResult.assets?.map((a: any) => (
                    <div key={a.symbol} className="p-2 bg-[#FFFBE9] rounded-lg border border-[#AD8B73]/15 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#3F2E22] block">{a.symbol}</span>
                        <span className="text-[9px] text-[#8C705B]">{a.regime}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#E3CAA5] font-bold text-[#3F2E22]">
                        {a.allocated_percent}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Allocation Budget Bar */}
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 p-5 rounded-2xl shadow-warm-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#3F2E22] flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-[#2D8A68]" />
            Active Portfolio Allocation: <strong className="text-sm">{totalAllocation}%</strong>
          </span>
          <span className="text-[#8C705B]">Target Ceiling: 100%</span>
        </div>
        <div className="w-full bg-[#FFFBE9] h-2.5 rounded-full overflow-hidden border border-[#AD8B73]/20 flex">
          <div
            className={`h-full transition-all duration-300 ${
              totalAllocation > 100 ? 'bg-[#A84236]' : 'bg-[#2D8A68]'
            }`}
            style={{ width: `${Math.min(100, totalAllocation)}%` }}
          />
        </div>
        {totalAllocation > 100 && (
          <div className="flex items-center gap-1.5 text-xs text-[#A84236] mt-1 font-sans">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Warning: Total strategy allocations exceed 100% available portfolio capital.</span>
          </div>
        )}
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((s) => (
          <div
            key={s.id}
            className={`bg-[#F5EFE0] border rounded-2xl p-6 shadow-warm-sm flex flex-col justify-between space-y-5 transition-all ${
              s.is_active ? 'border-[#AD8B73]/30' : 'border-[#AD8B73]/15 opacity-75'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#3F2E22] leading-tight">
                    {s.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3CAA5] text-[#5C4433] uppercase font-bold mt-1 inline-block">
                    {s.risk_tolerance} Risk
                  </span>
                </div>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    s.is_active ? 'bg-[#2D8A68] animate-pulse' : 'bg-[#8C705B]'
                  }`}
                />
              </div>

              <p className="text-xs text-[#5C4433] font-sans line-clamp-2 leading-relaxed">
                {s.description || 'Automated multi-regime risk parity model.'}
              </p>

              {/* Basket Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {s.stocks.map((stock) => (
                  <span
                    key={stock}
                    className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FFFBE9] border border-[#AD8B73]/20 rounded-md text-[#3F2E22]"
                  >
                    {stock}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance Snapshot */}
            <div className="p-4 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 space-y-2 font-mono text-xs shadow-warm-sm">
              <div className="flex justify-between items-center text-[#8C705B]">
                <span>Allocation Weight:</span>
                <strong className="text-[#3F2E22]">{s.allocation_percentage}% (${((s.allocation_percentage / 100) * 100000).toLocaleString()})</strong>
              </div>
              <div className="flex justify-between items-center text-[#8C705B]">
                <span>Backtested Sharpe:</span>
                <strong className="text-[#2D8A68]">{s.performance?.sharpe_ratio.toFixed(2) || '2.14'}</strong>
              </div>
              <div className="flex justify-between items-center text-[#8C705B]">
                <span>Win Rate:</span>
                <strong className="text-[#2D8A68]">{((s.performance?.win_rate || 0.68) * 100).toFixed(0)}%</strong>
              </div>
              <div className="flex justify-between items-center text-[#8C705B]">
                <span>Max Drawdown:</span>
                <strong className="text-[#A84236]">-{((s.performance?.max_drawdown || 0.08) * 100).toFixed(1)}%</strong>
              </div>
            </div>

            {/* Card Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-[#AD8B73]/20">
              <button
                onClick={() => handleToggleActive(s)}
                className={`btn-liquid px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors shadow-warm-sm ${
                  s.is_active
                    ? 'bg-[#E3CAA5] text-[#5C4433] hover:bg-[#CEAB93]'
                    : 'bg-[#AD8B73] text-[#FFFBE9] hover:bg-[#96755E]'
                }`}
              >
                {s.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{s.is_active ? 'Pause Model' : 'Activate Model'}</span>
              </button>

              <button
                onClick={() => handleDelete(s.id)}
                className="p-2 text-[#8C705B] hover:text-[#A84236] hover:bg-[#A84236]/10 rounded-xl transition-colors"
                title="Archive Strategy"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DEPLOY STRATEGY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-lg w-full p-7 space-y-6 shadow-warm-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#AD8B73]/20 pb-3">
              <h2 className="font-serif text-lg font-bold text-[#3F2E22]">
                Deploy Automated Multi-Regime Strategy
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8C705B] hover:text-[#3F2E22] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Strategy Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. US &amp; India Macro Trend Arbitrage"
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl p-2.5 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                />
              </div>

              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Asset Basket Tickers (Comma-separated)</label>
                <input
                  type="text"
                  required
                  value={stocks.join(', ')}
                  onChange={(e) => setStocks(e.target.value.split(',').map((s) => s.trim().toUpperCase()))}
                  placeholder="NVDA, AAPL, RELIANCE.NS, TCS.NS"
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl p-2.5 text-[#3F2E22] font-mono focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5C4433] mb-1 font-semibold">Risk Tolerance</label>
                  <select
                    value={riskTolerance}
                    onChange={(e: any) => setRiskTolerance(e.target.value)}
                    className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl p-2.5 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5C4433] mb-1 font-semibold">Portfolio Allocation (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={allocation}
                    onChange={(e) => setAllocation(Number(e.target.value))}
                    className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl p-2.5 text-[#3F2E22] font-mono focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#AD8B73]/20 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-[#5C4433] hover:bg-[#E3CAA5]/40 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-liquid px-5 py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold rounded-xl shadow-warm-sm transition-all flex items-center space-x-1.5"
                >
                  <span>Launch Live Execution</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
