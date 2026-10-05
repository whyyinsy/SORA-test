import React, { useState, useMemo } from 'react';
import { TdsrInputs } from '../types/sora';
import { calculateTdsr } from '../services/soraService';
import { ShieldCheck, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const TdsrCalculator: React.FC = () => {
  const [monthlyGrossIncome, setMonthlyGrossIncome] = useState<number>(12000);
  const [otherMonthlyDebtCommitments, setOtherMonthlyDebtCommitments] = useState<number>(1200);
  const [propertyValue, setPropertyValue] = useState<number>(1600000);
  const [proposedLoanAmount, setProposedLoanAmount] = useState<number>(1000000);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(25);
  const [isFirstProperty, setIsFirstProperty] = useState<boolean>(true);
  const [masStressTestRate, setMasStressTestRate] = useState<number>(4.0);

  const inputs: TdsrInputs = useMemo(
    () => ({
      monthlyGrossIncome,
      otherMonthlyDebtCommitments,
      propertyValue,
      isFirstProperty,
      loanTenureYears,
      proposedLoanAmount,
      masStressTestRate,
    }),
    [
      monthlyGrossIncome,
      otherMonthlyDebtCommitments,
      propertyValue,
      isFirstProperty,
      loanTenureYears,
      proposedLoanAmount,
      masStressTestRate,
    ]
  );

  const result = useMemo(() => calculateTdsr(inputs), [inputs]);

  return (
    <div className="space-y-6">
      {/* Informational Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Monetary Authority of Singapore (MAS) Prudential Limits</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          MAS TDSR & Stress-Test Borrowing Eligibility
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl">
          Under MAS regulations, total monthly debt obligations cannot exceed 55% of gross monthly
          income. All residential property loans must be stress-tested against a minimum interest floor
          of 4.00% p.a.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Financial & Property Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gross Monthly Income (SGD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  S$
                </span>
                <input
                  type="number"
                  step="500"
                  value={monthlyGrossIncome}
                  onChange={(e) => setMonthlyGrossIncome(Math.max(100, Number(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Combined household income if co-borrowing
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Other Monthly Commitments (SGD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  S$
                </span>
                <input
                  type="number"
                  step="100"
                  value={otherMonthlyDebtCommitments}
                  onChange={(e) =>
                    setOtherMonthlyDebtCommitments(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Car loans, personal loans, minimum card dues
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  onChange={(e) => setPropertyValue(Math.max(1000, Number(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Loan Amount (SGD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  S$
                </span>
                <input
                  type="number"
                  step="25000"
                  value={proposedLoanAmount}
                  onChange={(e) =>
                    setProposedLoanAmount(Math.max(1000, Number(e.target.value) || 0))
                  }
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tenure (Years)
              </label>
              <input
                type="number"
                min="5"
                max="35"
                value={loanTenureYears}
                onChange={(e) =>
                  setLoanTenureYears(Math.max(5, Math.min(35, Number(e.target.value) || 25)))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MAS Stress Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="6.0"
                value={masStressTestRate}
                onChange={(e) => setMasStressTestRate(Number(e.target.value) || 4.0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <div className="text-[10px] text-slate-400 mt-1">Regulatory floor: 4.00%</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Portfolio
              </label>
              <select
                value={isFirstProperty ? 'first' : 'second'}
                onChange={(e) => setIsFirstProperty(e.target.value === 'first')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                <option value="first">1st Housing Loan (75% LTV)</option>
                <option value="second">2nd+ Housing Loan (45% LTV)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Results & Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-xl border ${
              result.isTdsrCompliant && result.isLtvCompliant
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-red-950/90 text-white border-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {result.isTdsrCompliant && result.isLtvCompliant ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <h4 className="text-sm font-bold uppercase tracking-wider">
                {result.isTdsrCompliant && result.isLtvCompliant
                  ? 'Compliant with MAS Regulations'
                  : 'Exceeds MAS Regulatory Thresholds'}
              </h4>
            </div>

            {/* Calculated TDSR Ratio */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="text-xs text-slate-300">Your Stress-Tested TDSR:</div>
              <div className="text-3xl font-extrabold font-mono tabular-nums mt-0.5">
                {result.tdsrRatio}%
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                MAS Maximum Limit:{' '}
                <strong className="text-emerald-300 font-mono">55.0%</strong>
              </div>
            </div>

            {/* LTV Status */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-300">Loan-to-Value (LTV):</span>
                <div className="font-mono font-bold text-sm mt-0.5">{result.ltvRatio}%</div>
                <div className="text-[10px] text-slate-400">Max: {result.maxPermissibleLtv}%</div>
              </div>
              <div>
                <span className="text-slate-300">Stress Monthly Payment:</span>
                <div className="font-mono font-bold text-sm mt-0.5">
                  ${result.stressTestMonthlyPayment.toLocaleString()} SGD
                </div>
                <div className="text-[10px] text-slate-400">@ {masStressTestRate.toFixed(2)}% floor</div>
              </div>
            </div>
          </div>

          {/* Maximum Eligibility Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Maximum Borrowing Potential
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Max Permissible Total Monthly Debt:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${result.maxEligibleMonthlyDebt.toLocaleString()} SGD
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Max Eligible Mortgage Instalment:</span>
                <span className="font-mono font-bold text-emerald-700">
                  ${result.maxEligibleInstalment.toLocaleString()} SGD
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-600">Maximum Eligible Loan Amount:</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  ${result.maxEligibleLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} SGD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
