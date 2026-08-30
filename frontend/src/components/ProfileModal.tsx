import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Mail, Shield, Clock, CreditCard, Download, CheckCircle2, X, Save } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscription: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onOpenSubscription }) => {
  const { user, refreshProfile, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [timezoneStr, setTimezoneStr] = useState(user?.timezone || 'UTC');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.full_name || '');
      setTimezoneStr(user?.timezone || 'UTC');
      api.getInvoices().then((invs) => setInvoices(invs || [])).catch(() => {});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.updateProfile(fullName, timezoneStr);
      await refreshProfile();
      setMsg('Profile updated successfully.');
    } catch (err: any) {
      setMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-xl w-full p-7 space-y-6 shadow-warm-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-[#AD8B73]/20 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E3CAA5] border border-[#AD8B73]/30 flex items-center justify-center text-[#5C4433] font-serif font-bold text-lg shadow-warm-sm">
              {user?.full_name?.charAt(0) || 'Q'}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3F2E22]">
                Account Profile &amp; Preferences
              </h2>
              <p className="text-xs text-[#8C705B] font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8C705B] hover:text-[#3F2E22] p-1.5 rounded-lg hover:bg-[#E3CAA5]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subscription Banner */}
        <div className="p-4 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/25 flex flex-wrap items-center justify-between gap-3 shadow-warm-sm">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#8C705B] block font-bold">
              Current Subscription Tier:
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-sm font-serif font-bold text-[#3F2E22] uppercase">
                {user?.subscription_tier || 'PRO'} PLAN
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2D8A68]/15 text-[#2D8A68]">
                ACTIVE
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenSubscription();
            }}
            className="btn-liquid px-3.5 py-1.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold rounded-xl transition-all shadow-warm-sm flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#E3CAA5]" />
            <span>Upgrade / Change Plan</span>
          </button>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          {msg && (
            <div className="p-3 bg-[#2D8A68]/15 border border-[#2D8A68]/30 rounded-xl text-[#2D8A68] font-bold">
              {msg}
            </div>
          )}

          <div>
            <label className="block text-[#5C4433] mb-1 font-semibold">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C705B] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl pl-9 pr-3 py-2 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5C4433] mb-1 font-semibold">Trading Timezone</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-[#8C705B] absolute left-3 top-2.5" />
              <select
                value={timezoneStr}
                onChange={(e) => setTimezoneStr(e.target.value)}
                className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl pl-9 pr-3 py-2 text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm font-mono"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="America/New_York">US Eastern (America/New_York)</option>
                <option value="Asia/Kolkata">India Standard Time (Asia/Kolkata)</option>
                <option value="Europe/London">London (Europe/London)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="btn-liquid px-4 py-2 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold rounded-xl shadow-warm-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>

        {/* Recent Invoices Ledger */}
        <div className="pt-3 border-t border-[#AD8B73]/20 space-y-3">
          <span className="font-serif text-xs font-bold text-[#3F2E22] block">
            Payment &amp; Tax Invoices
          </span>

          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {invoices.length > 0 ? (
              invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20 flex items-center justify-between text-xs font-mono shadow-warm-sm"
                >
                  <div>
                    <span className="font-bold text-[#3F2E22] block">{inv.invoice_number}</span>
                    <span className="text-[10px] text-[#8C705B]">
                      {new Date(inv.created_at).toLocaleDateString()} • {inv.tier}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#3F2E22]">
                      ${inv.amount_usd?.toFixed(2) || '29.00'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="p-1 rounded bg-[#F5EFE0] hover:bg-[#E3CAA5] text-[#5C4433] transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-[#AD8B73]" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8C705B] font-sans">No invoices found.</p>
            )}
          </div>
        </div>

        {/* Logout Option */}
        <div className="pt-3 border-t border-[#AD8B73]/20 flex justify-between items-center text-xs">
          <span className="text-[#8C705B]">Session Active</span>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="text-[#A84236] hover:underline font-bold"
          >
            Sign Out of Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
