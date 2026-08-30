import React from 'react';
import { X, Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3F2E22]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-warm-lg max-h-[85vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#AD8B73]/20 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D8A68]/15 text-[#2D8A68] flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3F2E22]">Privacy Policy &amp; Data Protection</h2>
              <span className="text-[10px] text-[#8C705B] font-mono">GDPR &amp; CCPA Compliant • Last Updated: 2026</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#E3CAA5]/40 text-[#5C4433] font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="overflow-y-auto pr-2 space-y-4 text-xs font-sans text-[#5C4433] leading-relaxed">
          <section className="space-y-1.5">
            <h3 className="font-serif text-sm font-bold text-[#3F2E22]">1. Information We Collect</h3>
            <p>
              MarketPulse AI collects standard authentication credentials (hashed passwords, email address, display name), telemetry logs (requested stock symbols, strategy configurations), and paper trading performance metrics. We <strong>never</strong> collect or store real bank account credentials or private trading broker secrets on our servers.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-serif text-sm font-bold text-[#3F2E22]">2. How We Protect Your Data</h3>
            <p>
              All communication between your client browser and the MarketPulse quantitative backend is encrypted in transit using industry-standard TLS 1.3 encryption. Passwords are cryptographically salted and hashed using Bcrypt. Session tokens are signed via 256-bit JSON Web Tokens (JWT) with strict expiration limits.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-serif text-sm font-bold text-[#3F2E22]">3. Third-Party Analytics &amp; Cookies</h3>
            <p>
              We use minimal, privacy-preserving session cookies solely to maintain authenticated user state and remember interface preferences (such as selected currency and theme options). We do not sell or monetize your data to third-party advertising networks.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="font-serif text-sm font-bold text-[#3F2E22]">4. Your Rights Under GDPR &amp; CCPA</h3>
            <p>
              You have the right to request an export of your saved strategies and trade logs, request complete account deletion, or opt out of non-essential telemetry tracking at any time by contacting compliance@marketpulse.ai.
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
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
