import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActiveProfile,
  FinancialHealth,
  FixedBudget,
  Investment,
  MonthlyAchievement,
  MonthlyTarget,
  NoteItem,
  OverallAchievement,
  SyncConfig,
  Transaction,
  UserId,
  UserProfile,
} from '../types/finance';
import { DataService, DEFAULT_USERS } from '../services/dataService';
import {
  calculateFinancialHealth,
  formatMonthYearIndo,
  getCurrentYearMonth,
  getMonthDateRangeIndo,
  getYearMonthFromDate,
  isDateInMonth,
  shiftYearMonth,
} from '../utils/financeCalculators';
import { triggerHaptic } from '../utils/haptics';

interface FinanceContextType {
  // Profiles & Selection
  users: UserProfile[];
  activeProfile: ActiveProfile;
  setActiveProfile: (profile: ActiveProfile) => void;
  currentUser: UserProfile | null;

  // Selected Month / Range Filter
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedMonthName: string;
  selectedMonthRange: string;
  isCurrentMonth: boolean;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;

  // Data Collections
  transactions: Transaction[];
  fixedBudgets: FixedBudget[];
  investments: Investment[];
  notes: NoteItem[];

  // Filtered Collections for Current View
  filteredTransactions: Transaction[];
  monthTransactions: Transaction[];
  filteredFixedBudgets: FixedBudget[];
  filteredInvestments: Investment[];

  // Calculated Metrics
  totalIncome: number;
  salaryIncome: number;
  variableIncome: number;
  additionalIncome: number;
  depositoYieldTotal: number;
  totalFixedExpenses: number;
  totalDailyExpenses: number;
  totalSavings: number;
  netCashflow: number;
  savingsTarget: number;
  savingsProgressPercent: number;
  liquidAssetsEstimate: number;
  financialHealth: FinancialHealth;

  // Monthly Targets & Achievements
  monthlyTargets: Record<string, MonthlyTarget>;
  updateMonthlyTarget: (month: string, targets: MonthlyTarget) => void;
  achievementData: OverallAchievement;
  currentMonthAchievement: MonthlyAchievement;

  // Mutations
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleFixedBudgetPaid: (id: string) => void;
  addFixedBudget: (budget: Omit<FixedBudget, 'id'>) => void;
  deleteFixedBudget: (id: string) => void;
  addInvestment: (inv: Omit<Investment, 'id'>, injectToIncome?: boolean) => void;
  toggleInvestmentActive: (id: string) => void;
  updateUserProfile: (userId: UserId, updates: Partial<UserProfile>) => void;
  resetAllData: () => void;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (note: NoteItem) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;

  // Deposito Sync Mode (ON = Sync to Main App Cashflow, OFF = Standalone Calculator Only)
  isDepositoSyncEnabled: boolean;
  setDepositoSyncEnabled: (enabled: boolean) => void;

  // Floating Toast Feedback
  toast: { type: 'success' | 'error' | 'info'; message: string } | null;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;

