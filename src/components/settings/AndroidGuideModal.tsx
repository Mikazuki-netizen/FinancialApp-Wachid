import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Smartphone, Terminal } from 'lucide-react';
import { GlassModal } from '../common/GlassModal';
import { GlassButton } from '../common/GlassButton';
import { triggerHaptic } from '../../utils/haptics';

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const steps = [
    {
      title: '1. Build Web Assets Aplikasi ke Folder dist',
      description: 'Menghasilkan bundle statis Vite React yang siap dibungkus oleh WebView Android.',
      command: 'npm run build',
    },
    {
      title: '2. Inisialisasi Platform Android Capacitor',
      description: 'Menambahkan folder project Android native lengkap dengan Gradle build script.',
      command: 'npx cap add android',
    },
    {
      title: '3. Sinkronkan Aset Web ke Native Container',
      description: 'Menyalin file HTML, CSS, JavaScript ke dalam android/app/src/main/assets/public.',
      command: 'npx cap sync android',
    },
    {
      title: '4. Buka Android Studio atau Build APK Langsung',
      description: 'Membuka Android Studio untuk menjalankan di emulator/HP asli, atau jalankan perintah Gradle langsung:',
      command: 'npx cap open android\n# Atau untuk build APK debug langsung lewat terminal:\ncd android && ./gradlew assembleDebug',
    },
  ];

  const handleCopy = (text: string, index: number) => {
    triggerHaptic('success');
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Panduan Export Android APK"
      subtitle="Wrapper Hybrid Capacitor (TWA / WebView High-Performance)"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/20 text-sky-800 dark:text-sky-300">
          <div className="flex items-center gap-2 font-bold mb-1">
            <Smartphone className="w-4 h-4 text-sky-500" />
            <span>FinancialApp Wachid Hybrid PWA & Capacitor Ready</span>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed">
            Project ini sudah memiliki file <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">capacitor.config.ts</code> yang dikonfigurasi dengan splash screen transparan, status bar overlay, dan safe-area Apple HIG.
          </p>
        </div>

        {/* Step by Step */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-2"
            >
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>{step.title}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(step.command, idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                  title="Salin Perintah"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                {step.description}
              </p>

              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] flex items-center justify-between overflow-x-auto select-text">
                <pre className="whitespace-pre-wrap">{step.command}</pre>
              </div>
            </div>
          ))}
        </div>

        {/* APK Location Info */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Lokasi File Output APK:</span>
          </div>
          <p className="font-mono text-[10px] break-all select-text">
            android/app/build/outputs/apk/debug/app-debug.apk
          </p>
          <p className="text-[10px] opacity-90 mt-1">
            File APK ini dapat langsung dikirim ke HP Android Anda lewat WhatsApp / Google Drive dan di-install seketika!
          </p>
        </div>

        <div className="pt-2">
          <GlassButton
            variant="glass"
            fullWidth
            onClick={onClose}
          >
            Mengerti, Tutup Panduan
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
