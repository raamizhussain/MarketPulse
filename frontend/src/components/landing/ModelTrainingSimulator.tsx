import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Database,
  Layers,
  LineChart,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

interface PresetBasket {
  id: string;
  name: string;
  stocks: string[];
  description: string;
  estimatedSharpe: string;
  regimeProfile: string;
}

const PRESET_BASKETS: PresetBasket[] = [
  {
    id: 'tech',
    name: 'MegaCap Tech Growth',
    stocks: ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'],
    description: 'High alpha momentum assets with strong balance sheets and continuous innovation CAPEX.',
    estimatedSharpe: '2.18',
    regimeProfile: 'Long Quiet Bull persistence (avg 24d), acute volatility spikes during earnings season.',
  },
  {
    id: 'ev',
    name: 'Clean Mobility & Energy',
    stocks: ['TSLA', 'RIVN', 'ENPH', 'PLUG'],
    description: 'High-beta innovation assets sensitive to interest rates, policy shifts, and battery commodity cycles.',
    estimatedSharpe: '1.74',
    regimeProfile: 'Wider Sideways regimes (35%), rapid regime transition frequency requiring Half-Kelly sizing.',
  },
  {
    id: 'dividend',
    name: 'Dividend & Defensive',
    stocks: ['JNJ', 'PG', 'KO', 'PEP', 'ABBV'],
    description: 'Low-volatility cash flow generators with stable pricing power and consistent dividend reinvestment.',
    estimatedSharpe: '2.05',
    regimeProfile: 'Deep Bear state protection, minimal transition whipsaws, optimal for capital preservation.',
  },
];

