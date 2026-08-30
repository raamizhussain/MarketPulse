import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User as UserIcon, LogOut, Compass, CreditCard } from 'lucide-react';
import { StockSearchBar } from './StockSearchBar';

interface NavbarProps {
  activeTicker: string;
  onSelectTicker: (ticker: string) => void;
  onOpenOnboarding: () => void;
  onOpenProfile?: () => void;
  onOpenSubscription?: () => void;
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTicker,
  onSelectTicker,
  onOpenOnboarding,
  onOpenProfile,
  onOpenSubscription,
  onNavigateHome,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#F5EFE0] border-b border-[#AD8B73]/20 sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-warm-sm gap-4">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center space-x-5 shrink-0">
        <div
          onClick={onNavigateHome}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Return to Product Overview"
        >
          <div className="w-9 h-9 rounded-xl bg-[#E3CAA5] border border-[#AD8B73]/30 flex items-center justify-center shadow-warm-sm group-hover:scale-105 transition-transform">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4 stroke-[#5C4433]"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20V10a8 8 0 0 1 16 0v10" />
              <path d="M8 20v-6a4 4 0 0 1 8 0v6" />
              <circle cx="12" cy="7" r="1.5" fill="#AD8B73" stroke="none" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-lg tracking-tight text-[#3F2E22]">
                MarketPulse
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold uppercase tracking-widest bg-[#E3CAA5]/60 text-[#5C4433] border border-[#AD8B73]/30 hidden sm:inline-block">
                PRO TERMINAL
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#8C705B] hidden md:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D8A68] animate-pulse"></span>
              Universal Multi-Market Engine • US &amp; NSE/BSE
            </p>
          </div>
        </div>
      </div>

      {/* Center: Universal Stock Search Bar */}
      <div id="stock-search-container" className="flex-1 max-w-lg mx-auto">
        <StockSearchBar
          activeTicker={activeTicker}
          onSelectTicker={onSelectTicker}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 shrink-0">
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="text-xs font-medium text-[#5C4433] hover:text-[#3F2E22] bg-[#FFFBE9] hover:bg-[#E3CAA5]/40 px-3 py-1.5 rounded-xl border border-[#AD8B73]/25 shadow-warm-sm transition-colors hidden lg:flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#AD8B73]" />
            <span>Product Overview</span>
          </button>
        )}

        {/* Upgrade Plan Button */}
        {onOpenSubscription && (
          <button
            onClick={onOpenSubscription}
            className="btn-liquid text-xs font-semibold text-[#FFFBE9] bg-[#AD8B73] hover:bg-[#96755E] px-3.5 py-1.5 rounded-xl shadow-warm-sm transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#E3CAA5]" />
            <span>Upgrade Plan</span>
          </button>
        )}

        {/* Onboarding Tour Trigger */}
        <button
          onClick={onOpenOnboarding}
          className="text-xs font-medium text-[#5C4433] hover:text-[#3F2E22] bg-[#FFFBE9] hover:bg-[#E3CAA5]/40 px-3 py-1.5 rounded-xl border border-[#AD8B73]/25 shadow-warm-sm transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
          <span className="hidden sm:inline">Interactive Tour</span>
        </button>

        {/* User Profile Pill */}
        <div
          onClick={onOpenProfile}
          className="flex items-center space-x-2 pl-3 border-l border-[#AD8B73]/20 cursor-pointer group hover:opacity-80 transition-opacity"
          title="Manage Account Profile & Preferences"
        >
          <div className="w-7 h-7 rounded-full bg-[#E3CAA5] border border-[#AD8B73]/30 flex items-center justify-center text-[#5C4433]">
            <UserIcon className="w-3.5 h-3.5" />
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-semibold text-[#3F2E22] block leading-tight group-hover:text-[#AD8B73]">
              {user?.full_name?.split(' ')[0] || 'Quant'}
            </span>
            <span className="text-[10px] font-mono text-[#8C705B] uppercase block">
              {user?.subscription_tier || 'pro'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="p-1.5 rounded-lg text-[#8C705B] hover:text-[#A84236] hover:bg-[#A84236]/10 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
