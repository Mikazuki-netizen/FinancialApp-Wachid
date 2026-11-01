import { FixedBudget, Investment, MonthlyTarget, SyncConfig, Transaction, UserProfile } from '../types/finance';

const STORAGE_KEYS = {
  USERS: 'fintrack_ayah_users_v1',
  TRANSACTIONS: 'fintrack_ayah_transactions_v1',
  FIXED_BUDGETS: 'fintrack_ayah_fixed_budgets_v1',
  INVESTMENTS: 'fintrack_ayah_investments_v1',
  SYNC_CONFIG: 'fintrack_ayah_sync_config_v1',
  DEPOSITO_SYNC_ENABLED: 'fintrack_ayah_deposito_sync_enabled_v1',
  MONTHLY_TARGETS: 'fintrack_ayah_monthly_targets_v1',
  LAST_SEEN_MONTH: 'fintrack_ayah_last_seen_month_v1',
};

// Initial Seed Users (Tersinkron dengan Database Google Sheets)
export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Wachid',
    avatar: '👨‍💼',
    role: 'Ayah',
    baseSalary: 0,
    targetSavings: 0,
    accentColor: '#007AFF', // iOS Blue
  },
];

// Initial Seed Fixed Obligations (Kosong / Mulai dari awal)
export const DEFAULT_FIXED_BUDGETS: FixedBudget[] = [];

// Initial Seed Deposito / Investment (Kosong / Mulai dari awal)
export const DEFAULT_INVESTMENTS: Investment[] = [];

// Initial Seed Transactions (Kosong / Mulai dari awal)
export const DEFAULT_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  scriptUrl: 'https://script.google.com/macros/s/AKfycbxLTTP0tCI0GEe5_q7FLp1jVl_QG45UwpQoRgmiBK_B76gxXkRjo2wnmODd049kDZ3QUQ/exec',
  autoSync: true,
};

/**
 * Data Storage Manager with LocalStorage and Google Sheets Sync
 */
