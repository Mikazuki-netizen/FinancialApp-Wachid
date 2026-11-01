import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  KeyRound,
  Mail,
  ShieldCheck,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Pin,
  Trash2,
  Edit3,
  X,
  Lock,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useFinance } from '../../context/FinanceContext';
import { NoteCategory, NoteItem } from '../../types/finance';
import { triggerHaptic } from '../../utils/haptics';

const CATEGORY_CONFIG: Record<
  NoteCategory,
  { label: string; icon: React.FC<{ className?: string }>; colorClass: string; borderClass: string }
> = {
  email_account: {
    label: 'Akun & Email',
    icon: Mail,
    colorClass: 'text-sky-500 bg-sky-500/10 dark:bg-sky-400/15',
    borderClass: 'border-sky-500/20'
  },
  finance_pin: {
    label: 'PIN & Bank',
    icon: KeyRound,
    colorClass: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-400/15',
    borderClass: 'border-emerald-500/20'
  },
  important_doc: {
    label: 'Dokumen Penting',
    icon: ShieldCheck,
    colorClass: 'text-amber-500 bg-amber-500/10 dark:bg-amber-400/15',
    borderClass: 'border-amber-500/20'
  },
  general: {
    label: 'Catatan Umum',
    icon: FileText,
    colorClass: 'text-purple-500 bg-purple-500/10 dark:bg-purple-400/15',
    borderClass: 'border-purple-500/20'
  }
};

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePinNote, showToast, syncConfig } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    category: NoteCategory;
    accountEmail: string;
    accountPassword: string;
    content: string;
    pinned: boolean;
  }>({
    title: '',
    category: 'email_account',
    accountEmail: '',
    accountPassword: '',
    content: '',
    pinned: false
  });
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          note.title.toLowerCase().includes(q) ||
          (note.accountEmail && note.accountEmail.toLowerCase().includes(q)) ||
          note.content.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        // Pinned notes first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [notes, selectedCategory, searchQuery]);

  const togglePasswordVisibility = (id: string) => {
    triggerHaptic('light');
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerHaptic('success');
      setCopiedKey(key);
      showToast('success', `${label} berhasil disalin ke clipboard!`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast('error', 'Gagal menyalin teks');
    }
  };

  const handleOpenAdd = () => {
    triggerHaptic('medium');
    setEditingNote(null);
    setFormData({
      title: '',
      category: 'email_account',
      accountEmail: '',
      accountPassword: '',
      content: '',
      pinned: false
    });
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    triggerHaptic('light');
    setEditingNote(note);
    setFormData({
      title: note.title,
      category: note.category,
      accountEmail: note.accountEmail || '',
      accountPassword: note.accountPassword || '',
      content: note.content || '',
      pinned: note.pinned
    });
    setShowModalPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Judul catatan wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingNote) {
        await updateNote({
          ...editingNote,
          title: formData.title.trim(),
          category: formData.category,
          accountEmail: formData.accountEmail.trim(),
          accountPassword: formData.accountPassword.trim(),
          content: formData.content.trim(),
          pinned: formData.pinned
        });
      } else {
        await addNote({
          title: formData.title.trim(),
          category: formData.category,
          accountEmail: formData.accountEmail.trim(),
          accountPassword: formData.accountPassword.trim(),
          content: formData.content.trim(),
          pinned: formData.pinned
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (note: NoteItem) => {
    triggerHaptic('warning');
    if (window.confirm(`Hapus catatan "${note.title}"?`)) {
      deleteNote(note.id);
    }
  };

  const generateRandomPassword = () => {
    triggerHaptic('light');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, accountPassword: res }));
    setShowModalPassword(true);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <GlassCard className="p-4 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-blue flex-shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Brankas Catatan & Akun
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data email, password & memo tersinkron otomatis ke Spreadsheet
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-blue flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah</span>
          </motion.button>
        </div>

        {/* Sync hint indicator */}
        {syncConfig.scriptUrl && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tersambung ke tab <b>Notes</b> di Google Sheets
            </span>
            <span>{notes.length} Catatan tersimpan</span>
          </div>
        )}
      </GlassCard>

      {/* Search Bar & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari judul, email, atau isi catatan..."
            className="w-full glass-input pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => {
              triggerHaptic('light');
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white/80'
            }`}
          >
            Semua ({notes.length})
          </button>
          {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const Icon = config.icon;
            const count = notes.filter(n => n.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{config.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <Lock className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {searchQuery ? 'Catatan tidak ditemukan' : 'Belum ada catatan penting'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? 'Coba kata kunci pencarian lain atau pilih kategori Semua.'
              : 'Simpan alamat email, password, PIN bank, nomor polis, atau memo penting Ayah di sini.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-glow-blue"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Catatan Pertama</span>
            </button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map(note => {
            const config = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.general;
            const Icon = config.icon;
            const isPasswordRevealed = !!revealedPasswords[note.id];
            const emailKey = `${note.id}-email`;
            const passKey = `${note.id}-pass`;

            return (
              <GlassCard
                key={note.id}
                className={`p-4 transition-all relative ${
                  note.pinned
                    ? 'border-amber-500/40 dark:border-amber-500/30 shadow-glow-orange/10'
                    : ''
                }`}
              >
                {/* Top Row: Category Badge & Pin / Action */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.colorClass} ${config.borderClass}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{config.label}</span>
                    </span>

                    {note.pinned && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        <span>Disematkan</span>
                      </span>
                    )}
                  </div>

                  {/* Top-Right Quick Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinNote(note.id)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        note.pinned
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                      title={note.pinned ? 'Lepas sematan' : 'Sematkan ke atas'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-blue-500 transition-colors"
                      title="Ubah"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  {note.title}
                </h3>

                {/* Email / Username Field (If Present) */}
                {note.accountEmail && (
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                        {note.accountEmail}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(note.accountEmail || '', emailKey, 'Email/Akun')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 flex-shrink-0 text-[10px] font-semibold"
                    >
                      {copiedKey === emailKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Password / PIN Field (If Present) */}
                {note.accountPassword && (
                  <div className="mt-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                        {isPasswordRevealed ? note.accountPassword : '••••••••••••'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => togglePasswordVisibility(note.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={isPasswordRevealed ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {isPasswordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => copyToClipboard(note.accountPassword || '', passKey, 'Password')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 text-[10px] font-semibold"
                      >
                        {copiedKey === passKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Content / Memo */}
                {note.content && (
                  <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    Diperbarui {new Date(note.updatedAt || note.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-white/10 z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {editingNote ? 'Edit Catatan' : 'Catatan / Akun Baru'}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Disimpan lokal & tersinkron ke Google Sheets
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kategori Catatan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map(cat => {
                      const cfg = CATEGORY_CONFIG[cat];
                      const Icon = cfg.icon;
                      const isSelected = formData.category === cat;
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => {
                            triggerHaptic('light');
                            setFormData(prev => ({ ...prev, category: cat }));
                          }}
                          className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-blue-500/40'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : ''}`} />
                          <span className="truncate">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Catatan / Akun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Email Google Utama, Bank Mandiri, Sertifikat"
                    className="w-full glass-input text-xs"
                  />
                </div>

                {/* Email / Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email / Username / No. Rekening <span className="text-[10px] text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.accountEmail}
                      onChange={e => setFormData(prev => ({ ...prev, accountEmail: e.target.value }))}
                      placeholder="ayah.wachid@gmail.com / 1234-5678-90"
                      className="w-full glass-input pl-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Password / PIN */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password / PIN <span className="text-[10px] text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Buat Sandi Acak</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      value={formData.accountPassword}
                      onChange={e => setFormData(prev => ({ ...prev, accountPassword: e.target.value }))}
                      placeholder="Masukkan kata sandi atau PIN..."
                      className="w-full glass-input pl-9 pr-9 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Content / Memo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Isi Catatan / Keterangan Penting <span className="text-[10px] text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Tulis detail pemulihan, no telepon cadangan, catatan transaksi, atau info rahasia lainnya..."
                    className="w-full glass-input text-xs leading-relaxed"
                  />
                </div>

                {/* Pinned Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Pin className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Sematkan Catatan (Pin)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Catatan ini akan selalu muncul di posisi paling atas
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={e => setFormData(prev => ({ ...prev, pinned: e.target.checked }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-glow-blue transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Menyimpan...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingNote ? 'Simpan Perubahan' : 'Simpan Catatan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
