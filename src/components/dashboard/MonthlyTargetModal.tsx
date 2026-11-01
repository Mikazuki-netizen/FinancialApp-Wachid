import React, { useEffect, useState } from 'react';
import { Check, Edit3, PiggyBank, Sparkles, User } from 'lucide-react';
import { GlassModal } from '../common/GlassModal';
import { GlassButton } from '../common/GlassButton';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah } from '../../utils/financeCalculators';
import { triggerHaptic } from '../../utils/haptics';

interface MonthlyTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyTargetModal: React.FC<MonthlyTargetModalProps> = ({ isOpen, onClose }) => {
  const { selectedMonth, selectedMonthName, monthlyTargets, updateMonthlyTarget, users } = useFinance();

  const [u1Target, setU1Target] = useState('');
  const [u2Target, setU2Target] = useState('');

  // Load current values when modal opens or month changes
  useEffect(() => {
    if (isOpen) {
      const current = monthlyTargets[selectedMonth] || {};
      setU1Target(current.user_1 ? String(current.user_1) : '');
      setU2Target(current.user_2 ? String(current.user_2) : '');
    }
  }, [isOpen, selectedMonth, monthlyTargets]);

  const numU1 = Number(u1Target.replace(/[^0-9]/g, '')) || 0;
  const numU2 = Number(u2Target.replace(/[^0-9]/g, '')) || 0;
  const totalCombined = numU1 + numU2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    updateMonthlyTarget(selectedMonth, {
      user_1: numU1,
      user_2: numU2,
    });
    onClose();
  };

  const handleQuickAdd = (user: 'u1' | 'u2', amount: number) => {
    triggerHaptic('light');
    if (user === 'u1') {
      setU1Target(String(numU1 + amount));
    } else {
      setU2Target(String(numU2 + amount));
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Target Tabungan Bulan Ini"
      subtitle={`Periode: ${selectedMonthName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
          <PiggyBank className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="leading-relaxed">
            Target tabungan bersifat bulanan. Setiap memasuki bulan baru, target dimulai dari kosong agar Anda dapat menyesuaikan komitmen menabung bulan tersebut.
          </div>
        </div>

        {/* User 1: Wachid */}
        <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{users[0]?.avatar || '👨‍💼'}</span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Target Tabungan {users[0]?.name || 'Wachid'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Gaji Bulanan: {formatRupiah(users[0]?.baseSalary || 0, true)}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
              {formatRupiah(numU1)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0 (Belum ada target)"
              value={u1Target ? Number(u1Target).toLocaleString('id-ID') : ''}
              onChange={e => setU1Target(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400">Pilihan cepat:</span>
            {[1_000_000, 2_000_000, 5_000_000].map(val => (
              <button
                type="button"
                key={val}
                onClick={() => {
                  triggerHaptic('light');
                  setU1Target(String(val));
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium hover:bg-blue-500 hover:text-white transition-all"
              >
                {formatRupiah(val, true)}
              </button>
            ))}
          </div>
        </div>

        {/* User 2 (if present) */}
        {users.length > 1 && (
          <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{users[1]?.avatar || '👩‍💼'}</span>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Target Tabungan {users[1]?.name || 'User 2'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Gaji Bulanan: {formatRupiah(users[1]?.baseSalary || 0, true)}
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                {formatRupiah(numU2)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0 (Belum ada target)"
                value={u2Target ? Number(u2Target).toLocaleString('id-ID') : ''}
                onChange={e => setU2Target(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Pilihan cepat:</span>
              {[1_000_000, 2_000_000, 3_000_000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => {
                    triggerHaptic('light');
                    setU2Target(String(val));
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium hover:bg-purple-500 hover:text-white transition-all"
                >
                  {formatRupiah(val, true)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-black/5 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
              {users.length > 1 ? 'Total Target Gabungan' : 'Total Target Bulan Ini'}
            </span>
            <span className="text-xs text-slate-400">
              {users.map(u => u.name).join(' & ')}
            </span>
          </div>
          <span className="text-base font-black text-slate-900 dark:text-white">
            {formatRupiah(totalCombined)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            Batal
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            icon={<Check className="w-4 h-4" />}
          >
            Simpan Target {selectedMonthName}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
};
