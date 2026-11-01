import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  History,
  Info,
  Layers,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { GlassButton } from '../common/GlassButton';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../utils/financeCalculators';
import { triggerHaptic } from '../../utils/haptics';

export const AchievementView: React.FC = () => {
  const {
    achievementData,
    currentMonthAchievement,
    selectedMonthName,
    users,
  } = useFinance();

  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [includeCurrentMonth, setIncludeCurrentMonth] = useState<boolean>(true);

  const pastMonths = achievementData.monthlyHistory.filter(h => h.isPastMonth);
  const currentMonthData = currentMonthAchievement;

  // Totals calculation
  const totalSavedU1 = includeCurrentMonth && currentMonthData
    ? achievementData.user1.grandTotalSaved + currentMonthData.user1.totalSaved
    : achievementData.user1.grandTotalSaved;

  const totalSavedU2 = includeCurrentMonth && currentMonthData
    ? achievementData.user2.grandTotalSaved + currentMonthData.user2.totalSaved
    : achievementData.user2.grandTotalSaved;

  const totalHousehold = totalSavedU1 + totalSavedU2;

  const u1Ratio = totalHousehold > 0 ? Math.round((totalSavedU1 / totalHousehold) * 100) : 50;
  const u2Ratio = totalHousehold > 0 ? 100 - u1Ratio : 50;

  const handleCelebrate = () => {
    triggerHaptic('success');
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#007AFF', '#AF52DE', '#34C759'],
    });
  };

  const toggleMonthExpand = (m: string) => {
    triggerHaptic('light');
    setExpandedMonth(prev => (prev === m ? null : m));
  };

  return (
    <div className="space-y-4">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-blue-500/15 border border-amber-500/30 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg font-black">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Achievement Tabungan</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sisa Arus Kas Bulan Lewat + Tabungan Tercapai
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCelebrate}
            title="Rayakan Capaian"
            className="p-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 transition-all active:scale-90"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Grand Total Household Card */}
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              Total Brankas Tersimpan ({users.map(u => u.name).join(' & ')})
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full">
              {achievementData.pastMonthsCount} Bulan Ditutup
            </span>
          </div>

          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            {formatRupiah(totalHousehold)}
          </div>

          {/* Ratio bar (only if > 1 user) */}
          {users.length > 1 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>{users[0]?.avatar || '👨‍💼'}</span>
                  <span>{users[0]?.name}: {formatRupiah(totalSavedU1, true)} ({u1Ratio}%)</span>
                </span>
                <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <span>{users[1]?.name || 'User 2'}: {formatRupiah(totalSavedU2, true)} ({u2Ratio}%)</span>
                  <span>{users[1]?.avatar || '👩‍💼'}</span>
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${u1Ratio}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-l-full shadow-sm"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${u2Ratio}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-r-full shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Month Toggle Switch */}
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Sertakan estimasi tabungan & sisa uang bulan berjalan
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIncludeCurrentMonth(prev => !prev);
            }}
            className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
              includeCurrentMonth
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400'
            }`}
          >
            {includeCurrentMonth ? 'Aktif' : 'Bulan Lewat Saja'}
          </button>
        </div>
      </div>

      {/* Individual Achievement Cards */}
      <div className={users.length > 1 ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
        {/* Card Wachid */}
        <GlassCard variant="glow-blue" className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{users[0]?.avatar || '👨‍💼'}</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {users[0]?.name || 'Wachid'}
                </h3>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  {users[0]?.role || 'Ayah'} &bull; Gaji {formatRupiah(users[0]?.baseSalary || 0, true)}
                </span>
              </div>
            </div>

            <GlassBadge variant="blue" size="sm">
              Level Saver
            </GlassBadge>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Dana Di-Saving
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatRupiah(totalSavedU1)}
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/10 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <PiggyBank className="w-3.5 h-3.5 text-blue-500" />
                <span>Tabungan Tercapai:</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatRupiah(
                  achievementData.user1.totalSavingsDeposited +
                    (includeCurrentMonth && currentMonthData ? currentMonthData.user1.savingsAmount : 0)
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sisa Kas Terselamatkan:</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(
                  achievementData.user1.totalSurplusAccumulated +
                    (includeCurrentMonth && currentMonthData ? currentMonthData.user1.surplusCash : 0)
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
              <span>Target Bulanan Sukses:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {achievementData.user1.monthsAchievedCount} Bulan
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Card User 2 (if present) */}
        {users.length > 1 && (
          <GlassCard variant="glow-purple" className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{users[1]?.avatar || '👩‍💼'}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {users[1]?.name || 'User 2'}
                  </h3>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    {users[1]?.role || 'Anggota'} &bull; Gaji {formatRupiah(users[1]?.baseSalary || 0, true)}
                  </span>
                </div>
              </div>

              <GlassBadge variant="purple" size="sm">
                Smart Saver
              </GlassBadge>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Dana Di-Saving
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatRupiah(totalSavedU2)}
              </div>
            </div>

            {/* Breakdown Pills */}
            <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <PiggyBank className="w-3.5 h-3.5 text-purple-500" />
                  <span>Tabungan Tercapai:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatRupiah(
                    achievementData.user2.totalSavingsDeposited +
                      (includeCurrentMonth && currentMonthData ? currentMonthData.user2.savingsAmount : 0)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sisa Kas Terselamatkan:</span>
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(
                    achievementData.user2.totalSurplusAccumulated +
                      (includeCurrentMonth && currentMonthData ? currentMonthData.user2.surplusCash : 0)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                <span>Target Bulanan Sukses:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {achievementData.user2.monthsAchievedCount} Bulan
                </span>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Monthly History Accordion */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Pencapaian Per Bulan</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {achievementData.monthlyHistory.length} Periode
          </span>
        </div>

        {achievementData.monthlyHistory.length === 0 ? (
          <GlassCard className="p-6 text-center text-xs text-slate-400 space-y-2">
            <PiggyBank className="w-8 h-8 mx-auto text-slate-400" />
            <p>Belum ada rekaman bulan. Saat Anda mencatat transaksi dan bulan berganti, seluruh akumulasi sisa kas dan tabungan akan tersusun di sini.</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {achievementData.monthlyHistory.map(item => {
              const isExpanded = expandedMonth === item.month;
              return (
                <GlassCard key={item.month} className="p-3.5">
                  <div
                    onClick={() => toggleMonthExpand(item.month)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl text-xs font-bold ${
                          item.isPastMonth
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                            {item.monthName}
                          </span>
                          {item.isPastMonth ? (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-semibold">
                              Bulan Ditutup
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold">
                              Sedang Berjalan
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Total Tersimpan: {formatRupiah(item.totalHouseholdSaved)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {formatRupiah(item.totalHouseholdSaved, true)}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {users.map(u => u.name).join(' & ')}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 space-y-3"
                      >
                        {/* Wachid Month Detail */}
                        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <span>{users[0]?.avatar || '👨‍💼'}</span>
                              <span>Pencapaian {users[0]?.name || 'Wachid'}:</span>
                            </span>
                            <span className="text-slate-900 dark:text-white">
                              {formatRupiah(item.user1.totalSaved)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>Tabungan Yang Masuk:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {formatRupiah(item.user1.savingsAmount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>Sisa Arus Kas Bersih (Surplus):</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              +{formatRupiah(item.user1.surplusCash)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-black/5 dark:border-white/5">
                            <span>Target Tabungan Bulan Ini:</span>
                            <span>{item.user1.targetSavings > 0 ? formatRupiah(item.user1.targetSavings) : 'Belum ditentukan'}</span>
                          </div>
                        </div>

                        {/* User 2 Month Detail (if present) */}
                        {users.length > 1 && (
                          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                <span>{users[1]?.avatar || '👩‍💼'}</span>
                                <span>Pencapaian {users[1]?.name || 'User 2'}:</span>
                              </span>
                              <span className="text-slate-900 dark:text-white">
                                {formatRupiah(item.user2.totalSaved)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>Tabungan Yang Masuk:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {formatRupiah(item.user2.savingsAmount)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>Sisa Arus Kas Bersih (Surplus):</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                +{formatRupiah(item.user2.surplusCash)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-black/5 dark:border-white/5">
                              <span>Target Tabungan Bulan Ini:</span>
                              <span>{item.user2.targetSavings > 0 ? formatRupiah(item.user2.targetSavings) : 'Belum ditentukan'}</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Guide Card */}
      <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Cara Kerja Perhitungan Achievement Tabungan:</span>
        </div>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>Setiap bulan baru, gaji bulanan kembali utuh dan perhitungan dimulai kembali dari awal.</li>
          <li>Target tabungan per bulan dimulai dari kosong agar dapat Anda input sesuai komitmen bulan tersebut.</li>
          <li>Uang yang tersimpan (di-saving) dihitung dari gabungan: <strong>Tabungan yang berhasil disisihkan</strong> + <strong>Sisa arus kas (surplus) yang tersisa di akhir bulan</strong>.</li>
        </ul>
      </div>
    </div>
  );
};
