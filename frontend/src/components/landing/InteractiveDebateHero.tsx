import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  CheckCircle2,
  RefreshCw,
  Zap,
  Clock
} from 'lucide-react';

interface StockDebateSample {
  symbol: string;
  name: string;
  price: number;
  change: string;
  regime: 'Quiet Bull' | 'Turbulent Bear' | 'Sideways Choppy';
  regimeColor: string;
  sentiment: number;
  bullCase: {
    thesis: string;
    catalyst: string;
    precedent: string;
  };
  bearCase: {
    thesis: string;
    concern: string;
    riskMetric: string;
  };
  judgeSynthesis: {
    action: 'ACCUMULATE' | 'AGGRESSIVE BUY' | 'TACTICAL HEDGE' | 'HOLD CASH';
    confidence: number;
    allocation: number;
    ragMemory: string;
    catalystTrigger: string;
  };
}

const SAMPLE_DEBATES: Record<string, StockDebateSample> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 242.85,
    change: '+1.84%',
    regime: 'Quiet Bull',
    regimeColor: '#2D8A68',
    sentiment: 0.78,
    bullCase: {
      thesis: 'App Store high-margin services expansion + Apple Intelligence adoption cycle acceleration across 1.4B active installed devices.',
      catalyst: 'Next quarter gross margin guidance above 46.5%',
      precedent: 'Jan 2023 similar Bull regime + sentiment > 0.7 yielded +8.4% 30-day alpha.',
    },
    bearCase: {
      thesis: 'Valuation multiple stretched at 29.8x forward P/E against historical 5-year median of 24.2x with mature hardware upgrade velocity.',
      concern: 'Greater China consumer smartphone replacement cycle elongation',
      riskMetric: 'Drawdown buffer 4.2% to 50-day EMA support',
    },
    judgeSynthesis: {
      action: 'ACCUMULATE',
      confidence: 82,
      allocation: 28.5,
      ragMemory: 'Matched 3 historical analogues: 2021 & 2023 similar volatility profiles resolved into positive drift within 8 sessions.',
      catalystTrigger: 'If regime drops to Bear or sentiment drops below +0.30 → scale back to 10%.',
    },
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 138.20,
    change: '+3.42%',
    regime: 'Quiet Bull',
    regimeColor: '#2D8A68',
    sentiment: 0.86,
    bullCase: {
      thesis: 'Exponential Blackwell Ultra GPU architecture demand, hyperscaler CAPEX commitments exceeding $220B, and zero inventory build.',
      catalyst: 'Tier-1 cloud provider compute cluster expansion orders',
      precedent: 'Aug 2023 similar momentum alignment generated +14.2% return over 45 days.',
    },
    bearCase: {
      thesis: 'Extreme institutional concentration; sovereign AI restrictions and packaging substrate capacity limits could cap short-term upside.',
      concern: 'Customer CAPEX digestion pause in subsequent fiscal year',
      riskMetric: 'Implied volatility percentile at 76th rank',
    },
    judgeSynthesis: {
      action: 'AGGRESSIVE BUY',
      confidence: 89,
      allocation: 34.0,
      ragMemory: 'Retrieved ChromaDB milestone: Nov 2023 momentum expansion saw continuous 32-day positive drift.',
      catalystTrigger: 'Maintain stop-loss threshold at -6.5% peak trailing drawdown.',
    },
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 218.40,
    change: '-0.95%',
    regime: 'Sideways Choppy',
    regimeColor: '#B8860B',
    sentiment: 0.22,
    bullCase: {
      thesis: 'Full Self-Driving v13 unsupervised rollout potential and Energy Storage Megapack deployment backlog surging 125% YoY.',
      catalyst: 'Regulatory approval milestone for Cybercab fleet testing',
      precedent: 'May 2023 consolidation breakout preceded a +22% mean-reversion swing.',
    },
    bearCase: {
      thesis: 'Automotive gross margin compression from global EV discounting and rising competition in Asian markets.',
      concern: 'Auto automotive margins ex-regulatory credits under 14.5%',
      riskMetric: 'Historical volatility 48.2% (highest in basket)',
    },
    judgeSynthesis: {
      action: 'TACTICAL HEDGE',
      confidence: 68,
      allocation: 14.0,
      ragMemory: 'Historical analogue: Sideways states in TSLA have 62% probability of range-bound oscillation between $205-$230.',
      catalystTrigger: 'Upgrade to BUY if price breaches $235 with volume anomaly > 1.8x.',
    },
  },
};

