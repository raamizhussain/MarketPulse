import React from 'react';
import { X, FileText, AlertTriangle, Scale, CheckCircle2 } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-warm-lg max-h-[85vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#AD8B73]/20 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#AD8B73]/20 text-[#5C4433] flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3F2E22]">Terms of Service &amp; Risk Disclaimer</h2>
              <span className="text-[10px] text-[#8C705B] font-mono">SEBI / SEC Educational Regulatory Notice • 2026</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#E3CAA5]/40 text-[#5C4433] font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Terms Body */}
        <div className="overflow-y-auto pr-2 space-y-4 text-xs font-sans text-[#5C4433] leading-relaxed">
          <section className="space-y-1.5 p-3 rounded-xl bg-[#FFFBE9] border border-[#AD8B73]/20">
            <div className="flex items-center space-x-2 text-[#A84236] font-serif font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>1. Regulatory Disclaimer &amp; Not Investment Advice</span>
            </div>
            <p className="text-[11px]">
              MarketPulse AI and its associated HMM model outputs, FinBERT sentiment scoring, and multi-agent reasoning synthesis are strictly provided for <strong>educational, quantitative simulation, and research purposes only</strong>. We are not a SEBI or SEC-registered investment advisor. You assume 100% responsibility for any financial decisions made.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-serif text-sm font-bold text-[#3F2E22]">2. Simulated Paper Trading</h3>
            <p>
              All trades executed in the Paper Brokerage Desk use simulated virtual currency ($100,000 USD / ₹80,00,000 INR). No real funds are transferred, held, or exposed to financial market clearing houses.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-serif text-sm font-bold text-[#3F2E22]">3. Intellectual Property Rights</h3>
            <p>
              The MarketPulse quantitative algorithms, dynamic Kelly sizing formulations, and custom user interface components are the intellectual property of MarketPulse AI. Reverse engineering or scraping model weights is prohibited under institutional licensing terms.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-serif text-sm font-bold text-[#3F2E22]">4. Subscriptions &amp; Billing</h3>
            <p>
              Paid tiers (Pro, Pro+, Enterprise) are billed on a recurring monthly or annual basis. You may cancel your subscription at any time from your account settings without cancellation penalty.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#AD8B73]/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-liquid px-6 py-2.5 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold rounded-xl shadow-warm-sm"
          >
            I Accept Terms &amp; Conditions
          </button>
        </div>
      </div>
    </div>
  );
};