export const DataService = {
  getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUsers(users: UserProfile[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getTransactions(): Transaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
      return DEFAULT_TRANSACTIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  },

  saveTransactions(transactions: Transaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getFixedBudgets(): FixedBudget[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FIXED_BUDGETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FIXED_BUDGETS, JSON.stringify(DEFAULT_FIXED_BUDGETS));
      return DEFAULT_FIXED_BUDGETS;
    }
    try {
      const list: FixedBudget[] = JSON.parse(raw);
      return list.map(b => ({
        ...b,
        paidMonths: Array.isArray(b.paidMonths) ? b.paidMonths : (b.isPaid ? ['2026-10'] : []),
      }));
    } catch {
      return DEFAULT_FIXED_BUDGETS;
    }
  },

  saveFixedBudgets(budgets: FixedBudget[]) {
    localStorage.setItem(STORAGE_KEYS.FIXED_BUDGETS, JSON.stringify(budgets));
  },

  getMonthlyTargets(): Record<string, MonthlyTarget> {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_TARGETS);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  saveMonthlyTargets(targets: Record<string, MonthlyTarget>) {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_TARGETS, JSON.stringify(targets));
  },

  getLastSeenMonth(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SEEN_MONTH);
  },

  saveLastSeenMonth(month: string) {
    localStorage.setItem(STORAGE_KEYS.LAST_SEEN_MONTH, month);
  },

  getInvestments(): Investment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVESTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(DEFAULT_INVESTMENTS));
      return DEFAULT_INVESTMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_INVESTMENTS;
    }
  },

  saveInvestments(investments: Investment[]) {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
  },

  getSyncConfig(): SyncConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(DEFAULT_SYNC_CONFIG));
      return DEFAULT_SYNC_CONFIG;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.scriptUrl || parsed.scriptUrl.trim() === '') {
        parsed.scriptUrl = DEFAULT_SYNC_CONFIG.scriptUrl;
        parsed.autoSync = true;
        localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_SYNC_CONFIG;
    }
  },

  saveSyncConfig(config: SyncConfig) {
    localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(config));
  },

  getDepositoSyncEnabled(): boolean {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPOSITO_SYNC_ENABLED);
    return saved !== null ? saved === 'true' : false; // Default: false (Isolated mode)
  },

  saveDepositoSyncEnabled(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.DEPOSITO_SYNC_ENABLED, String(enabled));
  },

  resetToDefaultData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.FIXED_BUDGETS, JSON.stringify(DEFAULT_FIXED_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(DEFAULT_INVESTMENTS));
    localStorage.removeItem(STORAGE_KEYS.MONTHLY_TARGETS);
  },

  /**
   * Sync data from Google Sheets endpoint with robust type and currency parsing
   */
  async fetchFromGoogleSheets(scriptUrl: string): Promise<{
    users?: UserProfile[];
    transactions?: Transaction[];
    fixedBudgets?: FixedBudget[];
    investments?: Investment[];
  }> {
    if (!scriptUrl) throw new Error('URL Google Apps Script belum dikonfigurasi.');

    // Append action=getAll
    const url = new URL(scriptUrl);
    url.searchParams.set('action', 'getAll');

    const res = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
      },
    });

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      if (text.includes('accounts.google.com') || text.includes('Sign in')) {
        throw new Error('Akses ditolak oleh Google. Pastikan "Who has access" disetel ke "Anyone" dan Anda sudah klik Izinkan (Allow) saat Run.');
      }
      throw new Error(`Google Sheets tidak mengembalikan JSON valid: ${text.substring(0, 120)}`);
    }

    if (json.status !== 'success') {
      throw new Error(json.message || 'Format respon Google Sheets tidak valid');
    }

    const rawData = json.data || {};

    const parseNumber = (val: any, fallback = 0): number => {
      if (typeof val === 'number') return isNaN(val) ? fallback : val;
      if (val === null || val === undefined) return fallback;
      const str = String(val).trim();
      if (!str) return fallback;
      let cleaned = str.replace(/[^\d.,-]/g, '');
      if (cleaned.includes('.') && !cleaned.includes(',')) {
        if ((cleaned.match(/\./g) || []).length > 1 || cleaned.split('.')[1]?.length === 3) {
          cleaned = cleaned.replace(/\./g, '');
        }
      } else if (cleaned.includes(',') && !cleaned.includes('.')) {
        if ((cleaned.match(/,/g) || []).length > 1 || cleaned.split(',')[1]?.length === 3) {
          cleaned = cleaned.replace(/,/g, '');
        } else {
          cleaned = cleaned.replace(',', '.');
        }
      } else if (cleaned.includes('.') && cleaned.includes(',')) {
        if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
          cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
          cleaned = cleaned.replace(/,/g, '');
        }
      }
      const n = parseFloat(cleaned);
      return isNaN(n) ? fallback : n;
    };

    // Normalisasi Users
    const users: UserProfile[] = (rawData.users && rawData.users.length > 0)
      ? rawData.users.map((u: any, idx: number) => ({
          id: u.id || (idx === 0 ? 'user_1' : `user_${idx + 1}`),
          name: u.name || (idx === 0 ? 'Wachid' : `Profil ${idx + 1}`),
          avatar: u.avatar || (idx === 0 ? '👨‍💼' : '👤'),
          role: u.role || (idx === 0 ? 'Ayah' : 'Anggota'),
          baseSalary: parseNumber(u.baseSalary, 0),
          targetSavings: parseNumber(u.targetSavings, 0),
          accentColor: u.accentColor || (idx === 0 ? '#007AFF' : '#10B981'),
        }))
      : DEFAULT_USERS;

    // Normalisasi Transactions
    const transactions: Transaction[] = (rawData.transactions || []).map((t: any) => ({
      id: String(t.id || ('tx_' + Date.now())),
      timestamp: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
      userId: t.userId || 'user_1',
      type: (t.type || 'daily_expense') as any,
      category: String(t.category || 'Umum'),
      amount: parseNumber(t.amount, 0),
      description: String(t.description || ''),
      notes: t.notes ? String(t.notes) : undefined,
      isPassiveIncome: t.isPassiveIncome === true || String(t.isPassiveIncome).toLowerCase() === 'true' || t.category === 'Passive Income',
    }));

    // Normalisasi FixedBudgets
    const fixedBudgets: FixedBudget[] = (rawData.fixedBudgets || []).map((b: any) => ({
      id: String(b.id || ('fb_' + Date.now())),
      userId: b.userId || 'user_1',
      name: String(b.name || 'Tagihan'),
      amount: parseNumber(b.amount, 0),
      dueDate: parseNumber(b.dueDate, 5),
      isPaid: b.isPaid === true || String(b.isPaid).toLowerCase() === 'true' || b.isPaid === 1 || String(b.isPaid) === '1',
      paidMonths: Array.isArray(b.paidMonths) ? b.paidMonths : (b.isPaid ? ['2026-10'] : []),
      category: b.category || 'KPR / Sewa',
    }));

    // Normalisasi Investments
    const investments: Investment[] = (rawData.investments || []).map((i: any) => ({
      id: String(i.id || ('inv_' + Date.now())),
      userId: i.userId || 'user_1',
      name: String(i.name || 'Deposito'),
      type: i.type || 'deposito',
      principal: parseNumber(i.principal, 0),
      apyPercent: parseNumber(i.apyPercent, 6.0),
      tenorMonths: parseNumber(i.tenorMonths, 12),
      taxRatePercent: parseNumber(i.taxRatePercent, 20),
      grossMonthlyYield: parseNumber(i.grossMonthlyYield, 0),
      netMonthlyYield: parseNumber(i.netMonthlyYield, 0),
      maturityYield: parseNumber(i.maturityYield, 0),
      startDate: i.startDate || new Date().toISOString(),
      autoCompound: i.autoCompound === true || String(i.autoCompound).toLowerCase() === 'true',
      isActive: i.isActive !== false && String(i.isActive).toLowerCase() !== 'false',
      injectedToIncome: i.injectedToIncome !== false && String(i.injectedToIncome).toLowerCase() !== 'false',
    }));

    return { users, transactions, fixedBudgets, investments };
  },

  /**
   * Append a single transaction directly to Google Sheets
   */
  async addTransactionToGoogleSheets(scriptUrl: string, tx: Transaction): Promise<boolean> {
    if (!scriptUrl) throw new Error('URL Google Apps Script belum dikonfigurasi.');

    const res = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'addTransaction',
        data: tx,
      }),
    });

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Google Apps Script error: ${text.substring(0, 120)}`);
    }

    return json && json.status === 'success';
  },

  /**
   * Push all local data to Google Sheets
   */
  async pushAllToGoogleSheets(scriptUrl: string, data: {
    users: UserProfile[];
    transactions: Transaction[];
    fixedBudgets: FixedBudget[];
    investments: Investment[];
  }): Promise<boolean> {
    if (!scriptUrl) throw new Error('URL Google Apps Script belum dikonfigurasi.');

    const res = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Avoid CORS preflight in Google Apps Script
      },
      body: JSON.stringify({
        action: 'syncAll',
        data,
      }),
    });

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Google Apps Script error: ${text.substring(0, 120)}`);
    }

    return json && json.status === 'success';
  },

  /**
   * Test connection to Google Apps Script endpoint with rich diagnostic feedback
   */
  async testConnection(scriptUrl: string): Promise<{ success: boolean; message: string; rawText?: string }> {
    try {
      const trimmed = scriptUrl.trim();
      if (!trimmed.startsWith('https://script.google.com/macros/s/')) {
        return {
          success: false,
          message: 'Format URL salah. URL harus diawali dengan https://script.google.com/macros/s/... dan diakhiri dengan /exec',
        };
      }

      if (!trimmed.endsWith('/exec')) {
        return {
          success: false,
          message: 'URL Web App harus berakhiran /exec (bukan /edit atau /dev). Pastikan Anda menyalin Web App URL dari menu Deploy.',
        };
      }

      const url = new URL(trimmed);
      url.searchParams.set('action', 'getAll');

      const res = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow'
      });

      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        if (text.includes('accounts.google.com') || text.includes('Sign in') || text.includes('ServiceLogin')) {
          return {
            success: false,
            message: 'Akses Ditolak (Google Login). Penyebab: Anda belum menjalankan fungsi di editor untuk memberi izin akun Google Anda (klik Run > Review Permissions > Allow), atau Web App dibuat di akun Google Workspace/Sekolah yang memblokir akses publik.',
            rawText: text.substring(0, 200)
          };
        }
        if (text.includes('ScriptError') || text.includes('Exception')) {
          return {
            success: false,
            message: `Skrip Apps Script Error: ${text.substring(0, 180)}. Buka Apps Script editor, pilih fungsi initDatabase dan klik Run untuk melihat baris error.`,
            rawText: text.substring(0, 200)
          };
        }
        return {
          success: false,
          message: `Respon Google Sheets bukan JSON (HTTP ${res.status}): ${text.substring(0, 120)}`,
          rawText: text.substring(0, 200)
        };
      }

      if (json && json.status === 'success') {
        return {
          success: true,
          message: 'Terhubung! Spreadsheet siap menerima sinkronisasi data.'
        };
      }

      return {
        success: false,
        message: json.message || 'Status respon tidak success dari Google Sheets.',
      };
    } catch (e: any) {
      console.warn('Google Sheets connection test failed:', e);
      return {
        success: false,
        message: `Koneksi gagal: ${e.message || 'Network error'}. Cek koneksi internet Anda atau buka URL tersebut di tab browser baru untuk memeriksa responnya.`,
      };
    }
  }
};
