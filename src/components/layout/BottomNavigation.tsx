import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, LayoutDashboard, NotebookPen, Plus, Receipt } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export type TabType = 'dashboard' | 'fixed' | 'achievement' | 'deposito' | 'transactions' | 'notes';

interface BottomNavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenAddTransaction: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddTransaction,
}) => {
  const handleTabClick = (tab: TabType) => {
    triggerHaptic('light');
    onChangeTab(tab);
  };

  const handleAddClick = () => {
    triggerHaptic('medium');
    onOpenAddTransaction();
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-nav rounded-3xl px-3 py-2 flex items-center justify-between shadow-2xl relative">
          {/* Tab 1: Ringkasan / Dashboard */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
              activeTab === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className="w-5 h-5" />
              {activeTab === 'dashboard' && (
                <motion.div
                  layoutId="bottomTabIndicator"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                />
              )}
            </div>
            <span className="text-[10px] mt-1">Beranda</span>
          </button>

          {/* Tab 2: Cicilan Wajib / Fixed */}
          <button
            onClick={() => handleTabClick('fixed')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
              activeTab === 'fixed'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <CheckCircle2 className="w-5 h-5" />
              {activeTab === 'fixed' && (
                <motion.div
                  layoutId="bottomTabIndicator"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                />
              )}
            </div>
            <span className="text-[10px] mt-1">Wajib</span>
          </button>

          {/* Center Floating Quick Action Button */}
          <div className="flex-1 flex justify-center -mt-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleAddClick}
              className="w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-glow-blue flex items-center justify-center border-2 border-white/60 dark:border-white/20 active:shadow-inner"
              aria-label="Tambah Transaksi"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </motion.button>
          </div>

          {/* Tab 3: Catatan & Password (Notes) */}
          <button
            onClick={() => handleTabClick('notes')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
              activeTab === 'notes'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <NotebookPen className="w-5 h-5" />
              {activeTab === 'notes' && (
                <motion.div
                  layoutId="bottomTabIndicator"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                />
              )}
            </div>
            <span className="text-[10px] mt-1">Catatan</span>
          </button>

          {/* Tab 4: Transaksi & Riwayat */}
          <button
            onClick={() => handleTabClick('transactions')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
              activeTab === 'transactions'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Receipt className="w-5 h-5" />
              {activeTab === 'transactions' && (
                <motion.div
                  layoutId="bottomTabIndicator"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                />
              )}
            </div>
            <span className="text-[10px] mt-1">Riwayat</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
