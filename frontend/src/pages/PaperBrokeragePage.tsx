import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InstitutionalPriceChart } from '../components/InstitutionalPriceChart';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  RotateCcw,
  Zap,
  PieChart,
  Activity,
  ListOrdered,
  Wallet,
  Shield,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Sliders,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  country: 'US' | 'IN';
  currency: 'USD' | 'INR';
}

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 242.85, change: 4.25, changePct: 1.78, country: 'US', currency: 'USD' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 232.10, change: 1.15, changePct: 0.50, country: 'US', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 218.40, change: -3.20, changePct: -1.44, country: 'US', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 448.60, change: 2.80, changePct: 0.63, country: 'US', currency: 'USD' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 1287.00, change: 14.50, changePct: 1.14, country: 'IN', currency: 'INR' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3420.00, change: -18.00, changePct: -0.52, country: 'IN', currency: 'INR' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', price: 1645.00, change: 8.20, changePct: 0.50, country: 'IN', currency: 'INR' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', price: 980.50, change: 12.30, changePct: 1.27, country: 'IN', currency: 'INR' }
];

export const PaperBrokeragePage: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<WatchlistItem>(DEFAULT_WATCHLIST[0]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(DEFAULT_WATCHLIST);
  const [watchlistFilter, setWatchlistFilter] = useState<'ALL' | 'US' | 'IN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Terminal Tabs
  const [activeTab, setActiveTab] = useState<'order' | 'holdings' | 'positions' | 'orders' | 'funds'>('order');
  const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  // Order Ticket State
  const [productType, setProductType] = useState<'CNC' | 'MIS' | 'MTF'>('CNC');
  const [orderMode, setOrderMode] = useState<'REGULAR' | 'COVER' | 'GTT'>('REGULAR');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [sharesInput, setSharesInput] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(selectedStock.price);
  const [stopLossTrigger, setStopLossTrigger] = useState<number>(selectedStock.price * 0.95);

  // Portfolio & Depth State
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [sellModalData, setSellModalData] = useState<any>(null);
  const [tradeToast, setTradeToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fund Deposit Modal
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(50000);

  const isIndian = selectedStock.currency === 'INR' || selectedStock.symbol.includes('.NS') || selectedStock.symbol.includes('.BO');
  const currSym = isIndian ? '₹' : '$';

  // Load live stock data and price history
  useEffect(() => {
    setLimitPrice(selectedStock.price);
    setStopLossTrigger(selectedStock.price * 0.95);
    
    // Fetch price history
    api.getPriceHistory(selectedStock.symbol, chartRange === '1Y' ? '1y' : chartRange === '1M' ? '30d' : '7d')
      .then((res: any) => setPriceHistory(Array.isArray(res) ? res : (res?.data || [])))
      .catch(() => {});
  }, [selectedStock, chartRange]);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      const data = await api.getPaperPortfolio(selectedStock.symbol);
      setPortfolio(data);
    } catch (e) {
      console.warn('Error loading paper portfolio:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
    const interval = setInterval(loadPortfolioData, 3000);
    return () => clearInterval(interval);
  }, [selectedStock.symbol]);

  const handleExecuteOrder = async (side: 'BUY' | 'SELL', customShares?: number, customSym?: string) => {
    const sym = customSym || selectedStock.symbol;
    const qty = customShares || sharesInput;

    if (qty <= 0) {
      setTradeToast({ type: 'error', text: 'Please enter a valid share quantity.' });
      return;
    }

    setExecuting(true);
    setTradeToast(null);
    try {
      const updated = await api.placePaperOrder(
        sym,
        side,
        qty,
        orderType,
        productType === 'MTF' ? 'MIS' : productType
      );
      setPortfolio(updated);

      if (side === 'SELL' && updated.latest_sell_summary) {
        setSellModalData(updated.latest_sell_summary);
      } else {
        setTradeToast({
          type: 'success',
          text: `Executed ${side} ${qty} shares of ${sym} (${productType}) at ${currSym}${selectedStock.price.toFixed(2)}!`
        });
      }
    } catch (err: any) {
      setTradeToast({
        type: 'error',
        text: err.message || `Failed to execute ${side} order.`
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleDepositFunds = async () => {
    try {
      const updated = await api.depositPaperFunds(
        isIndian ? 0 : depositAmount,
        isIndian ? depositAmount : 0
      );
      setPortfolio(updated);
      setIsDepositOpen(false);
      setTradeToast({
        type: 'success',
        text: `Successfully credited ${currSym}${depositAmount.toLocaleString()} virtual trading balance!`
      });
    } catch (e) {
      console.warn('Error depositing funds:', e);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset your entire paper trading portfolio back to starting virtual capital ($100,000 USD / ₹80,00,000 INR)?')) return;
    try {
      const updated = await api.resetPaperPortfolio();
      setPortfolio(updated);
      setTradeToast({ type: 'success', text: 'Portfolio balance reset to starting capital!' });
    } catch (e) {
      console.warn('Error resetting portfolio:', e);
    }
  };

  // Financial Variables
  const relevantHoldings = (portfolio?.holdings || []).filter((h: any) =>
    isIndian ? (h.currency === 'INR' || h.symbol.includes('.NS') || h.symbol.includes('.BO'))
             : (h.currency !== 'INR' && !h.symbol.includes('.NS') && !h.symbol.includes('.BO'))
  );

  const computedInvested = relevantHoldings.reduce((sum: number, h: any) => sum + ((h.shares || 0) * (h.average_entry_price || 0)), 0);
  const computedMarketVal = relevantHoldings.reduce((sum: number, h: any) => sum + ((h.shares || 0) * (h.current_price || h.average_entry_price || 0)), 0);
  const computedOverallPnl = computedMarketVal - computedInvested;
  const computedOverallPnlPct = computedInvested > 0 ? (computedOverallPnl / computedInvested) * 100 : 0;
  const computedDayPnl = relevantHoldings.reduce((sum: number, h: any) => sum + (h.day_pnl || (((h.shares || 0) * (h.current_price || 0)) * ((h.day_change_pct || 0.85) / 100))), 0);

  const cashAvailable = isIndian ? (portfolio?.cash_inr ?? 8000000) : (portfolio?.cash_usd ?? 100000);
  const totalInvested = computedInvested;
  const totalMarketVal = computedMarketVal;
  const overallPnl = computedOverallPnl;
  const overallPnlPct = computedOverallPnlPct;
  const dayPnl = computedDayPnl;
  const totalEquity = cashAvailable + totalMarketVal;

  const activePosition = portfolio?.positions?.find((p: any) => p.symbol === selectedStock.symbol);
  const orderPrice = orderType === 'LIMIT' ? limitPrice : selectedStock.price;
  const rawOrderVal = sharesInput * orderPrice;
  const marginRequired = productType === 'MIS' ? rawOrderVal * 0.20 : (productType === 'MTF' ? rawOrderVal * 0.25 : rawOrderVal);
  const estimatedCharges = isIndian ? 20.0 + (rawOrderVal * 0.001) + (rawOrderVal * 0.0000345 * 1.18) : (rawOrderVal * 0.0000278);

  const depth = portfolio?.market_depth || {
    bids: [],
    asks: [],
    total_buy_qty: 18500,
    total_sell_qty: 14200,
    buy_ratio: 56.6,
    sell_ratio: 43.4,
    lower_circuit: selectedStock.price * 0.9,
    upper_circuit: selectedStock.price * 1.1
  };

  // Filter Watchlist
  const filteredWatchlist = watchlist.filter((item) => {
    if (watchlistFilter === 'US' && item.country !== 'US') return false;
    if (watchlistFilter === 'IN' && item.country !== 'IN') return false;
    if (searchQuery && !item.symbol.toUpperCase().includes(searchQuery.toUpperCase()) && !item.name.toUpperCase().includes(searchQuery.toUpperCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto bg-[#FFFBE9] paper-grain min-h-screen text-[#3F2E22]">
      {/* Top Header & Brokerage Telemetry */}
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 p-5 rounded-2xl shadow-warm-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#AD8B73] text-[#FFFBE9] flex items-center justify-center font-bold shadow-warm-sm">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-[#3F2E22] flex items-center gap-2">
              <span>Angel One / Kite Paper Brokerage Terminal</span>
              <span className="px-2 py-0.5 rounded bg-[#2D8A68]/15 text-[#2D8A68] text-[10px] font-mono font-bold">
                REAL-TIME LIVE PRICES
              </span>
            </h1>
            <p className="text-xs text-[#8C705B] font-mono mt-0.5">
              Live market orders, Level 2 depth ladder, delivery holdings, intraday leverage (5x) &amp; P&amp;L accounting
            </p>
          </div>
        </div>

        {/* Action Tabs Switcher */}
        <div className="flex items-center space-x-1 bg-[#FFFBE9] p-1 rounded-xl border border-[#AD8B73]/25 shadow-warm-sm text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'order'
                ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trading Desk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('holdings')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'holdings'
                ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Holdings ({portfolio?.holdings?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('positions')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'positions'
                ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Positions ({portfolio?.positions?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Order Book</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('funds')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'funds'
                ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Funds &amp; Margin</span>
          </button>
        </div>
      </div>

      {/* Global Portfolio KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm">
          <span className="text-[10px] text-[#8C705B] uppercase block">Total Portfolio Value</span>
          <strong className="text-base text-[#3F2E22] font-bold">
            {currSym}{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm">
          <span className="text-[10px] text-[#8C705B] uppercase block">Total Invested</span>
          <strong className="text-base text-[#3F2E22] font-bold">
            {currSym}{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm">
          <span className="text-[10px] text-[#8C705B] uppercase block">Overall Returns (P&amp;L)</span>
          <strong className={`text-base font-bold ${overallPnl >= 0 ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
            {overallPnl >= 0 ? '+' : ''}{currSym}{overallPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({overallPnlPct.toFixed(2)}%)
          </strong>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm">
          <span className="text-[10px] text-[#8C705B] uppercase block">Today's P&amp;L</span>
          <strong className={`text-base font-bold ${dayPnl >= 0 ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
            {dayPnl >= 0 ? '+' : ''}{currSym}{dayPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <span className="text-[10px] text-[#8C705B] uppercase block">Available Margin</span>
            <strong className="text-base text-[#2D8A68] font-bold">
              {currSym}{cashAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
          <button
            onClick={() => setIsDepositOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#E3CAA5] text-[#5C4433] font-bold text-[10px] hover:bg-[#CEAB93] transition-colors"
          >
            + Add Funds
          </button>
        </div>
      </div>

      {/* Trade Toast Banner */}
      {tradeToast && (
        <div
          className={`p-3 rounded-xl border text-xs font-sans flex items-center justify-between animate-fade-in ${
            tradeToast.type === 'success'
              ? 'bg-[#2D8A68]/15 border-[#2D8A68]/30 text-[#2D8A68]'
              : 'bg-[#A84236]/15 border-[#A84236]/30 text-[#A84236]'
          }`}
        >
          <div className="flex items-center space-x-2">
            {tradeToast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{tradeToast.text}</span>
          </div>
          <button onClick={() => setTradeToast(null)} className="text-xs font-bold px-1">✕</button>
        </div>
      )}

      {/* MAIN BROKERAGE DESK WORKSPACE (3-COLUMN TERMINAL) */}
      {activeTab === 'order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. LEFT PANEL: LIVE MARKET WATCHLIST (3 Cols) */}
          <div className="lg:col-span-3 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-4 space-y-3 shadow-warm-sm">
            <div className="flex items-center justify-between border-b border-[#AD8B73]/20 pb-2">
              <h3 className="font-serif text-sm font-bold text-[#3F2E22]">Market Watchlist</h3>
              <div className="flex items-center space-x-1 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setWatchlistFilter('ALL')}
                  className={`px-1.5 py-0.5 rounded ${watchlistFilter === 'ALL' ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold' : 'text-[#8C705B]'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setWatchlistFilter('US')}
                  className={`px-1.5 py-0.5 rounded ${watchlistFilter === 'US' ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold' : 'text-[#8C705B]'}`}
                >
                  🇺🇸 US
                </button>
                <button
                  type="button"
                  onClick={() => setWatchlistFilter('IN')}
                  className={`px-1.5 py-0.5 rounded ${watchlistFilter === 'IN' ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold' : 'text-[#8C705B]'}`}
                >
                  🇮🇳 NSE
                </button>
              </div>
            </div>

            {/* Watchlist Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C705B] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
              />
            </div>

            {/* Watchlist Items */}
            <div className="space-y-1.5 overflow-y-auto max-h-[580px] pr-1">
              {filteredWatchlist.map((item) => {
                const isSelected = selectedStock.symbol === item.symbol;
                const isProfitable = item.change >= 0;
                const itemSym = item.currency === 'INR' ? '₹' : '$';
                return (
                  <div
                    key={item.symbol}
                    onClick={() => setSelectedStock(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFFBE9] border-[#AD8B73] ring-1 ring-[#AD8B73]/40 shadow-warm-sm'
                        : 'bg-[#FFFBE9]/60 border-[#AD8B73]/15 hover:bg-[#FFFBE9] hover:border-[#AD8B73]/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs text-[#3F2E22]">{item.symbol}</span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#E3CAA5]/60 text-[#5C4433]">
                          {item.country}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8C705B] truncate block max-w-[110px]">
                        {item.name}
                      </span>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="font-bold text-[#3F2E22] block">
                        {itemSym}{item.price.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-bold ${isProfitable ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                        {isProfitable ? '+' : ''}{item.change.toFixed(2)} ({item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CENTER PANEL: LIVE CHART & STATS (5 Cols) */}
          <div className="lg:col-span-5 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-5 space-y-4 shadow-warm-sm flex flex-col justify-between">
            <div>
              {/* Header with Ticker Details & Range Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#AD8B73]/20 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-serif text-xl font-bold text-[#3F2E22]">
                      {selectedStock.symbol}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#E3CAA5] text-[#3F2E22] font-bold font-mono">
                      {isIndian ? 'NSE / BSE' : 'NASDAQ'}
                    </span>
                  </div>
                  <span className="text-xs text-[#8C705B]">{selectedStock.name}</span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-2xl font-bold text-[#3F2E22] block">
                    {currSym}{selectedStock.price.toFixed(2)}
                  </span>
                  <span className={`text-xs font-bold ${selectedStock.change >= 0 ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePct >= 0 ? '+' : ''}{selectedStock.changePct.toFixed(2)}%)
                  </span>
                </div>
              </div>

              {/* Institutional Interactive Price & Regime Chart */}
              <div className="mt-3">
                <InstitutionalPriceChart
                  symbol={selectedStock.symbol}
                  currencySymbol={currSym}
                  data={priceHistory}
                  currentPrice={selectedStock.price}
                  timeframe={chartRange}
                  onTimeframeChange={(tf) => setChartRange(tf)}
                  height={250}
                />
              </div>
            </div>

            {/* Real-time Market Statistics (Angel One style) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-[#FFFBE9] border border-[#AD8B73]/15">
                <span className="text-[10px] text-[#8C705B] block">Open Price</span>
                <strong className="text-[#3F2E22]">{currSym}{(selectedStock.price * 0.992).toFixed(2)}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFBE9] border border-[#AD8B73]/15">
                <span className="text-[10px] text-[#8C705B] block">Day High</span>
                <strong className="text-[#2D8A68]">{currSym}{(selectedStock.price * 1.018).toFixed(2)}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFBE9] border border-[#AD8B73]/15">
                <span className="text-[10px] text-[#8C705B] block">Day Low</span>
                <strong className="text-[#A84236]">{currSym}{(selectedStock.price * 0.985).toFixed(2)}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFBE9] border border-[#AD8B73]/15">
                <span className="text-[10px] text-[#8C705B] block">52W High</span>
                <strong className="text-[#3F2E22]">{currSym}{(selectedStock.price * 1.35).toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* 3. RIGHT PANEL: ANGEL ONE ORDER EXECUTION TICKET & MARKET DEPTH (4 Cols) */}
          <div className="lg:col-span-4 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-5 space-y-4 shadow-warm-sm">
            {/* Order Mode Switcher (Regular vs Cover vs GTT) */}
            <div className="flex items-center justify-between border-b border-[#AD8B73]/20 pb-3">
              <div className="flex items-center space-x-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setOrderMode('REGULAR')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    orderMode === 'REGULAR' ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm' : 'text-[#5C4433]'
                  }`}
                >
                  Regular
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode('COVER')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    orderMode === 'COVER' ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm' : 'text-[#5C4433]'
                  }`}
                >
                  Cover / SL
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode('GTT')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    orderMode === 'GTT' ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm' : 'text-[#5C4433]'
                  }`}
                >
                  GTT
                </button>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D8A68]/15 text-[#2D8A68] font-bold">
                LIVE
              </span>
            </div>

            {/* Product Type (Delivery CNC vs Intraday MIS vs MTF) */}
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setProductType('CNC')}
                className={`py-1.5 rounded-xl border transition-all text-center ${
                  productType === 'CNC'
                    ? 'bg-[#AD8B73] text-[#FFFBE9] border-[#AD8B73] font-bold shadow-warm-sm'
                    : 'bg-[#FFFBE9] text-[#5C4433] border-[#AD8B73]/20'
                }`}
              >
                Delivery (CNC)
              </button>
              <button
                type="button"
                onClick={() => setProductType('MIS')}
                className={`py-1.5 rounded-xl border transition-all text-center flex items-center justify-center gap-1 ${
                  productType === 'MIS'
                    ? 'bg-[#AD8B73] text-[#FFFBE9] border-[#AD8B73] font-bold shadow-warm-sm'
                    : 'bg-[#FFFBE9] text-[#5C4433] border-[#AD8B73]/20'
                }`}
              >
                <span>Intraday</span>
                <span className="px-1 py-0.2 rounded bg-[#2D8A68] text-[#FFFBE9] text-[8px] font-bold">5X</span>
              </button>
              <button
                type="button"
                onClick={() => setProductType('MTF')}
                className={`py-1.5 rounded-xl border transition-all text-center flex items-center justify-center gap-1 ${
                  productType === 'MTF'
                    ? 'bg-[#AD8B73] text-[#FFFBE9] border-[#AD8B73] font-bold shadow-warm-sm'
                    : 'bg-[#FFFBE9] text-[#5C4433] border-[#AD8B73]/20'
                }`}
              >
                <span>MTF</span>
                <span className="px-1 py-0.2 rounded bg-[#B8860B] text-[#FFFBE9] text-[8px] font-bold">4X</span>
              </button>
            </div>

            {/* Quantity & Order Price */}
            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={sharesInput}
                  onChange={(e) => setSharesInput(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 font-mono text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                />
              </div>

              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Order Price</label>
                <input
                  type="number"
                  step="0.05"
                  disabled={orderType === 'MARKET'}
                  value={orderType === 'MARKET' ? selectedStock.price : limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 font-mono text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] disabled:opacity-60 shadow-warm-sm"
                />
              </div>
            </div>

            {/* Market / Limit Switch */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`px-2.5 py-1 rounded-lg border ${orderType === 'MARKET' ? 'bg-[#E3CAA5] border-[#AD8B73] font-bold' : 'bg-[#FFFBE9] border-[#AD8B73]/20'}`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`px-2.5 py-1 rounded-lg border ${orderType === 'LIMIT' ? 'bg-[#E3CAA5] border-[#AD8B73] font-bold' : 'bg-[#FFFBE9] border-[#AD8B73]/20'}`}
              >
                Limit Order
              </button>
            </div>

            {/* Margin Calculation & Breakdown Box */}
            <div className="p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 space-y-1.5 text-xs font-mono shadow-warm-sm">
              <div className="flex justify-between items-center text-[#8C705B]">
                <span>Total Value:</span>
                <strong className="text-[#3F2E22]">{currSym}{rawOrderVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between items-center text-[#8C705B]">
                <span>Margin Required ({productType === 'MIS' ? '5x Leverage' : '100%'}):</span>
                <strong className="text-[#2D8A68]">{currSym}{marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between items-center text-[#8C705B] text-[10px]">
                <span>Est. Charges (STT+Brokerage):</span>
                <span>{currSym}{estimatedCharges.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Execution Action Buttons */}
            <div className="flex space-x-3 pt-1">
              <button
                type="button"
                disabled={executing}
                onClick={() => handleExecuteOrder('BUY')}
                className="btn-liquid flex-1 py-3 bg-[#2D8A68] hover:bg-[#246E53] text-[#FFFBE9] font-bold text-xs rounded-xl shadow-warm-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>BUY {sharesInput} {selectedStock.symbol}</span>
              </button>

              <button
                type="button"
                disabled={executing || !activePosition || activePosition.shares <= 0}
                onClick={() => handleExecuteOrder('SELL')}
                className="btn-liquid flex-1 py-3 bg-[#A84236] hover:bg-[#8D372D] text-[#FFFBE9] font-bold text-xs rounded-xl shadow-warm-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>SELL {sharesInput} {selectedStock.symbol}</span>
              </button>
            </div>

            {/* Market Depth Ladder Strip */}
            <div className="p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-[#2D8A68]">{depth.buy_ratio}% Buyers ({depth.total_buy_qty.toLocaleString()})</span>
                <span className="text-[#A84236]">{depth.sell_ratio}% Sellers ({depth.total_sell_qty.toLocaleString()})</span>
              </div>
              <div className="w-full bg-[#F5EFE0] h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-[#2D8A68] h-full" style={{ width: `${depth.buy_ratio}%` }} />
                <div className="bg-[#A84236] h-full" style={{ width: `${depth.sell_ratio}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOLDINGS (CNC DELIVERY) */}
      {activeTab === 'holdings' && (
        <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#AD8B73]/20 pb-3">
            <div>
              <h3 className="font-serif text-base font-bold text-[#3F2E22]">
                Delivery Portfolio Holdings ({portfolio?.holdings?.length || 0})
              </h3>
              <p className="text-xs text-[#8C705B] font-sans">Long-term equity assets held in demat paper storage</p>
            </div>
          </div>

          <div className="overflow-x-auto bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#8C705B] border-b border-[#AD8B73]/20 bg-[#F5EFE0] text-[10px] uppercase">
                  <th className="p-3">Instrument</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Avg Price</th>
                  <th className="p-3">LTP</th>
                  <th className="p-3">Invested</th>
                  <th className="p-3">Current Val</th>
                  <th className="p-3">Total Returns (P&amp;L)</th>
                  <th className="p-3">Day's P&amp;L</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#AD8B73]/15">
                {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                  portfolio.holdings.map((h: any) => {
                    const hSym = h.currency === 'INR' ? '₹' : '$';
                    const isProfitable = h.unrealized_pnl >= 0;
                    const isDayProfit = h.day_pnl >= 0;
                    return (
                      <tr key={h.id} className="hover:bg-[#F5EFE0]/50 transition-colors">
                        <td className="p-3 font-serif font-bold text-[#3F2E22]">{h.symbol}</td>
                        <td className="p-3 text-[#3F2E22]">{h.shares}</td>
                        <td className="p-3 text-[#5C4433]">{hSym}{h.average_entry_price.toFixed(2)}</td>
                        <td className="p-3 font-bold text-[#3F2E22]">{hSym}{h.current_price.toFixed(2)}</td>
                        <td className="p-3 text-[#5C4433]">{hSym}{h.invested_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-3 font-bold text-[#3F2E22]">{hSym}{h.market_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={`p-3 font-bold ${isProfitable ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                          {isProfitable ? '+' : ''}{hSym}{h.unrealized_pnl.toFixed(2)} ({h.unrealized_pnl_pct.toFixed(2)}%)
                        </td>
                        <td className={`p-3 font-bold ${isDayProfit ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                          {isDayProfit ? '+' : ''}{hSym}{h.day_pnl.toFixed(2)}
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleExecuteOrder('BUY', 10, h.symbol)}
                            className="px-2.5 py-1 rounded bg-[#2D8A68]/15 hover:bg-[#2D8A68] text-[#2D8A68] hover:text-[#FFFBE9] text-[10px] font-bold transition-colors"
                          >
                            + Add
                          </button>
                          <button
                            onClick={() => handleExecuteOrder('SELL', h.shares, h.symbol)}
                            className="px-2.5 py-1 rounded bg-[#A84236]/15 hover:bg-[#A84236] text-[#A84236] hover:text-[#FFFBE9] text-[10px] font-bold transition-colors"
                          >
                            Exit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-[#8C705B] font-sans text-xs">
                      No holdings recorded. Place a Delivery (CNC) trade to accumulate assets.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: POSITIONS (INTRADAY MIS) */}
      {activeTab === 'positions' && (
        <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#AD8B73]/20 pb-3">
            <h3 className="font-serif text-base font-bold text-[#3F2E22]">
              Open Active Positions ({portfolio?.positions?.length || 0})
            </h3>
          </div>

          <div className="overflow-x-auto bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#8C705B] border-b border-[#AD8B73]/20 bg-[#F5EFE0] text-[10px] uppercase">
                  <th className="p-3">Product</th>
                  <th className="p-3">Instrument</th>
                  <th className="p-3">Net Qty</th>
                  <th className="p-3">Avg Price</th>
                  <th className="p-3">LTP</th>
                  <th className="p-3">P&amp;L ($/₹)</th>
                  <th className="p-3">Return %</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#AD8B73]/15">
                {portfolio?.positions && portfolio.positions.length > 0 ? (
                  portfolio.positions.map((p: any) => {
                    const pSym = p.currency === 'INR' ? '₹' : '$';
                    const isProfit = p.unrealized_pnl >= 0;
                    return (
                      <tr key={p.id} className="hover:bg-[#F5EFE0]/50 transition-colors">
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-[#E3CAA5] text-[#5C4433] text-[9px] font-bold">
                            {p.product_type}
                          </span>
                        </td>
                        <td className="p-3 font-serif font-bold text-[#3F2E22]">{p.symbol}</td>
                        <td className="p-3 text-[#3F2E22] font-bold">{p.shares}</td>
                        <td className="p-3 text-[#5C4433]">{pSym}{p.average_entry_price.toFixed(2)}</td>
                        <td className="p-3 font-bold text-[#3F2E22]">{pSym}{p.current_price.toFixed(2)}</td>
                        <td className={`p-3 font-bold ${isProfit ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                          {isProfit ? '+' : ''}{pSym}{p.unrealized_pnl.toFixed(2)}
                        </td>
                        <td className={`p-3 font-bold ${isProfit ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                          {p.unrealized_pnl_pct.toFixed(2)}%
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleExecuteOrder('SELL', p.shares, p.symbol)}
                            className="px-2.5 py-1 rounded-lg bg-[#A84236]/15 hover:bg-[#A84236] text-[#A84236] hover:text-[#FFFBE9] text-[10px] font-bold transition-colors"
                          >
                            Square Off
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-[#8C705B] font-sans text-xs">
                      No open positions active.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & TRADE BOOK */}
      {activeTab === 'orders' && (
        <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#3F2E22]">Executed Trade Book</h3>
          <div className="overflow-x-auto bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#8C705B] border-b border-[#AD8B73]/20 bg-[#F5EFE0] text-[10px] uppercase">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Instrument</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Exec Price</th>
                  <th className="p-3">Total Value</th>
                  <th className="p-3">Charges</th>
                  <th className="p-3">Realized P&amp;L</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#AD8B73]/15">
                {portfolio?.orders && portfolio.orders.length > 0 ? (
                  portfolio.orders.map((o: any) => {
                    const oSym = o.currency === 'INR' ? '₹' : '$';
                    const isBuy = o.side === 'BUY';
                    return (
                      <tr key={o.id} className="hover:bg-[#F5EFE0]/50 transition-colors">
                        <td className="p-3 text-[#8C705B] font-bold">{o.order_id}</td>
                        <td className="p-3 text-[#8C705B]">{new Date(o.created_at).toLocaleTimeString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBuy ? 'bg-[#2D8A68]/15 text-[#2D8A68]' : 'bg-[#A84236]/15 text-[#A84236]'}`}>
                            {o.side}
                          </span>
                        </td>
                        <td className="p-3 text-[#5C4433]">{o.product_type}</td>
                        <td className="p-3 font-serif font-bold text-[#3F2E22]">{o.symbol}</td>
                        <td className="p-3 text-[#3F2E22]">{o.shares}</td>
                        <td className="p-3 text-[#5C4433]">{oSym}{o.execution_price.toFixed(2)}</td>
                        <td className="p-3 font-bold text-[#3F2E22]">{oSym}{o.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-3 text-[#8C705B]">{oSym}{o.charges?.toFixed(2) || '0.00'}</td>
                        <td className={`p-3 font-bold ${o.realized_pnl >= 0 ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                          {o.side === 'SELL' ? `${o.realized_pnl >= 0 ? '+' : ''}${oSym}${o.realized_pnl.toFixed(2)}` : '—'}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2D8A68]/15 text-[#2D8A68]">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-[#8C705B] font-sans text-xs">
                      No executed trades recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FUNDS & COLLATERAL MARGIN */}
      {activeTab === 'funds' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 space-y-4 shadow-warm-sm">
            <h3 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#AD8B73]" />
              <span>Brokerage Funds &amp; Collateral Margin</span>
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20">
                <span className="text-[#8C705B]">Available Trading Margin (USD):</span>
                <strong className="text-[#2D8A68] text-base">${(portfolio?.cash_usd || 100000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20">
                <span className="text-[#8C705B]">Available Trading Margin (INR):</span>
                <strong className="text-[#2D8A68] text-base">₹{(portfolio?.cash_inr || 8000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20">
                <span className="text-[#8C705B]">Holding Collateral Valuation:</span>
                <strong className="text-[#3F2E22] text-base">{currSym}{totalMarketVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20">
                <span className="text-[#8C705B]">Total Realized Profit / Loss:</span>
                <strong className={`text-base ${(portfolio?.realized_pnl_usd || 0) >= 0 ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                  {(portfolio?.realized_pnl_usd || 0) >= 0 ? '+' : ''}${portfolio?.realized_pnl_usd?.toFixed(2) || '0.00'} / ₹{portfolio?.realized_pnl_inr?.toFixed(2) || '0.00'}
                </strong>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="btn-liquid px-4 py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                + Deposit Virtual Capital (Pay-In)
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-[#FFFBE9] hover:bg-[#A84236]/15 text-[#A84236] font-semibold text-xs rounded-xl border border-[#AD8B73]/25 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to $100k / ₹80L</span>
              </button>
            </div>
          </div>

          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 space-y-3 shadow-warm-sm text-xs font-sans">
            <div className="flex items-center space-x-2 text-[#3F2E22] font-serif font-bold">
              <Shield className="w-4 h-4 text-[#2D8A68]" />
              <span>Brokerage Policy &amp; Security</span>
            </div>
            <p className="text-[#5C4433] leading-relaxed text-[11px]">
              Simulated trades execute against real live price quotes with statutory taxes (STT, SEBI turnover, GST) deducted in accordance with exchange regulations.
            </p>
          </div>
        </div>
      )}

      {/* REALIZED PROFIT / LOSS CELEBRATION MODAL */}
      {sellModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-md w-full p-7 space-y-5 shadow-warm-lg">
            <div className="text-center space-y-2">
              <div
                className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-warm-sm ${
                  sellModalData.is_profitable ? 'bg-[#2D8A68] text-[#FFFBE9]' : 'bg-[#A84236] text-[#FFFBE9]'
                }`}
              >
                {sellModalData.is_profitable ? <Sparkles className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#3F2E22]">
                {sellModalData.is_profitable ? 'Profitable Trade Booked!' : 'Position Liquidated'}
              </h3>
              <p className="text-xs text-[#5C4433] font-sans font-bold">
                {sellModalData.headline}
              </p>
            </div>

            {/* Trade Receipt Box */}
            <div className="p-4 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/25 space-y-2 font-mono text-xs shadow-warm-sm">
              <div className="flex justify-between text-[#8C705B]">
                <span>Shares Sold:</span>
                <strong className="text-[#3F2E22]">{sellModalData.shares_sold} {sellModalData.symbol}</strong>
              </div>
              <div className="flex justify-between text-[#8C705B]">
                <span>Average Entry Price:</span>
                <span>{sellModalData.currency === 'INR' ? '₹' : '$'}{sellModalData.entry_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8C705B]">
                <span>Execution Exit Price:</span>
                <span>{sellModalData.currency === 'INR' ? '₹' : '$'}{sellModalData.exit_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8C705B]">
                <span>Exchange Charges:</span>
                <span>{sellModalData.currency === 'INR' ? '₹' : '$'}{sellModalData.charges.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#AD8B73]/20 flex justify-between font-bold text-sm">
                <span>Net Realized P&amp;L:</span>
                <span className={sellModalData.is_profitable ? 'text-[#2D8A68]' : 'text-[#A84236]'}>
                  {sellModalData.is_profitable ? '+' : ''}{sellModalData.currency === 'INR' ? '₹' : '$'}{sellModalData.realized_pnl.toFixed(2)} ({sellModalData.realized_pnl_pct >= 0 ? '+' : ''}{sellModalData.realized_pnl_pct.toFixed(2)}%)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSellModalData(null)}
              className="btn-liquid w-full py-3 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold text-xs rounded-xl shadow-warm-sm"
            >
              Continue Trading
            </button>
          </div>
        </div>
      )}

      {/* DEPOSIT FUNDS MODAL */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-warm-lg">
            <div className="flex justify-between items-center border-b border-[#AD8B73]/20 pb-2">
              <h3 className="font-serif font-bold text-base text-[#3F2E22]">Add Virtual Margin Funds</h3>
              <button onClick={() => setIsDepositOpen(false)} className="text-[#8C705B] font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">
                  Amount to Credit ({currSym})
                </label>
                <input
                  type="number"
                  step={1000}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-xs font-mono text-[#3F2E22] focus:outline-none focus:border-[#AD8B73]"
                />
              </div>
              <button
                type="button"
                onClick={handleDepositFunds}
                className="btn-liquid w-full py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold rounded-xl shadow-warm-sm"
              >
                Confirm Virtual Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
