import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Coins,
  Edit3,
  Percent,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { MonthlyTargetModal } from './MonthlyTargetModal';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../utils/financeCalculators';
import { triggerHaptic } from '../../utils/haptics';

export const CashflowSummary: React.FC = () => {
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
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
    users,
    activeProfile,
    selectedMonthName,
    selectedMonthRange,
    isCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useFinance();

  const handleCelebrate = () => {
    triggerHaptic('success');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#007AFF', '#34C759', '#AF52DE', '#FFCC00'],
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Month & Period Selector Bar */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-black/5 dark:border-white/10 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex-shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate">
                {selectedMonthName}
              </span>
              {isCurrentMonth ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex-shrink-0">
                  Bulan Ini
                </span>
              ) : (
                <button
                  type="button"
                  onClick={goToCurrentMonth}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-500/25 transition-all flex-shrink-0"
                >
                  Kembali ke Bulan Ini
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              Periode: {selectedMonthRange}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={goToPreviousMonth}
            title="Bulan Sebelumnya"
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            title="Bulan Berikutnya"
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Balance / Net Cashflow Hero Card */}
      <GlassCard variant="glow-blue" className="bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Sisa Arus Kas Bersih (Net Cashflow)
            </span>
          </div>

          <GlassBadge variant={netCashflow >= 0 ? 'green' : 'red'} size="sm">
            {netCashflow >= 0 ? '+ Surplus' : '- Defisit'}
          </GlassBadge>
        </div>

        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatRupiah(netCashflow)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Setelah dikurangi kewajiban awal bulan, pengeluaran harian, & alokasi tabungan.
          </p>
        </div>

        {/* 2-Column Split: Inflow vs Outflow */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-black/5 dark:border-white/10">
          {/* Total Inflow */}
          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>Total Pemasukan</span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {formatRupiah(totalIncome)}
            </div>

            {/* Inflow breakdown pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Gaji: {formatRupiah(salaryIncome, true)}
              </span>
              {variableIncome > 0 && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Ekstra: +{formatRupiah(variableIncome, true)}
                </span>
              )}
              {depositoYieldTotal > 0 && (
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                  <Coins className="w-2.5 h-2.5" />
                  Yield: +{formatRupiah(depositoYieldTotal, true)}
                </span>
              )}
            </div>
          </div>

          {/* Total Outflow (Fixed + Daily) */}
          <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
              <span>Total Beban Hidup</span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {formatRupiah(totalFixedExpenses + totalDailyExpenses)}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
              <span>Wajib: {formatRupiah(totalFixedExpenses, true)}</span>
              <span>• Harian: {formatRupiah(totalDailyExpenses, true)}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Monthly Savings Target Progress Card */}
      <GlassCard variant="default">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex-shrink-0">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                Target Tabungan Bulanan ({selectedMonthName})
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                Alokasi tabungan & cadangan {users.map(u => u.name).join(' & ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {savingsTarget === 0 ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsTargetModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>Input Target</span>
              </button>
            ) : savingsProgressPercent >= 100 ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCelebrate}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-glow-green animate-bounce"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Tercapai!</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsTargetModalOpen(true);
                  }}
                  title="Ubah Target"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <GlassBadge variant="purple" size="sm">
                  {savingsProgressPercent}% Tercapai
                </GlassBadge>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsTargetModalOpen(true);
                  }}
                  title="Ubah Target"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* When target is 0 / empty */}
        {savingsTarget === 0 ? (
          <div className="mt-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-dashed border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Target tabungan bulan ini masih kosong. Silakan tentukan komitmen target tabungan untuk memulai pelacakan.
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsTargetModalOpen(true);
              }}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex-shrink-0"
            >
              Atur Sekarang &rarr;
            </button>
          </div>
        ) : (
          /* Progress Bar with Liquid Glow */
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-900 dark:text-white font-bold">
                {formatRupiah(totalSavings)}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                Target: {formatRupiah(savingsTarget)}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden relative p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(savingsProgressPercent, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-glow-purple relative overflow-hidden"
              >
                {/* Shimmer line inside progress */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              </motion.div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Monthly Target Modal */}
      <MonthlyTargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
      />
    </div>
  );
};
