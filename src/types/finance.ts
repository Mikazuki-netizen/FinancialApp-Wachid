export type UserId = 'user_1' | 'user_2';
export type ActiveProfile = 'user_1' | 'user_2' | 'household';

export type TransactionType = 
  | 'income'          // Gaji, bonus, freelance
  | 'fixed_expense'   // KPR, cicilan kendaraan, internet, asuransi
  | 'daily_expense'   // Makan, transport, ngopi, belanja
  | 'savings'         // Tabungan, transfer ke reksadana/deposito
  | 'deposito';       // Yield bunga deposito/investasi

export interface UserProfile {
  id: UserId;
  name: string;
  avatar: string;
  role: string;
  baseSalary: number;
  targetSavings: number;
  accentColor: string;
}

export interface Transaction {
  id: string;
  timestamp: string; // ISO date string
  userId: UserId;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  notes?: string;
  isPassiveIncome?: boolean;
}

export interface FixedBudget {
  id: string;
  userId: UserId | 'shared';
  name: string;
  amount: number;
  dueDate: number; // Day of month (1 - 31)
  isPaid: boolean;
  paidMonths?: string[]; // YYYY-MM months when this obligation was marked paid
  category: 'KPR / Sewa' | 'Cicilan Kendaraan' | 'Utilitas & Listrik' | 'Asuransi' | 'Pendidikan' | 'Lainnya';
}

export interface MonthlyTarget {
  user_1?: number;
  user_2?: number;
}

export interface UserMonthAchievement {
  savingsAmount: number;
  surplusCash: number;
  totalSaved: number;
  targetSavings: number;
  isTargetAchieved: boolean;
}

export interface MonthlyAchievement {
  month: string; // YYYY-MM
  monthName: string;
  isPastMonth: boolean;
  user1: UserMonthAchievement;
  user2: UserMonthAchievement;
  totalHouseholdSaved: number;
}

export interface OverallAchievement {
  pastMonthsCount: number;
  user1: {
    totalSavingsDeposited: number;
    totalSurplusAccumulated: number;
    grandTotalSaved: number;
    monthsAchievedCount: number;
  };
  user2: {
    totalSavingsDeposited: number;
    totalSurplusAccumulated: number;
    grandTotalSaved: number;
    monthsAchievedCount: number;
  };
  householdGrandTotal: number;
  monthlyHistory: MonthlyAchievement[];
}

export interface Investment {
  id: string;
  userId: UserId | 'shared';
  name: string;
  type: 'deposito' | 'sbn' | 'reksadana' | 'emas';
  principal: number;
  apyPercent: number;
  tenorMonths: number;
  taxRatePercent: number; // e.g. 20 for standard Indonesian deposito > 7.5jt
  grossMonthlyYield: number;
  netMonthlyYield: number;
  maturityYield: number;
  startDate: string;
  autoCompound: boolean;
  isActive: boolean;
  injectedToIncome: boolean;
}

export type HealthStatus = 'SEHAT' | 'WASPADA' | 'KRITIS';

export interface FinancialHealth {
  score: number; // 0 - 100
  status: HealthStatus;
  statusLabel: string;
  headline: string;
  dsrPercent: number; // Debt-to-Income Ratio
  savingsRatioPercent: number; // Savings / Net Income
  emergencyRunwayMonths: number; // Total buffer / monthly total expenses
  totalIncome: number;
  totalFixedExpenses: number;
  totalDailyExpenses: number;
  totalSavings: number;
  depositoYieldTotal: number;
  recommendations: Array<{
    type: 'positive' | 'warning' | 'critical';
    title: string;
    description: string;
  }>;
}

export interface DepositoCalculationResult {
  principal: number;
  apyPercent: number;
  tenorMonths: number;
  taxRatePercent: number;
  grossAnnualYield: number;
  netAnnualYield: number;
  grossMonthlyYield: number;
  netMonthlyYield: number;
  maturityTotalWithPrincipal: number;
  totalNetInterestEarned: number;
  totalTaxPaid: number;
}

export interface SyncConfig {
  scriptUrl: string;
  sheetId?: string;
  lastSyncedAt?: string;
  autoSync: boolean;
}
