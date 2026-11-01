import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/layout/Header';
import { BottomNavigation, TabType } from './components/layout/BottomNavigation';
import { FinancialHealthCard } from './components/dashboard/FinancialHealthCard';
import { CashflowSummary } from './components/dashboard/CashflowSummary';
import { FixedBudgetsList } from './components/fixedBudgets/FixedBudgetsList';
import { DepositoCalculatorModal } from './components/deposito/DepositoCalculatorModal';
import { TransactionsList } from './components/transactions/TransactionsList';
import { TransactionBottomSheet } from './components/transactions/TransactionBottomSheet';
import { AchievementView } from './components/achievement/AchievementView';
import { SettingsModal } from './components/settings/SettingsModal';
import { AndroidGuideModal } from './components/settings/AndroidGuideModal';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { ArrowRight, Calculator, CheckCircle2, PiggyBank, Receipt, Sparkles, AlertCircle, Cloud, Trophy } from 'lucide-react';
import { GlassCard } from './components/common/GlassCard';
import { triggerHaptic } from './utils/haptics';

export const AppContent: React.FC = () => {
  const { filteredTransactions, filteredFixedBudgets, activeProfile, toast } = useFinance();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidGuideOpen, setIsAndroidGuideOpen] = useState(false);

  return (
    <div className="min-h-screen relative mesh-bg-gradient selection:bg-blue-500 selection:text-white transition-colors duration-300">
      {/* Dynamic ambient blur sphere behind glass cards */}
      <div className="fixed top-20 -left-20 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="fixed bottom-32 -right-20 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl pointer-events-none" />

      {/* Floating Apple-Style Dynamic Island / Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-18 left-4 right-4 z-50 max-w-sm mx-auto pointer-events-none"
          >
            <div
              className={`p-3 rounded-2xl backdrop-blur-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
                toast.type === 'success'
                  ? 'bg-emerald-500/95 text-white border-emerald-400/40 shadow-emerald-500/20'
                  : toast.type === 'error'
                  ? 'bg-rose-500/95 text-white border-rose-400/40 shadow-rose-500/20'
                  : 'bg-slate-900/95 text-white border-white/20 shadow-black/20'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 text-white" />}
              {toast.type === 'info' && <Cloud className="w-4 h-4 flex-shrink-0 text-sky-400" />}
              <span className="flex-1 leading-snug">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky iOS Frosted Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content Area (Mobile Viewport Optimized) */}
      <main className="max-w-md mx-auto px-4 pt-4 pb-32 space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* 1. Health Diagnostic Engine (Apple HIG Widget) */}
              <FinancialHealthCard />

              {/* 2. Cashflow & Income Engine Overview */}
              <CashflowSummary />

              {/* 3. Quick Action Cards: Prestasi, Wajib & Deposito */}
              <div className="grid grid-cols-3 gap-2.5">
                <GlassCard
                  interactive
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('achievement');
                  }}
                  className="p-3 flex flex-col justify-between"
                >
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 w-fit">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      Prestasi
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                      <span className="truncate">Akumulasi</span>
                      <ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    </span>
                  </div>
                </GlassCard>

                <GlassCard
                  interactive
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('fixed');
                  }}
                  className="p-3 flex flex-col justify-between"
                >
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 w-fit">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      Wajib
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                      <span className="truncate">Cicilan</span>
                      <ArrowRight className="w-3 h-3 text-purple-500 flex-shrink-0" />
                    </span>
                  </div>
                </GlassCard>

                <GlassCard
                  interactive
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('deposito');
                  }}
                  className="p-3 flex flex-col justify-between"
                >
                  <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 w-fit">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div className="mt-2.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      Deposito
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                      <span className="truncate">Simulasi</span>
                      <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    </span>
                  </div>
                </GlassCard>
              </div>

              {/* 4. Recent Transactions Preview */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Aktivitas Transaksi Terbaru
                  </h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <TransactionsList />
              </div>
            </motion.div>
          )}

          {activeTab === 'fixed' && (
            <motion.div
              key="fixed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FixedBudgetsList />
            </motion.div>
          )}

          {activeTab === 'achievement' && (
            <motion.div
              key="achievement"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AchievementView />
            </motion.div>
          )}

          {activeTab === 'deposito' && (
            <motion.div
              key="deposito"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DepositoCalculatorModal />
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TransactionsList />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Apple HIG Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
      />

      {/* Quick Add Transaction Bottom Sheet Modal */}
      <TransactionBottomSheet
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      {/* Settings & Google Sheets Database Integration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAndroidGuide={() => {
          setIsSettingsOpen(false);
          setIsAndroidGuideOpen(true);
        }}
      />

      {/* Android Hybrid (Capacitor) Guide Modal */}
      <AndroidGuideModal
        isOpen={isAndroidGuideOpen}
        onClose={() => setIsAndroidGuideOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </ThemeProvider>
  );
}

