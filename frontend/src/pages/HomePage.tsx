import React, { useState } from 'react';
import { EditorialNavbar } from '../components/landing/EditorialNavbar';
import { InteractiveDebateHero } from '../components/landing/InteractiveDebateHero';
import { ModelTrainingSimulator } from '../components/landing/ModelTrainingSimulator';
import { PrivacyPolicyModal } from '../components/legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from '../components/legal/TermsOfServiceModal';
import { CookieConsentBanner } from '../components/legal/CookieConsentBanner';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Scale,
  BrainCircuit,
  Layers,
  LineChart,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Check,
  Zap,
  Globe,
  Lock,
  PieChart,
  Activity,
  FileText,
  Users,
  Compass,
  DollarSign,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ListOrdered
} from 'lucide-react';

interface HomePageProps {
  onLaunchTerminal: () => void;
  onSignIn: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onLaunchTerminal,
  onSignIn,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFBE9] text-[#3F2E22] font-sans selection:bg-[#E3CAA5] selection:text-[#3F2E22] paper-grain relative overflow-x-hidden">
      {/* Ambient Gaussian Blur Blobs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-[#E3CAA5]/35 blur-[100px] pointer-events-none animate-ambient-1 -z-10" />
      <div className="absolute top-[600px] right-10 w-[600px] h-[600px] rounded-full bg-[#CEAB93]/25 blur-[120px] pointer-events-none animate-ambient-2 -z-10" />
      <div className="absolute top-[1800px] left-10 w-[550px] h-[550px] rounded-full bg-[#AD8B73]/15 blur-[110px] pointer-events-none -z-10" />

      {/* Luxury Editorial Header */}
      <EditorialNavbar onLaunchTerminal={onLaunchTerminal} onSignIn={onSignIn} />

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-10 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-4xl mx-auto space-y-6 animate-fade-in-up">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#F5EFE0] border border-[#AD8B73]/30 text-xs font-medium text-[#5C4433] shadow-warm-sm">
            <span className="w-2 h-2 rounded-full bg-[#2D8A68] animate-pulse" />
            <span>Next-Gen Multi-Agent Quantitative Intelligence</span>
          </div>

          {/* High-Contrast Serif Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#3F2E22] leading-[1.12]">
            Institutional intelligence,{' '}
            <span className="italic font-normal text-[#8C705B]">calibrated</span> to your specific portfolio.
          </h1>

          {/* Editorial Subtitle */}
          <p className="text-base sm:text-lg text-[#5C4433] font-sans leading-relaxed max-w-2xl mx-auto">
            Generic S&amp;P 500 indicators fail individual traders. MarketPulse auto-trains Gaussian Hidden Markov Models on your stock universe, orchestrating an LLM agent committee with dynamic Kelly position sizing.
          </p>

          {/* Liquid CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onLaunchTerminal}
              className="btn-liquid px-8 py-4 rounded-xl bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-medium text-sm shadow-warm-lg flex items-center space-x-2.5 group"
            >
              <span>Launch Trading Terminal</span>
              <ArrowRight className="w-4 h-4 text-[#E3CAA5] group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#models"
              className="btn-liquid-secondary px-7 py-4 rounded-xl bg-[#F5EFE0] hover:bg-[#E3CAA5]/60 text-[#3F2E22] font-medium text-sm border border-[#AD8B73]/30 shadow-warm-sm flex items-center space-x-2"
            >
              <BrainCircuit className="w-4 h-4 text-[#8C705B]" />
              <span>Explore Model Training</span>
            </a>
          </div>
        </div>

        {/* Live Interactive Multi-Agent Debate Showcase Widget */}
        <div className="pt-6">
          <InteractiveDebateHero />
        </div>
      </section>

      {/* WHY GENERIC INDICATORS FAIL VS PORTFOLIO-SPECIFIC HMM */}
      <section id="regimes" className="py-20 px-6 md:px-10 bg-[#F5EFE0]/70 border-y border-[#AD8B73]/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C705B] font-bold">
              The Quantitative Edge
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3F2E22] tracking-tight">
              Why Generic Indicators Fail Individual Portfolios
            </h2>
            <p className="text-sm text-[#5C4433] leading-relaxed">
              Traditional moving averages and RSI lag behind macro shifts. A tech growth portfolio behaves entirely differently than dividend aristocrats during volatility expansions.
            </p>
          </div>

          {/* 3 HMM Regime Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quiet Bull */}
            <div className="p-7 rounded-2xl bg-[#FFFBE9] border border-[#2D8A68]/30 shadow-warm-md space-y-4 relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#2D8A68]/15 text-[#2D8A68] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3F2E22]">🟢 Quiet Bull Regime</h3>
              <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
                Characterized by continuous positive drift and subdued variance. The model aggressively expands allocation up to 85%, maximizing compounding returns.
              </p>
              <div className="pt-3 border-t border-[#AD8B73]/20 flex justify-between items-center text-xs font-mono">
                <span className="text-[#8C705B]">Historical Sharpe:</span>
                <strong className="text-[#2D8A68] text-sm font-bold">2.15</strong>
              </div>
            </div>

            {/* Turbulent Bear */}
            <div className="p-7 rounded-2xl bg-[#FFFBE9] border border-[#A84236]/30 shadow-warm-md space-y-4 relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#A84236]/15 text-[#A84236] flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3F2E22]">🔴 Turbulent Bear Regime</h3>
              <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
                Realized volatility spikes trigger immediate capital preservation. The model shifts into cash or defensive hedges, shielding portfolios against -20%+ market crashes.
              </p>
              <div className="pt-3 border-t border-[#AD8B73]/20 flex justify-between items-center text-xs font-mono">
                <span className="text-[#8C705B]">Drawdown Held:</span>
                <strong className="text-[#A84236] text-sm font-bold">-1.8% (vs -18% crash)</strong>
              </div>
            </div>

            {/* Sideways Choppy */}
            <div className="p-7 rounded-2xl bg-[#FFFBE9] border border-[#B8860B]/30 shadow-warm-md space-y-4 relative overflow-hidden group hover:scale-[1.01] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#B8860B]/15 text-[#B8860B] flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3F2E22]">🟡 Sideways Choppy Regime</h3>
              <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
                Range-bound consolidation without directional conviction. Sizing is scaled down to 25%-35% tactical allocations with strict mean-reversion filters.
              </p>
              <div className="pt-3 border-t border-[#AD8B73]/20 flex justify-between items-center text-xs font-mono">
                <span className="text-[#8C705B]">Mean-Reversion Alpha:</span>
                <strong className="text-[#5C4433] text-sm font-bold">+7.2%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONALIZED MODEL TRAINING SHOWCASE */}
      <section id="models" className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#8C705B] font-bold">
            Key Platform Differentiator
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3F2E22] tracking-tight">
            Personalized Model Training on Your Specific Stocks
          </h2>
          <p className="text-sm text-[#5C4433] leading-relaxed">
            Create bespoke intelligence models for your exact portfolio holdings. In 2-5 minutes, MarketPulse ingests 5+ years of minute-bars, FinBERT news transcripts, and tunes agent weights.
          </p>
        </div>

        <ModelTrainingSimulator />
      </section>

      {/* THE MULTI-AGENT COMMITTEE ARENA */}
      <section id="committee" className="py-20 px-6 md:px-10 bg-[#F5EFE0]/70 border-y border-[#AD8B73]/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C705B] font-bold">
              Cognitive Consensus Engine
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3F2E22] tracking-tight">
              A Tri-Agent Reasoning Committee Behind Every Signal
            </h2>
            <p className="text-sm text-[#5C4433] leading-relaxed">
              Never trust a single black-box model. MarketPulse pits the Bull and Bear personas against each other in structured debate before the Judge synthesizes the final trade verdict.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bull */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/30 shadow-warm-sm space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D8A68]/15 text-[#2D8A68] flex items-center justify-center font-serif font-bold text-lg">
                  01
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3F2E22]">Bull Agent</h3>
                  <span className="text-xs text-[#8C705B]">The Growth Optimist</span>
                </div>
              </div>
              <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
                Evaluates positive momentum drift, revenue acceleration, and earnings guidance upside. Identifies historical catalysts where sentiment aligned with high-velocity breakout rallies.
              </p>
            </div>

            {/* Bear */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/30 shadow-warm-sm space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#A84236]/15 text-[#A84236] flex items-center justify-center font-serif font-bold text-lg">
                  02
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3F2E22]">Bear Agent</h3>
                  <span className="text-xs text-[#8C705B]">The Risk Skeptic</span>
                </div>
              </div>
              <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
                Stress-tests valuation multiples, supply chain bottlenecks, and down-tail market risks. Challenges every bullish thesis to prevent catastrophic drawdowns.
              </p>
            </div>

            {/* Judge */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/30 shadow-warm-sm space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#AD8B73]/20 text-[#5C4433] flex items-center justify-center font-serif font-bold text-lg">
                  03
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3F2E22]">Judge Agent</h3>
                  <span className="text-xs text-[#8C705B]">The Synthesizer</span>
                </div>
              </div>
              <p className="text-xs text-[#5C4433] leading-relaxed font-sans">
                Retrieves similar historical analogues from ChromaDB vector memory, weighs the debate evidence, and formulates precise trade action with Kelly-optimal capital allocation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REAL-TIME PAPER BROKERAGE DESK SHOWCASE (ANGEL ONE / ZERODHA KITE GRADE) */}
      <section id="brokerage" className="py-24 px-6 md:px-10 bg-[#F5EFE0]/80 border-y border-[#AD8B73]/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFFBE9] border border-[#AD8B73]/30 text-xs font-medium text-[#5C4433] shadow-warm-sm font-mono">
              <Briefcase className="w-3.5 h-3.5 text-[#2D8A68]" />
              <span>Angel One &amp; Zerodha Kite Grade Execution</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3F2E22] tracking-tight">
              Real-Time Paper Brokerage &amp; Institutional Execution Desk
            </h2>
            <p className="text-sm text-[#5C4433] leading-relaxed">
              Experience the full thrill of live market trading with <strong>$100,000 USD / ₹80,00,000 INR</strong> in simulated capital. Real-time Level 2 market depth, 5x intraday leverage, delivery holdings, and instant P&amp;L accounting against live quotes.
            </p>
          </div>

          {/* 4 Feature Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Market Depth */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm space-y-3 flex flex-col justify-between group hover:scale-[1.01] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#2D8A68]/15 text-[#2D8A68] flex items-center justify-center font-bold mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#3F2E22]">5-Level Market Depth</h3>
                <p className="text-xs text-[#5C4433] font-sans leading-relaxed mt-1">
                  Live Level 2 order book streaming 5 buy bids vs 5 sell asks, buyer/seller pressure ratio bars, and upper/lower circuit limits.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-[#2D8A68] font-bold">
                ✓ Real-Time Order Flow
              </div>
            </div>

            {/* Feature 2: Leverage & Product Types */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm space-y-3 flex flex-col justify-between group hover:scale-[1.01] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#AD8B73]/20 text-[#5C4433] flex items-center justify-center font-bold mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#3F2E22]">5x Intraday &amp; Delivery</h3>
                <p className="text-xs text-[#5C4433] font-sans leading-relaxed mt-1">
                  Choose between <strong>CNC (Delivery)</strong> for long-term compounding or <strong>MIS (Intraday)</strong> with 5x leverage for active momentum trading.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-[#AD8B73] font-bold">
                ✓ MIS 5X Margin
              </div>
            </div>

            {/* Feature 3: Demat Holdings & Portfolio */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm space-y-3 flex flex-col justify-between group hover:scale-[1.01] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#3F2E22]/10 text-[#3F2E22] flex items-center justify-center font-bold mb-3">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#3F2E22]">Live Portfolio &amp; Holdings</h3>
                <p className="text-xs text-[#5C4433] font-sans leading-relaxed mt-1">
                  Tracks invested capital, current market valuations, 1-day P&amp;L, overall returns, with 1-click Average Up/Down and Square-Off.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-[#2D8A68] font-bold">
                ✓ Real-Time Unrealized P&amp;L
              </div>
            </div>

            {/* Feature 4: Statutory Charges & Trade Book */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm space-y-3 flex flex-col justify-between group hover:scale-[1.01] transition-all">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#B8860B]/15 text-[#B8860B] flex items-center justify-center font-bold mb-3">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#3F2E22]">Statutory Tax &amp; Trade Book</h3>
                <p className="text-xs text-[#5C4433] font-sans leading-relaxed mt-1">
                  Calculates exact STT, GST, SEBI turnover fees, and brokerage so you learn realistic net profitability upon position exit.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-[#B8860B] font-bold">
                ✓ Full Order IDs &amp; Receipts
              </div>
            </div>
          </div>

          {/* Interactive Brokerage Terminal Banner */}
          <div className="p-8 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/30 shadow-warm-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#2D8A68] font-bold">
                Zero Risk • Real adrenaline
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#3F2E22]">
                Ready to trade live market quotes with $100k / ₹80L virtual funds?
              </h3>
              <p className="text-xs text-[#5C4433] font-sans max-w-xl">
                Test the quantitative signals generated by our HMM models and Multi-Agent Reasoning committee directly on our simulated brokerage desk before risking real capital.
              </p>
            </div>

            <button
              onClick={onLaunchTerminal}
              className="btn-liquid shrink-0 px-7 py-3.5 rounded-xl bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-medium text-xs shadow-warm-md flex items-center space-x-2"
            >
              <span>Open Paper Brokerage Desk</span>
              <ArrowRight className="w-4 h-4 text-[#E3CAA5]" />
            </button>
          </div>
        </div>
      </section>

      {/* WALK-FORWARD BACKTESTING & RISK SHIELD */}
      <section id="backtesting" className="py-24 px-6 md:px-10 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C705B] font-bold">
              Scientific Validation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3F2E22] tracking-tight leading-tight">
              Walk-Forward Backtesting that Eliminates Lookahead Bias
            </h2>
            <p className="text-sm text-[#5C4433] leading-relaxed font-sans">
              Most trading platforms produce inflated backtests by fitting to future data. MarketPulse strictly enforces walk-forward rolling window validation: models train only on past data and are evaluated on unseen subsequent bars with realistic slippage and fees.
            </p>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-[#2D8A68] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#3F2E22]">Kelly Criterion Dynamic Position Sizing:</strong>
                  <p className="text-[#8C705B]">Automatically sizes each trade based on empirical win rates and payout ratios.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-[#2D8A68] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#3F2E22]">Cross-Asset Correlation Guardrails:</strong>
                  <p className="text-[#8C705B]">Alerts if portfolio assets become &gt;75% correlated, preventing concentration risk.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-[#2D8A68] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#3F2E22]">One-Click CSV &amp; Executive Tear Sheet Exports:</strong>
                  <p className="text-[#8C705B]">Download institutional PDF/HTML tear sheets and CSV trade logs instantly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Formula & Metric Card */}
          <div className="p-8 rounded-2xl bg-[#F5EFE0] border border-[#AD8B73]/30 shadow-warm-lg space-y-6">
            <div className="flex items-center justify-between border-b border-[#AD8B73]/20 pb-4">
              <span className="font-serif font-bold text-base text-[#3F2E22]">
                Fractional Kelly Mathematical Formulation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3CAA5] text-[#3F2E22] font-bold">
                MATHEMATICAL RIGOR
              </span>
            </div>

            <div className="p-4 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 font-mono text-center text-sm font-bold text-[#3F2E22] shadow-warm-sm">
              f* = c_risk × [ (W × R - (1 - W)) / R ]
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
              <div className="p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20">
                <span className="text-[10px] uppercase text-[#8C705B] block font-sans">Avg Win Rate</span>
                <strong className="text-base text-[#2D8A68]">64.8%</strong>
              </div>
              <div className="p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20">
                <span className="text-[10px] uppercase text-[#8C705B] block font-sans">Win/Loss Ratio</span>
                <strong className="text-base text-[#3F2E22]">1.82x</strong>
              </div>
              <div className="p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20">
                <span className="text-[10px] uppercase text-[#8C705B] block font-sans">Peak Drawdown</span>
                <strong className="text-base text-[#2D8A68]">-8.4%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAAS PRICING & TIERS */}
      <section id="pricing" className="py-24 px-6 md:px-10 bg-[#F5EFE0]/70 border-y border-[#AD8B73]/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C705B] font-bold">
              Transparent Pricing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3F2E22] tracking-tight">
              Invest in Quantitative Precision
            </h2>
            <p className="text-sm text-[#5C4433] leading-relaxed">
              Start with our free tier to evaluate the platform or unlock unlimited personalized intelligence models with Pro.
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="pt-4 flex items-center justify-center space-x-3 text-xs font-medium">
              <span className={billingCycle === 'monthly' ? 'text-[#3F2E22] font-bold' : 'text-[#8C705B]'}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-12 h-6 bg-[#AD8B73] rounded-full p-1 transition-colors relative"
              >
                <div
                  className={`w-4 h-4 bg-[#FFFBE9] rounded-full transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={billingCycle === 'annual' ? 'text-[#3F2E22] font-bold' : 'text-[#8C705B]'}>
                Annual Billing <span className="text-[#2D8A68] font-bold">(Save 20%)</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            {/* Free Tier */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3F2E22]">Free Explorer</h3>
                  <p className="text-xs text-[#8C705B] mt-1">For students &amp; individual evaluation</p>
                </div>
                <div className="font-serif text-3xl font-bold text-[#3F2E22]">$0</div>
                <ul className="space-y-2.5 text-xs text-[#5C4433] font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> 1 Personalized Model (Top 50 stocks)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> Real-time HMM data (20-min delay)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> Walk-forward backtester (1-month)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> Community forum read access
                  </li>
                </ul>
              </div>

              <button
                onClick={onLaunchTerminal}
                className="w-full py-2.5 rounded-xl border border-[#AD8B73]/40 text-[#5C4433] hover:bg-[#E3CAA5]/30 text-xs font-semibold transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="p-6 rounded-2xl bg-[#F5EFE0] border-2 border-[#AD8B73] shadow-warm-lg flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#AD8B73] text-[#FFFBE9] text-[10px] font-sans font-bold uppercase tracking-wider shadow-warm-sm">
                Most Popular
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3F2E22]">Pro Trader</h3>
                  <p className="text-xs text-[#8C705B] mt-1">For active traders &amp; quants</p>
                </div>
                <div className="font-serif text-3xl font-bold text-[#3F2E22]">
                  ${billingCycle === 'annual' ? '24' : '29'}
                  <span className="text-xs font-sans font-normal text-[#8C705B]"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#5C4433] font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2D8A68] shrink-0" /> 5 Personalized Intelligence Models
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2D8A68] shrink-0" /> All 5,000+ US Equities supported
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2D8A68] shrink-0" /> Real-time low-latency WebSocket feed
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2D8A68] shrink-0" /> Full walk-forward backtesting
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#2D8A68] shrink-0" /> Webhook integrations (Slack/Discord)
                  </li>
                </ul>
              </div>

              <button
                onClick={onLaunchTerminal}
                className="btn-liquid w-full py-2.5 rounded-xl bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold shadow-warm-md"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Pro+ Tier */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/30 shadow-warm-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3F2E22]">Pro+ Institutional</h3>
                  <p className="text-xs text-[#8C705B] mt-1">For financial advisors &amp; small funds</p>
                </div>
                <div className="font-serif text-3xl font-bold text-[#3F2E22]">
                  ${billingCycle === 'annual' ? '64' : '79'}
                  <span className="text-xs font-sans font-normal text-[#8C705B]"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#5C4433] font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> 20 Personalized Intelligence Models
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> FinBERT custom news fine-tuning
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> Cross-asset correlation heatmaps
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> Full Programmatic REST &amp; WS API
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> White-label PDF tear sheets
                  </li>
                </ul>
              </div>

              <button
                onClick={onLaunchTerminal}
                className="w-full py-2.5 rounded-xl bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#3F2E22] text-xs font-semibold border border-[#AD8B73]/30 transition-colors"
              >
                Upgrade to Pro+
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="p-6 rounded-2xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3F2E22]">Enterprise</h3>
                  <p className="text-xs text-[#8C705B] mt-1">For hedge funds &amp; prop desks</p>
                </div>
                <div className="font-serif text-3xl font-bold text-[#3F2E22]">Custom</div>
                <ul className="space-y-2.5 text-xs text-[#5C4433] font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> Unlimited bespoke models
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> Live broker trade auto-execution
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> On-premise or dedicated cloud VPC
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#AD8B73] shrink-0" /> 99.9% SLA &amp; dedicated quant engineer
                  </li>
                </ul>
              </div>

              <button
                onClick={onSignIn}
                className="w-full py-2.5 rounded-xl border border-[#AD8B73]/40 text-[#5C4433] hover:bg-[#E3CAA5]/30 text-xs font-semibold transition-colors"
              >
                Contact Institutional Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-20 px-6 md:px-10 max-w-6xl mx-auto">
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-br from-[#F5EFE0] via-[#E3CAA5]/50 to-[#CEAB93]/30 border border-[#AD8B73]/40 shadow-warm-lg text-center space-y-6 relative overflow-hidden">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#3F2E22] tracking-tight">
            Ready to upgrade from noisy indicators to quantitative clarity?
          </h2>
          <p className="text-sm sm:text-base text-[#5C4433] max-w-xl mx-auto leading-relaxed">
            Join algorithmic traders and institutional portfolio managers leveraging multi-agent regime consensus.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onLaunchTerminal}
              className="btn-liquid px-8 py-4 rounded-xl bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-medium text-sm shadow-warm-md flex items-center space-x-2"
            >
              <span>Launch Terminal Now</span>
              <ArrowRight className="w-4 h-4 text-[#E3CAA5]" />
            </button>

            <button
              onClick={onSignIn}
              className="px-6 py-4 rounded-xl bg-[#FFFBE9] text-[#3F2E22] font-medium text-sm border border-[#AD8B73]/30 shadow-warm-sm hover:bg-[#F5EFE0] transition-colors"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      </section>

      {/* ARCHITECTURAL EDITORIAL FOOTER */}
      <footer className="border-t border-[#AD8B73]/20 bg-[#F5EFE0]/60 pt-16 pb-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E3CAA5] border border-[#AD8B73]/30 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-4 h-4 stroke-[#5C4433]"
                    strokeWidth="1.75"
                  >
                    <path d="M4 20V10a8 8 0 0 1 16 0v10" />
                    <path d="M8 20v-6a4 4 0 0 1 8 0v6" />
                  </svg>
                </div>
                <span className="font-serif text-lg font-bold text-[#3F2E22]">MarketPulse Pro</span>
              </div>
              <p className="text-xs text-[#8C705B] max-w-sm leading-relaxed">
                Institutional-grade quantitative intelligence engine uniting Gaussian Hidden Markov Models, LangGraph Multi-Agent Committee Consensus, and FinBERT Sentiment.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-mono uppercase font-bold text-[#3F2E22] tracking-wider block">Platform</span>
              <ul className="space-y-2 text-[#8C705B]">
                <li><a href="#models" className="hover:text-[#3F2E22]">Personalized Models</a></li>
                <li><a href="#committee" className="hover:text-[#3F2E22]">Multi-Agent Debate</a></li>
                <li><a href="#regimes" className="hover:text-[#3F2E22]">HMM Regime Engine</a></li>
                <li><a href="#backtesting" className="hover:text-[#3F2E22]">Kelly Criterion Sizing</a></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-mono uppercase font-bold text-[#3F2E22] tracking-wider block">Resources</span>
              <ul className="space-y-2 text-[#8C705B]">
                <li><a href="/docs" target="_blank" className="hover:text-[#3F2E22]">OpenAPI Reference</a></li>
                <li><a href="#backtesting" className="hover:text-[#3F2E22]">Walk-Forward Math</a></li>
                <li><a href="#pricing" className="hover:text-[#3F2E22]">SaaS Pricing Tiers</a></li>
                <li><button onClick={onLaunchTerminal} className="hover:text-[#3F2E22]">Interactive Demo</button></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-mono uppercase font-bold text-[#3F2E22] tracking-wider block">Security &amp; Legal</span>
              <ul className="space-y-2 text-[#8C705B]">
                <li><span className="text-[#8C705B]">SOC2 Type II Certified</span></li>
                <li><span className="text-[#8C705B]">Read-Only Broker OAuth</span></li>
                <li>
                  <button
                    onClick={() => setIsPrivacyOpen(true)}
                    className="hover:text-[#3F2E22] transition-colors"
                  >
                    Privacy Policy (GDPR)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsTermsOpen(true)}
                    className="hover:text-[#3F2E22] transition-colors"
                  >
                    Terms of Service (SEBI/SEC)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#AD8B73]/20 flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#8C705B] font-mono">
            <p>© 2026 MarketPulse AI Inc. All rights reserved. Quantitative trading involves risk of loss.</p>
            <p>Built with Gaussian HMM • FinBERT • LangGraph • FastAPI • React</p>
          </div>
        </div>
      </footer>

      {/* Legal & Compliance Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsOfServiceModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* GDPR / CCPA Cookie Consent Banner */}
      <CookieConsentBanner
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />
    </div>
  );
};
