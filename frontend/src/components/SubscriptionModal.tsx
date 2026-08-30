import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CreditCard, Check, ArrowRight, Sparkles, Shield, X } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshProfile } = useAuth();
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'enterprise'>(
    (user?.subscription_tier as any) || 'pro'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Visa ending 4242)');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleProcessUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.upgradeTier(selectedTier, billingCycle, paymentMethod);
      await refreshProfile();
      alert(`Subscription successfully updated to ${selectedTier.toUpperCase()} tier!`);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to process tier upgrade.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-2xl w-full p-7 space-y-6 shadow-warm-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-[#AD8B73]/20 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#3F2E22] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#AD8B73]" />
              <span>MarketPulse Subscription &amp; Tier Upgrade</span>
            </h2>
            <p className="text-xs text-[#8C705B] font-sans">
              Currently active on: <strong className="text-[#3F2E22] uppercase">{user?.subscription_tier || 'PRO'} TIER</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8C705B] hover:text-[#3F2E22] p-1.5 rounded-lg hover:bg-[#E3CAA5]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing Cycle Switcher */}
        <div className="flex justify-center">
          <div className="bg-[#FFFBE9] p-1 rounded-xl border border-[#AD8B73]/25 flex items-center space-x-1 text-xs font-mono shadow-warm-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                  : 'text-[#5C4433]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                  : 'text-[#5C4433]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded bg-[#2D8A68] text-[#FFFBE9] text-[9px] font-bold">
                2 MONTHS FREE
              </span>
            </button>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free */}
          <div
            onClick={() => setSelectedTier('free')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedTier === 'free'
                ? 'border-[#AD8B73] bg-[#FFFBE9] ring-2 ring-[#AD8B73]/30 shadow-warm-md'
                : 'border-[#AD8B73]/20 bg-[#F5EFE0] hover:bg-[#FFFBE9]'
            }`}
          >
            <h4 className="font-serif font-bold text-sm text-[#3F2E22]">Free Explorer</h4>
            <div className="mt-2 mb-3">
              <span className="text-xl font-bold font-serif">$0</span>
              <span className="text-xs text-[#8C705B]"> / mo</span>
            </div>
            <ul className="text-[11px] text-[#5C4433] space-y-1.5 font-sans">
              <li>✓ 1 Active Strategy</li>
              <li>✓ Delayed Market Feeds</li>
              <li>✓ Standard HMM States</li>
              <li>✓ Basic Paper Trading</li>
            </ul>
          </div>

          {/* Pro Trader */}
          <div
            onClick={() => setSelectedTier('pro')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedTier === 'pro'
                ? 'border-[#AD8B73] bg-[#FFFBE9] ring-2 ring-[#AD8B73]/30 shadow-warm-md'
                : 'border-[#AD8B73]/20 bg-[#F5EFE0] hover:bg-[#FFFBE9]'
            }`}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-serif font-bold text-sm text-[#3F2E22]">Pro Trader</h4>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#E3CAA5] font-bold">POPULAR</span>
            </div>
            <div className="mt-2 mb-3">
              <span className="text-xl font-bold font-serif">{billingCycle === 'annual' ? '$24' : '$29'}</span>
              <span className="text-xs text-[#8C705B]"> / mo</span>
              <span className="text-[10px] text-[#8C705B] block font-mono">₹2,400 / month</span>
            </div>
            <ul className="text-[11px] text-[#5C4433] space-y-1.5 font-sans">
              <li>✓ 10 Active Strategies</li>
              <li>✓ Real-Time US &amp; Indian NSE</li>
              <li>✓ Multi-Agent LangGraph Debate</li>
              <li>✓ Live Paper Trading &amp; P&amp;L</li>
              <li>✓ REST API (10k req/day)</li>
            </ul>
          </div>

          {/* Enterprise */}
          <div
            onClick={() => setSelectedTier('enterprise')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedTier === 'enterprise'
                ? 'border-[#2D8A68] bg-[#FFFBE9] ring-2 ring-[#2D8A68]/30 shadow-warm-md'
                : 'border-[#AD8B73]/20 bg-[#F5EFE0] hover:bg-[#FFFBE9]'
            }`}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-serif font-bold text-sm text-[#2D8A68]">Institutional</h4>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#2D8A68]/15 text-[#2D8A68] font-bold">FULL ACCESS</span>
            </div>
            <div className="mt-2 mb-3">
              <span className="text-xl font-bold font-serif">{billingCycle === 'annual' ? '$249' : '$299'}</span>
              <span className="text-xs text-[#8C705B]"> / mo</span>
              <span className="text-[10px] text-[#8C705B] block font-mono">₹24,900 / month</span>
            </div>
            <ul className="text-[11px] text-[#5C4433] space-y-1.5 font-sans">
              <li>✓ Unlimited Strategies</li>
              <li>✓ 5,000 Model Warehouse</li>
              <li>✓ Zero-Latency Blender (&lt;50ms)</li>
              <li>✓ Dedicated Webhooks &amp; Feeds</li>
              <li>✓ Staff Admin Telemetry</li>
            </ul>
          </div>
        </div>

        {/* Payment Method */}
        <form onSubmit={handleProcessUpgrade} className="space-y-4 pt-3 border-t border-[#AD8B73]/20 text-xs font-sans">
          <div>
            <label className="block text-[#5C4433] mb-1 font-semibold">Select Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm font-mono"
            >
              <option value="Credit Card (Visa ending 4242)">💳 Visa / Mastercard ending 4242</option>
              <option value="UPI / NetBanking (trader@okaxis)">📱 UPI / NetBanking (Instant India ₹)</option>
              <option value="ACH / Corporate Wire Transfer">🏛️ Institutional ACH / Corporate Wire</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-[#5C4433] hover:bg-[#E3CAA5]/40 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-liquid px-5 py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold rounded-xl shadow-warm-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Processing Checkout...' : `Confirm Plan Change to ${selectedTier.toUpperCase()}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
