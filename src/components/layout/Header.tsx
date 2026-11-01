import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudOff, Loader2, Moon, Settings, Sun, Users } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveProfile } from '../../types/finance';
import { triggerHaptic } from '../../utils/haptics';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const {
    users,
    activeProfile,
    setActiveProfile,
    syncConfig,
    isSyncing,
    syncWithGoogleSheets,
    syncSuccessMessage,
  } = useFinance();
  const { theme, toggleTheme } = useTheme();

  const handleProfileSelect = (p: ActiveProfile) => {
    setActiveProfile(p);
  };

  const handleQuickSync = async () => {
    triggerHaptic('light');
    await syncWithGoogleSheets();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/70 dark:bg-[#070A0F]/75 border-b border-white/50 dark:border-white/10 px-4 pt-[max(3rem,calc(env(safe-area-inset-top)+1rem))] pb-3 transition-colors">
      <div className="max-w-md mx-auto flex flex-col gap-3">
        {/* Top Bar: Brand, Sync Pill, Theme & Settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-glow-blue text-white font-black text-sm">
              FW
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                FinancialApp Wachid
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                FINANCIAL TRACKER &bull; WACHID
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Sheets Sync Pill */}
            <button
              onClick={handleQuickSync}
              disabled={isSyncing}
              title={syncConfig.scriptUrl ? 'Klik untuk sinkronisasi Google Sheets' : 'Atur URL Google Sheets di Pengaturan'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-all text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/10"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  <span className="hidden sm:inline">Syncing...</span>
                </>
              ) : syncConfig.scriptUrl ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Cloud className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px]">{syncConfig.lastSyncedAt || 'Online'}</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400">Offline / Local</span>
                </>
              )}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              aria-label="Settings"
              className="p-2 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Display / Switcher */}
        {users.length > 1 ? (
          <div className="relative p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.07] border border-black/5 dark:border-white/10 flex items-center justify-between">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => handleProfileSelect(u.id as any)}
                className={`relative flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors z-10 ${
                  activeProfile === u.id
                    ? 'text-blue-600 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {activeProfile === u.id && (
                  <motion.div
                    layoutId="activeProfileIndicator"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-[#1a2333] shadow-md border border-black/5 dark:border-white/15"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 text-sm">{u.avatar || '👤'}</span>
                <span className="relative z-10 truncate">{u.name}</span>
              </button>
            ))}

            <button
              onClick={() => handleProfileSelect('household')}
              className={`relative flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors z-10 ${
                activeProfile === 'household'
                  ? 'text-emerald-600 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {activeProfile === 'household' && (
                <motion.div
                  layoutId="activeProfileIndicator"
                  className="absolute inset-0 rounded-xl bg-white dark:bg-[#1a2333] shadow-md border border-black/5 dark:border-white/15"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">
                <Users className="w-3.5 h-3.5" />
              </span>
              <span className="relative z-10 truncate">Gabungan</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-lg">{users[0]?.avatar || '👨‍💼'}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {users[0]?.name || 'Wachid'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold">
                  {users[0]?.role || 'Ayah'}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Profil Aktif</span>
          </div>
        )}
      </div>
    </header>
  );
};
