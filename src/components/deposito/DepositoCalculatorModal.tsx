import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Coins,
  DollarSign,
  Info,
  Percent,
  PiggyBank,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { GlassButton } from '../common/GlassButton';
import { useFinance } from '../../context/FinanceContext';
import { calculateDeposito, formatRupiah } from '../../utils/financeCalculators';
import { triggerHaptic } from '../../utils/haptics';

export const DepositoCalculatorModal: React.FC = () => {
  const {
    addInvestment,
    filteredInvestments,
    toggleInvestmentActive,
    users,
    activeProfile,
    isDepositoSyncEnabled,
    setDepositoSyncEnabled,
  } = useFinance();

  // Deposito Calculator State
  const [name, setName] = useState('Deposito Bank Digital (SeaBank/BCA/Jago)');
  const [principal, setPrincipal] = useState<number>(100_000_000);
  const [apyPercent, setApyPercent] = useState<number>(6.0);
  const [tenorMonths, setTenorMonths] = useState<number>(12);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(20);
  const [autoCompound, setAutoCompound] = useState<boolean>(false);
  const [assignedUser, setAssignedUser] = useState<'user_1' | 'user_2' | 'shared'>('user_1');
  const [justAdded, setJustAdded] = useState(false);

  // Compute live calculation
  const result = calculateDeposito(
    principal,
    apyPercent,
    tenorMonths,
    taxRatePercent,
    autoCompound
  );

  const handleInjectToIncome = () => {
    triggerHaptic('success');
    addInvestment(
      {
        userId: assignedUser,
        name,
        type: 'deposito',
        principal,
        apyPercent,
        tenorMonths,
        taxRatePercent,
        grossMonthlyYield: result.grossMonthlyYield,
        netMonthlyYield: result.netMonthlyYield,
        maturityYield: result.totalNetInterestEarned,
        startDate: new Date().toISOString(),
        autoCompound,
        isActive: true,
        injectedToIncome: isDepositoSyncEnabled,
      },
      isDepositoSyncEnabled
    );

    if (isDepositoSyncEnabled) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#34C759', '#FFD60A'],
      });
    }

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
  };

  const presetPrincipals = [10_000_000, 50_000_000, 100_000_000, 250_000_000];
  const presetApys = [4.5, 5.5, 6.0, 7.5];

  return (
    <div className="space-y-4">
      {/* Deposito Mode Switcher (Sync with Main Dashboard vs Standalone Calculator) */}
      <GlassCard variant={isDepositoSyncEnabled ? 'glow-blue' : 'default'} className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                isDepositoSyncEnabled
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  : 'bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400'
              }`}
            >
              {isDepositoSyncEnabled ? <TrendingUp className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Sinkronisasi ke Arus Kas
                </span>
                <GlassBadge variant={isDepositoSyncEnabled ? 'green' : 'neutral'} size="sm">
                  {isDepositoSyncEnabled ? 'ON (Tersinkron)' : 'OFF (Kalkulator Terpisah)'}
                </GlassBadge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                {isDepositoSyncEnabled
                  ? 'Bunga bulanan otomatis digabung ke Total Pemasukan & Dashboard'
                  : 'Kalkulator mandiri — hasil bunga tidak memengaruhi pemasukan atau saldo Dashboard'}
              </p>
            </div>
          </div>

          {/* iOS-Style Toggle Switch */}
          <button
            type="button"
            onClick={() => setDepositoSyncEnabled(!isDepositoSyncEnabled)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isDepositoSyncEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={isDepositoSyncEnabled}
            aria-label="Toggle Sinkronisasi Deposito"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isDepositoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </GlassCard>

      {/* Deposito Calculator Main Card */}
      <GlassCard variant="glow-blue">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Kalkulator Deposito & Bunga Bersih
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pajak PPh Final 20% (Ketentuan BI & Ditjen Pajak)
              </p>
            </div>
          </div>

          <GlassBadge variant="blue" size="sm">
            {isDepositoSyncEnabled ? 'Mode Sinkron' : 'Mode Terpisah'}
          </GlassBadge>
        </div>

        {/* Inputs */}
        <div className="space-y-3.5 mt-4">
          {/* Label / Bank Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Produk / Bank
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full glass-input text-xs"
            />
          </div>

          {/* Principal Amount */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Nominal Pokok Penempatan</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                {formatRupiah(principal)}
              </span>
            </div>

            <input
              type="range"
              min="1000000"
              max="500000000"
              step="1000000"
              value={principal}
              onChange={e => setPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-black/10 dark:bg-white/15 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            {/* Quick Chips for Principal */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presetPrincipals.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPrincipal(amt);
                  }}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                    principal === amt
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {formatRupiah(amt, true)}
                </button>
              ))}
            </div>
          </div>

          {/* APY Rate & Tenor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Bunga APY (%)</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {apyPercent}% p.a.
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="1"
                max="25"
                value={apyPercent}
                onChange={e => setApyPercent(Number(e.target.value))}
                className="w-full glass-input text-xs"
              />

              <div className="flex gap-1 mt-1.5">
                {presetApys.map(rate => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setApyPercent(rate);
                    }}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                      apyPercent === rate
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-500'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Tenor Waktu</span>
                <span className="text-slate-600 dark:text-slate-400 font-bold">
                  {tenorMonths} Bulan
                </span>
              </div>
              <select
                value={tenorMonths}
                onChange={e => setTenorMonths(Number(e.target.value))}
                className="w-full glass-input text-xs cursor-pointer"
              >
                <option value={1}>1 Bulan</option>
                <option value={3}>3 Bulan</option>
                <option value={6}>6 Bulan</option>
                <option value={12}>12 Bulan (1 Tahun)</option>
                <option value={24}>24 Bulan (2 Tahun)</option>
                <option value={36}>36 Bulan (3 Tahun)</option>
              </select>
            </div>
          </div>

          {/* Tax & Compound Toggles */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                  Pajak Bunga (PPh)
                </span>
                <span className="text-[9px] text-slate-400">
                  {principal > 7_500_000 ? 'Wajib 20% (> 7.5jt)' : 'Bebas Pajak (≤ 7.5jt)'}
                </span>
              </div>
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {result.taxRatePercent}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setAutoCompound(!autoCompound);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                autoCompound
                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-600 dark:text-blue-400'
                  : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold block">
                  Bunga Bergulung
                </span>
                <span className="text-[9px] font-bold">
                  {autoCompound ? 'AKTIF' : 'OFF'}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                Compound otomatis tiap bulan
              </span>
            </button>
          </div>

          {/* Owner Assignment */}
          {users.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pemilik Portofolio
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAssignedUser('user_1')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    assignedUser === 'user_1'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {users[0]?.name || 'User 1'}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignedUser('user_2')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    assignedUser === 'user_2'
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {users[1]?.name || 'User 2'}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignedUser('shared')}
                  className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    assignedUser === 'shared'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Bersama
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Calculation Results Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-2">
            <span>Hasil Kalkulasi Imbal Hasil Bersih</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                Passive Income Bersih / Bulan
              </span>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{formatRupiah(result.netMonthlyYield)}
              </div>
              <span className="text-[9px] text-slate-400">
                Kotor: {formatRupiah(result.grossMonthlyYield)}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                Total Bunga Bersih ({tenorMonths} Bln)
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                +{formatRupiah(result.totalNetInterestEarned)}
              </div>
              <span className="text-[9px] text-slate-400">
                Potongan Pajak: {formatRupiah(result.totalTaxPaid)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Total Akhir Saat Jatuh Tempo:
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {formatRupiah(result.maturityTotalWithPrincipal)}
            </span>
          </div>

          {/* Action Button: Inject to Recurring Income or Save Simulation */}
          <div className="mt-4">
            <GlassButton
              type="button"
              variant={isDepositoSyncEnabled ? 'emerald' : 'glass'}
              fullWidth
              size="md"
              icon={justAdded ? <CheckCircle2 className="w-4 h-4" /> : isDepositoSyncEnabled ? <TrendingUp className="w-4 h-4" /> : <PiggyBank className="w-4 h-4" />}
              onClick={handleInjectToIncome}
            >
              {justAdded
                ? isDepositoSyncEnabled
                  ? 'Berhasil Disuntikkan ke Arus Kas!'
                  : 'Berhasil Disimpan ke Portofolio Simulasi!'
                : isDepositoSyncEnabled
                ? 'Suntikkan Yield Bulanan ke Passive Income'
                : 'Simpan Portofolio Simulasi (Mode Terpisah)'}
            </GlassButton>
            <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-1.5">
              {isDepositoSyncEnabled
                ? `Otomatis menambah pemasukan bulanan sebesar ${formatRupiah(result.netMonthlyYield)}/bln di Dashboard`
                : 'Mode kalkulator mandiri: tersimpan untuk simulasi tanpa mengubah total pemasukan / saldo di Dashboard'}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Active Portofolio List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Portofolio Deposito & Investasi ({filteredInvestments.length})
          </h3>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {isDepositoSyncEnabled ? '🟢 Sinkron Arus Kas' : '⚪ Mode Terpisah'}
          </span>
        </div>

        {filteredInvestments.length === 0 ? (
          <GlassCard className="text-center py-6">
            <p className="text-xs text-slate-400">
              Belum ada portofolio investasi tersimpan.
            </p>
          </GlassCard>
        ) : (
          filteredInvestments.map(inv => (
            <div
              key={inv.id}
              className="p-3.5 rounded-2xl glass-card flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <PiggyBank className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {inv.name}
                  </h4>
                </div>

                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Pokok: {formatRupiah(inv.principal, true)}</span>
                  <span>• APY: {inv.apyPercent}%</span>
                  {inv.injectedToIncome && isDepositoSyncEnabled ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                      Tersinkron Pemasukan
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-medium">
                      Simulasi Mandiri
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  +{formatRupiah(inv.netMonthlyYield)}/bln
                </div>
                <span className="text-[9px] text-slate-400">
                  {isDepositoSyncEnabled ? 'Bersih setelah PPh' : 'Estimasi Bersih'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
