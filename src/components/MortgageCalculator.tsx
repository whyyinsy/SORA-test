import React, { useState, useMemo } from 'react';
import { MasBenchmarkRates, MortgageInputs, SoraBenchmarkTenor, RepaymentType } from '../types/sora';
import { calculateMortgageAmortization } from '../services/soraService';
import { AmortizationTable } from './AmortizationTable';
import { POPULAR_SG_BANK_PACKAGES } from '../data/mockMasSoraData';
import { DollarSign, Percent, Calendar, ShieldCheck, ArrowRight, Zap, PiggyBank } from 'lucide-react';

interface MortgageCalculatorProps {
  rates: MasBenchmarkRates;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ rates }) => {
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [propertyValue, setPropertyValue] = useState<number>(1350000);
  const [tenureYears, setTenureYears] = useState<number>(25);
  const [benchmarkTenor, setBenchmarkTenor] = useState<SoraBenchmarkTenor>('3M');
  const [bankSpread, setBankSpread] = useState<number>(0.70);
  const [customBenchmarkRate, setCustomBenchmarkRate] = useState<number>(3.468);
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('PRINCIPAL_AND_INTEREST');

  // Prepayment feature
  const [showPrepayment, setShowPrepayment] = useState<boolean>(false);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(50000);
  const [prepaymentMonth, setPrepaymentMonth] = useState<number>(24);

  // Selected bank package
  const [selectedPackageId, setSelectedPackageId] = useState<string>('dbs-3m-sora');

  const inputs: MortgageInputs = useMemo(
    () => ({
      loanAmount,
      tenureYears,
      benchmarkTenor,
      bankSpread,
      customBenchmarkRate,
      repaymentType,
      propertyValue,
      isFirstProperty: true,
      prepaymentAmount: showPrepayment ? prepaymentAmount : 0,
      prepaymentMonth: showPrepayment ? prepaymentMonth : 0,
    }),
    [
      loanAmount,
      tenureYears,
      benchmarkTenor,
      bankSpread,
      customBenchmarkRate,
      repaymentType,
      propertyValue,
      showPrepayment,
      prepaymentAmount,
      prepaymentMonth,
    ]
  );

  const amortization = useMemo(
    () => calculateMortgageAmortization(inputs, rates),
    [inputs, rates]
  );

  const handleSelectBankPackage = (pkgId: string) => {
    const pkg = POPULAR_SG_BANK_PACKAGES.find((p) => p.id === pkgId);
    if (pkg) {
      setSelectedPackageId(pkg.id);
      setBenchmarkTenor(pkg.benchmarkTenor);
      setBankSpread(pkg.spreadYear1To3);
    }
  };

  const currentBenchmarkValue = useMemo(() => {
    switch (benchmarkTenor) {
      case '1M':
        return rates.oneMonthCompounded;
      case '3M':
        return rates.threeMonthCompounded;
      case '6M':
        return rates.sixMonthCompounded;
      case 'CUSTOM':
        return customBenchmarkRate;
    }
  }, [benchmarkTenor, rates, customBenchmarkRate]);

  const principalRatio = useMemo(() => {
    if (amortization.totalPayment === 0) return 0;
    return (loanAmount / amortization.totalPayment) * 100;
  }, [loanAmount, amortization.totalPayment]);

  const interestRatio = 100 - principalRatio;

  return (
    <div className="space-y-6">
      {/* Top Bank Package Quick Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Popular Singapore SORA Loan Packages
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Click package to load standard bank margins & reset tenors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {POPULAR_SG_BANK_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleSelectBankPackage(pkg.id)}
              className={`p-2.5 text-left rounded-lg border transition-all ${
                selectedPackageId === pkg.id
                  ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{pkg.bankName}</span>
                <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                  +{pkg.spreadYear1To3.toFixed(2)}%
                </span>
              </div>
              <div className="text-[11px] text-slate-600 truncate mt-0.5">{pkg.packageName}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {pkg.benchmarkTenor} SORA · {pkg.lockInYears}Y Lock-in
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Loan Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Loan & Rate Parameters
          </h2>

          {/* Loan Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Loan Amount (SGD)
              </label>
              <span className="text-xs font-mono tabular-nums font-semibold text-slate-900">
                ${loanAmount.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                S$
              </span>
              <input
                type="number"
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(10000, Number(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            {/* Quick amount shortcuts */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[500000, 800000, 1000000, 1500000, 2000000, 3000000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setLoanAmount(amt)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    loanAmount === amt
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ${(amt / 1000000).toFixed(amt >= 1000000 ? 1 : 2)}M
                </button>
              ))}
            </div>
          </div>

          {/* Property Valuation (for LTV) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Property Valuation (SGD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  S$
                </span>
                <input
                  type="number"
                  step="50000"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Math.max(10000, Number(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                LTV:{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {propertyValue > 0 ? ((loanAmount / propertyValue) * 100).toFixed(1) : 0}%
                </span>{' '}
                (MAS Max 75%)
              </div>
            </div>

            {/* Loan Tenure */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Loan Tenure (Years)
                </label>
                <span className="text-xs font-mono font-semibold text-slate-900">
                  {tenureYears} Years ({tenureYears * 12} Months)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>5 yrs</span>
                <span>15 yrs</span>
                <span>25 yrs</span>
                <span>35 yrs</span>
              </div>
            </div>
          </div>

          {/* SORA Benchmark Tenor & Spread */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SORA Benchmark Tenor
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['3M', '1M', '6M', 'CUSTOM'] as SoraBenchmarkTenor[]).map((tenor) => (
                  <button
                    key={tenor}
                    onClick={() => setBenchmarkTenor(tenor)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
                      benchmarkTenor === tenor
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>{tenor === 'CUSTOM' ? 'Custom' : `${tenor} SORA`}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {tenor === '1M' && `${rates.oneMonthCompounded.toFixed(3)}%`}
                      {tenor === '3M' && `${rates.threeMonthCompounded.toFixed(3)}%`}
                      {tenor === '6M' && `${rates.sixMonthCompounded.toFixed(3)}%`}
                      {tenor === 'CUSTOM' && `${customBenchmarkRate.toFixed(3)}%`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {benchmarkTenor === 'CUSTOM' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom SORA Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customBenchmarkRate}
                  onChange={(e) => setCustomBenchmarkRate(Number(e.target.value))}
                  className="w-full max-w-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}

            {/* Bank Spread / Margin */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Bank Margin / Spread (+% p.a.)
                </label>
                <span className="text-xs font-mono font-semibold text-slate-900">
                  +{bankSpread.toFixed(2)}% p.a.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                    +
                  </span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="5"
                    value={bankSpread}
                    onChange={(e) => setBankSpread(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-7 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                    %
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {[0.60, 0.65, 0.70, 0.75, 0.85].map((spread) => (
                    <button
                      key={spread}
                      onClick={() => setBankSpread(spread)}
                      className={`flex-1 py-2 text-xs font-mono rounded transition-colors ${
                        bankSpread === spread
                          ? 'bg-slate-900 text-white font-medium'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      +{spread.toFixed(2)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Repayment Type Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Repayment Structure
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRepaymentType('PRINCIPAL_AND_INTEREST')}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    repaymentType === 'PRINCIPAL_AND_INTEREST'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-semibold">Principal & Interest (Amortized)</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      repaymentType === 'PRINCIPAL_AND_INTEREST' ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Standard monthly instalment reducing balance over tenure
                  </div>
                </button>

                <button
                  onClick={() => setRepaymentType('INTEREST_ONLY')}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    repaymentType === 'INTEREST_ONLY'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-semibold">Interest Only</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      repaymentType === 'INTEREST_ONLY' ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Pay only monthly interest, principal repaid at term end
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Prepayment Simulator Toggle */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Prepayment & Interest Savings Simulator
                  </span>
                </div>
                <button
                  onClick={() => setShowPrepayment(!showPrepayment)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  {showPrepayment ? 'Disable' : 'Enable Lump-Sum Simulation'}
                </button>
              </div>

              {showPrepayment && (
                <div className="mt-3 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Lump Sum Prepayment (SGD)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={prepaymentAmount}
                      onChange={(e) => setPrepaymentAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Pay at Month #
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={tenureYears * 12}
                      value={prepaymentMonth}
                      onChange={(e) => setPrepaymentMonth(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Results & Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Key Card */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm border border-slate-800 space-y-5">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Monthly Repayment Instalment
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white mt-1">
                ${amortization.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>Total Rate:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {amortization.applicableRate.toFixed(4)}% p.a.
                </span>
                <span>({currentBenchmarkValue.toFixed(4)}% + {bankSpread.toFixed(2)}%)</span>
              </div>
            </div>

            {/* Financial Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Total Interest
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                  ${amortization.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Total Loan Repayment
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
                  ${amortization.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Visual Principal vs Interest Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400">
                  Principal: {principalRatio.toFixed(1)}% (${(loanAmount / 1000).toFixed(0)}k)
                </span>
                <span className="text-amber-400">
                  Interest: {interestRatio.toFixed(1)}% ($
                  {(amortization.totalInterest / 1000).toFixed(0)}k)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${principalRatio}%` }}
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${interestRatio}%` }}
                />
              </div>
            </div>

            {/* Prepayment Savings Badge if Active */}
            {showPrepayment && amortization.interestSavedWithPrepayment !== undefined && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-medium">Interest Saved:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${amortization.interestSavedWithPrepayment.toLocaleString()} SGD
                  </span>
                </div>
                {amortization.monthsSavedWithPrepayment !== undefined &&
                  amortization.monthsSavedWithPrepayment > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Tenure Shortened By:</span>
                      <span className="font-mono text-white">
                        {amortization.monthsSavedWithPrepayment} months (
                        {(amortization.monthsSavedWithPrepayment / 12).toFixed(1)} yrs)
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Quick Singapore Market Benchmark Insights Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Singapore Mortgage Mechanics
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">·</span>
                <span>
                  <strong>Compounded in Advance:</strong> 3M SORA looks back at the preceding 90
                  days to establish your rate for the upcoming quarter.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">·</span>
                <span>
                  <strong>Actual/365 Convention:</strong> Singapore SGD loans accrue daily interest
                  calculated as $(Principal \times Rate \times Days / 365)$.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">·</span>
                <span>
                  <strong>MAS TDSR Floor:</strong> Residential loans in Singapore are stress-tested
                  at a minimum of 4.00% to ensure affordability during rate peaks.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <AmortizationTable amortization={amortization} loanAmount={loanAmount} />
    </div>
  );
};
