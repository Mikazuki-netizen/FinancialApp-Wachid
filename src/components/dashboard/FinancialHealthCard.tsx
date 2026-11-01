import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Coins,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../utils/financeCalculators';
import { triggerHaptic } from '../../utils/haptics';

export const FinancialHealthCard: React.FC = () => {
  const {
    totalIncome,
    totalFixedExpenses,
    totalDailyExpenses,
    totalSavings,
    netCashflow,
    activeProfile,
    currentUser,
  } = useFinance();

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    triggerHaptic('light');
    setIsExpanded(!isExpanded);
  };

  // 1. Total Pendapatan = 100% Base
  const baseIncome = Math.max(totalIncome, 1);
  const totalSpent = totalFixedExpenses + totalDailyExpenses + totalSavings;
  const remainingAmount = netCashflow; // totalIncome - totalSpent

  // 2. Persentase Sisa Uang dari Total Income
  const rawRemainingPercent = Math.round((remainingAmount / baseIncome) * 100);
  const remainingPercent = totalIncome > 0 ? rawRemainingPercent : 0;

  // Persentase rincian terhadap 100% income
  const fixedPercent = totalIncome > 0 ? (totalFixedExpenses / baseIncome) * 100 : 0;
  const dailyPercent = totalIncome > 0 ? (totalDailyExpenses / baseIncome) * 100 : 0;
  const savingsPercent = totalIncome > 0 ? (totalSavings / baseIncome) * 100 : 0;

  // Circle gauge meter calculations (0% to 100% visual fill)
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const gaugeFillPercent = Math.max(0, Math.min(remainingPercent, 100));
  const strokeDashoffset = circumference - (gaugeFillPercent / 100) * circumference;

  // Determine Visual State based on Remaining Income %
  let statusBadgeVariant: 'green' | 'amber' | 'red' = 'green';
  let cardVariant: 'glow-emerald' | 'default' | 'subtle' = 'glow-emerald';
  let ringColor = 'text-emerald-500 stroke-emerald-500';
  let statusLabel = 'Arus Kas Aman';
  let headline = `Tersisa ${formatRupiah(remainingAmount)} (${remainingPercent}% dari Pemasukan)`;

  if (totalIncome === 0) {
    statusBadgeVariant = 'amber';
    cardVariant = 'default';
    ringColor = 'text-slate-400 stroke-slate-400';
    statusLabel = 'Data Baru (0)';
    headline = 'Mulai Masukkan Pendapatan & Transaksi';
  } else if (remainingPercent >= 50) {
    statusBadgeVariant = 'green';
    cardVariant = 'glow-emerald';
    ringColor = 'text-emerald-500 stroke-emerald-500';
    statusLabel = 'Sisa Kas Prima';
    headline = `Tersisa ${formatRupiah(remainingAmount)} (${remainingPercent}% sisa kas)`;
  } else if (remainingPercent >= 20) {
    statusBadgeVariant = 'amber';
    cardVariant = 'default';
    ringColor = 'text-amber-500 stroke-amber-500';
    statusLabel = 'Terkendali';
    headline = `Tersisa ${formatRupiah(remainingAmount)} (${remainingPercent}% sisa kas)`;
  } else {
    statusBadgeVariant = 'red';
    cardVariant = 'subtle';
    ringColor = 'text-rose-500 stroke-rose-500';
    statusLabel = remainingPercent < 0 ? 'Defisit Arus Kas' : 'Sisa Menipis';
    headline =
      remainingPercent < 0
        ? `Defisit ${formatRupiah(Math.abs(remainingAmount))} (Melebihi Pendapatan)`
        : `Sisa tinggal ${formatRupiah(remainingAmount)} (${remainingPercent}% tersisa)`;
  }

  // Dynamic contextual advice based on remaining percentage
  const dynamicRecommendations = totalIncome === 0 ? [
    {
      type: 'warning' as const,
      title: 'Mulai dengan Menentukan Pendapatan Bulanan',
      description: 'Buka menu Pengaturan untuk memasukkan Gaji Pokok atau gunakan tombol + Transaksi untuk mencatat pemasukan.',
    },
    {
      type: 'positive' as const,
      title: 'Tambahkan Tagihan & Cicilan Wajib',
      description: 'Catat pos kewajiban rutin (seperti KPR, sewa, listrik) pada tab Beban Wajib.',
    }
  ] : [
    {
      type: remainingPercent >= 50 ? 'positive' : remainingPercent >= 20 ? 'warning' : 'critical',
      title:
        remainingPercent >= 50
          ? `Sisa Kas Sangat Aman (${remainingPercent}% Tersisa)`
          : remainingPercent >= 20
          ? `Sisa Kas Terkendali (${remainingPercent}% Tersisa)`
          : `Peringatan: Sisa Kas Menipis (${remainingPercent}%)`,
      description:
        remainingPercent >= 50
          ? `Anda masih memiliki sisa ${formatRupiah(
              remainingAmount
            )} (${remainingPercent}% dari total pemasukan). Pertimbangkan mengalokasikan surplus ini ke tabungan atau deposito berbunga.`
          : remainingPercent >= 20
          ? `Tersisa ${formatRupiah(
              remainingAmount
            )} untuk sisa bulan ini. Jaga pengeluaran harian agar rasio sisa kas tetap di atas 20%.`
          : `Pengeluaran telah menyerap ${Math.min(
              100,
              100 - remainingPercent
            )}% pemasukan Anda. Batasi pos belanja harian sekunder untuk mencegah defisit.`,
    },
    {
      type: fixedPercent <= 35 ? 'positive' : 'warning',
      title:
        fixedPercent <= 35
          ? `Beban Wajib Ideal (${fixedPercent.toFixed(0)}%)`
          : `Kewajiban Tetap Tinggi (${fixedPercent.toFixed(0)}%)`,
      description:
        fixedPercent <= 35
          ? `Cicilan & tagihan tetap hanya menyerap ${formatRupiah(
              totalFixedExpenses
            )} (${fixedPercent.toFixed(1)}%), masih di bawah batas aman perbankan (≤35%).`
          : `Kewajiban tetap menyerap ${formatRupiah(
              totalFixedExpenses
            )} (${fixedPercent.toFixed(1)}%). Hindari mengambil cicilan konsumtif baru.`,
    },
    {
      type: savingsPercent >= 20 ? 'positive' : savingsPercent >= 10 ? 'warning' : 'critical',
      title:
        savingsPercent >= 20
          ? `Target Tabungan 20% Tercapai (${savingsPercent.toFixed(0)}%)`
          : `Alokasi Tabungan (${savingsPercent.toFixed(0)}%)`,
      description:
        savingsPercent >= 20
          ? `Luar biasa! Anda telah menyisihkan ${formatRupiah(
              totalSavings
            )} (${savingsPercent.toFixed(1)}%) untuk investasi & masa depan.`
          : `Saat ini teralokasi ${formatRupiah(
              totalSavings
            )} (${savingsPercent.toFixed(1)}%). Disarankan menyisihkan minimal 10-20% di awal bulan.`,
    },
  ];

  return (
    <GlassCard variant={cardVariant} className="transition-all duration-300">
      <div className="flex items-start justify-between gap-2.5">
        {/* Left Side: Remaining Income % Gauge & Indicator */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Animated Gauge Ring — Shows % Remaining Income */}
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 54 54">
              {/* Background Track */}
              <circle
                cx="27"
                cy="27"
                r={radius}
                className="stroke-black/5 dark:stroke-white/10"
                strokeWidth="4.5"
                fill="transparent"
              />
              {/* Active Remaining Track */}
              <motion.circle
                cx="27"
                cy="27"
                r={radius}
                className={ringColor}
                strokeWidth="4.5"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-none">
                {remainingPercent}%
              </span>
              <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                SISA
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-1.5 mb-1">
              <GlassBadge
                variant={statusBadgeVariant}
                size="sm"
                className="text-[10px] px-2 py-0.5"
                icon={
                  statusBadgeVariant === 'green' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : statusBadgeVariant === 'amber' ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <ShieldAlert className="w-3 h-3" />
                  )
                }
              >
                {statusLabel}
              </GlassBadge>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 truncate max-w-[90px]">
                {activeProfile === 'household' ? 'Keluarga' : currentUser?.name}
              </span>
            </div>

            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words line-clamp-2">
              {headline}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Pendapatan: {formatRupiah(totalIncome, true)} • Pengeluaran: {formatRupiah(totalSpent, true)}
            </p>
          </div>
        </div>

        {/* Expand Diagnostics Button */}
        <button
          onClick={toggleExpand}
          className="p-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0 mt-0.5"
          aria-label="Rincian Alokasi"
        >
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* 3 Allocation Cards: Wajib (Fixed), Harian (Daily), Tabungan (Savings) */}
      <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3.5 border-t border-black/5 dark:border-white/10">
        {/* Wajib (Cicilan / Tagihan Tetap) */}
        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 min-w-0">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium gap-1">
            <span className="truncate">Wajib (KPR)</span>
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                fixedPercent <= 30
                  ? 'bg-emerald-500'
                  : fixedPercent <= 40
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">
            {fixedPercent.toFixed(0)}%
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {formatRupiah(totalFixedExpenses, true)}
          </div>
        </div>

        {/* Harian (Daily Expenses) */}
        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 min-w-0">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium gap-1">
            <span className="truncate">Harian (Daily)</span>
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                dailyPercent <= 30
                  ? 'bg-emerald-500'
                  : dailyPercent <= 45
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">
            {dailyPercent.toFixed(0)}%
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {formatRupiah(totalDailyExpenses, true)}
          </div>
        </div>

        {/* Tabungan / Investasi */}
        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 min-w-0">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium gap-1">
            <span className="truncate">Tabungan</span>
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                savingsPercent >= 20
                  ? 'bg-emerald-500'
                  : savingsPercent >= 10
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">
            {savingsPercent.toFixed(0)}%
          </div>
          <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {formatRupiah(totalSavings, true)}
          </div>
        </div>
      </div>

      {/* Expandable Actionable Advice */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 space-y-2"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Analisis & Rekomendasi Alokasi Kas</span>
            </div>

            <div className="space-y-2 mt-2">
              {dynamicRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs border ${
                    rec.type === 'positive'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300'
                      : rec.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {rec.type === 'positive' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                    ) : rec.type === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
                    )}
                    <span>{rec.title}</span>
                  </div>
                  <p className="mt-1 opacity-90 leading-relaxed text-[11px]">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
