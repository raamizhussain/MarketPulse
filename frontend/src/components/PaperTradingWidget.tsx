import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getExchangeMarketStatus } from '../utils/marketHours';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  PieChart,
  Activity,
  ListOrdered,
  Wallet,
  Shield,
  Clock,
  Sparkles,
  Info,
  X
} from 'lucide-react';

interface PaperTradingWidgetProps {
  activeTicker: string;
  livePrice: number;
  currency: string;
}

export const PaperTradingWidget: React.FC<PaperTradingWidgetProps> = ({
  activeTicker,
  livePrice,
  currency
}) => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'order' | 'holdings' | 'positions' | 'orders' | 'funds'>('order');
  
  // Order Form State
  const [productType, setProductType] = useState<'CNC' | 'MIS'>('CNC');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [sharesInput, setSharesInput] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(livePrice);
  
  // Fund deposit
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [sellModalData, setSellModalData] = useState<any>(null);
  const [tradeToast, setTradeToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isIndian = currency === 'INR' || activeTicker.includes('.NS') || activeTicker.includes('.BO');
  const currSym = isIndian ? '₹' : '$';

  useEffect(() => {
    setLimitPrice(livePrice);
  }, [livePrice]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await api.getPaperPortfolio(activeTicker);
      setPortfolio(data);
    } catch (e) {
      console.warn('Error loading paper portfolio:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
    const interval = setInterval(loadPortfolio, 8000);
    return () => clearInterval(interval);
  }, [activeTicker]);

  const handleExecuteOrder = async (side: 'BUY' | 'SELL', customShares?: number, customSym?: string) => {
    const sym = customSym || activeTicker;
    const qty = customShares || sharesInput;

    if (qty <= 0) {
      setTradeToast({ type: 'error', text: 'Please enter a valid quantity of shares.' });
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
        productType
      );
      setPortfolio(updated);

      if (side === 'SELL' && updated.latest_sell_summary) {
        setSellModalData(updated.latest_sell_summary);
      } else {
        setTradeToast({
          type: 'success',
          text: `Executed ${side} ${qty} shares of ${sym} (${productType}) at ${currSym}${livePrice.toFixed(2)}!`
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
        text: `Successfully added ${currSym}${depositAmount.toLocaleString()} virtual funds!`
      });
    } catch (e) {
      console.warn('Error depositing funds:', e);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset your paper trading portfolio back to starting virtual capital ($100,000 USD / ₹80,00,000 INR)?')) return;
    try {
      const updated = await api.resetPaperPortfolio();
      setPortfolio(updated);
      setTradeToast({ type: 'success', text: 'Portfolio balance reset to initial starting capital!' });
    } catch (e) {
      console.warn('Error resetting portfolio:', e);
    }
  };

  // Financial Computations
  // Market Hours & Status
  const marketStatus = getExchangeMarketStatus(isIndian);

  // Financial Variables
  const relevantHoldings = (portfolio?.holdings || []).filter((h: any) =>
    isIndian ? (h.currency === 'INR' || h.symbol.includes('.NS') || h.symbol.includes('.BO'))
             : (h.currency !== 'INR' && !h.symbol.includes('.NS') && !h.symbol.includes('.BO'))
  );

  const computedInvested = relevantHoldings.reduce((sum: number, h: any) => sum + ((h.shares || 0) * (h.average_entry_price || 0)), 0);
  const computedMarketVal = relevantHoldings.reduce((sum: number, h: any) => sum + ((h.shares || 0) * (h.current_price || h.average_entry_price || 0)), 0);
  const computedOverallPnl = computedMarketVal - computedInvested;
  const computedOverallPnlPct = computedInvested > 0 ? (computedOverallPnl / computedInvested) * 100 : 0;
  const computedDayPnl = marketStatus.isAMO
    ? 0.0
    : relevantHoldings.reduce((sum: number, h: any) => sum + (h.day_pnl || (((h.shares || 0) * (h.current_price || 0)) * ((h.day_change_pct || 0.85) / 100))), 0);

  const cashAvailable = isIndian ? (portfolio?.cash_inr ?? 8000000) : (portfolio?.cash_usd ?? 100000);
  const totalInvested = computedInvested;
  const totalMarketVal = computedMarketVal;
  const overallPnl = computedOverallPnl;
  const overallPnlPct = computedOverallPnlPct;
  const dayPnl = computedDayPnl;
  const totalEquity = cashAvailable + totalMarketVal;

  const activePosition = portfolio?.positions?.find((p: any) => p.symbol === activeTicker);
  const orderPrice = orderType === 'LIMIT' ? limitPrice : livePrice;
  const rawOrderVal = sharesInput * orderPrice;
  const marginRequired = productType === 'MIS' ? rawOrderVal * 0.20 : rawOrderVal;
  const estimatedCharges = isIndian ? 20.0 + (rawOrderVal * 0.001) + (rawOrderVal * 0.0000345 * 1.18) : (rawOrderVal * 0.0000278);

  const depth = portfolio?.market_depth || {
    bids: [],
    asks: [],
    total_buy_qty: 12500,
    total_sell_qty: 9400,
    buy_ratio: 57.1,
    sell_ratio: 42.9,
    lower_circuit: livePrice * 0.9,
    upper_circuit: livePrice * 1.1
  };

  return (
    <div id="paper-trading-desk" className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-5">
      {/* Brokerage Style Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#AD8B73]/20 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#2D8A68] text-[#FFFBE9] flex items-center justify-center font-serif font-bold shadow-warm-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-lg font-bold text-[#3F2E22]">
                Real-Time Brokerage &amp; Paper Trading Desk
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#2D8A68]/15 text-[#2D8A68] text-[10px] font-mono font-bold">
                ZERODHA / GROWW GRADE
              </span>
            </div>
            <p className="text-xs text-[#8C705B] font-sans">
              Live market execution, 5-level market depth, portfolio holdings &amp; real-time P&amp;L accounting
            </p>
          </div>
        </div>

        {/* Action Tabs Switcher */}
        <div className="flex items-center space-x-1 bg-[#FFFBE9] p-1 rounded-xl border border-[#AD8B73]/25 shadow-warm-sm text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'order'
                ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Order &amp; Depth</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('holdings')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
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
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
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
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
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
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'funds'
                ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Funds</span>
          </button>
        </div>
      </div>

      {/* Global Portfolio KPI Strip (Zerodha / Groww Header Style) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm">
          <span className="text-[10px] text-[#8C705B] uppercase block">Total Portfolio Value</span>
          <strong className="text-sm md:text-base text-[#3F2E22] font-bold">
            {currSym}{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm">
          <span className="text-[10px] text-[#8C705B] uppercase block">Total Invested</span>
          <strong className="text-sm md:text-base text-[#3F2E22] font-bold">
            {currSym}{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm">
          <span className="text-[10px] text-[#8C705B] uppercase block">Overall Returns (P&amp;L)</span>
          <strong className={`text-sm md:text-base font-bold ${overallPnl >= 0 ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
            {overallPnl >= 0 ? '+' : ''}{currSym}{overallPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({overallPnlPct.toFixed(2)}%)
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm">
          <span className="text-[10px] text-[#8C705B] uppercase block">1-Day P&amp;L</span>
          <strong className={`text-sm md:text-base font-bold ${dayPnl >= 0 ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
            {dayPnl >= 0 ? '+' : ''}{currSym}{dayPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 shadow-warm-sm flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <span className="text-[10px] text-[#8C705B] uppercase block">Available Margin</span>
            <strong className="text-sm md:text-base text-[#2D8A68] font-bold">
              {currSym}{cashAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
          <button
            onClick={() => setIsDepositOpen(true)}
            className="p-1.5 rounded-lg bg-[#E3CAA5] text-[#5C4433] font-bold text-[10px] hover:bg-[#CEAB93] transition-colors"
            title="Add Virtual Margin"
          >
            + Add
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

      {/* TAB 1: ORDER TICKET & 5-LEVEL MARKET DEPTH */}
      {activeTab === 'order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Order Ticket (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-[#FFFBE9] border border-[#AD8B73]/25 rounded-xl p-5 space-y-4 shadow-warm-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#AD8B73]/20 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8C705B] block font-bold">Active Symbol</span>
                <h4 className="font-serif text-lg font-bold text-[#3F2E22]">
                  {activeTicker} • <span className="font-mono text-[#2D8A68]">{currSym}{livePrice.toFixed(2)}</span>
                </h4>
              </div>

              {/* Product Type (CNC vs MIS) */}
              <div className="flex items-center space-x-1 bg-[#F5EFE0] p-1 rounded-xl border border-[#AD8B73]/20 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setProductType('CNC')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    productType === 'CNC'
                      ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                      : 'text-[#5C4433]'
                  }`}
                >
                  CNC (Delivery)
                </button>
                <button
                  type="button"
                  onClick={() => setProductType('MIS')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    productType === 'MIS'
                      ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                      : 'text-[#5C4433]'
                  }`}
                >
                  <span>MIS (Intraday)</span>
                  <span className="px-1 py-0.2 rounded bg-[#2D8A68] text-[#FFFBE9] text-[8px] font-bold">5X</span>
                </button>
              </div>
            </div>

            {/* Order Type Tabs (Market vs Limit) */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <label className="text-[#8C705B] font-semibold">Order Type:</label>
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`px-2.5 py-1 rounded-lg border text-xs ${
                  orderType === 'MARKET'
                    ? 'bg-[#E3CAA5] border-[#AD8B73] text-[#3F2E22] font-bold'
                    : 'bg-[#F5EFE0] border-[#AD8B73]/20 text-[#5C4433]'
                }`}
              >
                Market (LTP)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`px-2.5 py-1 rounded-lg border text-xs ${
                  orderType === 'LIMIT'
                    ? 'bg-[#E3CAA5] border-[#AD8B73] text-[#3F2E22] font-bold'
                    : 'bg-[#F5EFE0] border-[#AD8B73]/20 text-[#5C4433]'
                }`}
              >
                Limit Order
              </button>
            </div>

            {/* Shares & Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#5C4433] text-xs mb-1 font-semibold">
                  Quantity (Shares)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={1}
                    value={sharesInput}
                    onChange={(e) => setSharesInput(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-xs font-mono text-[#3F2E22] focus:outline-none focus:border-[#AD8B73]"
                  />
                </div>
                {/* Quick Qty Pills */}
                <div className="flex items-center space-x-1 mt-1.5">
                  {[5, 10, 25, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setSharesInput(qty)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        sharesInput === qty
                          ? 'bg-[#AD8B73] text-[#FFFBE9] border-[#AD8B73]'
                          : 'bg-[#F5EFE0] text-[#5C4433] border-[#AD8B73]/20 hover:bg-[#E3CAA5]'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#5C4433] text-xs mb-1 font-semibold">
                  Price ({currSym})
                </label>
                <input
                  type="number"
                  step="0.05"
                  disabled={orderType === 'MARKET'}
                  value={orderType === 'MARKET' ? livePrice : limitPrice}
                  onChange={(e) => setLimitPrice(Number(e.target.value))}
                  className="w-full bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-xs font-mono text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] disabled:opacity-60"
                />
                <span className="text-[10px] font-mono text-[#8C705B] mt-1 block">
                  {orderType === 'MARKET' ? 'Executed at Best Market Price' : 'Custom Trigger Limit'}
                </span>
              </div>
            </div>

            {/* Margin Breakdown Box */}
            <div className="p-3 bg-[#F5EFE0] rounded-xl border border-[#AD8B73]/20 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center text-[#8C705B]">
                <span>Total Order Value:</span>
                <strong className="text-[#3F2E22]">{currSym}{rawOrderVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between items-center text-[#8C705B]">
                <span>Margin Required ({productType === 'MIS' ? '5x Leverage' : '100%'}):</span>
                <strong className="text-[#2D8A68]">{currSym}{marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between items-center text-[#8C705B] text-[10px]">
                <span>Est. Charges (STT + GST + Exch):</span>
                <span>{currSym}{estimatedCharges.toFixed(2)}</span>
              </div>
            </div>

            {/* Buy / Sell Action Buttons */}
            <div className="flex space-x-3 pt-1">
              <button
                type="button"
                disabled={executing}
                onClick={() => handleExecuteOrder('BUY')}
                className="btn-liquid flex-1 py-3 bg-[#2D8A68] hover:bg-[#246E53] text-[#FFFBE9] font-bold text-xs rounded-xl shadow-warm-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>BUY {sharesInput} {activeTicker}</span>
              </button>

              <button
                type="button"
                disabled={executing || !activePosition || activePosition.shares <= 0}
                onClick={() => handleExecuteOrder('SELL')}
                className="btn-liquid flex-1 py-3 bg-[#A84236] hover:bg-[#8D372D] text-[#FFFBE9] font-bold text-xs rounded-xl shadow-warm-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>SELL {sharesInput} {activeTicker}</span>
              </button>
            </div>
          </div>

          {/* 5-Level Market Depth Ladder (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-[#FFFBE9] border border-[#AD8B73]/25 rounded-xl p-5 space-y-3 shadow-warm-sm">
            <div className="flex items-center justify-between border-b border-[#AD8B73]/20 pb-2">
              <span className="font-serif text-xs font-bold text-[#3F2E22] uppercase tracking-wider">
                Market Depth (Level 2)
              </span>
              <span className="text-[10px] font-mono text-[#8C705B]">Real-Time Ladder</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {/* Buy Orders (Bids) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#2D8A68] font-bold text-[10px] border-b border-[#AD8B73]/15 pb-1">
                  <span>BID</span>
                  <span>ORDERS</span>
                  <span>QTY</span>
                </div>
                {depth.bids.map((b: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-[#2D8A68]">
                    <span className="font-bold">{currSym}{b.price.toFixed(2)}</span>
                    <span className="text-[#8C705B] text-[10px]">{b.orders}</span>
                    <span>{b.qty.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-[#AD8B73]/15 flex justify-between text-[10px] font-bold text-[#2D8A68]">
                  <span>Total Bids</span>
                  <span>{depth.total_buy_qty.toLocaleString()}</span>
                </div>
              </div>

              {/* Sell Orders (Asks) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#A84236] font-bold text-[10px] border-b border-[#AD8B73]/15 pb-1">
                  <span>ASK</span>
                  <span>ORDERS</span>
                  <span>QTY</span>
                </div>
                {depth.asks.map((a: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-[#A84236]">
                    <span className="font-bold">{currSym}{a.price.toFixed(2)}</span>
                    <span className="text-[#8C705B] text-[10px]">{a.orders}</span>
                    <span>{a.qty.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-1 border-t border-[#AD8B73]/15 flex justify-between text-[10px] font-bold text-[#A84236]">
                  <span>Total Asks</span>
                  <span>{depth.total_sell_qty.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Depth Ratio Bar */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-[#2D8A68] font-bold">{depth.buy_ratio}% Buyers</span>
                <span className="text-[#A84236] font-bold">{depth.sell_ratio}% Sellers</span>
              </div>
              <div className="w-full bg-[#FFFBE9] h-2 rounded-full overflow-hidden border border-[#AD8B73]/20 flex">
                <div className="bg-[#2D8A68] h-full" style={{ width: `${depth.buy_ratio}%` }} />
                <div className="bg-[#A84236] h-full" style={{ width: `${depth.sell_ratio}%` }} />
              </div>
            </div>

            {/* Circuit Limits */}
            <div className="pt-2 border-t border-[#AD8B73]/15 flex justify-between text-[10px] font-mono text-[#8C705B]">
              <span>Lower Circuit: <strong className="text-[#A84236]">{currSym}{depth.lower_circuit.toFixed(2)}</strong></span>
              <span>Upper Circuit: <strong className="text-[#2D8A68]">{currSym}{depth.upper_circuit.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOLDINGS (CNC / LONG TERM) */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
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
                            className="px-2 py-1 rounded bg-[#2D8A68]/15 hover:bg-[#2D8A68] text-[#2D8A68] hover:text-[#FFFBE9] text-[10px] font-bold transition-colors"
                          >
                            + Add
                          </button>
                          <button
                            onClick={() => handleExecuteOrder('SELL', h.shares, h.symbol)}
                            className="px-2 py-1 rounded bg-[#A84236]/15 hover:bg-[#A84236] text-[#A84236] hover:text-[#FFFBE9] text-[10px] font-bold transition-colors"
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
                      No delivery holdings recorded. Place a CNC order on any stock to build your long-term portfolio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: POSITIONS (INTRADAY / ALL ACTIVE) */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
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
                  <th className="p-3">Change %</th>
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
                      No active open positions.
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
        <div className="space-y-4">
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
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isBuy ? 'bg-[#2D8A68]/15 text-[#2D8A68]' : 'bg-[#A84236]/15 text-[#A84236]'
                            }`}
                          >
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
                      No orders executed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FUNDS & MARGIN STATEMENT */}
      {activeTab === 'funds' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#FFFBE9] border border-[#AD8B73]/25 rounded-xl p-5 space-y-4 shadow-warm-sm">
            <h4 className="font-serif text-sm font-bold text-[#3F2E22] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#AD8B73]" />
              <span>Simulated Trading Balance Breakdown</span>
            </h4>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 bg-[#F5EFE0] rounded-lg">
                <span className="text-[#8C705B]">Available Trading Cash (USD):</span>
                <strong className="text-[#2D8A68] text-sm">${(portfolio?.cash_usd || 100000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-[#F5EFE0] rounded-lg">
                <span className="text-[#8C705B]">Available Trading Cash (INR):</span>
                <strong className="text-[#2D8A68] text-sm">₹{(portfolio?.cash_inr || 8000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-[#F5EFE0] rounded-lg">
                <span className="text-[#8C705B]">Total Holdings Valuation:</span>
                <strong className="text-[#3F2E22] text-sm">{currSym}{totalMarketVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-[#F5EFE0] rounded-lg">
                <span className="text-[#8C705B]">Cumulative Realized Profit:</span>
                <strong className={`text-sm ${(portfolio?.realized_pnl_usd || 0) >= 0 ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                  {(portfolio?.realized_pnl_usd || 0) >= 0 ? '+' : ''}${portfolio?.realized_pnl_usd?.toFixed(2) || '0.00'} / ₹{portfolio?.realized_pnl_inr?.toFixed(2) || '0.00'}
                </strong>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="btn-liquid px-4 py-2 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold text-xs rounded-xl shadow-warm-sm transition-all"
              >
                + Deposit Virtual Capital
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-[#F5EFE0] hover:bg-[#A84236]/15 text-[#A84236] font-semibold text-xs rounded-xl border border-[#AD8B73]/25 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to $100k / ₹80L</span>
              </button>
            </div>
          </div>

          {/* Regulatory Brokerage Note */}
          <div className="bg-[#FFFBE9] border border-[#AD8B73]/25 rounded-xl p-5 space-y-3 shadow-warm-sm text-xs font-sans">
            <div className="flex items-center space-x-2 text-[#3F2E22] font-serif font-bold">
              <Shield className="w-4 h-4 text-[#2D8A68]" />
              <span>Simulated Exchange Rules</span>
            </div>
            <ul className="text-[#5C4433] space-y-2 text-[11px] leading-relaxed">
              <li>• <strong>Real-time Market Ticks</strong>: Executions reflect real-time live bid/ask spreads.</li>
              <li>• <strong>5x MIS Leverage</strong>: Day trades require only 20% margin.</li>
              <li>• <strong>STT &amp; Stamp Duty</strong>: Exact Indian NSE delivery charges and US SEC fees simulated automatically.</li>
            </ul>
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
              <p className="text-xs text-[#5C4433] font-sans">
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
              <h3 className="font-serif font-bold text-base text-[#3F2E22]">Add Simulated Capital</h3>
              <button onClick={() => setIsDepositOpen(false)} className="text-[#8C705B] font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">
                  Amount to Deposit ({currSym})
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
