import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  ExternalLink,
  Layers,
  Loader2,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Upload,
  User,
  Coins,
} from 'lucide-react';
import { GlassModal } from '../common/GlassModal';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { useFinance } from '../../context/FinanceContext';
import { GOOGLE_APPS_SCRIPT_SOURCE } from '../../services/sheetsTemplate';
import { DataService } from '../../services/dataService';
import { formatRupiah } from '../../utils/financeCalculators';
import { triggerHaptic } from '../../utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAndroidGuide: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAndroidGuide,
}) => {
  const {
    syncConfig,
    updateSyncConfig,
    users,
    updateUserProfile,
    syncWithGoogleSheets,
    pushToGoogleSheets,
    isSyncing,
    syncError,
    syncSuccessMessage,
    resetAllData,
    isDepositoSyncEnabled,
    setDepositoSyncEnabled,
    selectedMonth,
    monthlyTargets,
    updateMonthlyTarget,
  } = useFinance();

  const [scriptUrl, setScriptUrl] = useState(syncConfig.scriptUrl || '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [connectionErrorMsg, setConnectionErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);

  // User 1 & 2 state
  const [user1Salary, setUser1Salary] = useState(String(users[0]?.baseSalary ?? 0));
  const [user1Target, setUser1Target] = useState(String(monthlyTargets[selectedMonth]?.user_1 ?? users[0]?.targetSavings ?? 0));
  const [user2Salary, setUser2Salary] = useState(String(users[1]?.baseSalary ?? 0));
  const [user2Target, setUser2Target] = useState(String(monthlyTargets[selectedMonth]?.user_2 ?? users[1]?.targetSavings ?? 0));
  const [savedUserMsg, setSavedUserMsg] = useState(false);

  const handleSaveSyncConfig = () => {
    triggerHaptic('light');
    updateSyncConfig({ scriptUrl: scriptUrl.trim() });
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) return;
    triggerHaptic('light');
    setTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionErrorMsg('');

    const res = await DataService.testConnection(scriptUrl.trim());
    setTestingConnection(false);
    if (res.success) {
      setConnectionStatus('success');
      setConnectionErrorMsg(res.message);
      updateSyncConfig({ scriptUrl: scriptUrl.trim() });
      triggerHaptic('success');
      // Otomatis sinkronkan semua data awal ke spreadsheet seketika!
      await pushToGoogleSheets();
    } else {
      setConnectionStatus('failed');
      setConnectionErrorMsg(res.message);
      triggerHaptic('warning');
    }
  };

  const handleSaveUsers = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    const u1T = Number(user1Target) || 0;
    const u2T = Number(user2Target) || 0;

    if (users[0]) {
      updateUserProfile(users[0].id, {
        baseSalary: Number(user1Salary) || 0,
        targetSavings: u1T,
      });
    }
    if (users[1]) {
      updateUserProfile(users[1].id, {
        baseSalary: Number(user2Salary) || 0,
        targetSavings: u2T,
      });
    }

    updateMonthlyTarget(selectedMonth, {
      user_1: u1T,
      user_2: u2T,
    });

    setSavedUserMsg(true);
    setTimeout(() => setSavedUserMsg(false), 2500);
  };

  const handleCopyCode = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SOURCE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan & Integrasi"
      subtitle="Google Sheets Headless DB & Profil Pengguna"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* SECTION 1: Google Sheets Database Integration */}
        <div className="p-4 rounded-3xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Sheets Headless Database
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sinkronkan data transaksi ke spreadsheet Google Sheets pribadi Anda
                </p>
              </div>
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Google Apps Script Web App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={scriptUrl}
                onChange={e => setScriptUrl(e.target.value)}
                onBlur={handleSaveSyncConfig}
                className="w-full glass-input text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection || !scriptUrl}
                className="px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              >
                {testingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tes'}
              </button>
            </div>

            {connectionStatus === 'success' && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{connectionErrorMsg || 'Terhubung dengan sukses ke Google Sheets!'}</span>
              </p>
            )}
            {connectionStatus === 'failed' && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium mt-1.5 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{connectionErrorMsg}</span>
              </div>
            )}
          </div>

          {/* Sync Actions Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <GlassButton
              size="sm"
              variant="glass"
              icon={isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              onClick={syncWithGoogleSheets}
              disabled={isSyncing || !scriptUrl}
            >
              Tarik dari Sheets
            </GlassButton>

            <GlassButton
              size="sm"
              variant="primary"
              icon={isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Upload className="w-3.5 h-3.5" />}
              onClick={pushToGoogleSheets}
              disabled={isSyncing || !scriptUrl}
            >
              Kirim ke Sheets
            </GlassButton>
          </div>

          {syncSuccessMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {syncError && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{syncError}</span>
            </div>
          )}

          {/* Quick Script Access Button */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Skrip Google Apps Script (Code.gs)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCodeViewer(!showCodeViewer)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {showCodeViewer ? 'Tutup Kode' : 'Lihat Kode'}
              </button>
            </div>
          </div>

          {/* Code Viewer Drawer */}
          {showCodeViewer && (
            <div className="mt-2 p-3 rounded-2xl bg-black/80 text-emerald-400 text-[10px] font-mono max-h-48 overflow-y-auto no-scrollbar border border-white/10 select-text">
              <pre>{GOOGLE_APPS_SCRIPT_SOURCE}</pre>
            </div>
          )}
        </div>

        {/* SECTION 2: User Profiles & Base Salaries */}
        <form onSubmit={handleSaveUsers} className="p-4 rounded-3xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Gaji Pokok & Target Tabungan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Baseline pemasukan bulanan untuk {users.map(u => u.name).join(' & ')}
              </p>
            </div>
          </div>

          {/* User 1: Wachid */}
          <div className="space-y-2 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span>{users[0]?.avatar || '👨‍💼'}</span>
              <span>{users[0]?.name || 'Wachid'} ({users[0]?.role || 'Ayah'})</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">
                  Gaji Pokok (Rp)
                </label>
                <input
                  type="number"
                  value={user1Salary}
                  onChange={e => setUser1Salary(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">
                  Target Tabungan (Rp)
                </label>
                <input
                  type="number"
                  value={user1Target}
                  onChange={e => setUser1Target(e.target.value)}
                  className="w-full glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* User 2 (if present) */}
          {users.length > 1 && (
            <div className="space-y-2 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <span>{users[1]?.avatar || '👩‍💼'}</span>
                <span>{users[1]?.name || 'User 2'} ({users[1]?.role || 'Anggota'})</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">
                    Gaji Pokok (Rp)
                  </label>
                  <input
                    type="number"
                    value={user2Salary}
                    onChange={e => setUser2Salary(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">
                    Target Tabungan (Rp)
                  </label>
                  <input
                    type="number"
                    value={user2Target}
                    onChange={e => setUser2Target(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {savedUserMsg && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Profil Tersimpan!
              </span>
            )}
            <div className="ml-auto">
              <GlassButton type="submit" variant="primary" size="sm">
                Simpan Profil
              </GlassButton>
            </div>
          </div>
        </form>

        {/* SECTION: Deposito Integration Mode */}
        <div className="p-4 rounded-3xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                isDepositoSyncEnabled
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  : 'bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Sinkronisasi Deposito ke Arus Kas
                </h4>
                <GlassBadge variant={isDepositoSyncEnabled ? 'green' : 'neutral'} size="sm">
                  {isDepositoSyncEnabled ? 'ON' : 'OFF'}
                </GlassBadge>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isDepositoSyncEnabled
                  ? 'Imbal hasil bunga deposito dihitung ke Total Pemasukan & Dashboard'
                  : 'Kalkulator mandiri — bunga deposito tidak memengaruhi arus kas utama'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDepositoSyncEnabled(!isDepositoSyncEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isDepositoSyncEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={isDepositoSyncEnabled}
            aria-label="Toggle Sinkronisasi Deposito"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isDepositoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* SECTION 3: Mobile Hybrid (Capacitor Android) */}
        <div className="p-4 rounded-3xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Export ke Android APK (Capacitor)
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Jalankan aplikasi di HP Android dengan performa native
              </p>
            </div>
          </div>

          <GlassButton
            size="sm"
            variant="glass"
            onClick={onOpenAndroidGuide}
          >
            Panduan APK
          </GlassButton>
        </div>

        {/* SECTION 4: Reset Data */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              if (confirm('Kembalikan semua data ke sampel awal?')) {
                resetAllData();
              }
            }}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data ke Contoh Semula</span>
          </button>
        </div>
      </div>
    </GlassModal>
  );
};
