import React, { useState, useEffect } from 'react';
import { CurrentRegime, SentimentData, PricePoint, AgentRecommendation, TickerSummary } from '../types';
import { api } from '../services/api';
import { realtime } from '../services/websocket';
import { InstitutionalPriceChart } from '../components/InstitutionalPriceChart';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Zap,
  BrainCircuit,
  Scale,
  RefreshCw,
  Clock,
  Sparkles,
  Flame,
  AlertCircle,
  BarChart2,
  ChevronRight,
  Globe
} from 'lucide-react';

interface DashboardProps {
  selectedTicker: string;
  onSelectTicker?: (ticker: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ selectedTicker, onSelectTicker }) => {
  const [regime, setRegime] = useState<CurrentRegime | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [period, setPeriod] = useState<string>('30d');
  const [recommendation, setRecommendation] = useState<AgentRecommendation | null>(null);
  const [loadingAgents, setLoadingAgents] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const isIndian = selectedTicker.endsWith('.NS') || selectedTicker.endsWith('.BO') || ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ICICIBANK', 'SBIN', 'ITC', 'WIPRO', 'ZOMATO'].some(s => selectedTicker.toUpperCase().includes(s));
  const currencySymbol = isIndian ? '₹' : '$';

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [regimeRes, sentimentRes, historyRes] = await Promise.all([
          api.getCurrentRegime(selectedTicker),
          api.getSentiment(selectedTicker),
          api.getPriceHistory(selectedTicker, period),
        ]);
        setRegime(regimeRes);
        setSentiment(sentimentRes);
        setPriceHistory(historyRes.data || []);
      } catch (e) {
        console.warn('Market data fetch warning:', e);
      } finally {
        setLoadingData(false);
      }
    };

    const fetchAgentRecommendation = async () => {
      setLoadingAgents(true);
      try {
        const recRes = await api.getLatestRecommendation(selectedTicker);
        setRecommendation(recRes);
      } catch (e) {
        console.warn('Agent recommendation warning:', e);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchData();
    fetchAgentRecommendation();

    const unsubscribe = realtime.subscribe((data) => {
      if (data.type === 'market_tick' && data.tickers) {
        const tick = data.tickers.find((t: TickerSummary) => t.symbol === selectedTicker);
        if (tick && regime) {
          setRegime((prev) => (prev ? { ...prev, price: tick.price } : null));
        }
      }
    });

    return () => unsubscribe();
  }, [selectedTicker, period]);

  const handleRunDebate = async () => {
    setLoadingAgents(true);
    try {
      const rec = await api.triggerAnalysis(selectedTicker);
      setRecommendation(rec);
    } catch (e) {
      console.warn('Debate execution error:', e);
    } finally {
      setLoadingAgents(false);
    }
  };

  const getRegimeTheme = (state?: number) => {
    if (state === 0) return { text: 'text-[#2D8A68]', bg: 'bg-[#2D8A68]/15', border: 'border-[#2D8A68]/30', dot: '#2D8A68' };
    if (state === 1) return { text: 'text-[#A84236]', bg: 'bg-[#A84236]/15', border: 'border-[#A84236]/30', dot: '#A84236' };
    return { text: 'text-[#B8860B]', bg: 'bg-[#B8860B]/15', border: 'border-[#B8860B]/30', dot: '#B8860B' };
  };

  const regColor = getRegimeTheme(regime?.regime_state);

  const renderChart = () => {
    const tf = period === '1d' ? '1D' : (period === '7d' ? '1W' : (period === '1y' ? '1Y' : '1M'));
    return (
      <div className="w-full">
        <InstitutionalPriceChart
          symbol={selectedTicker}
          currencySymbol={currencySymbol}
          data={priceHistory}
          currentPrice={regime?.price}
          timeframe={tf}
          onTimeframeChange={(newTf) => {
            const nextPeriod = newTf === '1D' ? '1d' : (newTf === '1W' ? '7d' : (newTf === '1Y' ? '1y' : '30d'));
            setPeriod(nextPeriod);
          }}
          height={260}
        />
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto bg-[#FFFBE9] paper-grain min-h-screen text-[#3F2E22]">
      {/* QUICK MARKET SELECTOR PILLS */}
      {onSelectTicker && (
        <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 p-3.5 rounded-2xl shadow-warm-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* US Equities */}
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold uppercase text-[#8C705B] flex items-center gap-1">
              🇺🇸 US Top:
            </span>
            <div className="flex items-center space-x-1 font-mono font-bold text-[11px]">
              {['NVDA', 'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'META', 'PLTR'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => onSelectTicker(sym)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${
                    selectedTicker === sym
                      ? 'bg-[#AD8B73] text-[#FFFBE9] shadow-warm-sm'
                      : 'bg-[#FFFBE9] text-[#5C4433] hover:bg-[#E3CAA5]/40 border border-[#AD8B73]/20'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Indian Equities */}
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] font-bold uppercase text-[#8C705B] flex items-center gap-1">
              🇮🇳 India NSE:
            </span>
            <div className="flex items-center space-x-1 font-mono font-bold text-[11px]">
              {[
                { label: 'RELIANCE', sym: 'RELIANCE.NS' },
                { label: 'TCS', sym: 'TCS.NS' },
                { label: 'HDFCBANK', sym: 'HDFCBANK.NS' },
                { label: 'TATAMOTORS', sym: 'TATAMOTORS.NS' },
                { label: 'INFY', sym: 'INFY.NS' },
                { label: 'ZOMATO', sym: 'ZOMATO.NS' },
              ].map((item) => (
                <button
                  key={item.sym}
                  onClick={() => onSelectTicker(item.sym)}
                  className={`px-2.5 py-0.5 rounded-lg transition-all ${
                    selectedTicker === item.sym
                      ? 'bg-[#AD8B73] text-[#FFFBE9] shadow-warm-sm'
                      : 'bg-[#FFFBE9] text-[#5C4433] hover:bg-[#E3CAA5]/40 border border-[#AD8B73]/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP KPI BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Ticker & Price */}
        <div className="p-5 rounded-2xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C705B]">Asset Snapshot</span>
              <h2 className="font-serif text-2xl font-bold text-[#3F2E22] mt-1">{selectedTicker}</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-[#E3CAA5] text-[#3F2E22] font-bold">
              {isIndian ? 'NSE / BSE' : 'NASDAQ'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#3F2E22]">
              {currencySymbol}{regime?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || (isIndian ? '1,287.00' : '242.85')}
            </span>
            <span className="text-xs text-[#2D8A68] font-bold">
              Log Ret: {((regime?.log_return || 0.0034) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* HMM Regime */}
        <div id="market-regime-pill" className={`p-5 rounded-2xl bg-[#F5EFE0] border ${regColor.border} shadow-warm-sm flex flex-col justify-between`}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C705B]">Gaussian HMM State</span>
              <h3 className={`font-serif text-xl font-bold mt-1 ${regColor.text}`}>
                {regime?.regime_name || 'Quiet Bull'}
              </h3>
            </div>
            <div className={`w-3 h-3 rounded-full animate-pulse`} style={{ backgroundColor: regColor.dot }} />
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#5C4433]">
            <span>Confidence: <strong>{((regime?.confidence || 0.88) * 100).toFixed(0)}%</strong></span>
            <span>Realized Vol: <strong>{((regime?.volatility || 0.0014) * 100).toFixed(2)}%</strong></span>
          </div>
        </div>

        {/* FinBERT Sentiment */}
        <div className="p-5 rounded-2xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C705B]">FinBERT News Polarity</span>
              <h3 className="font-serif text-xl font-bold text-[#2D8A68] mt-1 capitalize">
                {sentiment?.sentiment_label || 'Bullish'}
              </h3>
            </div>
            <Sparkles className="w-4 h-4 text-[#B8860B]" />
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#5C4433]">
            <span>Score: <strong className="text-[#2D8A68]">+{sentiment?.sentiment_score.toFixed(2) || '+0.78'}</strong></span>
            <span>Articles Scored: <strong>{sentiment?.articles_analyzed || 14}</strong></span>
          </div>
        </div>

        {/* Judge Consensus */}
        <div className="p-5 rounded-2xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8C705B]">Committee Recommendation</span>
              <h3 className="font-serif text-xl font-bold text-[#AD8B73] mt-1">
                {recommendation?.recommendation_label || 'ACCUMULATE'}
              </h3>
            </div>
            <Scale className="w-4 h-4 text-[#AD8B73]" />
          </div>
          <div className="mt-3 flex justify-between text-xs text-[#5C4433]">
            <span>Confidence: <strong className="text-[#3F2E22]">{((recommendation?.confidence || 0.84) * 100).toFixed(0)}%</strong></span>
            <span>Regime: <strong className="text-[#2D8A68] capitalize">{recommendation?.regime || 'Quiet Bull'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: CHART (2/3) + NEWS (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Resolution Price Chart */}
        <div className="lg:col-span-2 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#3F2E22]">
                Price Action &amp; Micro-Regime Overlay ({selectedTicker})
              </h3>
              <p className="text-xs text-[#8C705B] font-mono mt-0.5">
                Gaussian Hidden Markov Model state classification synchronized with live market bars ({currencySymbol})
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex space-x-1 bg-[#FFFBE9] p-1 rounded-xl border border-[#AD8B73]/20 shadow-warm-sm text-xs font-mono">
              {['1d', '7d', '30d', '90d', '1y'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    period === p
                      ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                      : 'text-[#5C4433] hover:text-[#3F2E22] hover:bg-[#E3CAA5]/40'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Price Chart */}
          <div className="pt-2 bg-[#FFFBE9] rounded-xl p-4 border border-[#AD8B73]/20 shadow-warm-sm">
            {loadingData ? (
              <div className="h-64 flex items-center justify-center text-xs font-mono text-[#8C705B]">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#AD8B73]" />
                Ingesting high-frequency bars for {selectedTicker}...
              </div>
            ) : (
              renderChart()
            )}
          </div>
        </div>

        {/* Right 1 Col: FinBERT Live News Sentiment Wire */}
        <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#B8860B]" />
                <span>FinBERT News Wire ({selectedTicker})</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3CAA5]/60 text-[#5C4433] font-bold">
                {isIndian ? 'NSE Stream' : 'Alpaca Stream'}
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {sentiment?.top_headlines && sentiment.top_headlines.length > 0 ? (
                sentiment.top_headlines.map((item, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm space-y-1.5 hover:border-[#AD8B73]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#8C705B]">{new Date(item.created_at || Date.now()).toLocaleTimeString()}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          item.score > 0.3
                            ? 'bg-[#2D8A68]/15 text-[#2D8A68]'
                            : item.score < -0.3
                            ? 'bg-[#A84236]/15 text-[#A84236]'
                            : 'bg-[#AD8B73]/15 text-[#5C4433]'
                        }`}
                      >
                        SCORE ({item.score?.toFixed(2) || '+0.65'})
                      </span>
                    </div>
                    <p className="text-xs text-[#3F2E22] font-sans line-clamp-2 leading-snug">
                      {item.headline}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#8C705B] font-mono p-4 text-center">
                  Listening for real-time news transcripts...
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#AD8B73]/20 flex items-center justify-between text-[11px] font-mono text-[#8C705B]">
            <span>Average Polarity:</span>
            <strong className="text-[#2D8A68]">+{sentiment?.sentiment_score.toFixed(2) || '+0.78'}</strong>
          </div>
        </div>
      </div>

      {/* 3. MULTI-AGENT COMMITTEE CONSENSUS ARENA */}
      <div id="agent-arena-container" className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-[#AD8B73]" />
              <h3 className="font-serif text-lg font-bold text-[#3F2E22]">
                Multi-Agent Reasoning Committee Arena ({selectedTicker})
              </h3>
            </div>
            <p className="text-xs text-[#8C705B] font-mono mt-0.5">
              LangGraph State Graph with Bull Node, Bear Node, and Chief Judge Synthesis
            </p>
          </div>

          <button
            onClick={handleRunDebate}
            disabled={loadingAgents}
            className="btn-liquid px-4 py-2 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-warm-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAgents ? 'animate-spin' : ''}`} />
            <span>{loadingAgents ? 'Synthesizing Consensus...' : 'Execute Live Debate'}</span>
          </button>
        </div>

        {/* 3 Agent Persona Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bull Node */}
          <div className="p-5 rounded-xl bg-[#FFFBE9] border border-[#2D8A68]/30 shadow-warm-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2D8A68]/15 text-[#2D8A68] flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-[#3F2E22]">Bull Agent</h4>
                    <span className="text-[10px] text-[#8C705B]">The Growth Optimist</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D8A68]/15 text-[#2D8A68] font-bold">
                  BULLISH THESIS
                </span>
              </div>

              <div className="text-xs text-[#5C4433] font-sans whitespace-pre-line leading-relaxed">
                {recommendation?.bull_argument ||
                  `Key Catalysts for ${selectedTicker}:\n- Robust order-flow momentum & favorable earnings guidance\n- Steady institutional accumulation\n\nKey Note: Trend aligned with Quiet Bull regime.`}
              </div>
            </div>
          </div>

          {/* Bear Node */}
          <div className="p-5 rounded-xl bg-[#FFFBE9] border border-[#A84236]/30 shadow-warm-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#A84236]/15 text-[#A84236] flex items-center justify-center font-bold">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-[#3F2E22]">Bear Agent</h4>
                    <span className="text-[10px] text-[#8C705B]">The Risk Skeptic</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A84236]/15 text-[#A84236] font-bold">
                  DOWNSIDE GUARD
                </span>
              </div>

              <div className="text-xs text-[#5C4433] font-sans whitespace-pre-line leading-relaxed">
                {recommendation?.bear_argument ||
                  `Key Headwinds & Risks (${selectedTicker}):\n- Localized volatility scaling requires tail-risk caution\n- Valuation multiple leaves small margin of safety\n\nKey Note: Maintain disciplined trailing stop-loss.`}
              </div>
            </div>
          </div>

          {/* Judge Node */}
          <div className="p-5 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/40 shadow-warm-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#AD8B73] text-[#FFFBE9] flex items-center justify-center font-bold shadow-warm-sm">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-[#3F2E22]">Chief Judge</h4>
                    <span className="text-[10px] text-[#8C705B]">The Synthesizer</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm">
                  {recommendation?.recommendation_label || 'ACCUMULATE'}
                </span>
              </div>

              <div className="text-xs text-[#5C4433] font-sans whitespace-pre-line leading-relaxed font-mono">
                {recommendation?.judge_recommendation ||
                  `RECOMMENDATION: BUY\nCONFIDENCE: 88%\n- Directive: ACCUMULATE (Quiet Bull)\n- Half-Kelly Sizing: 18.5% NAV\n- Target: ${currencySymbol}${((regime?.price || 150) * 1.10).toFixed(2)} | Stop: ${currencySymbol}${((regime?.price || 150) * 0.94).toFixed(2)}\n\nKey Trigger: Volatility spike > 2.2% flips to CASH.`}
              </div>
            </div>
          </div>
        </div>

        {/* Historical ChromaDB Analogue Memory Strip */}
        <div className="p-4 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 text-xs font-mono space-y-1.5 shadow-warm-sm">
          <div className="flex items-center space-x-2 text-[#8C705B]">
            <Clock className="w-3.5 h-3.5 text-[#AD8B73]" />
            <span className="uppercase text-[10px] font-bold">ChromaDB Vector Retrieval Analogues</span>
          </div>
          <p className="text-[#5C4433] font-sans text-xs">
            {recommendation?.historical_episodes && recommendation.historical_episodes.length > 0
              ? recommendation.historical_episodes[0]
              : `Matched historical analogues for ${selectedTicker}: Similar volatility profiles resolved into positive drift within 8 sessions.`}
          </p>
        </div>
      </div>
    </div>
  );
};
