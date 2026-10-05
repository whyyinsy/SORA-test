import React, { useState, useMemo } from 'react';
import { calculateCompoundedSora } from '../services/soraService';
import { MOCK_DAILY_SORA_RATES } from '../data/mockMasSoraData';
import { SoraDailyRate } from '../types/sora';
import { Calendar, Calculator, Download, Plus, Trash2, ArrowUpDown } from 'lucide-react';

export const DailyCompoundingEngine: React.FC = () => {
  const [dayPeriod, setDayPeriod] = useState<30 | 60 | 90>(30);
  const [principal, setPrincipal] = useState<number>(1000000);
  const [bankSpread, setBankSpread] = useState<number>(0.70);
  const [customRatesList, setCustomRatesList] = useState<SoraDailyRate[]>(MOCK_DAILY_SORA_RATES);

  // Filter rates by chosen period
  const activeRates = useMemo(() => {
    // Sorted chronological
    const sorted = [...customRatesList].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    // Take the latest N business days
    const sliceCount = dayPeriod === 30 ? 22 : dayPeriod === 60 ? 44 : 66;
    return sorted.slice(0, sliceCount);
  }, [customRatesList, dayPeriod]);

  // Run calculation
  const summary = useMemo(() => {
    return calculateCompoundedSora(activeRates, principal, bankSpread);
  }, [activeRates, principal, bankSpread]);

  // Download daily ledger as CSV
  const handleExportDailyCsv = () => {
    const headers = [
      'Date',
      'Overnight SORA (%)',
      'Calendar Days (n_i)',
      'Daily Compounding Factor',
      'Cumulative Product Factor',
      'Daily Interest Accrued (SGD)',
      'Cumulative Interest (SGD)',
    ];

    const rows = summary.records.map((r) => [
      r.date,
      r.overnightRate.toFixed(4),
      r.calendarDays,
      r.dailyCompoundingFactor.toFixed(8),
      r.cumulativeProductFactor.toFixed(8),
      r.accruedInterestSgd.toFixed(2),
      r.cumulativeInterestSgd.toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MAS_SORA_Daily_Compounding_Ledger_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Mathematical Methodology Card */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-xl border border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Official MAS Daily Compounding in Arrears Formula</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Actual/365 Overnight Rate Accumulator
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Monetary Authority of Singapore (MAS) specifies the daily compounding of SORA using
              actual calendar days ($n_i$) per business day over the interest period $d$.
            </p>
          </div>

          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 font-mono text-xs text-slate-200 self-start">
            <div className="text-[11px] text-slate-400 mb-1">MAS Formula Specification:</div>
            <div className="text-emerald-300">
              Rate = [ ∏ (1 + (r_i × n_i / 365)) - 1 ] × (365 / d)
            </div>
          </div>
        </div>

        {/* Period Selector & Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Interest Calculation Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([30, 60, 90] as (30 | 60 | 90)[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setDayPeriod(p)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    dayPeriod === p
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  ~{p} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Principal Loan Balance (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                S$
              </span>
              <input
                type="number"
                step="50000"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(1000, Number(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bank Margin / Spread (+% p.a.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                +
              </span>
              <input
                type="number"
                step="0.05"
                value={bankSpread}
                onChange={(e) => setBankSpread(Number(e.target.value) || 0)}
                className="w-full pl-7 pr-7 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Compounded Annual Rate</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {summary.compoundedAnnualRate.toFixed(4)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            + Bank Spread ={' '}
            <strong className="text-slate-800">
              {(summary.compoundedAnnualRate + bankSpread).toFixed(4)}% p.a.
            </strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Simple Average Rate</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {summary.simpleAverageRate.toFixed(4)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Delta from Compounded:{' '}
            <span className="font-mono">
              {(summary.compoundedAnnualRate - summary.simpleAverageRate).toFixed(4)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Interest Accrued</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            ${summary.totalInterestAccrued.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            For {summary.totalCalendarDays} calendar days
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Calculation Period</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1">
            {summary.startDate} → {summary.endDate}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {summary.businessDays} business days ({summary.totalCalendarDays} calendar days)
          </div>
        </div>
      </div>

      {/* Daily Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Daily Overnight Compounding Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Friday rates carry 3 calendar days (n_i = 3) for Saturday and Sunday over weekends.
            </p>
          </div>

          <button
            onClick={handleExportDailyCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Daily Ledger</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Overnight SORA (r_i)</th>
                <th className="py-2.5 px-4 text-right">Days (n_i)</th>
                <th className="py-2.5 px-4 text-right">Daily Factor</th>
                <th className="py-2.5 px-4 text-right">Cumulative Factor</th>
                <th className="py-2.5 px-4 text-right text-emerald-700">Daily Interest</th>
                <th className="py-2.5 px-4 text-right font-semibold">Cumulative Interest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {summary.records.map((record) => (
                <tr key={record.date} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-4 font-sans font-medium text-slate-900">
                    {record.date}
                    {record.calendarDays > 1 && (
                      <span className="text-[10px] text-slate-500 ml-1.5 font-normal">
                        ({record.calendarDays}d weekend)
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-slate-800">
                    {record.overnightRate.toFixed(4)}%
                  </td>
                  <td className="py-2 px-4 text-right text-slate-600">{record.calendarDays}</td>
                  <td className="py-2 px-4 text-right text-slate-500">
                    {record.dailyCompoundingFactor.toFixed(7)}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-500">
                    {record.cumulativeProductFactor.toFixed(7)}
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-600">
                    ${record.accruedInterestSgd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-slate-900">
                    ${record.cumulativeInterestSgd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
