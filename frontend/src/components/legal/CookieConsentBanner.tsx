import React, { useState, useEffect } from 'react';
import { Shield, Cookie, X, Check } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('marketpulse_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type: 'all' | 'essential') => {
    localStorage.setItem('marketpulse_cookie_consent', type);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-8 md:max-w-md z-50 animate-fade-in-up">
      <div className="p-5 rounded-2xl bg-[#F5EFE0] border border-[#AD8B73]/30 shadow-warm-lg space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#AD8B73]/20 text-[#5C4433] flex items-center justify-center font-bold">
              <Cookie className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm font-bold text-[#3F2E22]">Cookie &amp; Privacy Preferences</h4>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-[#8C705B] hover:text-[#3F2E22] text-xs font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#5C4433] font-sans leading-relaxed">
          MarketPulse AI uses strictly necessary cookies to keep you securely authenticated and preserve your quantitative trading session. We do not track you across external websites.{' '}
          <button
            onClick={onOpenPrivacy}
            className="text-[#AD8B73] hover:underline font-semibold"
          >
            Read our Privacy Policy
          </button>.
        </p>

        <div className="flex items-center space-x-2 pt-1">
          <button
            type="button"
            onClick={() => handleAccept('all')}
            className="btn-liquid flex-1 py-2 bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-semibold text-xs rounded-xl shadow-warm-sm transition-all"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => handleAccept('essential')}
            className="px-3.5 py-2 bg-[#FFFBE9] hover:bg-[#E3CAA5]/40 text-[#5C4433] border border-[#AD8B73]/25 font-semibold text-xs rounded-xl transition-all"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
};