export const ModelTrainingSimulator: React.FC = () => {
  const [selectedBasket, setSelectedBasket] = useState<PresetBasket>(PRESET_BASKETS[0]);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const trainingSteps = [
    { title: 'Data Ingestion', desc: 'Fetching 5+ years of minute-bars across 400,000+ data points...' },
    { title: 'NLP Extraction', desc: 'Analyzing 14,800+ news articles & earnings calls with FinBERT...' },
    { title: 'HMM Calibration', desc: 'Optimizing Gaussian Hidden Markov Model with KMeans seeding...' },
    { title: 'Agent Tuning', desc: 'Calibrating Bull/Bear disagreement thresholds & Kelly fractional sizing...' },
  ];

  const handleStartTraining = () => {
    setIsTraining(true);
    setIsCompleted(false);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < trainingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsTraining(false);
          setIsCompleted(true);
          return prev;
        }
      });
    }, 750);
  };

  return (
    <div className="bg-[#FFFBE9] rounded-2xl border border-[#AD8B73]/30 shadow-warm-lg overflow-hidden p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#AD8B73]/20 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E3CAA5]/50 border border-[#AD8B73]/30 text-xs font-sans font-semibold text-[#5C4433] mb-2">
            <BrainCircuit className="w-3.5 h-3.5 text-[#AD8B73]" />
            <span>Interactive Simulator</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#3F2E22] tracking-tight">
            Personalized Intelligence Model Generator
          </h3>
          <p className="text-xs font-sans text-[#8C705B] mt-1">
            Experience how MarketPulse builds bespoke quantitative models tailored specifically to your stock portfolio
          </p>
        </div>

        {!isTraining && !isCompleted ? (
          <button
            onClick={handleStartTraining}
            className="btn-liquid px-6 py-3 rounded-xl bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold shadow-warm-md flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Auto-Train Bespoke Model</span>
          </button>
        ) : isCompleted ? (
          <button
            onClick={() => { setIsCompleted(false); setStepIndex(0); }}
            className="px-4 py-2.5 rounded-xl bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#5C4433] text-xs font-semibold border border-[#AD8B73]/30 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset & Train Another Basket</span>
          </button>
        ) : null}
      </div>

      {/* Step 1: Select Portfolio Basket */}
      <div className="space-y-4">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#8C705B]">
          Step 1: Choose or Define Your Portfolio Basket
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_BASKETS.map((basket) => (
            <div
              key={basket.id}
              onClick={() => {
                if (!isTraining) {
                  setSelectedBasket(basket);
                  setIsCompleted(false);
                }
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedBasket.id === basket.id
                  ? 'bg-[#F5EFE0] border-[#AD8B73] shadow-warm-md scale-[1.02]'
                  : 'bg-[#FBF7EA] border-[#AD8B73]/20 hover:border-[#AD8B73]/50 opacity-80'
              } ${isTraining ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-serif font-bold text-sm text-[#3F2E22]">{basket.name}</h4>
                {selectedBasket.id === basket.id && (
                  <CheckCircle2 className="w-4 h-4 text-[#AD8B73]" />
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-2.5">
                {basket.stocks.map((sym) => (
                  <span
                    key={sym}
                    className="px-2 py-0.5 rounded bg-[#FFFBE9] border border-[#AD8B73]/20 font-mono text-[10px] font-bold text-[#5C4433]"
                  >
                    {sym}
                  </span>
                ))}
              </div>

              <p className="text-[11px] font-sans text-[#5C4433] line-clamp-2 leading-relaxed">
                {basket.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Training Pipeline Progress Bar */}
      {isTraining && (
        <div className="p-6 bg-[#F5EFE0] rounded-xl border border-[#AD8B73]/30 space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#3F2E22] font-bold flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#AD8B73] animate-bounce" />
              <span>Step {stepIndex + 1} of 4: {trainingSteps[stepIndex].title}</span>
            </span>
            <span className="text-[#8C705B]">{( (stepIndex + 1) / 4 * 100).toFixed(0)}% Completed</span>
          </div>

          <div className="w-full bg-[#FFFBE9] h-2.5 rounded-full overflow-hidden border border-[#AD8B73]/20">
            <div
              className="bg-[#AD8B73] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((stepIndex + 1) / 4) * 100}%` }}
            />
          </div>

          <p className="text-xs font-sans text-[#5C4433] italic">
            "{trainingSteps[stepIndex].desc}"
          </p>
        </div>
      )}

      {/* Step 3: Generated Bespoke Model Output Card */}
      {isCompleted && (
        <div className="p-6 bg-[#F5EFE0] rounded-xl border border-[#2D8A68]/40 shadow-warm-md space-y-4 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#AD8B73]/20 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2D8A68] text-[#FFFBE9] flex items-center justify-center shadow-warm-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#3F2E22]">
                  {selectedBasket.name} Intelligence Model Deployed
                </h4>
                <p className="text-[11px] font-sans text-[#8C705B]">
                  Calibrated on {selectedBasket.stocks.join(', ')} • Production Ready
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#2D8A68]/15 text-[#2D8A68] font-mono text-[11px] font-bold border border-[#2D8A68]/30">
              STATUS: MODEL CONVERGED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 text-center">
              <span className="text-[10px] font-sans uppercase text-[#8C705B] block">Walk-Forward Sharpe</span>
              <p className="text-lg font-bold text-[#2D8A68] mt-0.5">{selectedBasket.estimatedSharpe}</p>
            </div>

            <div className="p-3.5 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 text-center">
              <span className="text-[10px] font-sans uppercase text-[#8C705B] block">Historical Win Rate</span>
              <p className="text-lg font-bold text-[#3F2E22] mt-0.5">64.8%</p>
            </div>

            <div className="p-3.5 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 text-center">
              <span className="text-[10px] font-sans uppercase text-[#8C705B] block">Max Drawdown Guard</span>
              <p className="text-lg font-bold text-[#2D8A68] mt-0.5">-8.4% (vs -22% baseline)</p>
            </div>
          </div>

          <div className="p-4 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 text-xs font-sans space-y-1.5">
            <strong className="text-[#3F2E22] block font-serif">Regime & Sizing Profile:</strong>
            <p className="text-[#5C4433] leading-relaxed">{selectedBasket.regimeProfile}</p>
          </div>
        </div>
      )}
    </div>
  );
};
