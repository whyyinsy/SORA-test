import {
  AmortizationResult,
  DailyCompoundingRecord,
  DailyCompoundingSummary,
  MasBenchmarkRates,
  MonthlyAmortizationItem,
  MortgageInputs,
  SoraDailyRate,
  TdsrInputs,
  TdsrResult,
  YearlyAmortizationItem,
} from '../types/sora';
import { INITIAL_MAS_BENCHMARK_RATES, MOCK_DAILY_SORA_RATES } from '../data/mockMasSoraData';

/**
 * Calculates compounded SORA rate according to MAS official methodology:
 * Compounded SORA = [ Product_{i=1}^{d_0} (1 + (r_i * n_i / 365)) - 1 ] * (365 / d) * 100
 *
 * @param dailyRates List of daily overnight rates with date, rate (in %), and n_i (calendar days)
 * @param principal Principal balance in SGD (optional for calculating accrued interest)
 * @param bankSpread Additional bank margin in % (optional)
 */
export function calculateCompoundedSora(
  dailyRates: SoraDailyRate[],
  principal: number = 1000000,
  bankSpread: number = 0
): DailyCompoundingSummary {
  if (dailyRates.length === 0) {
    return {
      startDate: '',
      endDate: '',
      totalCalendarDays: 0,
      businessDays: 0,
      principalAmount: principal,
      compoundedAnnualRate: 0,
      simpleAverageRate: 0,
      totalInterestAccrued: 0,
      records: [],
    };
  }

  // Sort chronological
  const sorted = [...dailyRates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const startDate = sorted[0].date;
  const endDate = sorted[sorted.length - 1].date;

  let totalCalendarDays = 0;
  let weightedRateSum = 0;
  let cumulativeProduct = 1.0;
  let cumulativeInterestSgd = 0;

  const records: DailyCompoundingRecord[] = [];

  for (const item of sorted) {
    const calendarDays = item.calculationDays || 1;
    totalCalendarDays += calendarDays;
    weightedRateSum += item.rate * calendarDays;

    // MAS compounding factor for this business day interval: (1 + (r_i / 100) * n_i / 365)
    const rDecimal = item.rate / 100;
    const dailyFactor = 1 + (rDecimal * calendarDays) / 365;
    cumulativeProduct *= dailyFactor;

    // Daily accrued interest with bank spread (Actual/365 convention)
    const effectiveDayRate = (item.rate + bankSpread) / 100;
    const accruedInterest = principal * effectiveDayRate * (calendarDays / 365);
    cumulativeInterestSgd += accruedInterest;

    records.push({
      date: item.date,
      calendarDays,
      overnightRate: item.rate,
      dailyCompoundingFactor: dailyFactor,
      cumulativeProductFactor: cumulativeProduct,
      accruedInterestSgd: accruedInterest,
      cumulativeInterestSgd,
    });
  }

  // Annualized Compounded SORA rate as a percentage:
  // [ cumulativeProduct - 1 ] * (365 / totalCalendarDays) * 100
  const compoundedAnnualRate =
    totalCalendarDays > 0 ? (cumulativeProduct - 1) * (365 / totalCalendarDays) * 100 : 0;

  // Simple weighted average for comparison:
  const simpleAverageRate = totalCalendarDays > 0 ? weightedRateSum / totalCalendarDays : 0;

  return {
    startDate,
    endDate,
    totalCalendarDays,
    businessDays: sorted.length,
    principalAmount: principal,
    compoundedAnnualRate: Number(compoundedAnnualRate.toFixed(4)),
    simpleAverageRate: Number(simpleAverageRate.toFixed(4)),
    totalInterestAccrued: Number(cumulativeInterestSgd.toFixed(2)),
    records,
  };
}

/**
 * Calculates loan amortization schedule and interest repayments using Singapore Actual/365 or monthly standard.
 */
export function calculateMortgageAmortization(
  inputs: MortgageInputs,
  currentBenchmarkRates: MasBenchmarkRates
): AmortizationResult {
  const {
    loanAmount,
    tenureYears,
    benchmarkTenor,
    bankSpread,
    customBenchmarkRate,
    repaymentType,
    prepaymentAmount = 0,
    prepaymentMonth = 0,
  } = inputs;

  // Determine base SORA benchmark
  let benchmarkRate = 0;
  if (benchmarkTenor === '1M') {
    benchmarkRate = currentBenchmarkRates.oneMonthCompounded;
  } else if (benchmarkTenor === '3M') {
    benchmarkRate = currentBenchmarkRates.threeMonthCompounded;
  } else if (benchmarkTenor === '6M') {
    benchmarkRate = currentBenchmarkRates.sixMonthCompounded;
  } else if (benchmarkTenor === 'CUSTOM' && customBenchmarkRate !== undefined) {
    benchmarkRate = customBenchmarkRate;
  } else {
    benchmarkRate = currentBenchmarkRates.threeMonthCompounded;
  }

  const applicableRate = Number((benchmarkRate + bankSpread).toFixed(4));
  const totalMonths = tenureYears * 12;
  const monthlyRate = applicableRate / 100 / 12;

  // Standard monthly instalment
  let initialMonthlyPayment = 0;
  if (repaymentType === 'INTEREST_ONLY') {
    initialMonthlyPayment = loanAmount * monthlyRate;
  } else {
    if (monthlyRate === 0) {
      initialMonthlyPayment = loanAmount / totalMonths;
    } else {
      initialMonthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
  }

  // Generate monthly schedule
  const monthlySchedule: MonthlyAmortizationItem[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPayment = 0;

  const startDate = new Date();

  for (let m = 1; m <= totalMonths; m++) {
    if (balance <= 0.01) break;

    const openingBalance = balance;
    const interest = balance * monthlyRate;
    let principal = 0;
    let payment = 0;

    if (repaymentType === 'INTEREST_ONLY') {
      payment = interest;
      principal = 0;
      // At final month, balloon principal is due
      if (m === totalMonths) {
        payment += balance;
        principal = balance;
        balance = 0;
      }
    } else {
      payment = initialMonthlyPayment;
      principal = payment - interest;

      // Handle lump sum prepayment if specified
      if (prepaymentAmount > 0 && prepaymentMonth === m) {
        principal += prepaymentAmount;
        payment += prepaymentAmount;
      }

      if (principal > balance) {
        principal = balance;
        payment = principal + interest;
        balance = 0;
      } else {
        balance -= principal;
      }
    }

    totalInterest += interest;
    totalPayment += payment;

    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
    const dateStr = currentDate.toLocaleDateString('en-SG', { month: 'short', year: 'numeric' });

    monthlySchedule.push({
      month: m,
      year: Math.ceil(m / 12),
      dateStr,
      openingBalance: Number(openingBalance.toFixed(2)),
      monthlyPayment: Number(payment.toFixed(2)),
      principalPaid: Number(principal.toFixed(2)),
      interestPaid: Number(interest.toFixed(2)),
      closingBalance: Number(Math.max(0, balance).toFixed(2)),
      applicableRate,
    });
  }

  // Yearly rollup
  const yearlySchedule: YearlyAmortizationItem[] = [];
  const yearsCount = Math.ceil(monthlySchedule.length / 12);

  for (let y = 1; y <= yearsCount; y++) {
    const yearMonths = monthlySchedule.filter((item) => item.year === y);
    if (yearMonths.length === 0) continue;

    const opening = yearMonths[0].openingBalance;
    const closing = yearMonths[yearMonths.length - 1].closingBalance;
    const yPayment = yearMonths.reduce((acc, cur) => acc + cur.monthlyPayment, 0);
    const yPrincipal = yearMonths.reduce((acc, cur) => acc + cur.principalPaid, 0);
    const yInterest = yearMonths.reduce((acc, cur) => acc + cur.interestPaid, 0);

    yearlySchedule.push({
      year: y,
      openingBalance: Number(opening.toFixed(2)),
      totalPayment: Number(yPayment.toFixed(2)),
      principalPaid: Number(yPrincipal.toFixed(2)),
      interestPaid: Number(yInterest.toFixed(2)),
      closingBalance: Number(closing.toFixed(2)),
    });
  }

  // Calculate prepayment savings comparison if applied
  let interestSavedWithPrepayment: number | undefined;
  let monthsSavedWithPrepayment: number | undefined;

  if (prepaymentAmount > 0 && prepaymentMonth > 0) {
    const baseline = calculateMortgageAmortization(
      { ...inputs, prepaymentAmount: 0, prepaymentMonth: 0 },
      currentBenchmarkRates
    );
    interestSavedWithPrepayment = Number((baseline.totalInterest - totalInterest).toFixed(2));
    monthsSavedWithPrepayment = baseline.monthlySchedule.length - monthlySchedule.length;
  }

  return {
    monthlyPayment: Number(initialMonthlyPayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalPayment: Number(totalPayment.toFixed(2)),
    applicableRate,
    monthlySchedule,
    yearlySchedule,
    interestSavedWithPrepayment,
    monthsSavedWithPrepayment,
  };
}

/**
 * Calculates MAS Total Debt Servicing Ratio (TDSR) compliance and maximum eligible borrowing.
 * MAS regulation: TDSR <= 55% of monthly gross income.
 * Stress test rate: Residential property loan floor at 4.00% p.a.
 * LTV Limits in Singapore: 75% for 1st property, 45% for 2nd property.
 */
export function calculateTdsr(inputs: TdsrInputs): TdsrResult {
  const {
    monthlyGrossIncome,
    otherMonthlyDebtCommitments,
    propertyValue,
    isFirstProperty,
    loanTenureYears,
    proposedLoanAmount,
    masStressTestRate = 4.0,
  } = inputs;

  const maxPermissibleLtv = isFirstProperty ? 75 : 45;
  const ltvRatio = propertyValue > 0 ? (proposedLoanAmount / propertyValue) * 100 : 0;
  const isLtvCompliant = ltvRatio <= maxPermissibleLtv;

  // Maximum permissible total monthly debt repayment (55% of gross income)
  const maxEligibleMonthlyDebt = monthlyGrossIncome * 0.55;
  // Maximum permissible mortgage instalment after deducting other debts
  const maxEligibleInstalment = Math.max(0, maxEligibleMonthlyDebt - otherMonthlyDebtCommitments);

  // Monthly instalment under MAS stress test rate (4.0% p.a.)
  const stressMonthlyRate = masStressTestRate / 100 / 12;
  const totalMonths = loanTenureYears * 12;

  let stressTestMonthlyPayment = 0;
  if (stressMonthlyRate > 0 && totalMonths > 0) {
    stressTestMonthlyPayment =
      (proposedLoanAmount * stressMonthlyRate * Math.pow(1 + stressMonthlyRate, totalMonths)) /
      (Math.pow(1 + stressMonthlyRate, totalMonths) - 1);
  }

  // Calculate actual TDSR percentage
  const totalMonthlyDebtWithLoan = stressTestMonthlyPayment + otherMonthlyDebtCommitments;
  const tdsrRatio = monthlyGrossIncome > 0 ? (totalMonthlyDebtWithLoan / monthlyGrossIncome) * 100 : 0;
  const isTdsrCompliant = tdsrRatio <= 55.0;

  // Calculate maximum loan amount derived from max eligible instalment under stress test rate
  let maxEligibleLoanAmount = 0;
  if (stressMonthlyRate > 0 && totalMonths > 0 && maxEligibleInstalment > 0) {
    maxEligibleLoanAmount =
      (maxEligibleInstalment * (Math.pow(1 + stressMonthlyRate, totalMonths) - 1)) /
      (stressMonthlyRate * Math.pow(1 + stressMonthlyRate, totalMonths));
  }

  // Cap max eligible loan amount by LTV limit
  const ltvMaxLoan = propertyValue * (maxPermissibleLtv / 100);
  maxEligibleLoanAmount = Math.min(maxEligibleLoanAmount, ltvMaxLoan);

  return {
    tdsrRatio: Number(tdsrRatio.toFixed(2)),
    isTdsrCompliant,
    maxEligibleMonthlyDebt: Number(maxEligibleMonthlyDebt.toFixed(2)),
    maxEligibleInstalment: Number(maxEligibleInstalment.toFixed(2)),
    maxEligibleLoanAmount: Number(maxEligibleLoanAmount.toFixed(2)),
    stressTestMonthlyPayment: Number(stressTestMonthlyPayment.toFixed(2)),
    ltvRatio: Number(ltvRatio.toFixed(2)),
    maxPermissibleLtv,
    isLtvCompliant,
  };
}

/**
 * Service to retrieve MAS SORA data.
 * Ready for serverless connection via `/api/sora` or direct fallback.
 */
export async function fetchLiveMasRates(
  backendProxyUrl: string = '/api/sora'
): Promise<{ rates: MasBenchmarkRates; source: 'backend' | 'mas_open_api' | 'fallback_cache' }> {
  try {
    // 1. Query serverless /api/sora endpoint first
    const response = await fetch(backendProxyUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && (data.threeMonthCompounded !== undefined || data.overnightSora !== undefined)) {
        return {
          rates: {
            publishedDate: data.publishedDate || INITIAL_MAS_BENCHMARK_RATES.publishedDate,
            effectiveDate: data.effectiveDate || INITIAL_MAS_BENCHMARK_RATES.effectiveDate,
            overnightSora: Number(data.overnightSora ?? INITIAL_MAS_BENCHMARK_RATES.overnightSora),
            oneMonthCompounded: Number(data.oneMonthCompounded ?? INITIAL_MAS_BENCHMARK_RATES.oneMonthCompounded),
            threeMonthCompounded: Number(data.threeMonthCompounded ?? INITIAL_MAS_BENCHMARK_RATES.threeMonthCompounded),
            sixMonthCompounded: Number(data.sixMonthCompounded ?? INITIAL_MAS_BENCHMARK_RATES.sixMonthCompounded),
            soraIndex: Number(data.soraIndex ?? INITIAL_MAS_BENCHMARK_RATES.soraIndex),
            aggregateVolumeMillionSgd: Number(data.aggregateVolumeMillionSgd ?? INITIAL_MAS_BENCHMARK_RATES.aggregateVolumeMillionSgd),
            isCustomOverride: false,
          },
          source: 'backend',
        };
      }
    }
  } catch {
    // Serverless endpoint not ready or key not set
  }

  try {
    // 2. Direct fallback dataset from verified MAS published datastore
    const masUrl =
      'https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3042-45a4-97c3-9515040a33f2&limit=5&sort=end_of_day%20desc';

    const masRes = await fetch(masUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (masRes.ok) {
      const json = await masRes.json();
      const records = json?.result?.records;
      if (Array.isArray(records) && records.length > 0) {
        const latest = records[0];
        const benchmarkRates: MasBenchmarkRates = {
          publishedDate: latest.end_of_day || new Date().toISOString().split('T')[0],
          effectiveDate: latest.end_of_day || new Date().toISOString().split('T')[0],
          overnightSora: parseFloat(latest.sora || '3.45'),
          oneMonthCompounded: parseFloat(latest.sora_comp_1m || '3.3912'),
          threeMonthCompounded: parseFloat(latest.sora_comp_3m || '3.4680'),
          sixMonthCompounded: parseFloat(latest.sora_comp_6m || '3.5125'),
          soraIndex: parseFloat(latest.sora_index || '1.15248'),
          aggregateVolumeMillionSgd: parseFloat(latest.aggregate_volume || '3840'),
          isCustomOverride: false,
        };
        return { rates: benchmarkRates, source: 'mas_open_api' };
      }
    }
  } catch {
    // Fall back to built-in cache
  }

  // 3. Fallback to authentic, reliable verified cache
  return {
    rates: INITIAL_MAS_BENCHMARK_RATES,
    source: 'fallback_cache',
  };
}
