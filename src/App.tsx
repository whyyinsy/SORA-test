import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { MasRateTicker } from './components/MasRateTicker';
import { MortgageCalculator } from './components/MortgageCalculator';
import { DailyCompoundingEngine } from './components/DailyCompoundingEngine';
import { FixedVsSoraComparison } from './components/FixedVsSoraComparison';
import { TdsrCalculator } from './components/TdsrCalculator';
import { RatesApiInspector } from './components/RatesApiInspector';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { INITIAL_MAS_BENCHMARK_RATES } from './data/mockMasSoraData';
import { MasBenchmarkRates } from './types/sora';
import { fetchLiveMasRates } from './services/soraService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mortgage');
  const [rates, setRates] = useState<MasBenchmarkRates>(INITIAL_MAS_BENCHMARK_RATES);
  const [dataSource, setDataSource] = useState<'backend' | 'mas_open_api' | 'fallback_cache'>('fallback_cache');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);

  // Initial load check for live backend or MAS API
  const refreshRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchLiveMasRates();
      setRates(result.rates);
      setDataSource(result.source);
    } catch {
      // Fallback
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  const handleResetRates = () => {
    setRates(INITIAL_MAS_BENCHMARK_RATES);
  };

  const handleUpdateRates = (updatedRates: MasBenchmarkRates) => {
    setRates(updatedRates);
  };

  const handleRatesUpdatedFromInspector = (
    newRates: MasBenchmarkRates,
    source: 'backend' | 'mas_open_api' | 'fallback_cache'
  ) => {
    setRates(newRates);
    setDataSource(source);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1-Row 3-Zone Top Navigation Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        isRefreshing={isRefreshing}
        onRefreshRates={refreshRates}
      />

      {/* Official MAS Benchmark Rate Ticker Bar */}
      <MasRateTicker
        rates={rates}
        onUpdateRates={handleUpdateRates}
        onResetRates={handleResetRates}
        dataSource={dataSource}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'mortgage' && <MortgageCalculator rates={rates} />}
        {activeTab === 'compounding' && <DailyCompoundingEngine />}
        {activeTab === 'comparison' && <FixedVsSoraComparison rates={rates} />}
        {activeTab === 'tdsr' && <TdsrCalculator />}
        {activeTab === 'rates' && (
          <RatesApiInspector
            currentRates={rates}
            onRatesUpdated={handleRatesUpdatedFromInspector}
            dataSource={dataSource}
            onOpenBackendModal={() => setIsBackendModalOpen(true)}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-slate-700">SORA Precision</span>
            <span aria-hidden="true">·</span>
            <span>Day-Count Convention: Actual/365</span>
            <span aria-hidden="true">·</span>
            <span>Monetary Authority of Singapore (MAS) Benchmark Standards</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Backend API Spec
            </button>
            <a
              href="https://www.mas.gov.sg/bonds-and-bills/singapore-overnight-rate-average-sora"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              MAS SORA Documentation
            </a>
          </div>
        </div>
      </footer>

      {/* Backend Integration Modal */}
      <BackendIntegrationModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        currentRates={rates}
      />
    </div>
  );
}
