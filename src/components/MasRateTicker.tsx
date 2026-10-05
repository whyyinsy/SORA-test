import React, { useState } from 'react';
import { MasBenchmarkRates } from '../types/sora';
import { Sliders, RotateCcw, Check, Info } from 'lucide-react';

interface MasRateTickerProps {
  rates: MasBenchmarkRates;
  onUpdateRates: (updated: MasBenchmarkRates) => void;
  onResetRates: () => void;
  dataSource: 'backend' | 'mas_open_api' | 'fallback_cache';
}

export const MasRateTicker: React.FC<MasRateTickerProps> = ({
  rates,
  onUpdateRates,
  onResetRates,
  dataSource,
}) => {
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [bpsShift, setBpsShift] = useState(0);

  const handleApplyShift = (shiftDeltaBps: number) => {
    const shiftPercent = shiftDeltaBps / 100;
    setBpsShift(shiftDeltaBps);
    onUpdateRates({
      ...rates,
      overnightSora: Number((rates.overnightSora + shiftPercent).toFixed(4)),
      oneMonthCompounded: Number((rates.oneMonthCompounded + shiftPercent).toFixed(4)),
      threeMonthCompounded: Number((rates.threeMonthCompounded + shiftPercent).toFixed(4)),
      sixMonthCompounded: Number((rates.sixMonthCompounded + shiftPercent).toFixed(4)),
      isCustomOverride: shiftDeltaBps !== 0,
    });
  };

  const handleManualRateChange = (field: keyof MasBenchmarkRates, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onUpdateRates({
        ...rates,
        [field]: num,
        isCustomOverride: true,
      });
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: Source metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              MAS Official Benchmark
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Effective Date: {rates.effectiveDate}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Day-Count: Actual/365</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>
              Source:{' '}
              {dataSource === 'backend'
                ? 'Local Backend Proxy (/api/sora)'
                : dataSource === 'mas_open_api'
                ? 'Live MAS Open Datastore'
                : 'MAS Domestic Money Market Data'}
            </span>
            {rates.isCustomOverride && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-amber-400 font-medium">Scenario Mode Active</span>
              </>
            )}
          </div>

          {/* Right: Quick scenario toggle */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => setShowAdjuster(!showAdjuster)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showAdjuster ? 'Close Adjuster' : 'Simulate Rate Shift'}</span>
            </button>
            {rates.isCustomOverride && (
              <button
                onClick={() => {
                  setBpsShift(0);
                  onResetRates();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to MAS</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Benchmark Rates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
              3M Compounded SORA
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {rates.threeMonthCompounded.toFixed(4)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Standard mortgage anchor</div>
          </div>

          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              1M Compounded SORA
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {rates.oneMonthCompounded.toFixed(4)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Monthly reset contracts</div>
          </div>

          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              6M Compounded SORA
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {rates.sixMonthCompounded.toFixed(4)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Semi-annual loans</div>
          </div>

          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Overnight SORA
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {rates.overnightSora.toFixed(4)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Daily volume-weighted</div>
          </div>

          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              SORA Index
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {rates.soraIndex.toFixed(5)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Compounded value index</div>
          </div>

          <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Aggregate Volume
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              ${(rates.aggregateVolumeMillionSgd / 1000).toFixed(2)}B
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">SGD interbank market</div>
          </div>
        </div>

        {/* Collapsible Rate Shift / Stress Test Bar */}
        {showAdjuster && (
          <div className="mt-3 p-3.5 bg-slate-800 rounded-lg border border-slate-700 animate-in fade-in duration-150">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  SORA Sensitivity & Rate Shift Scenario
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate interest payments if MAS SORA adjusts following central bank monetary policy.
                </p>
              </div>

              {/* Quick shift buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[-100, -50, -25, 0, 25, 50, 100].map((delta) => (
                  <button
                    key={delta}
                    onClick={() => handleApplyShift(delta)}
                    className={`px-2.5 py-1 text-xs font-mono tabular-nums font-medium rounded transition-colors ${
                      bpsShift === delta
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta} bps
                  </button>
                ))}
              </div>
            </div>

            {/* Custom override direct inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-700">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Custom 3M SORA (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rates.threeMonthCompounded}
                  onChange={(e) => handleManualRateChange('threeMonthCompounded', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Custom 1M SORA (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rates.oneMonthCompounded}
                  onChange={(e) => handleManualRateChange('oneMonthCompounded', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Custom 6M SORA (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rates.sixMonthCompounded}
                  onChange={(e) => handleManualRateChange('sixMonthCompounded', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Overnight SORA (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rates.overnightSora}
                  onChange={(e) => handleManualRateChange('overnightSora', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
