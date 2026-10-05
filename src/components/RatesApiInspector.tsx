import React, { useState } from 'react';
import { MasBenchmarkRates } from '../types/sora';
import { MOCK_DAILY_SORA_RATES } from '../data/mockMasSoraData';
import { fetchLiveMasRates } from '../services/soraService';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, Code, Activity, Key, Send } from 'lucide-react';

interface RatesApiInspectorProps {
  currentRates: MasBenchmarkRates;
  onRatesUpdated: (rates: MasBenchmarkRates, source: 'backend' | 'mas_open_api' | 'fallback_cache') => void;
  dataSource: 'backend' | 'mas_open_api' | 'fallback_cache';
  onOpenBackendModal: () => void;
}

export const RatesApiInspector: React.FC<RatesApiInspectorProps> = ({
  currentRates,
  onRatesUpdated,
  dataSource,
  onOpenBackendModal,
}) => {
  const [isTestingFetch, setIsTestingFetch] = useState(false);
  const [fetchStatusMessage, setFetchStatusMessage] = useState<string | null>(null);

  // Serverless test state
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [testKeyIdInput, setTestKeyIdInput] = useState('');
  const [testApiResult, setTestApiResult] = useState<any>(null);
  const [isCallingWithKey, setIsCallingWithKey] = useState(false);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (err: any) {
      setHealthStatus({ status: 'error', error: err.message });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleTestWithKeyId = async () => {
    setIsCallingWithKey(true);
    setTestApiResult(null);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (testKeyIdInput.trim()) {
        headers['KeyId'] = testKeyIdInput.trim();
      }
      const res = await fetch('/api/sora?nocache=true', { headers });
      const data = await res.json();
      setTestApiResult({ statusCode: res.status, ok: res.ok, data });
      if (res.ok && data.threeMonthCompounded !== undefined) {
        onRatesUpdated(data, 'backend');
      }
    } catch (err: any) {
      setTestApiResult({ statusCode: 500, ok: false, data: { error: err.message } });
    } finally {
      setIsCallingWithKey(false);
    }
  };

  const handleTestApiCall = async () => {
    setIsTestingFetch(true);
    setFetchStatusMessage(null);
    try {
      const res = await fetchLiveMasRates();
      onRatesUpdated(res.rates, res.source);
      if (res.source === 'backend') {
        setFetchStatusMessage('Successfully connected to serverless endpoint (/api/sora).');
      } else if (res.source === 'mas_open_api') {
        setFetchStatusMessage('Successfully received live data directly from MAS Datastore API.');
      } else {
        setFetchStatusMessage(
          'Using authenticated fallback cache (Configure MAS_KEY_ID in .env or test with custom KeyId below).'
        );
      }
    } catch {
      setFetchStatusMessage('Encountered error fetching rates; using cached dataset.');
    } finally {
      setIsTestingFetch(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Status & Live Fetcher Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>MAS SORA Serverless Integration Console</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Monetary Authority of Singapore (MAS) Gateway
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Serverless endpoints active in <code className="font-mono text-slate-800">/api/sora.ts</code> and{' '}
              <code className="font-mono text-slate-800">/api/health.ts</code>. Target MAS Endpoint:{' '}
              <span className="font-mono text-[11px] text-slate-800">
                domestic_interest_rates_daily/views/domestic_interest_rates_daily
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestApiCall}
              disabled={isTestingFetch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingFetch ? 'animate-spin' : ''}`} />
              <span>{isTestingFetch ? 'Querying...' : 'Fetch Live Rates'}</span>
            </button>

            <button
              onClick={onOpenBackendModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Code className="w-3.5 h-3.5 text-slate-600" />
              <span>API Details</span>
            </button>
          </div>
        </div>

        {fetchStatusMessage && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{fetchStatusMessage}</span>
          </div>
        )}
      </div>

      {/* Live Serverless Endpoint Tester Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Interactive Serverless Endpoint Tester (/api/sora & /api/health)
            </h3>
          </div>
          <button
            onClick={checkHealth}
            disabled={isCheckingHealth}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            <Activity className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Check /api/health</span>
          </button>
        </div>

        {healthStatus && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span>Health Status:</span>
              <span className={healthStatus.status === 'ok' ? 'text-emerald-600 font-bold' : 'text-red-600'}>
                {healthStatus.status?.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              MAS_KEY_ID In Environment:{' '}
              <strong className={healthStatus.masKeyConfigured ? 'text-emerald-700' : 'text-amber-600'}>
                {healthStatus.masKeyConfigured ? 'Configured' : 'Not Set in .env'}
              </strong>
              {healthStatus.masKeyIdMasked && ` (${healthStatus.masKeyIdMasked})`}
            </div>
          </div>
        )}

        {/* Test KeyId Header Input */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-700">
            Test Request with KeyId Header
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Paste your MAS KeyId to test (or configure in .env as MAS_KEY_ID)..."
                value={testKeyIdInput}
                onChange={(e) => setTestKeyIdInput(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <button
              onClick={handleTestWithKeyId}
              disabled={isCallingWithKey}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Send className={`w-3.5 h-3.5 ${isCallingWithKey ? 'animate-spin' : ''}`} />
              <span>Send /api/sora Request</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Sends an HTTP GET request to <code className="font-mono text-slate-700">/api/sora</code> with header{' '}
            <code className="font-mono text-slate-700">KeyId: &lt;value&gt;</code>.
          </p>
        </div>

        {/* Result from /api/sora test */}
        {testApiResult && (
          <div className="mt-3 p-3.5 bg-slate-950 text-slate-200 rounded-lg border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[11px]">
              <span className="text-slate-400">Response Status:</span>
              <span className={testApiResult.ok ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                HTTP {testApiResult.statusCode}
              </span>
            </div>
            <pre className="overflow-x-auto text-[11px] text-emerald-300 max-h-48 leading-relaxed">
              {JSON.stringify(testApiResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Active Data Payload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: JSON Inspector */}
        <div className="bg-slate-950 text-slate-200 p-5 rounded-xl border border-slate-800 shadow-xs font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-3">
            <span className="font-semibold text-slate-300">Live Memory State</span>
            <span className="text-[11px] text-emerald-400">
              Source: {dataSource.toUpperCase()}
            </span>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-300">
            {JSON.stringify(currentRates, null, 2)}
          </pre>
        </div>

        {/* Right: Singapore Benchmark Knowledge Base */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
          <h3 className="font-semibold text-slate-900 text-sm">
            Understanding SORA & MAS Specifications
          </h3>

          <div className="space-y-3">
            <div className="border-l-2 border-emerald-600 pl-3">
              <div className="font-semibold text-slate-900">What is SORA?</div>
              <p className="text-slate-600 mt-0.5">
                The Singapore Overnight Rate Average (SORA) is the volume-weighted average of
                unsecured overnight interbank Singapore Dollar transactions brokered in Singapore
                between 8am and 6:15pm. It fully replaced SOR and SIBOR.
              </p>
            </div>

            <div className="border-l-2 border-slate-300 pl-3">
              <div className="font-semibold text-slate-900">1M vs 3M vs 6M Compounded SORA</div>
              <p className="text-slate-600 mt-0.5">
                Compounded SORA rates are calculated over 1-month, 3-month, or 6-month historical
                rolling windows. 3M Compounded SORA is the standard reference benchmark used by
                DBS, OCBC, UOB, and other retail banks in Singapore for floating home loans.
              </p>
            </div>

            <div className="border-l-2 border-slate-300 pl-3">
              <div className="font-semibold text-slate-900">The Actual/365 Day-Count Standard</div>
              <p className="text-slate-600 mt-0.5">
                In Singapore money markets, interest is calculated on an Actual/365 day convention.
                Interest on Friday night covers 3 calendar days (Friday, Saturday, Sunday) based on
                Friday&apos;s published rate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Daily SORA Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">
            Recent MAS Daily Overnight SORA History
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily historical rates with volume and quartile spreads as published by MAS.
          </p>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Overnight SORA Rate (%)</th>
                <th className="py-2.5 px-4 text-right">Volume (SGD M)</th>
                <th className="py-2.5 px-4 text-right">25th Percentile</th>
                <th className="py-2.5 px-4 text-right">75th Percentile</th>
                <th className="py-2.5 px-4 text-right">Calendar Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {MOCK_DAILY_SORA_RATES.slice(0, 30).map((r) => (
                <tr key={r.date} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-4 font-sans font-medium text-slate-900">{r.date}</td>
                  <td className="py-2 px-4 text-right font-bold text-slate-900">
                    {r.rate.toFixed(4)}%
                  </td>
                  <td className="py-2 px-4 text-right text-slate-600">
                    ${r.volumeMillionSgd.toLocaleString()}M
                  </td>
                  <td className="py-2 px-4 text-right text-slate-500">
                    {r.lowQuartile?.toFixed(2)}%
                  </td>
                  <td className="py-2 px-4 text-right text-slate-500">
                    {r.highQuartile?.toFixed(2)}%
                  </td>
                  <td className="py-2 px-4 text-right text-slate-600">{r.calculationDays || 1}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

