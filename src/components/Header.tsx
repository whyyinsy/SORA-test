import React from 'react';
import { Landmark, Code2, RefreshCw, FileSpreadsheet } from 'lucide-react';

export type ActiveTab = 'mortgage' | 'compounding' | 'comparison' | 'tdsr' | 'rates';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenBackendModal: () => void;
  onExportCsv?: () => void;
  isRefreshing: boolean;
  onRefreshRates: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenBackendModal,
  onExportCsv,
  isRefreshing,
  onRefreshRates,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Landmark className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              SORA Precision
            </span>
          </div>

          {/* Zone 2: Navigation Links / Segmented Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onSelectTab('mortgage')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'mortgage'
                  ? 'text-slate-900 bg-slate-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Mortgage Calculator
            </button>
            <button
              onClick={() => onSelectTab('compounding')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'compounding'
                  ? 'text-slate-900 bg-slate-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Daily Compounding
            </button>
            <button
              onClick={() => onSelectTab('comparison')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'comparison'
                  ? 'text-slate-900 bg-slate-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              SORA vs Fixed
            </button>
            <button
              onClick={() => onSelectTab('tdsr')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'tdsr'
                  ? 'text-slate-900 bg-slate-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              MAS TDSR Stress Test
            </button>
            <button
              onClick={() => onSelectTab('rates')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'rates'
                  ? 'text-slate-900 bg-slate-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Rates & API Spec
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshRates}
              disabled={isRefreshing}
              title="Refresh MAS Rates"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Refresh MAS Rates"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {onExportCsv && (
              <button
                onClick={onExportCsv}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              onClick={onOpenBackendModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend Ready</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => onSelectTab('mortgage')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'mortgage' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mortgage
          </button>
          <button
            onClick={() => onSelectTab('compounding')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'compounding' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overnight Compounding
          </button>
          <button
            onClick={() => onSelectTab('comparison')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'comparison' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fixed vs SORA
          </button>
          <button
            onClick={() => onSelectTab('tdsr')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'tdsr' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            MAS TDSR
          </button>
          <button
            onClick={() => onSelectTab('rates')}
            className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
              activeTab === 'rates' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rates & API
          </button>
        </div>
      </div>
    </header>
  );
};
