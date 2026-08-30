import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Brain, Cpu, ShieldCheck, BarChart3, CheckCircle2, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Welcome to MarketPulse Pro',
      subtitle: 'Multi-Agent Quantitative Intelligence & Risk Architecture',
      icon: Brain,
      content: (
        <div className="space-y-4 text-xs text-[#5C4433] font-sans leading-relaxed">
          <p>
            MarketPulse is an institutional-grade platform uniting mathematical regime classification,
            unstructured news sentiment, and multi-agent LLM reasoning into actionable, risk-controlled trading decisions.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/25 shadow-warm-sm">
              <span className="font-serif font-bold text-[#3F2E22] block mb-1">🎯 For Retail Traders</span>
              <span className="text-[11px] text-[#8C705B]">Clear BUY/SELL/HOLD directives with explicit confidence and catalyst stop lines.</span>
            </div>
            <div className="p-3.5 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/25 shadow-warm-sm">
              <span className="font-serif font-bold text-[#3F2E22] block mb-1">🏛️ For Institutions</span>
              <span className="text-[11px] text-[#8C705B]">Kelly position sizing, walk-forward lookahead-free backtesting, and full audit APIs.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '1. 3-State Gaussian HMM Regimes',
      subtitle: 'Decoding Macro Volatility & Log Return Weather',
      icon: Cpu,
      content: (
        <div className="space-y-3 text-xs text-[#5C4433] font-sans leading-relaxed">
          <p>
            Rather than relying on lagging moving averages, our <strong>Gaussian Hidden Markov Model</strong> clusters market returns and realized volatility into 3 distinct probabilistic regimes:
          </p>
          <div className="space-y-2 pt-1">
            <div className="p-3 bg-[#FFFBE9] border border-[#2D8A68]/30 rounded-xl flex items-center justify-between shadow-warm-sm">
              <div>
                <span className="font-bold text-[#2D8A68] block text-xs">🟢 Quiet Bull (State 0)</span>
                <span className="text-[11px] text-[#8C705B]">Low volatility, positive drift. Maximizes long exposure up to 85%.</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#2D8A68]">High Alpha</span>
            </div>
            <div className="p-3 bg-[#FFFBE9] border border-[#A84236]/30 rounded-xl flex items-center justify-between shadow-warm-sm">
              <div>
                <span className="font-bold text-[#A84236] block text-xs">🔴 Turbulent Bear (State 1)</span>
                <span className="text-[11px] text-[#8C705B]">Expanding variance, downside panic. Auto-triggers cash capital defense (0% target).</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#A84236]">Capital Defense</span>
            </div>
            <div className="p-3 bg-[#FFFBE9] border border-[#B8860B]/30 rounded-xl flex items-center justify-between shadow-warm-sm">
              <div>
                <span className="font-bold text-[#B8860B] block text-xs">🟡 Sideways Choppy (State 2)</span>
                <span className="text-[11px] text-[#8C705B]">Range-bound compression. Maintains moderate 30% tactical exposure.</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#B8860B]">Tactical</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '2. Multi-Agent Reasoning Committee',
      subtitle: 'Adversarial Consensus Powered by LangGraph & ChromaDB',
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 text-xs text-[#5C4433] font-sans leading-relaxed">
          <p>
            Unlike opaque black-box models, MarketPulse enforces a structured adversarial debate between two specialized personas before a Chief Judge renders judgment:
          </p>
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs pt-1">
            <div className="p-3 bg-[#FFFBE9] border border-[#AD8B73]/25 rounded-xl shadow-warm-sm">
              <span className="text-[#2D8A68] font-bold block mb-1">🐂 Bull Node</span>
              <span className="text-[10px] text-[#8C705B]">Argues upside catalysts, momentum, and guidance.</span>
            </div>
            <div className="p-3 bg-[#FFFBE9] border border-[#AD8B73]/25 rounded-xl shadow-warm-sm">
              <span className="text-[#A84236] font-bold block mb-1">🐻 Bear Node</span>
              <span className="text-[10px] text-[#8C705B]">Flags multiple compression, tail risks, and stop breaches.</span>
            </div>
            <div className="p-3 bg-[#FFFBE9] border border-[#AD8B73]/25 rounded-xl shadow-warm-sm">
              <span className="text-[#AD8B73] font-bold block mb-1">⚖️ Chief Judge</span>
              <span className="text-[10px] text-[#8C705B]">Synthesizes cases with ChromaDB analogues into final sizing.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '3. Quantitative Sizing & Risk Shield',
      subtitle: 'Fractional Kelly Criterion & Peak Drawdown Containment',
      icon: BarChart3,
      content: (
        <div className="space-y-3 text-xs text-[#5C4433] font-sans leading-relaxed">
          <p>
            Every algorithmic trade is protected by institutional risk parameters:
          </p>
          <ul className="space-y-2 text-xs text-[#5C4433] font-sans">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D8A68] shrink-0 mt-0.5" />
              <span><strong>Kelly Position Sizing:</strong> Computes exact mathematical allocation fraction based on historical win rates.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D8A68] shrink-0 mt-0.5" />
              <span><strong>Drawdown Auto-Pause:</strong> Halts allocations if peak drawdown approaches user-configured maximum.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D8A68] shrink-0 mt-0.5" />
              <span><strong>Real-Time Alerts:</strong> Push notifications dispatched when market regimes flip or news sentiment panics.</span>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  const current = slides[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2E22]/60 backdrop-blur-sm p-4">
      <div className="bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-2xl w-full max-w-xl shadow-warm-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-6 bg-[#F5EFE0] border-b border-[#AD8B73]/20 flex items-start justify-between relative">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-[#E3CAA5] border border-[#AD8B73]/30 shadow-warm-sm text-[#5C4433]">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#3F2E22]">{current.title}</h2>
              <p className="text-xs text-[#8C705B] font-mono mt-0.5">{current.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#FFFBE9] hover:bg-[#E3CAA5]/50 border border-[#AD8B73]/20 text-[#5C4433] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">{current.content}</div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-[#F5EFE0] border-t border-[#AD8B73]/20 flex items-center justify-between">
          <div className="flex space-x-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`w-2.5 h-1.5 rounded-full transition-all ${
                  step === idx ? 'w-6 bg-[#AD8B73]' : 'bg-[#E3CAA5]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 rounded-xl text-[#5C4433] hover:text-[#3F2E22] bg-[#FFFBE9] hover:bg-[#E3CAA5]/40 border border-[#AD8B73]/25 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            {step < slides.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="btn-liquid px-5 py-2 rounded-xl bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] shadow-warm-sm flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#2D8A68] hover:bg-[#236B50] text-[#FFFBE9] transition-colors flex items-center gap-1.5 shadow-warm-sm"
              >
                Get Started <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
