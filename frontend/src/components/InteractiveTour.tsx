import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Sparkles,
  Search,
  Activity,
  BrainCircuit,
  Briefcase,
  Layers,
  Settings
} from 'lucide-react';

interface TourStep {
  title: string;
  targetId?: string;
  description: string;
  icon: any;
  tip: string;
  tabTarget?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Universal Stock Search & Multi-Currency Engine',
    targetId: 'stock-search-container',
    description: 'Search any stock across 5,000+ US (NASDAQ/NYSE in $) and Indian equities (NSE/BSE in ₹). Auto-detects flags, currencies, and live quotes in <200ms.',
    icon: Search,
    tip: 'Try typing NVDA, AAPL, or RELIANCE.NS into the search bar.',
    tabTarget: 'dashboard'
  },
  {
    title: 'HMM Market Regime Intelligence',
    targetId: 'market-regime-pill',
    description: 'Our 3-State Gaussian Hidden Markov Model categorizes market volatility into Quiet Bull, Turbulent Bear, or Volatile Sideways.',
    icon: Activity,
    tip: 'Transition matrices calibrate dynamically from live log-return drift.',
    tabTarget: 'dashboard'
  },
  {
    title: 'Multi-Agent Reasoning Committee Arena',
    targetId: 'agent-arena-container',
    description: 'LangGraph State Graph pit the Bull Node against the Bear Node, synthesized by the Chief Judge with Fractional Half-Kelly position sizing.',
    icon: BrainCircuit,
    tip: 'Click "Execute Live Debate" on any stock to generate tailored arguments and targets.',
    tabTarget: 'dashboard'
  },
  {
    title: 'Real-Time Paper Trading & Execution Desk',
    targetId: 'paper-trading-desk',
    description: 'Experience real-world market execution with zero capital risk! Start with $100,000 USD / ₹80,00,000 INR simulated buying power.',
    icon: Briefcase,
    tip: 'Execute simulated Buy/Sell orders at live market quotes and track unrealized P&L in real time.',
    tabTarget: 'dashboard'
  },
  {
    title: 'Multi-Strategy Portfolio Manager & Model Blender',
    targetId: 'multi-strategy-header',
    description: 'Pre-trained warehouse indexes 5,000 stocks. Blend multiple models with inverse-volatility risk parity in under 50ms.',
    icon: Layers,
    tip: 'Click "Instant Blend" to test multi-asset Sharpe ratios and diversification compression.',
    tabTarget: 'multi-strategy'
  },
  {
    title: 'Subscription Tiers & Developer Settings',
    targetId: 'settings-header',
    description: 'Manage programmatic API keys, outbound webhooks, tier upgrades (Free, Pro, Enterprise), and download official tax receipts.',
    icon: Settings,
    tip: 'Check out the new instant checkout modal and PDF invoice generator.',
    tabTarget: 'settings'
  }
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  const step = TOUR_STEPS[currentStepIndex];

  useEffect(() => {
    if (isOpen && step.tabTarget && onNavigateTab) {
      onNavigateTab(step.tabTarget);
    }
  }, [currentStepIndex, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-lg w-full p-7 space-y-6 shadow-warm-lg">
        {/* Tour Header */}
        <div className="flex justify-between items-center border-b border-[#AD8B73]/20 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#AD8B73] text-[#FFFBE9] flex items-center justify-center shadow-warm-sm">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#3F2E22]">
                Interactive Platform Tour
              </h3>
              <span className="text-[10px] font-mono text-[#8C705B]">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8C705B] hover:text-[#3F2E22] p-1.5 rounded-lg hover:bg-[#E3CAA5]/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/25 text-[#AD8B73] shadow-warm-sm shrink-0">
              <StepIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-[#3F2E22]">
                {step.title}
              </h4>
              <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
                {step.description}
              </p>
            </div>
          </div>

          {/* Pro Tip Box */}
          <div className="p-3 rounded-xl bg-[#FFFBE9] border border-[#2D8A68]/30 text-xs font-sans text-[#2D8A68] flex items-start space-x-2 shadow-warm-sm">
            <Sparkles className="w-4 h-4 shrink-0 text-[#2D8A68] mt-0.5" />
            <div>
              <strong className="font-bold block text-[10px] uppercase font-mono">Pro Tip:</strong>
              <span>{step.tip}</span>
            </div>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center space-x-1.5 pt-1">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-6 bg-[#AD8B73]'
                  : 'w-2 bg-[#AD8B73]/25 hover:bg-[#AD8B73]/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-[#AD8B73]/20">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3.5 py-2 text-xs font-semibold text-[#5C4433] hover:bg-[#E3CAA5]/40 rounded-xl transition-colors disabled:opacity-30 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-[#8C705B] hover:text-[#3F2E22] transition-colors"
            >
              Skip Tour
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="btn-liquid px-4 py-2 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold rounded-xl shadow-warm-sm transition-all flex items-center gap-1.5"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
