import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ChevronDown, Check, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

interface StockOption {
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  currency: string;
}

interface StockSearchBarProps {
  activeTicker: string;
  onSelectTicker: (ticker: string) => void;
  variant?: 'navbar' | 'inline';
}

export const StockSearchBar: React.FC<StockSearchBarProps> = ({
  activeTicker,
  onSelectTicker,
  variant = 'navbar',
}) => {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<'ALL' | 'US' | 'IN'>('ALL');
  const [options, setOptions] = useState<StockOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.searchStocks(query, region);
        setOptions(res || []);
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 150);

    return () => clearTimeout(debounceTimer);
  }, [query, region]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    onSelectTicker(symbol);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-md">
      {/* Input container */}
      <div
        className={`flex items-center bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl shadow-warm-sm px-3 py-1.5 transition-all ${
          isOpen ? 'ring-2 ring-[#AD8B73]/40 border-[#AD8B73]' : 'hover:border-[#AD8B73]/60'
        }`}
      >
        <Search className="w-4 h-4 text-[#8C705B] shrink-0 mr-2" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && options.length > 0) {
              handleSelect(options[0].symbol);
            }
          }}
          placeholder="Search any stock (e.g. RELIANCE, NVDA, TCS, AAPL, TATAMOTORS)..."
          className="w-full bg-transparent text-xs text-[#3F2E22] placeholder-[#8C705B]/60 focus:outline-none font-sans"
        />

        {activeTicker && !query && (
          <span className="shrink-0 px-2 py-0.5 rounded bg-[#E3CAA5]/70 text-[#5C4433] font-mono text-[10px] font-bold border border-[#AD8B73]/30 ml-1">
            Active: {activeTicker}
          </span>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-2xl shadow-warm-lg z-50 overflow-hidden animate-fade-in-up">
          {/* Region Selector Pills */}
          <div className="flex items-center justify-between p-2.5 bg-[#F5EFE0] border-b border-[#AD8B73]/20 text-[11px] font-mono">
            <span className="text-[#8C705B] text-[10px] font-bold uppercase tracking-wider pl-1">
              Select Market:
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setRegion('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  region === 'ALL'
                    ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                    : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
                }`}
              >
                🌐 All
              </button>
              <button
                type="button"
                onClick={() => setRegion('US')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  region === 'US'
                    ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                    : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
                }`}
              >
                🇺🇸 US Markets
              </button>
              <button
                type="button"
                onClick={() => setRegion('IN')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  region === 'IN'
                    ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                    : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
                }`}
              >
                🇮🇳 Indian Equities
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#AD8B73]/15">
            {options.map((item) => {
              const isSelected = activeTicker === item.symbol;
              const isIndian = item.country === 'IN' || item.symbol.endsWith('.NS');
              return (
                <div
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#F5EFE0] font-semibold'
                      : 'hover:bg-[#F5EFE0]/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{isIndian ? '🇮🇳' : '🇺🇸'}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#3F2E22]">
                          {item.symbol}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#E3CAA5]/60 text-[#5C4433] font-bold border border-[#AD8B73]/20">
                          {item.exchange}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C705B] font-sans line-clamp-1">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#5C4433] px-2 py-0.5 rounded bg-[#FFFBE9] border border-[#AD8B73]/20 font-bold">
                      {item.currency === 'INR' ? '₹ INR' : '$ USD'}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#2D8A68]" />}
                  </div>
                </div>
              );
            })}

            {options.length === 0 && (
              <div className="p-5 text-center text-xs font-sans text-[#8C705B]">
                {loading ? 'Searching live equities...' : 'Type any stock ticker symbol to analyze.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
