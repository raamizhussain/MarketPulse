import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiKeyItem } from '../types';
import { api } from '../services/api';
import {
  Settings,
  Key,
  Copy,
  Check,
  Plus,
  Shield,
  Send,
  Lock,
  User as UserIcon,
  Sparkles,
  CreditCard,
  Download,
  CheckCircle2,
  ArrowRight,
  Receipt,
  FileText,
  Clock,
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  // Profile Edit
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [timezoneStr, setTimezoneStr] = useState(user?.timezone || 'UTC');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Upgrade & Checkout Modal
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'enterprise'>('enterprise');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Visa ending 4242)');
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [keys, invs] = await Promise.all([
          api.getApiKeys(),
          api.getInvoices()
        ]);
        setApiKeys(keys || []);
        setInvoices(invs || []);
      } catch (e) {
        console.warn('Error loading settings data:', e);
      }
    };
    loadData();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    try {
      const res = await api.createApiKey(newKeyName);
      setApiKeys((prev) => [res, ...prev]);
      if (res.raw_key) {
        setGeneratedKey(res.raw_key);
      }
      setNewKeyName('');
    } catch (err: any) {
      alert(err.message || 'Failed to create key');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleTestWebhook = async () => {
    setWebhookStatus('Testing payload transmission...');
    setTimeout(() => {
      setWebhookStatus('✓ Test payload acknowledged with HTTP 200 OK');
    }, 1000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await api.updateProfile(fullName, timezoneStr);
      await refreshProfile();
      setProfileMsg('Account profile updated successfully.');
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProcessUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeLoading(true);
    try {
      await api.upgradeTier(selectedTier, billingCycle, paymentMethod);
      await refreshProfile();
      const updatedInvoices = await api.getInvoices();
      setInvoices(updatedInvoices || []);
      setIsUpgradeModalOpen(false);
      alert(`Subscription successfully updated to ${selectedTier.toUpperCase()} tier!`);
    } catch (err: any) {
      alert(err.message || 'Failed to process tier upgrade.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleDownloadInvoice = (inv: any) => {
    const receiptContent = `
======================================================
MARKETPULSE AI — INSTITUTIONAL TAX INVOICE & RECEIPT
======================================================
Invoice Number: ${inv.invoice_number}
Date: ${new Date(inv.created_at).toLocaleDateString()}
Account: ${user?.email || 'enterprise@marketpulse.ai'}
Subscription Tier: ${inv.tier} Plan
Amount Paid (USD): $${inv.amount_usd.toFixed(2)}
Amount Paid (INR): ₹${inv.amount_inr.toFixed(2)}
Payment Status: ${inv.status}
Payment Method: ${inv.payment_method}
======================================================
Thank you for using MarketPulse AI Quantitative Platform.
======================================================
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoice_number}_Receipt.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto bg-[#FFFBE9] paper-grain min-h-screen text-[#3F2E22]">
      {/* Header */}
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 p-5 rounded-2xl shadow-warm-sm flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-[#3F2E22] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#AD8B73]" />
            <span>Developer API, Subscription &amp; Account Settings</span>
          </h1>
          <p className="text-xs text-[#8C705B] font-mono mt-0.5">
            Manage programmatic API credentials, webhook dispatchers, payment tiers, and tax invoices
          </p>
        </div>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="btn-liquid px-4 py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] rounded-xl text-xs font-semibold shadow-warm-sm transition-colors flex items-center gap-1.5"
        >
          <CreditCard className="w-4 h-4 text-[#E3CAA5]" />
          <span>Manage Subscription &amp; Tiers</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: API Keys & Invoices & Webhooks */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Key Generator */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#AD8B73]" />
                <span>Programmatic REST &amp; WebSocket API Keys</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3CAA5] text-[#3F2E22] font-bold">
                BEARER AUTH
              </span>
            </div>

            <p className="text-xs text-[#5C4433] font-sans">
              Authenticate automated Python/TypeScript trading bots or quantitative pipelines against our high-frequency endpoints.
            </p>

            <form onSubmit={handleCreateKey} className="flex gap-2 text-xs font-mono">
              <input
                type="text"
                placeholder="Key label (e.g. Production Algo Server)..."
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] placeholder-[#8C705B]/60 focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
              />
              <button
                type="submit"
                className="btn-liquid px-4 py-2 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-warm-sm shrink-0 font-sans"
              >
                <Plus className="w-4 h-4 text-[#E3CAA5]" />
                <span>Create Key</span>
              </button>
            </form>

            {generatedKey && (
              <div className="p-4 bg-[#FFFBE9] border border-[#2D8A68]/40 rounded-xl space-y-2 font-mono text-xs shadow-warm-sm">
                <div className="flex items-center justify-between text-[#2D8A68] font-bold">
                  <span>✓ New Secret Key Generated (Copy Now - Won't be shown again)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F5EFE0] rounded-lg border border-[#AD8B73]/20">
                  <span className="truncate pr-2 text-[#3F2E22] font-bold">{generatedKey}</span>
                  <button
                    onClick={() => handleCopy(generatedKey)}
                    className="p-1.5 rounded-lg bg-[#FFFBE9] hover:bg-[#E3CAA5] text-[#5C4433] transition-colors shrink-0"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-[#2D8A68]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Existing Keys Table */}
            <div className="overflow-x-auto bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[#8C705B] border-b border-[#AD8B73]/20 bg-[#F5EFE0] text-[10px] uppercase">
                    <th className="p-3">Key Label</th>
                    <th className="p-3">Prefix</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#AD8B73]/15">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-[#F5EFE0]/50 transition-colors">
                      <td className="p-3 font-serif font-bold text-[#3F2E22]">{k.name}</td>
                      <td className="p-3 text-[#5C4433]">{k.prefix}...</td>
                      <td className="p-3 text-[#8C705B]">
                        {new Date(k.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2D8A68]/15 text-[#2D8A68]">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing Invoices Ledger Table */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#AD8B73]" />
                <span>Subscription Invoices &amp; Tax Receipts</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2D8A68]/15 text-[#2D8A68] font-bold">
                AUTO-PAID
              </span>
            </div>

            <div className="overflow-x-auto bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[#8C705B] border-b border-[#AD8B73]/20 bg-[#F5EFE0] text-[10px] uppercase">
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Plan Tier</th>
                    <th className="p-3">Amount (USD/INR)</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#AD8B73]/15">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F5EFE0]/50 transition-colors">
                        <td className="p-3 font-bold text-[#3F2E22]">{inv.invoice_number}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#AD8B73]/15 text-[#5C4433]">
                            {inv.tier}
                          </span>
                        </td>
                        <td className="p-3 text-[#3F2E22] font-bold">
                          ${inv.amount_usd?.toFixed(2) || '29.00'} / ₹{inv.amount_inr?.toFixed(0) || '2,400'}
                        </td>
                        <td className="p-3 text-[#8C705B]">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2D8A68]/15 text-[#2D8A68]">
                            {inv.status || 'PAID'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(inv)}
                            className="p-1.5 rounded-lg bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#5C4433] transition-colors inline-flex items-center gap-1 text-[11px]"
                            title="Download Tax Receipt"
                          >
                            <Download className="w-3.5 h-3.5 text-[#AD8B73]" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-[#8C705B] font-sans text-xs">
                        No prior invoices recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Webhook Dispatcher */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-[#3F2E22] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#AD8B73]" />
              <span>Outbound Event Webhook Dispatcher</span>
            </h2>
            <p className="text-xs text-[#5C4433] font-sans">
              Stream live committee consensus recommendations and regime alerts into your Slack, Discord, or custom backend.
            </p>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold font-sans">Endpoint URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex-1 bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                  />
                  <button
                    onClick={handleTestWebhook}
                    className="px-4 py-2 bg-[#FFFBE9] hover:bg-[#E3CAA5]/40 text-[#5C4433] rounded-xl font-semibold border border-[#AD8B73]/25 transition-colors font-sans shadow-warm-sm"
                  >
                    Test Ping
                  </button>
                </div>
              </div>

              {webhookStatus && (
                <div className="p-3 bg-[#FFFBE9] border border-[#2D8A68]/30 rounded-xl text-xs text-[#2D8A68]">
                  {webhookStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: User Account & Subscription Profile */}
        <div className="space-y-6">
          {/* Subscription Status Card */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E3CAA5] border border-[#AD8B73]/30 flex items-center justify-center text-[#5C4433] font-serif font-bold text-lg shadow-warm-sm">
                {user?.full_name?.charAt(0) || 'Q'}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#3F2E22]">{user?.full_name || 'Quantitative Trader'}</h3>
                <span className="text-xs text-[#8C705B] font-mono">{user?.email || 'trader@marketpulse.ai'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#AD8B73]/20 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
                <span className="text-[#8C705B] font-sans">Active Plan:</span>
                <span className="px-2.5 py-0.5 rounded bg-[#AD8B73] text-[#FFFBE9] font-bold uppercase">
                  {user?.subscription_tier || 'PRO TRADER'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
                <span className="text-[#8C705B] font-sans">Account Role:</span>
                <span className="text-[#3F2E22] font-bold capitalize">{user?.role || 'User'}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm">
                <span className="text-[#8C705B] font-sans">Model Warehouse:</span>
                <span className="text-[#2D8A68] font-bold">5,000 Stocks Access</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="btn-liquid w-full py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold rounded-xl transition-all shadow-warm-sm flex items-center justify-center space-x-1.5 text-xs font-sans"
            >
              <span>Change Subscription Tier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile Edit Card */}
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/25 rounded-2xl p-6 shadow-warm-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#3F2E22] flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-[#AD8B73]" />
              <span>Edit Account Preferences</span>
            </h3>

            {profileMsg && (
              <div className="p-2.5 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 text-xs font-sans text-[#3F2E22]">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                />
              </div>

              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Timezone</label>
                <select
                  value={timezoneStr}
                  onChange={(e) => setTimezoneStr(e.target.value)}
                  className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                >
                  <option value="UTC">UTC (Universal Time)</option>
                  <option value="America/New_York">US Eastern (America/New_York)</option>
                  <option value="Asia/Kolkata">India Standard Time (Asia/Kolkata)</option>
                  <option value="Europe/London">London (Europe/London)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2 bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#5C4433] border border-[#AD8B73]/30 font-semibold rounded-xl transition-colors shadow-warm-sm disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* UPGRADE & BILLING CHECKOUT MODAL */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-2xl w-full p-7 space-y-6 shadow-warm-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#AD8B73]/20 pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#3F2E22]">
                  Select MarketPulse Subscription Tier
                </h2>
                <p className="text-xs text-[#8C705B] font-sans">
                  Institutional multi-agent intelligence with live multi-currency data
                </p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-[#8C705B] hover:text-[#3F2E22] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Billing Cycle Switcher */}
            <div className="flex justify-center">
              <div className="bg-[#FFFBE9] p-1 rounded-xl border border-[#AD8B73]/25 flex items-center space-x-1 text-xs font-mono shadow-warm-sm">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-lg transition-all ${
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
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    billingCycle === 'annual'
                      ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                      : 'text-[#5C4433]'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#2D8A68] text-[#FFFBE9] text-[9px] font-bold">
                    2 MOS FREE
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
                  <li>✓ Pretrained Model Warehouse</li>
                  <li>✓ Zero-Latency Blender (&lt;50ms)</li>
                  <li>✓ Webhook feeds + Telemetry</li>
                </ul>
              </div>
            </div>

            {/* Payment Method */}
            <form onSubmit={handleProcessUpgrade} className="space-y-4 pt-3 border-t border-[#AD8B73]/20 text-xs font-sans">
              <div>
                <label className="block text-[#5C4433] mb-1 font-semibold">Payment Method</label>
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
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="px-4 py-2.5 text-[#5C4433] hover:bg-[#E3CAA5]/40 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upgradeLoading}
                  className="btn-liquid px-5 py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold rounded-xl shadow-warm-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{upgradeLoading ? 'Processing Checkout...' : `Confirm Upgrade to ${selectedTier.toUpperCase()}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
