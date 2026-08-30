import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  LineChart,
  Layers,
  ShieldAlert,
  History,
  Settings,
  Server,
  BrainCircuit,
  Compass,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'brokerage', label: 'Paper Brokerage Desk', icon: Briefcase, badge: 'Angel / Kite' },
    { id: 'strategy', label: 'Strategy & Backtest', icon: LineChart },
    { id: 'multi-strategy', label: 'Multi-Strategy', icon: Layers },
    { id: 'risk-alerts', label: 'Risk & Alerts', icon: ShieldAlert },
    { id: 'historical', label: 'Regime Analytics', icon: History },
    { id: 'settings', label: 'API & Settings', icon: Settings },
    { id: 'home', label: 'Product Overview', icon: Compass },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Telemetry', icon: Server, badge: 'Staff' });
  }

  return (
    <aside className="w-64 bg-[#F5EFE0] border-r border-[#AD8B73]/20 flex flex-col justify-between shrink-0 shadow-warm-sm">
      <div className="p-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C705B] font-bold px-3 mb-3">
          Intelligence Modules
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#AD8B73] text-[#FFFBE9] shadow-warm-sm font-semibold'
                    : 'text-[#5C4433] hover:text-[#3F2E22] hover:bg-[#E3CAA5]/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFFBE9]' : 'text-[#8C705B]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-[#FFFBE9]/20 text-[#FFFBE9]'
                        : item.badge === 'Live'
                        ? 'bg-[#2D8A68]/15 text-[#2D8A68] border border-[#2D8A68]/30'
                        : 'bg-[#AD8B73]/20 text-[#5C4433] border border-[#AD8B73]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quantitative Engine Architecture Card */}
      <div className="p-4 m-3 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/25 shadow-warm-sm text-xs space-y-2.5">
        <div className="flex items-center justify-between text-[#8C705B]">
          <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Quantitative Core</span>
          <BrainCircuit className="w-3.5 h-3.5 text-[#AD8B73]" />
        </div>
        <div className="space-y-1.5 text-[11px] font-sans">
          <div className="flex justify-between items-center">
            <span className="text-[#8C705B]">Model:</span>
            <span className="font-mono text-[#2D8A68] font-bold">3-State Gaussian HMM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8C705B]">NLP Core:</span>
            <span className="font-mono text-[#5C4433] font-bold">FinBERT + Llama 3.3</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8C705B]">RAG Store:</span>
            <span className="font-mono text-[#AD8B73] font-bold">ChromaDB Vector</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