export const InteractiveDebateHero: React.FC = () => {
  const [activeSymbol, setActiveSymbol] = useState<string>('AAPL');
  const [activeTab, setActiveTab] = useState<'arena' | 'synthesis' | 'rag'>('arena');
  const current = SAMPLE_DEBATES[activeSymbol];

  return (
    <div className="bg-[#FFFBE9] rounded-2xl border border-[#AD8B73]/30 shadow-warm-lg overflow-hidden transition-all duration-300">
      {/* Top Ticker Selector Bar */}
      <div className="bg-[#F5EFE0] px-5 py-3.5 border-b border-[#AD8B73]/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-sans font-semibold text-[#8C705B] uppercase tracking-wider">
            Live Committee Arena:
          </span>
          <div className="flex items-center space-x-1.5">
            {Object.keys(SAMPLE_DEBATES).map((sym) => (
              <button
                key={sym}
                onClick={() => setActiveSymbol(sym)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeSymbol === sym
                    ? 'bg-[#AD8B73] text-[#FFFBE9] shadow-warm-sm'
                    : 'bg-[#FFFBE9] text-[#5C4433] hover:bg-[#E3CAA5]/50 border border-[#AD8B73]/20'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Live Ticker State Metadata */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="text-[#3F2E22]">
            <span className="font-sans text-[11px] text-[#8C705B] mr-1">Price:</span>
            <strong>${current.price.toFixed(2)}</strong>{' '}
            <span className={current.change.startsWith('+') ? 'text-[#2D8A68]' : 'text-[#A84236]'}>
              ({current.change})
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFBE9] border border-[#AD8B73]/20 text-[11px]">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: current.regimeColor }}
            />
            <span className="font-sans font-medium text-[#5C4433]">{current.regime}</span>
          </div>
        </div>
      </div>

      {/* Main Debate Grid (Bull vs Bear) */}
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bull Node Card */}
          <div className="p-5 rounded-xl bg-[#FBF7EA] border border-[#2D8A68]/30 shadow-warm-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#2D8A68]/15 text-[#2D8A68] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#3F2E22] tracking-wide">
                    Bull Agent Node
                  </h4>
                  <span className="text-[10px] font-sans text-[#8C705B]">The Growth Optimist</span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#2D8A68]/15 text-[#2D8A68] border border-[#2D8A68]/20">
                SENTIMENT: +{current.sentiment.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
              "{current.bullCase.thesis}"
            </p>

            <div className="pt-2 border-t border-[#AD8B73]/15 space-y-1 text-[11px] font-sans">
              <div className="text-[#5C4433]">
                <strong className="text-[#3F2E22]">Key Catalyst:</strong> {current.bullCase.catalyst}
              </div>
              <div className="text-[#8C705B]">
                <strong>Precedent:</strong> {current.bullCase.precedent}
              </div>
            </div>
          </div>

          {/* Bear Node Card */}
          <div className="p-5 rounded-xl bg-[#FBF7EA] border border-[#A84236]/30 shadow-warm-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#A84236]/15 text-[#A84236] flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#3F2E22] tracking-wide">
                    Bear Agent Node
                  </h4>
                  <span className="text-[10px] font-sans text-[#8C705B]">The Risk Skeptic</span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#A84236]/15 text-[#A84236] border border-[#A84236]/20">
                DOWNSIDE GUARD
              </span>
            </div>

            <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
              "{current.bearCase.thesis}"
            </p>

            <div className="pt-2 border-t border-[#AD8B73]/15 space-y-1 text-[11px] font-sans">
              <div className="text-[#5C4433]">
                <strong className="text-[#3F2E22]">Core Concern:</strong> {current.bearCase.concern}
              </div>
              <div className="text-[#8C705B]">
                <strong>Downside Metric:</strong> {current.bearCase.riskMetric}
              </div>
            </div>
          </div>
        </div>

        {/* Judge Synthesis Banner */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-[#F5EFE0] via-[#FBF7EA] to-[#F5EFE0] border border-[#AD8B73]/40 shadow-warm-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#AD8B73] text-[#FFFBE9] flex items-center justify-center shadow-warm-sm">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-[#3F2E22]">
                  Judge Synthesis & Sizing Consensus
                </h4>
                <p className="text-[10px] font-sans text-[#8C705B]">
                  ChromaDB RAG Augmented • Kelly Criterion Position Formulation
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm">
                {current.judgeSynthesis.action}
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#FFFBE9] text-[#5C4433] border border-[#AD8B73]/30">
                Confidence: <strong>{current.judgeSynthesis.confidence}%</strong>
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#E3CAA5] text-[#3F2E22] font-bold border border-[#AD8B73]/30">
                Kelly Size: {current.judgeSynthesis.allocation}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans text-[#5C4433] pt-1">
            <div className="p-3 bg-[#FFFBE9] rounded-lg border border-[#AD8B73]/20">
              <span className="text-[10px] font-mono uppercase text-[#8C705B] font-semibold block mb-0.5">
                🧠 ChromaDB Historical Analogue
              </span>
              <p className="text-[11px] leading-snug">{current.judgeSynthesis.ragMemory}</p>
            </div>

            <div className="p-3 bg-[#FFFBE9] rounded-lg border border-[#AD8B73]/20">
              <span className="text-[10px] font-mono uppercase text-[#8C705B] font-semibold block mb-0.5">
                ⚡ Execution Condition & Catalyst
              </span>
              <p className="text-[11px] leading-snug">{current.judgeSynthesis.catalystTrigger}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
