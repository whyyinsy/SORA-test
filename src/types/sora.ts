export interface SoraDailyRate {
  date: string; // YYYY-MM-DD
  rate: number; // in percentage, e.g., 3.45 means 3.45%
  volumeMillionSgd: number; // Volume in SGD millions
  highQuartile?: number;
  lowQuartile?: number;
  calculationDays?: number; // n_i calendar days it applies for (e.g., 3 for Friday, 1 for weekday)
}

export interface MasBenchmarkRates {
  publishedDate: string; // e.g. "2026-10-02"
  effectiveDate: string; // e.g. "2026-10-01"
  overnightSora: number; // e.g. 3.42%
  oneMonthCompounded: number; // e.g. 3.38%
  threeMonthCompounded: number; // e.g. 3.46%
  sixMonthCompounded: number; // e.g. 3.52%
  soraIndex: number; // e.g. 1.14820
  aggregateVolumeMillionSgd: number;
  isCustomOverride?: boolean;
}

export type SoraBenchmarkTenor = '1M' | '3M' | '6M' | 'CUSTOM';

export type PaymentFrequency = 'MONTHLY';

export type RepaymentType = 'PRINCIPAL_AND_INTEREST' | 'INTEREST_ONLY';

export interface MortgageInputs {
  loanAmount: number; // in SGD
  tenureYears: number; // 1 to 35
  benchmarkTenor: SoraBenchmarkTenor;
  bankSpread: number; // in percentage, e.g. 0.70 means 0.70%
  customBenchmarkRate?: number;
  repaymentType: RepaymentType;
  propertyValue: number; // for LTV calculation
  isFirstProperty: boolean;
  prepaymentAmount?: number;
  prepaymentMonth?: number;
}

export interface MonthlyAmortizationItem {
  month: number;
  year: number;
  dateStr: string;
  openingBalance: number;
  monthlyPayment: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
  applicableRate: number;
}

export interface YearlyAmortizationItem {
  year: number;
  openingBalance: number;
  totalPayment: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface AmortizationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  applicableRate: number;
  monthlySchedule: MonthlyAmortizationItem[];
  yearlySchedule: YearlyAmortizationItem[];
  interestSavedWithPrepayment?: number;
  monthsSavedWithPrepayment?: number;
}

export interface DailyCompoundingRecord {
  date: string;
  calendarDays: number; // n_i
  overnightRate: number; // r_i in %
  dailyCompoundingFactor: number; // (1 + r_i * n_i / 365)
  cumulativeProductFactor: number;
  accruedInterestSgd: number;
  cumulativeInterestSgd: number;
}

export interface DailyCompoundingSummary {
  startDate: string;
  endDate: string;
  totalCalendarDays: number;
  businessDays: number;
  principalAmount: number;
  compoundedAnnualRate: number; // in %
  simpleAverageRate: number; // in %
  totalInterestAccrued: number;
  records: DailyCompoundingRecord[];
}

export interface TdsrInputs {
  monthlyGrossIncome: number;
  otherMonthlyDebtCommitments: number; // car loans, personal loans, credit card min
  propertyValue: number;
  isFirstProperty: boolean;
  loanTenureYears: number;
  proposedLoanAmount: number;
  masStressTestRate: number; // MAS mandated floor rate, currently 4.0%
}

export interface TdsrResult {
  tdsrRatio: number; // in %
  isTdsrCompliant: boolean; // <= 55%
  maxEligibleMonthlyDebt: number;
  maxEligibleInstalment: number;
  maxEligibleLoanAmount: number;
  stressTestMonthlyPayment: number;
  ltvRatio: number;
  maxPermissibleLtv: number;
  isLtvCompliant: boolean;
}
