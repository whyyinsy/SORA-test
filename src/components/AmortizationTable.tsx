import React, { useState, useMemo } from 'react';
import { AmortizationResult } from '../types/sora';
import { Download, Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface AmortizationTableProps {
  amortization: AmortizationResult;
  loanAmount: number;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({ amortization, loanAmount }) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24; // 2 years of monthly data per page

  // Filtered monthly records
  const filteredMonthly = useMemo(() => {
    if (!searchQuery) return amortization.monthlySchedule;
    return amortization.monthlySchedule.filter(
      (item) =>
        item.dateStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `year ${item.year}`.includes(searchQuery.toLowerCase()) ||
        `month ${item.month}`.includes(searchQuery.toLowerCase())
    );
  }, [amortization.monthlySchedule, searchQuery]);

  const totalMonthlyPages = Math.ceil(filteredMonthly.length / pageSize);
  const paginatedMonthly = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMonthly.slice(start, start + pageSize);
  }, [filteredMonthly, currentPage, pageSize]);

  // Export to CSV function
  const handleExportCsv = () => {
    const headers = ['Month', 'Year', 'Period', 'Opening Balance (SGD)', 'Monthly Payment (SGD)', 'Principal Paid (SGD)', 'Interest Paid (SGD)', 'Closing Balance (SGD)', 'Applicable Rate (%)'];
    const rows = amortization.monthlySchedule.map((row) => [
      row.month,
      row.year,
      `"${row.dateStr}"`,
      row.openingBalance.toFixed(2),
      row.monthlyPayment.toFixed(2),
      row.principalPaid.toFixed(2),
      row.interestPaid.toFixed(2),
      row.closingBalance.toFixed(2),
      row.applicableRate.toFixed(4),
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SORA_Loan_Amortization_Schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Amortization & Repayment Schedule
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Total Loan: ${loanAmount.toLocaleString()} SGD</span>
            <span aria-hidden="true">·</span>
            <span>Total Interest: ${amortization.totalInterest.toLocaleString()} SGD</span>
            <span aria-hidden="true">·</span>
            <span>{amortization.monthlySchedule.length} Monthly Instalments</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setViewMode('yearly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Summary
            </button>
            <button
              onClick={() => {
                setViewMode('monthly');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Breakdown
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Monthly Search Filter */}
      {viewMode === 'monthly' && (
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by month or year (e.g. 2027, Year 2)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="text-xs text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredMonthly.length)} of {filteredMonthly.length} months
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        {viewMode === 'yearly' ? (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-4">Year</th>
                <th className="py-2.5 px-4 text-right">Opening Balance</th>
                <th className="py-2.5 px-4 text-right">Annual Repayment</th>
                <th className="py-2.5 px-4 text-right text-emerald-700">Principal Paid</th>
                <th className="py-2.5 px-4 text-right text-amber-700">Interest Paid</th>
                <th className="py-2.5 px-4 text-right">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {amortization.yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                    Year {row.year}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-600">
                    ${row.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-900">
                    ${row.totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-emerald-600">
                    ${row.principalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-amber-600">
                    ${row.interestPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-800">
                    ${row.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Period</th>
                <th className="py-2.5 px-4 text-right">Opening Balance</th>
                <th className="py-2.5 px-4 text-right">Monthly Payment</th>
                <th className="py-2.5 px-4 text-right text-emerald-700">Principal</th>
                <th className="py-2.5 px-4 text-right text-amber-700">Interest</th>
                <th className="py-2.5 px-4 text-right">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {paginatedMonthly.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-4 text-slate-400 font-mono">{row.month}</td>
                  <td className="py-2 px-4 font-sans font-medium text-slate-900">
                    {row.dateStr}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-600">
                    ${row.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-slate-900">
                    ${row.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-600">
                    ${row.principalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-4 text-right text-amber-600">
                    ${row.interestPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-slate-800">
                    ${row.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar for Monthly View */}
      {viewMode === 'monthly' && totalMonthlyPages > 1 && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-600 font-medium">
            Page {currentPage} of {totalMonthlyPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalMonthlyPages, p + 1))}
            disabled={currentPage === totalMonthlyPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
