import { DepositoCalculationResult, FinancialHealth, HealthStatus } from '../types/finance';

/**
 * Formats number into Indonesian Rupiah format (e.g. Rp 15.000.000)
 */
export function formatRupiah(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }

  if (compact && Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

/**
 * Formats ISO date string to Indonesian readable format (e.g. 02 Okt 2026)
 */
export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Returns current local year and month string format YYYY-MM (e.g. "2026-10")
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Extracts YYYY-MM from an ISO date or date string
 */
export function getYearMonthFromDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }
  } catch {
    // fallback
  }
  return dateStr.slice(0, 7);
}

/**
 * Formats YYYY-MM to Indonesian string (e.g. "Oktober 2026")
 */
export function formatMonthYearIndo(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return yearMonthStr;

  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Formats date range for month (e.g. "1 Okt 2026 - 31 Okt 2026")
 */
export function getMonthDateRangeIndo(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return '';

  const lastDay = new Date(year, month, 0).getDate();
  const monthShort = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(year, month - 1, 1));
  return `1 ${monthShort} ${year} - ${lastDay} ${monthShort} ${year}`;
}

/**
 * Checks whether a date string falls inside the given YYYY-MM month
 */
export function isDateInMonth(dateStr: string, yearMonthStr: string): boolean {
  if (!dateStr || !yearMonthStr) return false;
  if (dateStr.startsWith(yearMonthStr)) return true;
  return getYearMonthFromDate(dateStr) === yearMonthStr;
}

/**
 * Shifts year-month string forward or backward by a number of months
 */
export function shiftYearMonth(yearMonthStr: string, deltaMonths: number): string {
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const year = Number(yearStr) || new Date().getFullYear();
  const month = Number(monthStr) || new Date().getMonth() + 1;
  const target = new Date(year, month - 1 + deltaMonths, 1);
  const targetYear = target.getFullYear();
  const targetMonth = String(target.getMonth() + 1).padStart(2, '0');
  return `${targetYear}-${targetMonth}`;
}

/**
 * Bank Deposito & Compound Interest Calculator
 * Standard Indonesian bank formula:
 * - Deposito placement > Rp 7.500.000 has 20% PPh Final tax on interest.
 * - Tenor in months.
 */
export function calculateDeposito(
  principal: number,
  apyPercent: number,
  tenorMonths: number = 12,
  taxRatePercent: number = 20,
  autoCompound: boolean = false
): DepositoCalculationResult {
  // If principal <= 7,500,000, Indonesian tax is technically 0%, but configurable
  const effectiveTaxRate = principal <= 7_500_000 ? 0 : taxRatePercent;

  const grossAnnualYield = principal * (apyPercent / 100);
  const grossMonthlyYield = grossAnnualYield / 12;

  const netAnnualYield = grossAnnualYield * (1 - effectiveTaxRate / 100);
  const netMonthlyYield = grossMonthlyYield * (1 - effectiveTaxRate / 100);

  let maturityTotalWithPrincipal = principal;
  let totalNetInterestEarned = 0;

  if (autoCompound) {
    // Monthly compound interest formula with monthly tax deduction:
    // Balance_m = Balance_{m-1} * (1 + (apy/12 * (1 - tax/100)))
    const monthlyRate = (apyPercent / 100 / 12) * (1 - effectiveTaxRate / 100);
    maturityTotalWithPrincipal = principal * Math.pow(1 + monthlyRate, tenorMonths);
    totalNetInterestEarned = maturityTotalWithPrincipal - principal;
  } else {
    // Simple interest payout
    totalNetInterestEarned = netMonthlyYield * tenorMonths;
    maturityTotalWithPrincipal = principal + totalNetInterestEarned;
  }

  const totalGrossInterest = (grossMonthlyYield * tenorMonths);
  const totalTaxPaid = totalGrossInterest * (effectiveTaxRate / 100);

  return {
    principal,
    apyPercent,
    tenorMonths,
    taxRatePercent: effectiveTaxRate,
    grossAnnualYield,
    netAnnualYield,
    grossMonthlyYield,
    netMonthlyYield,
    maturityTotalWithPrincipal,
    totalNetInterestEarned,
    totalTaxPaid,
  };
}

/**
 * Diagnostic Engine: Financial Health Calculator
 * Assesses DSR, Savings Rate, and Buffer Runway according to Indonesian & global planning standards.
 */
