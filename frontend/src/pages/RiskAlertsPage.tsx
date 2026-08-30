import React, { useState, useEffect } from 'react';
import { AlertRule, AlertHistoryItem, CorrelationMatrixData } from '../types';
import { api } from '../services/api';
import {
  ShieldAlert,
  Bell,
  CheckCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Flame,
  Activity,
  Check,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

export const RiskAlertsPage: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [history, setHistory] = useState<AlertHistoryItem[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationMatrixData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New Rule Form
  const [alertType, setAlertType] = useState<any>('regime_change');
  const [threshold, setThreshold] = useState<number>(1.0);
  const [channel, setChannel] = useState<any>('in_app');
  const [symbol, setSymbol] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [rList, hList, cMatrix] = await Promise.all([
        api.getAlertRules(),
        api.getAlertHistory(),
        api.getCorrelationMatrix(),
      ]);
      setRules(rList);
      setHistory(hList);
      setCorrelation(cMatrix);
    } catch (e) {
      console.warn('Error loading risk data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAlertRule({
        alert_type: alertType,
        threshold_value: threshold,
        symbol,
        channel,
        is_active: true,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error creating rule');
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, is_acknowledged: true } : h)));
    } catch (e) {
      console.warn('Error acknowledging alert:', e);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await api.deleteAlertRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.warn('Error deleting rule:', e);
    }
  };

  const getHeatmapColor = (val: number) => {
    if (val > 0.75) return 'bg-[#A84236]/20 text-[#A84236] font-bold border border-[#A84236]/30';
    if (val > 0.4) return 'bg-[#B8860B]/15 text-[#B8860B] font-bold border border-[#B8860B]/30';
    if (val < -0.2) return 'bg-[#2D8A68]/20 text-[#2D8A68] font-bold border border-[#2D8A68]/30';
    return 'bg-[#FFFBE9] text-[#5C4433] border border-[#AD8B73]/20';
  };

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto bg-[#FFFBE9] paper-grain min-h-screen text-[#3F2E22]">
      {/* Header */}
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 p-5 rounded-2xl shadow-warm-sm flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-[#3F2E22] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#AD8B73]" />
            <span>Risk Architecture &amp; Alert Dispatcher</span>
          </h1>
          <p className="text-xs text-[#8C705B] font-mono mt-0.5">
            Configure algorithmic alerts, manage downside stops, and inspect cross-asset correlation matrices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Rule & Active Rules */}
        <div className="space-y-6">
          {/* Rule Creator */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#AD8B73]" />
              <span>Create Algorithmic Alert Rule</span>
            </h2>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Trigger Type</label>
                <select
                  value={alertType}
                  onChange={(e: any) => setAlertType(e.target.value)}
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                >
                  <option value="regime_change">Regime Shift (e.g. Bull → Bear)</option>
                  <option value="drawdown_threshold">Peak Drawdown Limit Exceeded</option>
                  <option value="sentiment_drop">FinBERT News Sentiment Collapse</option>
                  <option value="volatility_spike">Realized Volatility Spike</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#5C4433] mb-1 font-semibold">Asset Filter</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="ALL or AAPL"
                    className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] font-mono shadow-warm-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#5C4433] mb-1 font-semibold">Threshold Level</label>
                  <input
                    type="number"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] font-mono shadow-warm-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Notification Channel</label>
                <select
                  value={channel}
                  onChange={(e: any) => setChannel(e.target.value)}
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] shadow-warm-sm"
                >
                  <option value="in_app">In-Terminal Banner</option>
                  <option value="email">Institutional Email</option>
                  <option value="webhook">Webhook (Slack / Discord)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-liquid w-full mt-2 py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold rounded-xl transition-colors shadow-warm-sm"
              >
                Deploy Alert Rule
              </button>
            </form>
          </div>

          {/* Active Rules List */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-3">
            <h2 className="font-serif text-base font-bold text-[#3F2E22]">Active Guardrail Rules</h2>
            <div className="space-y-2">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-[#FFFBE9] border border-[#AD8B73]/20 rounded-xl flex items-center justify-between text-xs shadow-warm-sm"
                >
                  <div>
                    <span className="font-serif font-bold text-[#3F2E22] block capitalize">
                      {r.alert_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#8C705B] font-mono">
                      {r.symbol} • Threshold: {r.threshold_value} • {r.channel}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(r.id)}
                    className="p-1.5 text-[#8C705B] hover:text-[#A84236] hover:bg-[#A84236]/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Live Alerts & Correlation Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Alerts Stream */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#B8860B]" />
                <span>Real-Time Alert Dispatch Stream</span>
              </h2>
              <span className="text-[10px] font-mono text-[#8C705B]">
                {history.filter((h) => !h.is_acknowledged).length} Unacknowledged
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    h.is_acknowledged
                      ? 'bg-[#FFFBE9]/60 border-[#AD8B73]/15 opacity-60'
                      : 'bg-[#FFFBE9] border-[#AD8B73]/30 shadow-warm-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          h.severity === 'critical'
                            ? 'bg-[#A84236]/15 text-[#A84236] border border-[#A84236]/30'
                            : h.severity === 'warning'
                            ? 'bg-[#B8860B]/15 text-[#B8860B] border border-[#B8860B]/30'
                            : 'bg-[#AD8B73]/15 text-[#5C4433]'
                        }`}
                      >
                        {h.severity.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[#8C705B] font-mono">
                        {new Date(h.triggered_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C4433] font-sans">{h.message}</p>
                  </div>

                  {!h.is_acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(h.id)}
                      className="px-2.5 py-1 bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#5C4433] rounded-lg text-xs font-semibold border border-[#AD8B73]/25 transition-colors shrink-0"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Asset Correlation Heatmap Matrix */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#AD8B73]" />
                  <span>Cross-Asset Correlation Matrix</span>
                </h2>
                <p className="text-xs text-[#8C705B] font-mono mt-0.5">
                  Realized log return pairwise correlation (Red &gt;0.75 denotes concentration hazard)
                </p>
              </div>
            </div>

            {correlation && (
              <div className="overflow-x-auto bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 p-4 shadow-warm-sm">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="p-2 text-[#8C705B]"></th>
                      {correlation.symbols.map((sym) => (
                        <th key={sym} className="p-2 text-[#3F2E22] font-bold">
                          {sym}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlation.symbols.map((rowSym, rIdx) => (
                      <tr key={rowSym}>
                        <td className="p-2 text-left font-bold text-[#3F2E22]">{rowSym}</td>
                        {correlation.matrix[rIdx].map((val, cIdx) => (
                          <td key={cIdx} className="p-1.5">
                            <span
                              className={`inline-block w-full py-1 rounded-lg text-xs font-bold ${getHeatmapColor(
                                val
                              )}`}
                            >
                              {val.toFixed(2)}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