  // Google Sheets Remote Sync
  syncConfig: SyncConfig;
  updateSyncConfig: (config: Partial<SyncConfig>) => void;
  isSyncing: boolean;
  syncError: string | null;
  syncSuccessMessage: string | null;
  syncWithGoogleSheets: () => Promise<boolean>;
  pushToGoogleSheets: () => Promise<boolean>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => DataService.getUsers());
  const [activeProfile, setActiveProfileState] = useState<ActiveProfile>('household');
  const [transactions, setTransactions] = useState<Transaction[]>(() => DataService.getTransactions());
  const [fixedBudgets, setFixedBudgets] = useState<FixedBudget[]>(() => DataService.getFixedBudgets());
  const [investments, setInvestments] = useState<Investment[]>(() => DataService.getInvestments());
  const [notes, setNotes] = useState<NoteItem[]>(() => DataService.getNotes());
  const [monthlyTargets, setMonthlyTargets] = useState<Record<string, MonthlyTarget>>(() =>
    DataService.getMonthlyTargets()
  );
  const [syncConfig, setSyncConfigState] = useState<SyncConfig>(() => DataService.getSyncConfig());
  const [isDepositoSyncEnabled, setIsDepositoSyncEnabledState] = useState<boolean>(() =>
    DataService.getDepositoSyncEnabled()
  );

  const setDepositoSyncEnabled = (enabled: boolean) => {
    triggerHaptic('medium');
    setIsDepositoSyncEnabledState(enabled);
    DataService.saveDepositoSyncEnabled(enabled);
  };

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Sync to local storage on changes
  useEffect(() => {
    DataService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    DataService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    DataService.saveFixedBudgets(fixedBudgets);
  }, [fixedBudgets]);

  useEffect(() => {
    DataService.saveInvestments(investments);
  }, [investments]);

  useEffect(() => {
    DataService.saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    DataService.saveMonthlyTargets(monthlyTargets);
  }, [monthlyTargets]);

  useEffect(() => {
    DataService.saveSyncConfig(syncConfig);
  }, [syncConfig]);

  // Check if entering a new month
  useEffect(() => {
    const curMonth = getCurrentYearMonth();
    const lastSeen = DataService.getLastSeenMonth();
    if (lastSeen && lastSeen !== curMonth) {
      showToast(
        'info',
        `Memasuki bulan baru (${formatMonthYearIndo(curMonth)}). Gaji bulanan telah kembali utuh dan target tabungan siap diinput!`
      );
    }
    DataService.saveLastSeenMonth(curMonth);
  }, []);

  // Auto-sync from Google Sheets on initial mount if scriptUrl is configured
  useEffect(() => {
    if (syncConfig.scriptUrl) {
      syncWithGoogleSheets();
    }
  }, []);

  const setActiveProfile = (profile: ActiveProfile) => {
    triggerHaptic('light');
    setActiveProfileState(profile);
  };

  const currentUser = useMemo(() => {
    if (activeProfile === 'household') return null;
    return users.find(u => u.id === activeProfile) || users[0] || null;
  }, [activeProfile, users]);

  // Selected month filter (default: current calendar month, e.g. "2026-10")
  const [selectedMonth, setSelectedMonthState] = useState<string>(() => getCurrentYearMonth());

  const setSelectedMonth = (month: string) => {
    triggerHaptic('light');
    setSelectedMonthState(month);
  };

  const goToPreviousMonth = () => {
    triggerHaptic('light');
    setSelectedMonthState(prev => shiftYearMonth(prev, -1));
  };

  const goToNextMonth = () => {
    triggerHaptic('light');
    setSelectedMonthState(prev => shiftYearMonth(prev, 1));
  };

  const goToCurrentMonth = () => {
    triggerHaptic('light');
    setSelectedMonthState(getCurrentYearMonth());
  };

  const isCurrentMonth = selectedMonth === getCurrentYearMonth();
  const selectedMonthName = useMemo(() => formatMonthYearIndo(selectedMonth), [selectedMonth]);
  const selectedMonthRange = useMemo(() => getMonthDateRangeIndo(selectedMonth), [selectedMonth]);

  // Filtered collections based on active profile and Deposito Sync Mode
  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (activeProfile !== 'household') {
      list = list.filter(t => t.userId === activeProfile);
    }
    // If Deposito Sync is turned OFF, isolate transactions from passive deposito yield
    if (!isDepositoSyncEnabled) {
      list = list.filter(t => !t.isPassiveIncome && t.category !== 'Passive Income' && t.type !== 'deposito');
    }
    return list;
  }, [activeProfile, transactions, isDepositoSyncEnabled]);

  // Transactions belonging specifically to the selected month's date range
  const monthTransactions = useMemo(() => {
    return filteredTransactions.filter(t => {
      if (!t.timestamp) return false;
      return isDateInMonth(t.timestamp, selectedMonth);
    });
  }, [filteredTransactions, selectedMonth]);

  const filteredFixedBudgets = useMemo(() => {
    let list = fixedBudgets;
    if (activeProfile !== 'household') {
      list = list.filter(b => b.userId === activeProfile || b.userId === 'shared');
    }
    return list.map(b => {
      const paidList = b.paidMonths || (b.isPaid ? ['2026-10'] : []);
      return {
        ...b,
        isPaid: paidList.includes(selectedMonth),
      };
    });
  }, [activeProfile, fixedBudgets, selectedMonth]);

  const filteredInvestments = useMemo(() => {
    if (activeProfile === 'household') return investments;
    return investments.filter(i => i.userId === activeProfile || i.userId === 'shared');
  }, [activeProfile, investments]);

  // Financial Metrics Computation — Base Salary preserved + Additional Incomes accumulated by date range
  const {
    totalIncome,
    salaryIncome,
    variableIncome,
    additionalIncome,
    depositoYieldTotal,
    totalFixedExpenses,
    totalDailyExpenses,
    totalSavings,
    netCashflow,
    savingsTarget,
    savingsProgressPercent,
    liquidAssetsEstimate,
  } = useMemo(() => {
    // 1. Determine Base Salaries from Users table (baseline income for the month)
    let baseSalary = 0;
    let target = 0;

    const currentTargets = monthlyTargets[selectedMonth] || {};

    if (activeProfile === 'household') {
      baseSalary = users.reduce((sum, u) => sum + (Number(u.baseSalary) || 0), 0);
      target = Object.values(currentTargets).reduce((sum, t) => sum + (Number(t) || 0), 0);
    } else {
      const u = users.find(x => x.id === activeProfile) || users[0];
      baseSalary = u ? Number(u.baseSalary) || 0 : 0;
      target = Number(currentTargets[activeProfile as 'user_1' | 'user_2'] || currentTargets.user_1) || 0;
    }

    // 2. Deposito / Investment Yield from active portfolio
    // ONLY included if isDepositoSyncEnabled is TRUE!
    const activeInvs = isDepositoSyncEnabled
      ? filteredInvestments.filter(i => i.isActive && i.injectedToIncome)
      : [];
    const depYield = activeInvs.reduce((sum, i) => sum + (Number(i.netMonthlyYield) || 0), 0);

    const passiveTxs = isDepositoSyncEnabled
      ? monthTransactions.filter(t => t.type === 'income' && (t.isPassiveIncome || t.category === 'Passive Income'))
      : [];
    const depYieldFinal = isDepositoSyncEnabled
      ? (passiveTxs.length > 0 ? passiveTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) : depYield)
      : 0;

    // 3. Additional Income transactions for this month (excluding passive yield)
    const additionalIncomeTxs = monthTransactions.filter(
      t => t.type === 'income' && !t.isPassiveIncome && t.category !== 'Passive Income'
    );
    const additionalIncomeTotal = additionalIncomeTxs.reduce(
      (sum, t) => sum + (Number(t.amount) || 0),
      0
    );

    // CRITICAL: Base monthly salary is ALWAYS maintained and NEVER wiped out!
    // Any income transactions inputted within this month's date range are ADDED to the base income!
    const totIncome = baseSalary + depYieldFinal + additionalIncomeTotal;

    // Specific breakdown
    const salaryTxs = additionalIncomeTxs.filter(t => t.category === 'Gaji Pokok');
    const extraSalary = salaryTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const salaryInc = baseSalary + extraSalary;

    const variableInc = additionalIncomeTxs
      .filter(t => t.category !== 'Gaji Pokok')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // 4. Fixed Expenses: from FixedBudgets list (monthly obligations) or fixed_expense transactions in this month
    const fixedTxTotal = monthTransactions
      .filter(t => t.type === 'fixed_expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totFixed = filteredFixedBudgets.length > 0
      ? filteredFixedBudgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
      : fixedTxTotal;

    // 5. Daily Expenses: from transactions tagged daily_expense in this month
    const totDaily = monthTransactions
      .filter(t => t.type === 'daily_expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // 6. Savings: from transactions tagged savings in this month
    const totSavings = monthTransactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const netCash = totIncome - (totFixed + totDaily + totSavings);
    const progress = target > 0 ? Math.min(Math.round((totSavings / target) * 100), 100) : 0;

    // Estimated liquid assets (sum of investments principal ONLY IF sync is enabled + 3x monthly savings buffer)
    const investmentPrincipal = isDepositoSyncEnabled
      ? filteredInvestments.reduce((sum, i) => sum + (Number(i.principal) || 0), 0)
      : 0;
    const liquid = investmentPrincipal + (totSavings * 3);

    return {
      totalIncome: totIncome,
      salaryIncome: salaryInc,
      variableIncome: variableInc,
      additionalIncome: additionalIncomeTotal,
      depositoYieldTotal: depYieldFinal,
      totalFixedExpenses: totFixed,
      totalDailyExpenses: totDaily,
      totalSavings: totSavings,
      netCashflow: netCash,
      savingsTarget: target,
      savingsProgressPercent: progress,
      liquidAssetsEstimate: liquid,
    };
  }, [
    activeProfile,
    users,
    filteredInvestments,
    monthTransactions,
    filteredFixedBudgets,
    isDepositoSyncEnabled,
    monthlyTargets,
    selectedMonth,
  ]);

  // Financial Health Computation
  const financialHealth = useMemo(() => {
    return calculateFinancialHealth({
      totalIncome,
      totalFixedExpenses,
      totalDailyExpenses,
      totalSavings,
      totalLiquidAssets: liquidAssetsEstimate,
      depositoYieldTotal,
    });
  }, [totalIncome, totalFixedExpenses, totalDailyExpenses, totalSavings, liquidAssetsEstimate, depositoYieldTotal]);

  // Background auto-sync helper whenever data changes
  const triggerAutoSync = (
    updatedTransactions?: Transaction[],
    updatedBudgets?: FixedBudget[],
    updatedInvs?: Investment[],
    singleTx?: Transaction
  ) => {
    if (!syncConfig.scriptUrl) {
      showToast('info', 'Transaksi disimpan lokal di HP (Google Sheets belum terhubung)');
      return;
    }

    setTimeout(async () => {
      try {
        setIsSyncing(true);
        setSyncError(null);

        let ok = false;
        // If single newly added transaction, try direct non-destructive append first
        if (singleTx) {
          try {
            ok = await DataService.addTransactionToGoogleSheets(syncConfig.scriptUrl, singleTx);
          } catch (e) {
            console.warn('Direct append failed, fallback to pushAll:', e);
          }
        }

        // Fallback to pushAll if direct append was not used or failed
        if (!ok) {
          ok = await DataService.pushAllToGoogleSheets(syncConfig.scriptUrl, {
            users,
            transactions: updatedTransactions || transactions,
            fixedBudgets: updatedBudgets || fixedBudgets,
            investments: updatedInvs || investments,
          });
        }

        if (ok) {
          const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          setSyncConfigState(prev => ({ ...prev, lastSyncedAt: now }));
          setSyncSuccessMessage(`Tersinkron ke Google Sheets (${now})`);
          showToast('success', `Tersinkron ke Google Sheets (${now})`);
        } else {
          throw new Error('Google Sheets tidak merespon sukses.');
        }
      } catch (err: any) {
        console.warn('Auto-sync error:', err);
        const errMsg = err?.message || 'Gagal tersinkron ke Google Sheets';
        setSyncError(errMsg);
        showToast('error', `Gagal sync: ${errMsg.substring(0, 50)}`);
      } finally {
        setIsSyncing(false);
      }
    }, 200);
  };

  // Mutation Handlers
  const addTransaction = (newTx: Omit<Transaction, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const tx: Transaction = {
      ...newTx,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: newTx.timestamp || new Date().toISOString(),
    };
    const nextList = [tx, ...transactions];
    setTransactions(nextList);
    triggerHaptic('success');
    triggerAutoSync(nextList, undefined, undefined, tx);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const nextList = transactions.map(t => (t.id === id ? { ...t, ...updates } : t));
    setTransactions(nextList);
    triggerHaptic('success');
    showToast('success', 'Transaksi berhasil diperbarui');
    triggerAutoSync(nextList);
  };

  const deleteTransaction = (id: string) => {
    const nextList = transactions.filter(t => t.id !== id);
    setTransactions(nextList);
    triggerHaptic('medium');
    triggerAutoSync(nextList);
  };

  const toggleFixedBudgetPaid = (id: string) => {
    const nextList = fixedBudgets.map(b => {
      if (b.id !== id) return b;
      const currentPaid = b.paidMonths || (b.isPaid ? ['2026-10'] : []);
      const isPaidNow = currentPaid.includes(selectedMonth);
      const nextPaid = isPaidNow
        ? currentPaid.filter(m => m !== selectedMonth)
        : [...currentPaid, selectedMonth];
      return {
        ...b,
        isPaid: nextPaid.includes(selectedMonth),
        paidMonths: nextPaid,
      };
    });
    setFixedBudgets(nextList);
    triggerHaptic('light');
    triggerAutoSync(undefined, nextList);
  };

  const updateMonthlyTarget = (month: string, targetUpdates: MonthlyTarget) => {
    triggerHaptic('success');
    setMonthlyTargets(prev => {
      const updated = {
        ...prev,
        [month]: {
          ...prev[month],
          ...targetUpdates,
        },
      };
      DataService.saveMonthlyTargets(updated);
      return updated;
    });
    showToast('success', `Target tabungan ${formatMonthYearIndo(month)} berhasil disimpan`);
  };

  const addFixedBudget = (budget: Omit<FixedBudget, 'id'>) => {
    const newBudget: FixedBudget = {
      ...budget,
      id: 'fb_' + Date.now(),
    };
    const nextList = [...fixedBudgets, newBudget];
    setFixedBudgets(nextList);
    triggerHaptic('success');
    triggerAutoSync(undefined, nextList);
  };

  const deleteFixedBudget = (id: string) => {
    const nextList = fixedBudgets.filter(b => b.id !== id);
    setFixedBudgets(nextList);
    triggerHaptic('medium');
    triggerAutoSync(undefined, nextList);
  };

  const addInvestment = (inv: Omit<Investment, 'id'>, injectToIncome: boolean = true) => {
    const id = 'inv_' + Date.now();
    const newInv: Investment = {
      ...inv,
      id,
      injectedToIncome: injectToIncome,
      isActive: true,
    };
    const nextInvs = [...investments, newInv];
    setInvestments(nextInvs);

    let nextTxs = transactions;
    // If marked to inject to income AND Deposito Sync is enabled, also record a passive income transaction
    if (injectToIncome && newInv.netMonthlyYield > 0 && isDepositoSyncEnabled) {
      const tx: Transaction = {
        id: 'tx_pass_' + Date.now(),
        timestamp: new Date().toISOString(),
        userId: inv.userId === 'shared' ? 'user_1' : inv.userId,
        type: 'income',
        category: 'Passive Income',
        amount: Math.round(newInv.netMonthlyYield),
        description: `Bunga Bersih Bulanan ${inv.name} (${inv.apyPercent}%)`,
        isPassiveIncome: true,
      };
      nextTxs = [tx, ...transactions];
      setTransactions(nextTxs);
    }

    triggerHaptic('success');
    triggerAutoSync(nextTxs, undefined, nextInvs);
  };

  const toggleInvestmentActive = (id: string) => {
    setInvestments(prev =>
      prev.map(i => (i.id === id ? { ...i, isActive: !i.isActive } : i))
    );
    triggerHaptic('light');
  };

  const updateUserProfile = (userId: UserId, updates: Partial<UserProfile>) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...updates } : u))
    );
    triggerHaptic('success');
  };

  const resetAllData = () => {
    DataService.resetToDefaultData();
    setUsers(DEFAULT_USERS);
    setTransactions(DataService.getTransactions());
    setFixedBudgets(DataService.getFixedBudgets());
    setInvestments(DataService.getInvestments());
    setNotes(DataService.getNotes());
    triggerHaptic('warning');
  };

  const addNote = async (newNoteData: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      ...newNoteData,
      id: 'note_' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    DataService.saveNotes(updated);
    triggerHaptic('success');
    showToast('success', 'Catatan berhasil disimpan!');

    if (syncConfig.scriptUrl) {
      DataService.saveNoteToGoogleSheets(syncConfig.scriptUrl, newNote).catch(() => {});
    }
  };

  const updateNote = async (updatedNote: NoteItem) => {
    const noteWithTimestamp: NoteItem = {
      ...updatedNote,
      updatedAt: new Date().toISOString(),
    };
    const updated = notes.map(n => (n.id === updatedNote.id ? noteWithTimestamp : n));
    setNotes(updated);
    DataService.saveNotes(updated);
    triggerHaptic('light');
    showToast('success', 'Catatan berhasil diperbarui!');

    if (syncConfig.scriptUrl) {
      DataService.saveNoteToGoogleSheets(syncConfig.scriptUrl, noteWithTimestamp).catch(() => {});
    }
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    DataService.saveNotes(updated);
    triggerHaptic('medium');
    showToast('info', 'Catatan dihapus.');

    if (syncConfig.scriptUrl) {
      DataService.deleteNoteFromGoogleSheets(syncConfig.scriptUrl, id).catch(() => {});
    }
  };

  const togglePinNote = async (id: string) => {
    const target = notes.find(n => n.id === id);
    if (!target) return;
    const updatedNote = { ...target, pinned: !target.pinned, updatedAt: new Date().toISOString() };
    const updated = notes.map(n => (n.id === id ? updatedNote : n));
    setNotes(updated);
    DataService.saveNotes(updated);
    triggerHaptic('light');

    if (syncConfig.scriptUrl) {
      DataService.saveNoteToGoogleSheets(syncConfig.scriptUrl, updatedNote).catch(() => {});
    }
  };

  const updateSyncConfig = (config: Partial<SyncConfig>) => {
    setSyncConfigState(prev => ({ ...prev, ...config }));
  };

  // Sync from Google Sheets
  const syncWithGoogleSheets = async (): Promise<boolean> => {
    if (!syncConfig.scriptUrl) {
      setSyncError('URL Google Apps Script belum diatur. Buka Pengaturan untuk menambahkan URL.');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccessMessage(null);

    try {
      const data = await DataService.fetchFromGoogleSheets(syncConfig.scriptUrl);
      if (data.users && data.users.length > 0) setUsers(data.users);
      if (data.transactions && Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (data.fixedBudgets && Array.isArray(data.fixedBudgets)) setFixedBudgets(data.fixedBudgets);
      if (data.investments && Array.isArray(data.investments)) setInvestments(data.investments);
      if (data.notes && Array.isArray(data.notes)) setNotes(data.notes);

      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setSyncConfigState(prev => ({ ...prev, lastSyncedAt: now }));
      setSyncSuccessMessage(`Sinkronisasi berhasil! ${data.transactions?.length || 0} transaksi, ${data.notes?.length || 0} catatan dimuat (${now})`);
      triggerHaptic('success');
      return true;
    } catch (err: any) {
      setSyncError(err.message || 'Gagal menyinkronkan data.');
      triggerHaptic('warning');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Push Local Data to Google Sheets
  const pushToGoogleSheets = async (): Promise<boolean> => {
    if (!syncConfig.scriptUrl) {
      setSyncError('URL Google Apps Script belum diatur.');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccessMessage(null);

    try {
      const ok = await DataService.pushAllToGoogleSheets(syncConfig.scriptUrl, {
        users,
        transactions,
        fixedBudgets,
        investments,
        notes,
      });

      if (ok) {
        const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setSyncConfigState(prev => ({ ...prev, lastSyncedAt: now }));
        setSyncSuccessMessage(`Berhasil! ${transactions.length} transaksi, ${notes.length} catatan & profil berhasil diunggah (${now})`);
        triggerHaptic('success');
        return true;
      } else {
        throw new Error('Google Sheets mengembalikan respon gagal.');
      }
    } catch (err: any) {
      setSyncError(err.message || 'Gagal mengirim data ke Google Sheets.');
      triggerHaptic('warning');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Achievement Data Computation — Accumulation of past months (sisa uang + tabungan tercapai)
  const achievementData: OverallAchievement = useMemo(() => {
    const currentCalMonth = getCurrentYearMonth();

    // Collect all relevant months
    const monthSet = new Set<string>();
    monthSet.add(currentCalMonth);
    monthSet.add(selectedMonth);
    transactions.forEach(t => {
      const m = getYearMonthFromDate(t.timestamp);
      if (m) monthSet.add(m);
    });
    Object.keys(monthlyTargets).forEach(m => monthSet.add(m));

    // Sort descending (latest month first)
    const sortedMonths = Array.from(monthSet).sort((a, b) => b.localeCompare(a));

    const u1 = users.find(u => u.id === 'user_1') || users[0];
    const u2 = users.find(u => u.id === 'user_2');
    const baseSalU1 = Number(u1?.baseSalary) || 0;
    const baseSalU2 = Number(u2?.baseSalary) || 0;

    const monthlyHistory: MonthlyAchievement[] = sortedMonths.map(monthKey => {
      const isPast = monthKey < currentCalMonth;
      const monthTxs = transactions.filter(t => isDateInMonth(t.timestamp, monthKey));

      // User 1 (Wachid)
      const u1Target = monthlyTargets[monthKey]?.user_1 || 0;
      const u1SavingsTxs = monthTxs.filter(t => (t.userId === 'user_1' || !u2) && t.type === 'savings');
      const u1Savings = u1SavingsTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const u1ExtraIncome = monthTxs
        .filter(t => (t.userId === 'user_1' || !u2) && t.type === 'income' && !t.isPassiveIncome && t.category !== 'Passive Income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const u1TotalIncome = baseSalU1 + u1ExtraIncome;

      const u1FixedExpenses = fixedBudgets
        .filter(b => b.userId === 'user_1' || b.userId === 'shared' || !u2)
        .reduce((sum, b) => sum + ((b.userId === 'shared' && u2) ? (Number(b.amount) || 0) / 2 : (Number(b.amount) || 0)), 0);

      const u1DailyExpenses = monthTxs
        .filter(t => (t.userId === 'user_1' || !u2) && t.type === 'daily_expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const u1Surplus = Math.max(0, u1TotalIncome - (u1FixedExpenses + u1DailyExpenses + u1Savings));
      const u1TotalSaved = u1Savings + u1Surplus;

      // User 2 (Optional)
      const u2Target = u2 ? (monthlyTargets[monthKey]?.user_2 || 0) : 0;
      const u2SavingsTxs = u2 ? monthTxs.filter(t => t.userId === 'user_2' && t.type === 'savings') : [];
      const u2Savings = u2SavingsTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const u2ExtraIncome = u2
        ? monthTxs
            .filter(t => t.userId === 'user_2' && t.type === 'income' && !t.isPassiveIncome && t.category !== 'Passive Income')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        : 0;
      const u2TotalIncome = baseSalU2 + u2ExtraIncome;

      const u2FixedExpenses = u2
        ? fixedBudgets
            .filter(b => b.userId === 'user_2' || b.userId === 'shared')
            .reduce((sum, b) => sum + (b.userId === 'shared' ? (Number(b.amount) || 0) / 2 : (Number(b.amount) || 0)), 0)
        : 0;

      const u2DailyExpenses = u2
        ? monthTxs
            .filter(t => t.userId === 'user_2' && t.type === 'daily_expense')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
        : 0;

      const u2Surplus = u2 ? Math.max(0, u2TotalIncome - (u2FixedExpenses + u2DailyExpenses + u2Savings)) : 0;
      const u2TotalSaved = u2Savings + u2Surplus;

      return {
        month: monthKey,
        monthName: formatMonthYearIndo(monthKey),
        isPastMonth: isPast,
        user1: {
          savingsAmount: u1Savings,
          surplusCash: u1Surplus,
          totalSaved: u1TotalSaved,
          targetSavings: u1Target,
          isTargetAchieved: u1Target > 0 && u1TotalSaved >= u1Target,
        },
        user2: {
          savingsAmount: u2Savings,
          surplusCash: u2Surplus,
          totalSaved: u2TotalSaved,
          targetSavings: u2Target,
          isTargetAchieved: u2Target > 0 && u2TotalSaved >= u2Target,
        },
        totalHouseholdSaved: u1TotalSaved + (u2 ? u2TotalSaved : 0),
      };
    });

    const pastMonths = monthlyHistory.filter(h => h.isPastMonth);

    const u1Deposited = pastMonths.reduce((sum, h) => sum + h.user1.savingsAmount, 0);
    const u1Surplus = pastMonths.reduce((sum, h) => sum + h.user1.surplusCash, 0);
    const u1Grand = u1Deposited + u1Surplus;
    const u1AchievedCount = pastMonths.filter(h => h.user1.isTargetAchieved).length;

    const u2Deposited = pastMonths.reduce((sum, h) => sum + h.user2.savingsAmount, 0);
    const u2Surplus = pastMonths.reduce((sum, h) => sum + h.user2.surplusCash, 0);
    const u2Grand = u2Deposited + u2Surplus;
    const u2AchievedCount = pastMonths.filter(h => h.user2.isTargetAchieved).length;

    return {
      pastMonthsCount: pastMonths.length,
      user1: {
        totalSavingsDeposited: u1Deposited,
        totalSurplusAccumulated: u1Surplus,
        grandTotalSaved: u1Grand,
        monthsAchievedCount: u1AchievedCount,
      },
      user2: {
        totalSavingsDeposited: u2Deposited,
        totalSurplusAccumulated: u2Surplus,
        grandTotalSaved: u2Grand,
        monthsAchievedCount: u2AchievedCount,
      },
      householdGrandTotal: u1Grand + u2Grand,
      monthlyHistory,
    };
  }, [transactions, users, fixedBudgets, monthlyTargets, selectedMonth]);

  const currentMonthAchievement = useMemo(() => {
    return (
      achievementData.monthlyHistory.find(h => h.month === selectedMonth) ||
      achievementData.monthlyHistory[0]
    );
  }, [achievementData, selectedMonth]);

  return (
    <FinanceContext.Provider
      value={{
        users,
        activeProfile,
        setActiveProfile,
        currentUser,
        selectedMonth,
        setSelectedMonth,
        selectedMonthName,
        selectedMonthRange,
        isCurrentMonth,
        goToPreviousMonth,
        goToNextMonth,
        goToCurrentMonth,
        transactions,
        fixedBudgets,
        investments,
        notes,
        filteredTransactions,
        monthTransactions,
        filteredFixedBudgets,
        filteredInvestments,
        monthlyTargets,
        updateMonthlyTarget,
        achievementData,
        currentMonthAchievement,
        totalIncome,
        salaryIncome,
        variableIncome,
        additionalIncome,
        depositoYieldTotal,
        totalFixedExpenses,
        totalDailyExpenses,
        totalSavings,
        netCashflow,
        savingsTarget,
        savingsProgressPercent,
        liquidAssetsEstimate,
        financialHealth,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleFixedBudgetPaid,
        addFixedBudget,
        deleteFixedBudget,
        addInvestment,
        toggleInvestmentActive,
        updateUserProfile,
        resetAllData,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        isDepositoSyncEnabled,
        setDepositoSyncEnabled,
        toast,
        showToast,
        syncConfig,
        updateSyncConfig,
        isSyncing,
        syncError,
        syncSuccessMessage,
        syncWithGoogleSheets,
        pushToGoogleSheets,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