export function calculateFinancialHealth(params: {
  totalIncome: number;
  totalFixedExpenses: number;
  totalDailyExpenses: number;
  totalSavings: number;
  totalLiquidAssets: number;
  depositoYieldTotal?: number;
}): FinancialHealth {
  const {
    totalIncome,
    totalFixedExpenses,
    totalDailyExpenses,
    totalSavings,
    totalLiquidAssets,
    depositoYieldTotal = 0,
  } = params;

  const effectiveIncome = Math.max(totalIncome, 1);
  const totalExpenses = totalFixedExpenses + totalDailyExpenses;

  // 1. Debt-to-Income / Fixed Obligation Ratio (DSR)
  // Ideal: <= 30%. Warning: 30%-35%. Critical: > 35%
  const dsrPercent = (totalFixedExpenses / effectiveIncome) * 100;

  // 2. Savings Ratio
  // Ideal: >= 20%. Moderate: 10%-20%. Critical: < 10%
  const savingsRatioPercent = (totalSavings / effectiveIncome) * 100;

  // 3. Emergency Runway (Months of living expenses covered by liquid reserves)
  // Ideal: >= 6 months (or >= 3 months for single/dual income). Critical: < 3 months
  const monthlyBurn = totalExpenses > 0 ? totalExpenses : 1_000_000;
  const emergencyRunwayMonths = totalLiquidAssets / monthlyBurn;

  // 4. Compute Health Score (0 - 100)
  let score = 0;

  // DSR evaluation (Max 35 pts)
  if (dsrPercent <= 30) {
    score += 35;
  } else if (dsrPercent <= 35) {
    score += 25;
  } else if (dsrPercent <= 45) {
    score += 15;
  } else {
    score += 5;
  }

  // Savings Ratio evaluation (Max 35 pts)
  if (savingsRatioPercent >= 20) {
    score += 35;
  } else if (savingsRatioPercent >= 15) {
    score += 28;
  } else if (savingsRatioPercent >= 10) {
    score += 18;
  } else if (savingsRatioPercent > 0) {
    score += 8;
  } else {
    score += 0;
  }

  // Runway evaluation (Max 30 pts)
  if (emergencyRunwayMonths >= 6) {
    score += 30;
  } else if (emergencyRunwayMonths >= 3) {
    score += 20;
  } else if (emergencyRunwayMonths >= 1) {
    score += 10;
  } else {
    score += 2;
  }

  // Determine Badge Status
  let status: HealthStatus = 'SEHAT';
  let statusLabel = 'Finansial Sehat';
  let headline = 'Arus kas stabil & alokasi aset ideal';

  if (score < 50) {
    status = 'KRITIS';
    statusLabel = 'Kondisi Kritis';
    headline = 'Beban kewajiban tinggi atau tabungan minim';
  } else if (score < 75) {
    status = 'WASPADA';
    statusLabel = 'Perlu Waspada';
    headline = 'Cukup baik, optimalkan rasio tabungan & utang';
  }

  // Generate actionable contextual recommendations
  const recommendations: FinancialHealth['recommendations'] = [];

  // DSR Recommendation
  if (dsrPercent > 35) {
    recommendations.push({
      type: 'critical',
      title: 'Kewajiban Tetap Melebihi Batas Aman (>35%)',
      description: `Cicilan & beban awal bulan menyerap ${dsrPercent.toFixed(1)}% pemasukan. Hindari cicilan konsumtif baru dan prioritaskan pelunasan pinjaman berbunga tinggi.`,
    });
  } else if (dsrPercent > 30) {
    recommendations.push({
      type: 'warning',
      title: 'Beban Kewajiban Mendekati Batas Wajar (30-35%)',
      description: `Beban tetap Anda berada di angka ${dsrPercent.toFixed(1)}%. Jaga pengeluaran harian tetap terkendali agar ruang tabungan tidak tertekan.`,
    });
  } else {
    recommendations.push({
      type: 'positive',
      title: 'Rasio Cicilan Sangat Sehat (≤30%)',
      description: `Beban tetap hanya ${dsrPercent.toFixed(1)}% dari total pemasukan. Anda memiliki fleksibilitas arus kas yang prima.`,
    });
  }

  // Savings Recommendation
  if (savingsRatioPercent >= 20) {
    recommendations.push({
      type: 'positive',
      title: 'Target Tabungan Tercapai (≥20%)',
      description: `Hebat! Anda menyisihkan ${savingsRatioPercent.toFixed(1)}% untuk investasi dan masa depan (sesuai kaidah 50/30/20).`,
    });
  } else if (savingsRatioPercent >= 10) {
    recommendations.push({
      type: 'warning',
      title: 'Rasio Tabungan Dapat Ditingkatkan',
      description: `Tabungan Anda saat ini ${savingsRatioPercent.toFixed(1)}%. Coba naikkan perlahan menuju target minimal 20% dengan memangkas pengeluaran harian mikro.`,
    });
  } else {
    recommendations.push({
      type: 'critical',
      title: 'Alokasi Tabungan Terlalu Rendah (<10%)',
      description: `Tabungan hanya ${savingsRatioPercent.toFixed(1)}%. Risiko ketergantungan pada gaji tinggi bila terjadi peristiwa darurat.`,
    });
  }

  // Runway Recommendation
  if (emergencyRunwayMonths >= 6) {
    recommendations.push({
      type: 'positive',
      title: 'Dana Darurat Kuat (≥6 Bulan)',
      description: `Cadangan likuid Anda dapat menopang kebutuhan selama ${emergencyRunwayMonths.toFixed(1)} bulan tanpa pemasukan tambahan.`,
    });
  } else if (emergencyRunwayMonths >= 3) {
    recommendations.push({
      type: 'warning',
      title: 'Dana Darurat Cukup (3-6 Bulan)',
      description: `Runway kas saat ini ${emergencyRunwayMonths.toFixed(1)} bulan. Disarankan meningkatkan cadangan hingga 6 bulan pengeluaran.`,
    });
  } else {
    recommendations.push({
      type: 'critical',
      title: 'Cadangan Darurat Rendah (<3 Bulan)',
      description: `Runway Anda hanya ${emergencyRunwayMonths.toFixed(1)} bulan. Prioritaskan pembentukan buffer likuid di deposito/pasar uang segera.`,
    });
  }

  return {
    score: Math.round(score),
    status,
    statusLabel,
    headline,
    dsrPercent,
    savingsRatioPercent,
    emergencyRunwayMonths,
    totalIncome,
    totalFixedExpenses,
    totalDailyExpenses,
    totalSavings,
    depositoYieldTotal,
    recommendations,
  };
}
