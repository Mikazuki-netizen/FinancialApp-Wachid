import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Car,
  Check,
  Coffee,
  Coins,
  CreditCard,
  Film,
  Gift,
  Heart,
  HeartPulse,
  Home,
  MoreHorizontal,
  PiggyBank,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';
import { GlassModal } from '../common/GlassModal';
import { GlassButton } from '../common/GlassButton';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, UserId } from '../../types/finance';
import { formatMonthYearIndo, formatRupiah } from '../../utils/financeCalculators';
import { triggerHaptic } from '../../utils/haptics';

interface TransactionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

interface CategoryOption {
  name: string;
  icon: React.ReactNode;
}

export const TransactionBottomSheet: React.FC<TransactionBottomSheetProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const { addTransaction, updateTransaction, deleteTransaction, users, activeProfile, selectedMonth } = useFinance();

  const [type, setType] = useState<TransactionType>('daily_expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Makanan & Kuliner');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });
  const [assignedUser, setAssignedUser] = useState<UserId>(
    activeProfile === 'user_2' ? 'user_2' : 'user_1'
  );

  // Synchronize state when opening in edit or create mode
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      setDescription(transactionToEdit.description || '');
      setDate(
        transactionToEdit.timestamp
          ? transactionToEdit.timestamp.split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setAssignedUser(transactionToEdit.userId);
    } else {
      setType('daily_expense');
      setAmount('');
      setCategory('Makanan & Kuliner');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setAssignedUser(activeProfile === 'user_2' ? 'user_2' : 'user_1');
    }
  }, [transactionToEdit, isOpen, activeProfile]);

  const categoriesByType: Record<TransactionType, CategoryOption[]> = {
    daily_expense: [
      { name: 'Makanan & Kuliner', icon: <Utensils className="w-4 h-4" /> },
      { name: 'Kopi & Nongkrong', icon: <Coffee className="w-4 h-4" /> },
      { name: 'Belanja Supermarket', icon: <ShoppingBag className="w-4 h-4" /> },
      { name: 'Transport & Bensin', icon: <Car className="w-4 h-4" /> },
      { name: 'Hiburan & Nonton', icon: <Film className="w-4 h-4" /> },
      { name: 'Kesehatan & Obat', icon: <HeartPulse className="w-4 h-4" /> },
      { name: 'Infaq / Amal', icon: <Heart className="w-4 h-4 text-emerald-500" /> },
      { name: 'Lain-lain', icon: <MoreHorizontal className="w-4 h-4" /> },
    ],
    income: [
      { name: 'Gaji Pokok', icon: <Wallet className="w-4 h-4" /> },
      { name: 'Bonus & THR', icon: <Gift className="w-4 h-4" /> },
      { name: 'Freelance & Side Job', icon: <Briefcase className="w-4 h-4" /> },
      { name: 'Passive Income', icon: <Coins className="w-4 h-4" /> },
      { name: 'Lain-lain', icon: <TrendingUp className="w-4 h-4" /> },
    ],
    fixed_expense: [
      { name: 'KPR / Sewa', icon: <Home className="w-4 h-4" /> },
      { name: 'Cicilan Kendaraan', icon: <Car className="w-4 h-4" /> },
      { name: 'Listrik & WiFi', icon: <Zap className="w-4 h-4" /> },
      { name: 'Asuransi', icon: <HeartPulse className="w-4 h-4" /> },
      { name: 'Tagihan Lainnya', icon: <CreditCard className="w-4 h-4" /> },
    ],
    savings: [
      { name: 'Reksadana', icon: <TrendingUp className="w-4 h-4" /> },
      { name: 'Tabungan Emas', icon: <Coins className="w-4 h-4" /> },
      { name: 'Deposito Tambahan', icon: <PiggyBank className="w-4 h-4" /> },
      { name: 'Dana Darurat', icon: <Wallet className="w-4 h-4" /> },
    ],
    deposito: [
      { name: 'Bunga Deposito', icon: <Coins className="w-4 h-4" /> },
    ],
  };

  const currentCategories = categoriesByType[type] || categoriesByType.daily_expense;

  const handleTypeChange = (newType: TransactionType) => {
    triggerHaptic('light');
    setType(newType);
    const defaults = categoriesByType[newType];
    if (defaults && defaults.length > 0) {
      setCategory(defaults[0].name);
    }
  };

  const handleAddQuickAmount = (delta: number) => {
    triggerHaptic('light');
    const current = Number(amount.replace(/[^0-9]/g, '')) || 0;
    setAmount(String(current + delta));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount.replace(/[^0-9]/g, ''));
    if (parsedAmount <= 0) return;

    // Construct local timestamp to prevent timezone shifts across midnight
    const [y, m, d] = date.split('-').map(Number);
    const now = new Date();
    const targetDate = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
    const timestamp = targetDate.toISOString();

    if (transactionToEdit) {
      updateTransaction(transactionToEdit.id, {
        userId: assignedUser,
        type,
        category,
        amount: parsedAmount,
        description: description.trim() || category,
        timestamp,
      });
    } else {
      addTransaction({
        userId: assignedUser,
        type,
        category,
        amount: parsedAmount,
        description: description.trim() || category,
        timestamp,
      });
    }

    // Reset & Close
    setAmount('');
    setDescription('');
    onClose();
  };

  const handleDelete = () => {
    if (!transactionToEdit) return;
    triggerHaptic('medium');
    deleteTransaction(transactionToEdit.id);
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit & Sesuaikan Transaksi' : 'Catat Transaksi Baru'}
      subtitle={
        transactionToEdit
          ? 'Penyesuaian (adjustment) nominal, kategori, atau tanggal'
          : 'Pencatatan cepat berbasis profil'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Segmented Controller */}
        <div className="p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.07] border border-black/5 dark:border-white/10 grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => handleTypeChange('daily_expense')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              type === 'daily_expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Harian
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('fixed_expense')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              type === 'fixed_expense'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Wajib
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('savings')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              type === 'savings'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tabungan
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pemasukan
          </button>
        </div>

        {/* User Assignment Toggle */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
            Dicatat Oleh:
          </span>
          {users.length > 1 ? (
            <div className="flex gap-2">
              {users.map(u => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setAssignedUser(u.id as UserId);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    assignedUser === u.id
                      ? 'bg-blue-600 text-white shadow-glow-blue'
                      : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{u.avatar || '👤'}</span>
                  <span>{u.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
              <span>{users[0]?.avatar || '👨‍💼'}</span>
              <span>{users[0]?.name || 'Wachid'}</span>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nominal Rupiah (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              Rp
            </span>
            <input
              type="number"
              required
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full glass-input pl-11 text-lg font-black tracking-tight"
            />
          </div>

          {/* Quick Increment Chips */}
          <div className="flex gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => handleAddQuickAmount(25_000)}
              className="flex-1 py-1 text-[10px] font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/5"
            >
              +25 Rb
            </button>
            <button
              type="button"
              onClick={() => handleAddQuickAmount(50_000)}
              className="flex-1 py-1 text-[10px] font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/5"
            >
              +50 Rb
            </button>
            <button
              type="button"
              onClick={() => handleAddQuickAmount(100_000)}
              className="flex-1 py-1 text-[10px] font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/5"
            >
              +100 Rb
            </button>
            <button
              type="button"
              onClick={() => handleAddQuickAmount(500_000)}
              className="flex-1 py-1 text-[10px] font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/5"
            >
              +500 Rb
            </button>
          </div>
        </div>

        {/* Category Picker Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Pilih Kategori
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currentCategories.map(cat => {
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setCategory(cat.name);
                  }}
                  className={`p-2 rounded-xl text-left flex items-center gap-2 border transition-all text-xs font-semibold ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-black/20'
                  }`}
                >
                  <span className="p-1 rounded-lg bg-black/5 dark:bg-white/10 text-current flex-shrink-0">
                    {cat.icon}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Keterangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Makan siang ramen"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full glass-input text-xs"
            />
          </div>
        </div>

        {/* Income Destination Preview Callout */}
        {type === 'income' && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            <div className="leading-snug">
              Pemasukan ini akan <strong>ditambahkan</strong> ke base pendapatan bulan{' '}
              <strong>{formatMonthYearIndo(date.slice(0, 7))}</strong>.
            </div>
          </div>
        )}

        {/* Submit & Action Buttons */}
        <div className="pt-2">
          {transactionToEdit ? (
            <div className="flex items-center gap-2">
              <GlassButton
                type="button"
                variant="danger"
                size="md"
                onClick={handleDelete}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Hapus
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                icon={<Check className="w-4 h-4 stroke-[2.5]" />}
              >
                Simpan Penyesuaian
              </GlassButton>
            </div>
          ) : (
            <GlassButton
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              icon={<Plus className="w-5 h-5 stroke-[2.5]" />}
            >
              Simpan Transaksi
            </GlassButton>
          )}
        </div>
      </form>
    </GlassModal>
  );
};
