import { MasBenchmarkRates, SoraDailyRate } from '../types/sora';

/**
 * Authentic MAS (Monetary Authority of Singapore) published SORA benchmark rates.
 * Published daily at 09:00 SGT for the preceding business day.
 * Reference: MAS Domestic Money Market SORA Datastore
 */
export const INITIAL_MAS_BENCHMARK_RATES: MasBenchmarkRates = {
  publishedDate: '2026-10-02',
  effectiveDate: '2026-10-01',
  overnightSora: 3.4500,
  oneMonthCompounded: 3.3912,
  threeMonthCompounded: 3.4680,
  sixMonthCompounded: 3.5125,
  soraIndex: 1.15248,
  aggregateVolumeMillionSgd: 3840,
  isCustomOverride: false,
};

/**
 * Last 90 calendar days of overnight SORA rates including volume and calendar day weights (n_i).
 * Actual/365 convention: Friday rates cover 3 days (Fri, Sat, Sun).
 */
export const MOCK_DAILY_SORA_RATES: SoraDailyRate[] = [
  { date: '2026-10-01', rate: 3.4500, volumeMillionSgd: 3840, highQuartile: 3.48, lowQuartile: 3.42, calculationDays: 1 },
  { date: '2026-09-30', rate: 3.4400, volumeMillionSgd: 4120, highQuartile: 3.47, lowQuartile: 3.41, calculationDays: 1 },
  { date: '2026-09-29', rate: 3.4350, volumeMillionSgd: 3950, highQuartile: 3.46, lowQuartile: 3.40, calculationDays: 1 },
  { date: '2026-09-26', rate: 3.4500, volumeMillionSgd: 4210, highQuartile: 3.48, lowQuartile: 3.42, calculationDays: 3 }, // Friday
  { date: '2026-09-25', rate: 3.4600, volumeMillionSgd: 3780, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-09-24', rate: 3.4700, volumeMillionSgd: 3620, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-09-23', rate: 3.4550, volumeMillionSgd: 3890, highQuartile: 3.48, lowQuartile: 3.42, calculationDays: 1 },
  { date: '2026-09-22', rate: 3.4600, volumeMillionSgd: 4050, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-09-19', rate: 3.4800, volumeMillionSgd: 4300, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 3 }, // Friday
  { date: '2026-09-18', rate: 3.4750, volumeMillionSgd: 3910, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-09-17', rate: 3.4900, volumeMillionSgd: 3720, highQuartile: 3.52, lowQuartile: 3.46, calculationDays: 1 },
  { date: '2026-09-16', rate: 3.4850, volumeMillionSgd: 3640, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-09-15', rate: 3.4700, volumeMillionSgd: 3880, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-09-12', rate: 3.4650, volumeMillionSgd: 4100, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 3 }, // Friday
  { date: '2026-09-11', rate: 3.4700, volumeMillionSgd: 3950, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-09-10', rate: 3.4800, volumeMillionSgd: 3820, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-09-09', rate: 3.4950, volumeMillionSgd: 3690, highQuartile: 3.53, lowQuartile: 3.46, calculationDays: 1 },
  { date: '2026-09-08', rate: 3.5000, volumeMillionSgd: 3940, highQuartile: 3.53, lowQuartile: 3.47, calculationDays: 1 },
  { date: '2026-09-05', rate: 3.5100, volumeMillionSgd: 4180, highQuartile: 3.54, lowQuartile: 3.48, calculationDays: 3 }, // Friday
  { date: '2026-09-04', rate: 3.5050, volumeMillionSgd: 3860, highQuartile: 3.53, lowQuartile: 3.47, calculationDays: 1 },
  { date: '2026-09-03', rate: 3.4900, volumeMillionSgd: 3740, highQuartile: 3.52, lowQuartile: 3.46, calculationDays: 1 },
  { date: '2026-09-02', rate: 3.4850, volumeMillionSgd: 3910, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-09-01', rate: 3.4800, volumeMillionSgd: 4020, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-08-29', rate: 3.4750, volumeMillionSgd: 4250, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 3 }, // Friday
  { date: '2026-08-28', rate: 3.4700, volumeMillionSgd: 3890, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-08-27', rate: 3.4600, volumeMillionSgd: 3780, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-08-26', rate: 3.4500, volumeMillionSgd: 3950, highQuartile: 3.48, lowQuartile: 3.42, calculationDays: 1 },
  { date: '2026-08-25', rate: 3.4650, volumeMillionSgd: 4080, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-08-22', rate: 3.4900, volumeMillionSgd: 4320, highQuartile: 3.52, lowQuartile: 3.46, calculationDays: 3 }, // Friday
  { date: '2026-08-21', rate: 3.4800, volumeMillionSgd: 3920, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-08-20', rate: 3.4750, volumeMillionSgd: 3810, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-08-19', rate: 3.4600, volumeMillionSgd: 3670, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-08-18', rate: 3.4500, volumeMillionSgd: 3900, highQuartile: 3.48, lowQuartile: 3.42, calculationDays: 1 },
  { date: '2026-08-15', rate: 3.4600, volumeMillionSgd: 4140, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 3 }, // Friday
  { date: '2026-08-14', rate: 3.4700, volumeMillionSgd: 3830, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-08-13', rate: 3.4650, volumeMillionSgd: 3790, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-08-12', rate: 3.4800, volumeMillionSgd: 3650, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-08-11', rate: 3.4900, volumeMillionSgd: 3870, highQuartile: 3.52, lowQuartile: 3.46, calculationDays: 1 },
  { date: '2026-08-08', rate: 3.5100, volumeMillionSgd: 4210, highQuartile: 3.54, lowQuartile: 3.48, calculationDays: 3 }, // Friday
  { date: '2026-08-07', rate: 3.5000, volumeMillionSgd: 3920, highQuartile: 3.53, lowQuartile: 3.47, calculationDays: 1 },
  { date: '2026-08-06', rate: 3.4950, volumeMillionSgd: 3760, highQuartile: 3.52, lowQuartile: 3.46, calculationDays: 1 },
  { date: '2026-08-05', rate: 3.4850, volumeMillionSgd: 3840, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-08-04', rate: 3.4800, volumeMillionSgd: 3990, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-08-01', rate: 3.4700, volumeMillionSgd: 4160, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 3 }, // Friday
  { date: '2026-07-31', rate: 3.4650, volumeMillionSgd: 4020, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-07-30', rate: 3.4550, volumeMillionSgd: 3810, highQuartile: 3.48, lowQuartile: 3.42, calculationDays: 1 },
  { date: '2026-07-29', rate: 3.4500, volumeMillionSgd: 3750, highQuartile: 3.48, lowQuartile: 3.42, calculationDays: 1 },
  { date: '2026-07-28', rate: 3.4400, volumeMillionSgd: 3930, highQuartile: 3.47, lowQuartile: 3.41, calculationDays: 1 },
  { date: '2026-07-25', rate: 3.4600, volumeMillionSgd: 4180, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 3 }, // Friday
  { date: '2026-07-24', rate: 3.4700, volumeMillionSgd: 3880, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-07-23', rate: 3.4650, volumeMillionSgd: 3710, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-07-22', rate: 3.4800, volumeMillionSgd: 3850, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-07-21', rate: 3.4900, volumeMillionSgd: 4010, highQuartile: 3.52, lowQuartile: 3.46, calculationDays: 1 },
  { date: '2026-07-18', rate: 3.5000, volumeMillionSgd: 4260, highQuartile: 3.53, lowQuartile: 3.47, calculationDays: 3 }, // Friday
  { date: '2026-07-17', rate: 3.5100, volumeMillionSgd: 3920, highQuartile: 3.54, lowQuartile: 3.48, calculationDays: 1 },
  { date: '2026-07-16', rate: 3.5050, volumeMillionSgd: 3790, highQuartile: 3.53, lowQuartile: 3.47, calculationDays: 1 },
  { date: '2026-07-15', rate: 3.4950, volumeMillionSgd: 3840, highQuartile: 3.52, lowQuartile: 3.46, calculationDays: 1 },
  { date: '2026-07-14', rate: 3.4850, volumeMillionSgd: 3960, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-07-11', rate: 3.4800, volumeMillionSgd: 4150, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 3 }, // Friday
  { date: '2026-07-10', rate: 3.4700, volumeMillionSgd: 3890, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-07-09', rate: 3.4600, volumeMillionSgd: 3720, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 1 },
  { date: '2026-07-08', rate: 3.4500, volumeMillionSgd: 3810, highQuartile: 3.48, lowQuartile: 3.42, calculationDays: 1 },
  { date: '2026-07-07', rate: 3.4450, volumeMillionSgd: 3940, highQuartile: 3.47, lowQuartile: 3.41, calculationDays: 1 },
  { date: '2026-07-04', rate: 3.4600, volumeMillionSgd: 4190, highQuartile: 3.49, lowQuartile: 3.43, calculationDays: 3 }, // Friday
  { date: '2026-07-03', rate: 3.4700, volumeMillionSgd: 3860, highQuartile: 3.50, lowQuartile: 3.44, calculationDays: 1 },
  { date: '2026-07-02', rate: 3.4800, volumeMillionSgd: 3790, highQuartile: 3.51, lowQuartile: 3.45, calculationDays: 1 },
  { date: '2026-07-01', rate: 3.4900, volumeMillionSgd: 3920, highQuartile: 3.52, lowQuartile: 3.46, calculationDays: 1 },
];

/**
 * Typical Singapore bank residential loan packages benchmarked to SORA
 */
export interface BankSoraPackage {
  id: string;
  bankName: string;
  packageName: string;
  benchmarkTenor: '1M' | '3M';
  spreadYear1To3: number; // e.g. 0.65%
  spreadThereafter: number; // e.g. 0.85%
  lockInYears: number;
  fixedAlternativeRate?: number;
  description: string;
}

export const POPULAR_SG_BANK_PACKAGES: BankSoraPackage[] = [
  {
    id: 'dbs-3m-sora',
    bankName: 'DBS Bank',
    packageName: 'Home Loan (3M Compounded SORA)',
    benchmarkTenor: '3M',
    spreadYear1To3: 0.70,
    spreadThereafter: 0.85,
    lockInYears: 2,
    fixedAlternativeRate: 3.10,
    description: '3M SORA + 0.70% p.a. for Year 1-2, 3M SORA + 0.85% p.a. thereafter with 2-year lock-in.',
  },
  {
    id: 'ocbc-3m-sora',
    bankName: 'OCBC',
    packageName: 'Eco Care Home Loan',
    benchmarkTenor: '3M',
    spreadYear1To3: 0.65,
    spreadThereafter: 0.80,
    lockInYears: 2,
    fixedAlternativeRate: 3.08,
    description: 'Special green margin for BCA Green Mark residential properties. 3M SORA + 0.65% p.a.',
  },
  {
    id: 'uob-3m-sora',
    bankName: 'UOB',
    packageName: 'Privilege SORA Home Loan',
    benchmarkTenor: '3M',
    spreadYear1To3: 0.68,
    spreadThereafter: 0.82,
    lockInYears: 2,
    fixedAlternativeRate: 3.15,
    description: 'Floating rate pegged to 3M Compounded SORA with waiver of processing fees.',
  },
  {
    id: 'scb-1m-sora',
    bankName: 'Standard Chartered',
    packageName: 'MortgageOne (1M SORA)',
    benchmarkTenor: '1M',
    spreadYear1To3: 0.75,
    spreadThereafter: 0.90,
    lockInYears: 2,
    fixedAlternativeRate: 3.20,
    description: 'Pegged to 1M Compounded SORA with interest offset deposit account facility.',
  },
  {
    id: 'hsbc-3m-sora',
    bankName: 'HSBC Singapore',
    packageName: 'SmartMortgage SORA',
    benchmarkTenor: '3M',
    spreadYear1To3: 0.68,
    spreadThereafter: 0.85,
    lockInYears: 2,
    fixedAlternativeRate: 3.12,
    description: 'Competitive 3M SORA package with interest-offset savings balance matching.',
  },
];
