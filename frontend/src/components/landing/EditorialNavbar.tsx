import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowUpRight, Menu, X, User as UserIcon } from 'lucide-react';

interface EditorialNavbarProps {
  onLaunchTerminal: () => void;
  onSignIn: () => void;
}

export const EditorialNavbar: React.FC<EditorialNavbarProps> = ({
  onLaunchTerminal,
  onSignIn,
}) => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Personalized AI', href: '#models' },
    { name: 'Agent Committee', href: '#committee' },
    { name: 'Regime Intelligence', href: '#regimes' },
    { name: 'Backtesting', href: '#backtesting' },
    { name: 'Pricing Tiers', href: '#pricing' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFFBE9]/90 backdrop-blur-md border-b border-[#AD8B73]/20 shadow-warm-sm py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#E3CAA5] border border-[#AD8B73]/30 flex items-center justify-center shadow-warm-sm group-hover:scale-105 transition-transform">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 stroke-[#5C4433]"
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
            <div className="flex items-center space-x-1.5">
              <span className="font-serif text-xl font-bold tracking-tight text-[#3F2E22]">
                MarketPulse
              </span>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#E3CAA5]/60 text-[#5C4433] border border-[#AD8B73]/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] font-sans text-[#8C705B] tracking-wide hidden sm:block">
              Multi-Agent Quantitative Intelligence
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-xs font-medium tracking-wide text-[#5C4433]">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="relative py-1 hover:text-[#3F2E22] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#AD8B73] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F5EFE0] border border-[#AD8B73]/25 shadow-warm-sm">
                <div className="w-6 h-6 rounded-lg bg-[#E3CAA5] flex items-center justify-center text-[#5C4433]">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-left text-[11px]">
                  <span className="font-bold text-[#3F2E22] block leading-tight">
                    {user.full_name?.split(' ')[0] || 'Quant'}
                  </span>
                  <span className="text-[9px] font-mono text-[#8C705B] uppercase">
                    {user.subscription_tier}
                  </span>
                </div>
              </div>

              <button
                onClick={onLaunchTerminal}
                className="btn-liquid px-5 py-2.5 rounded-xl bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-medium tracking-wide shadow-warm-md flex items-center space-x-1.5 group"
              >
                <span>Enter Terminal</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#E3CAA5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onSignIn}
                className="px-4 py-2.5 rounded-xl font-medium text-[#5C4433] hover:text-[#3F2E22] hover:bg-[#E3CAA5]/40 transition-colors"
              >
                Sign In
              </button>

              <button
                onClick={onLaunchTerminal}
                className="btn-liquid px-5 py-2.5 rounded-xl bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] font-medium tracking-wide shadow-warm-md flex items-center space-x-1.5 group"
              >
                <span>Launch Terminal</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#E3CAA5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#5C4433] hover:bg-[#E3CAA5]/40"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F5EFE0] border-b border-[#AD8B73]/20 px-6 py-6 space-y-4 animate-fade-in shadow-warm-lg">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#5C4433]">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#3F2E22]"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-[#AD8B73]/20 flex flex-col space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchTerminal();
              }}
              className="btn-liquid w-full py-3 rounded-xl bg-[#AD8B73] text-[#FFFBE9] font-medium text-center shadow-warm-md"
            >
              {user ? 'Enter Pro Terminal' : 'Launch Free Sandbox'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
