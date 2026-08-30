import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OnboardingModal } from './components/OnboardingModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ProfileModal } from './components/ProfileModal';
import { InteractiveTour } from './components/InteractiveTour';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PaperBrokeragePage } from './pages/PaperBrokeragePage';
import { StrategyPage } from './pages/StrategyPage';
import { MultiStrategyPage } from './pages/MultiStrategyPage';
import { RiskAlertsPage } from './pages/RiskAlertsPage';
import { HistoricalAnalysisPage } from './pages/HistoricalAnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState<'home' | 'auth' | 'terminal'>('home');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');
  
  // Auto-switch to terminal whenever a user authenticates or signs in
  React.useEffect(() => {
    if (user && viewMode === 'auth') {
      setViewMode('terminal');
    }
  }, [user, viewMode]);

  // Modals state
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBE9] paper-grain flex items-center justify-center">
        <div className="text-center space-y-3 font-mono text-xs text-[#8C705B]">
          <div className="w-8 h-8 border-2 border-[#AD8B73] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-serif text-sm font-bold text-[#3F2E22]">Initializing MarketPulse Pro Terminal...</p>
        </div>
      </div>
    );
  }

  // 1. If unauthenticated
  if (!user) {
    if (viewMode === 'auth') {
      return <AuthPage onBackToHome={() => setViewMode('home')} />;
    }
    return (
      <HomePage
        onLaunchTerminal={() => setViewMode('auth')}
        onSignIn={() => setViewMode('auth')}
      />
    );
  }

  // 2. If authenticated, allow viewing Home Page or Terminal without logging out
  if (viewMode === 'home') {
    return (
      <div className="relative">
        <HomePage
          onLaunchTerminal={() => setViewMode('terminal')}
          onSignIn={() => setViewMode('terminal')}
        />
        <SubscriptionModal
          isOpen={isSubscriptionOpen}
          onClose={() => setIsSubscriptionOpen(false)}
        />
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
        />
      </div>
    );
  }

  // 3. Authenticated Terminal Interface
  return (
    <div className="min-h-screen bg-[#FFFBE9] text-[#3F2E22] flex flex-col paper-grain relative">
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-[#E3CAA5]/30 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Navigation */}
      <Navbar
        activeTicker={selectedTicker}
        onSelectTicker={setSelectedTicker}
        onOpenOnboarding={() => setIsTourOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onNavigateHome={() => setViewMode('home')}
      />

      {/* Main App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            if (tab === 'home') {
              setViewMode('home');
            } else {
              setCurrentTab(tab);
            }
          }}
        />

        {/* Dynamic Page View Area */}
        <main className="flex-1 overflow-y-auto bg-[#FFFBE9]">
          {currentTab === 'dashboard' && (
            <DashboardPage
              selectedTicker={selectedTicker}
              onSelectTicker={setSelectedTicker}
            />
          )}
          {currentTab === 'brokerage' && <PaperBrokeragePage />}
          {currentTab === 'strategy' && <StrategyPage />}
          {currentTab === 'multi-strategy' && <MultiStrategyPage />}
          {currentTab === 'risk-alerts' && <RiskAlertsPage />}
          {currentTab === 'historical' && <HistoricalAnalysisPage />}
          {currentTab === 'settings' && <SettingsPage />}
          {currentTab === 'admin' && <AdminPage />}
        </main>
      </div>

      {/* Modals */}
      <InteractiveTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => {
          setViewMode('terminal');
          setCurrentTab(tab);
        }}
      />
      
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};
