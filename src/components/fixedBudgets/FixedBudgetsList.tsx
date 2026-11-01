import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  Plus,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { GlassButton } from '../common/GlassButton';
import { GlassModal } from '../common/GlassModal';
import { useFinance } from '../../context/FinanceContext';
import { FixedBudget } from '../../types/finance';
import { formatRupiah } from '../../utils/financeCalculators';
import { triggerHaptic } from '../../utils/haptics';

export const FixedBudgetsList: React.FC = () => {
  const {
    filteredFixedBudgets,
    toggleFixedBudgetPaid,
    addFixedBudget,
    deleteFixedBudget,
    users,
    activeProfile,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('5');
  const [category, setCategory] = useState<FixedBudget['category']>('KPR / Sewa');
  const [assignedUser, setAssignedUser] = useState<'user_1' | 'user_2' | 'shared'>('user_1');

  // Stats
  const totalObligations = filteredFixedBudgets.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = filteredFixedBudgets.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const totalUnpaid = totalObligations - totalPaid;
  const paidPercent = totalObligations > 0 ? Math.round((totalPaid / totalObligations) * 100) : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount.replace(/[^0-9]/g, ''));
    if (!name || parsedAmount <= 0) return;

    addFixedBudget({
      userId: assignedUser,
      name,
      amount: parsedAmount,
      dueDate: Number(dueDate) || 5,
      isPaid: false,
      category,
    });

    setName('');
    setAmount('');
    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (cat: FixedBudget['category']) => {
    switch (cat) {
      case 'KPR / Sewa':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'Cicilan Kendaraan':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'Utilitas & Listrik':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'Asuransi':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'Pendidikan':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Total Wajib & Paid Progress */}
      <GlassCard variant="default">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Kewajiban Awal Bulan (Wajib)
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatRupiah(totalObligations)}
            </div>
          </div>

          <GlassButton
            size="sm"
            variant="glass"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Tambah
          </GlassButton>
        </div>

        {/* Paid Progress Bar */}
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 min-w-0 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Lunas: {formatRupiah(totalPaid)} ({paidPercent}%)</span>
            </span>
            <span className="text-amber-600 dark:text-amber-400 flex-shrink-0">
              Sisa: {formatRupiah(totalUnpaid)}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${paidPercent}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </div>
      </GlassCard>

      {/* List of Obligations */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Daftar Tagihan & Cicilan ({filteredFixedBudgets.length})
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Ketuk lingkaran untuk centang bayar
          </span>
        </div>

        {filteredFixedBudgets.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Belum ada kewajiban tetap tercatat.
            </p>
          </GlassCard>
        ) : (
          <AnimatePresence>
            {filteredFixedBudgets.map(budget => {
              const assigned =
                budget.userId === 'shared'
                  ? 'Keluarga'
                  : users.find(u => u.id === budget.userId)?.name || 'User';

              return (
                <motion.div
                  key={budget.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group p-3.5 rounded-2xl glass-card flex items-center justify-between gap-3 transition-all ${
                    budget.isPaid
                      ? 'opacity-70 border-emerald-500/20'
                      : 'hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Paid / Unpaid Checkbox Toggle */}
                    <button
                      onClick={() => toggleFixedBudgetPaid(budget.id)}
                      className="p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                      aria-label={budget.isPaid ? 'Tandai belum bayar' : 'Tandai sudah bayar'}
                    >
                      {budget.isPaid ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 stroke-[2.2]" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-lg bg-black/5 dark:bg-white/5">
                          {getCategoryIcon(budget.category)}
                        </span>
                        <h4
                          className={`text-sm font-bold truncate ${
                            budget.isPaid
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {budget.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Jatuh Tempo: Tgl {budget.dueDate}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium">
                          {assigned}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm font-extrabold ${
                          budget.isPaid
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatRupiah(budget.amount)}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          budget.isPaid
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {budget.isPaid ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteFixedBudget(budget.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-opacity"
                      aria-label="Hapus Tagihan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Add Fixed Budget Modal */}
      <GlassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Kewajiban Tetap"
        subtitle="Cicilan KPR, kendaraan, listrik, asuransi bulanan"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Kewajiban
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Cicilan KPR Rumah BTN"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nominal (Rp)
              </label>
              <input
                type="number"
                required
                placeholder="5500000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tgl Jatuh Tempo (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kategori
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as FixedBudget['category'])}
              className="w-full glass-input cursor-pointer"
            >
              <option value="KPR / Sewa">KPR / Sewa Properti</option>
              <option value="Cicilan Kendaraan">Cicilan Kendaraan Mobil/Motor</option>
              <option value="Utilitas & Listrik">Utilitas (Listrik, PAM, WiFi)</option>
              <option value="Asuransi">Asuransi Jiwa & Kesehatan</option>
              <option value="Pendidikan">Pendidikan & Sekolah</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {users.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Dialokasikan Untuk
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAssignedUser('user_1')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    assignedUser === 'user_1'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-glow-blue'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {users[0]?.name || 'User 1'}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignedUser('user_2')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    assignedUser === 'user_2'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-glow-purple'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {users[1]?.name || 'User 2'}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignedUser('shared')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    assignedUser === 'shared'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-glow-green'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Bersama
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <GlassButton
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
            >
              Simpan Kewajiban
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
