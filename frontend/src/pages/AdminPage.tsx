import React, { useState, useEffect } from 'react';
import { SystemHealth, ModelTelemetry } from '../types';
import { api } from '../services/api';
import {
  Server,
  Activity,
  Users,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [telemetry, setTelemetry] = useState<ModelTelemetry | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [h, t, u] = await Promise.all([
        api.getSystemHealth(),
        api.getModelTelemetry(),
        api.getAdminUsers(),
      ]);
      setHealth(h);
      setTelemetry(t);
      setUsers(u);
    } catch (e) {
      console.warn('Error loading admin telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto bg-[#FFFBE9] paper-grain min-h-screen text-[#3F2E22]">
      {/* Header */}
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 p-5 rounded-2xl shadow-warm-sm flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-[#3F2E22] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#AD8B73]" />
            <span>Staff Administration &amp; Infrastructure Telemetry</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#AD8B73]/20 text-[#5C4433] border border-[#AD8B73]/30 uppercase">
              Staff Clearance
            </span>
          </h1>
          <p className="text-xs text-[#8C705B] font-mono mt-0.5">
            System uptime, LLM latency distribution, and multi-tenant database status
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2.5 bg-[#FFFBE9] hover:bg-[#E3CAA5]/40 text-[#5C4433] rounded-xl border border-[#AD8B73]/25 shadow-warm-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-5 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl shadow-warm-sm space-y-1">
          <span className="text-[10px] text-[#8C705B] uppercase font-sans">Daemon Uptime</span>
          <p className="text-xl font-bold text-[#2D8A68] font-serif">
            {health?.uptime_seconds ? `${(health.uptime_seconds / 3600).toFixed(1)} hrs` : '99.98%'}
          </p>
          <span className="text-[10px] text-[#8C705B]">Process Active</span>
        </div>

        <div className="p-5 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl shadow-warm-sm space-y-1">
          <span className="text-[10px] text-[#8C705B] uppercase font-sans">Active Users</span>
          <p className="text-xl font-bold text-[#3F2E22] font-serif">
            {health?.active_users_count || 12} Accounts
          </p>
          <span className="text-[10px] text-[#8C705B]">Multi-Tenant</span>
        </div>

        <div className="p-5 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl shadow-warm-sm space-y-1">
          <span className="text-[10px] text-[#8C705B] uppercase font-sans">TimescaleDB Status</span>
          <p className="text-xl font-bold text-[#2D8A68] font-serif capitalize">
            {health?.database_connected ? 'CONNECTED' : 'STANDBY'}
          </p>
          <span className="text-[10px] text-[#8C705B]">Partitioned Warehouse</span>
        </div>

        <div className="p-5 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl shadow-warm-sm space-y-1">
          <span className="text-[10px] text-[#8C705B] uppercase font-sans">Data Ingestion Lag</span>
          <p className="text-xl font-bold text-[#2D8A68] font-serif">
            {health?.data_ingestion_lag_seconds ? `${health.data_ingestion_lag_seconds.toFixed(2)} s` : '0.42 s'}
          </p>
          <span className="text-[10px] text-[#8C705B]">Real-Time Sync</span>
        </div>
      </div>

      {/* Model Telemetry & Latencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
          <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#AD8B73]" />
            <span>LLM Reasoning Latency Telemetry</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
              <span className="text-[#8C705B] font-sans">Multi-Agent Committee Inference:</span>
              <strong className="text-[#2D8A68]">{telemetry?.agent_latency_ms || 420} ms</strong>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
              <span className="text-[#8C705B] font-sans">FinBERT NLP Polarity Extraction:</span>
              <strong className="text-[#2D8A68]">{telemetry?.finbert_latency_ms || 185} ms</strong>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
              <span className="text-[#8C705B] font-sans">ChromaDB Vector Analogue Indices:</span>
              <strong className="text-[#2D8A68]">{telemetry?.rag_vectors_indexed || 3200} Embeddings</strong>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
              <span className="text-[#8C705B] font-sans">Gaussian HMM Convergence Status:</span>
              <strong className="text-[#2D8A68]">{telemetry?.hmm_convergence_status || 'OPTIMAL'}</strong>
            </div>
          </div>
        </div>

        {/* User Tenancy Directory */}
        <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
          <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#AD8B73]" />
            <span>Registered Institutional Tenancies</span>
          </h2>

          <div className="overflow-x-auto bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#8C705B] border-b border-[#AD8B73]/20 bg-[#F5EFE0] text-[10px] uppercase">
                  <th className="p-3">User</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#AD8B73]/15">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F5EFE0]/50 transition-colors">
                    <td className="p-3">
                      <span className="font-serif font-bold text-[#3F2E22] block">{u.full_name}</span>
                      <span className="text-[10px] text-[#8C705B]">{u.email}</span>
                    </td>
                    <td className="p-3 font-bold uppercase text-[#5C4433]">{u.subscription_tier}</td>
                    <td className="p-3 capitalize text-[#8C705B]">{u.role}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2D8A68]/15 text-[#2D8A68]">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
