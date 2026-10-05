import React, { useState, useMemo } from 'react';
import { MasBenchmarkRates } from '../types/sora';
import { calculateMortgageAmortization } from '../services/soraService';
import { Scale, ArrowRight, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';

interface FixedVsSoraComparisonProps {
  rates: MasBenchmarkRates;
}

export const FixedVsSoraComparison: React.FC<FixedVsSoraComparisonProps> = ({ rates }) => {
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [tenureYears, setTenureYears] = useState<number>(25);

  // Floating package params
  const [soraSpread, setSoraSpread] = useState<number>(0.70);
  const benchmarkRate = rates.threeMonthCompounded;
  const floatingEffectiveRate = Number((benchmarkRate + soraSpread).toFixed(4));

  // Fixed package params
  const [fixedRate, setFixedRate] = useState<number>(3.15);
  const [fixedLockInYears, setFixedLockInYears] = useState<number>(2);

  // Future rate expectations (Rate Cut / Hike scenario in Year 2)
  const [futureSoraChangeBps, setFutureSoraChangeBps] = useState<number>(-50); // e.g. -50 bps cut

  // Baseline Floating calculation
  const floatingCalc = useMemo(() => {
    return calculateMortgageAmortization(
      {
        loanAmount,
        tenureYears,
        benchmarkTenor: '3M',
        bankSpread: soraSpread,
        repaymentType: 'PRINCIPAL_AND_INTEREST',
        propertyValue: loanAmount / 0.75,
        isFirstProperty: true,
      },
      rates
    );
  }, [loanAmount, tenureYears, soraSpread, rates]);

  // Fixed calculation
  const fixedCalc = useMemo(() => {
    return calculateMortgageAmortization(
      {
        loanAmount,
        tenureYears,
        benchmarkTenor: 'CUSTOM',
        customBenchmarkRate: fixedRate,
        bankSpread: 0,
        repaymentType: 'PRINCIPAL_AND_INTEREST',
        propertyValue: loanAmount / 0.75,
        isFirstProperty: true,
      },
      rates
    );
  }, [loanAmount, tenureYears, fixedRate, rates]);

  // Interest in lock-in period
  const fixedLockInMonths = fixedLockInYears * 12;
  const floatingLockInInterest = useMemo(() => {
    return floatingCalc.monthlySchedule
      .slice(0, fixedLockInMonths)
      .reduce((acc, cur) => acc + cur.interestPaid, 0);
  }, [floatingCalc, fixedLockInMonths]);

  const fixedLockInInterest = useMemo(() => {
    return fixedCalc.monthlySchedule
      .slice(0, fixedLockInMonths)
      .reduce((acc, cur) => acc + cur.interestPaid, 0);
  }, [fixedCalc, fixedLockInMonths]);

  const lockInInterestDiff = floatingLockInInterest - fixedLockInInterest;

  // Break-even SORA rate calculation
  // Floating Rate = SORA + spread. For Floating = Fixed, SORA = Fixed - spread.
  const breakEvenSora = Number((fixedRate - soraSpread).toFixed(4));

  // Scenario with rate change in Year 2
  const scenarioSoraRate = Number((benchmarkRate + futureSoraChangeBps / 100).toFixed(4));
  const scenarioFloatingEffective = Number((scenarioSoraRate + soraSpread).toFixed(4));

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
          <Scale className="w-4 h-4 text-emerald-600" />
          <span>Floating SORA vs Fixed Mortgage Arbitrage</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Compare Floating SORA with Fixed Bank Packages
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl">
          Evaluate whether locking in a fixed rate protects against interest spikes, or if floating
          3M SORA provides lower total cost as central bank interest rate cycles ease.
        </p>

        {/* Global Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loan Principal (SGD)
            </label>
            <input
              type="number"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(10000, Number(e.target.value) || 0))}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loan Tenure (Years)
            </label>
            <input
              type="number"
              min="5"
              max="35"
              value={tenureYears}
              onChange={(e) => setTenureYears(Math.max(5, Math.min(35, Number(e.target.value) || 25)))}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fixed Package Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.05"
              value={fixedRate}
              onChange={(e) => setFixedRate(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fixed Lock-in Period
            </label>
            <select
              value={fixedLockInYears}
              onChange={(e) => setFixedLockInYears(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
            >
              <option value={1}>1 Year Lock-in</option>
              <option value={2}>2 Years Lock-in (Standard)</option>
              <option value={3}>3 Years Lock-in</option>
              <option value={5}>5 Years Lock-in</option>
            </select>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Floating Package Card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Option A: Floating 3M SORA
            </span>
            <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Current Benchmark
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              ${floatingCalc.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-500 font-sans ml-1">/ month</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 font-mono">
              Rate: {floatingEffectiveRate.toFixed(4)}% p.a. (3M SORA {benchmarkRate.toFixed(4)}% +{' '}
              {soraSpread.toFixed(2)}% margin)
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{fixedLockInYears}-Year Interest:</span>
              <span className="font-mono font-semibold text-slate-900">
                ${floatingLockInInterest.toLocaleString(undefined, { minimumFractionDigits: 0 })} SGD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Lifetime Interest:</span>
              <span className="font-mono font-semibold text-slate-900">
                ${floatingCalc.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 0 })} SGD
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Package Card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Option B: {fixedLockInYears}-Year Fixed Package
            </span>
            <span className="text-xs font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              Locked In
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              ${fixedCalc.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-500 font-sans ml-1">/ month</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 font-mono">
              Guaranteed Rate: {fixedRate.toFixed(2)}% p.a. fixed for {fixedLockInYears} years
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{fixedLockInYears}-Year Interest:</span>
              <span className="font-mono font-semibold text-slate-900">
                ${fixedLockInInterest.toLocaleString(undefined, { minimumFractionDigits: 0 })} SGD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lock-in Difference:</span>
              <span
                className={`font-mono font-semibold ${
                  lockInInterestDiff > 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {lockInInterestDiff > 0
                  ? `Fixed saves $${Math.abs(lockInInterestDiff).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })} SGD`
                  : `Floating saves $${Math.abs(lockInInterestDiff).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })} SGD`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Break-even & Sensitivity Analysis */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">SORA Break-Even Analysis</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              The exact benchmark level where floating SORA matches the fixed rate offer.
            </p>
          </div>

          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <div className="text-[11px] text-slate-400">Break-Even 3M SORA Rate:</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {breakEvenSora.toFixed(4)}%
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/80 text-xs text-slate-300 space-y-2">
          <p>
            • If 3M SORA stays <strong>above {breakEvenSora.toFixed(4)}%</strong>, the Fixed{' '}
            {fixedRate.toFixed(2)}% package is cheaper.
          </p>
          <p>
            • If 3M SORA falls <strong>below {breakEvenSora.toFixed(4)}%</strong> (a decrease of{' '}
            {Math.abs(Number(((benchmarkRate - breakEvenSora) * 100).toFixed(0)))} bps from today&apos;s{' '}
            {benchmarkRate.toFixed(4)}%), Floating SORA yields greater overall savings.
          </p>
        </div>

        {/* Rate Cut Scenario Slider */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Simulate Monetary Policy Rate Shift
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              {futureSoraChangeBps > 0 ? `+${futureSoraChangeBps}` : futureSoraChangeBps} bps (3M SORA
              becomes {scenarioSoraRate.toFixed(4)}%)
            </span>
          </div>

          <input
            type="range"
            min="-150"
            max="150"
            step="25"
            value={futureSoraChangeBps}
            onChange={(e) => setFutureSoraChangeBps(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>-150 bps (Heavy Cuts)</span>
            <span>-50 bps (Moderate Cuts)</span>
            <span>0 bps (Unchanged)</span>
            <span>+50 bps (Hikes)</span>
            <span>+150 bps</span>
          </div>
        </div>
      </div>
    </div>
  );
};
