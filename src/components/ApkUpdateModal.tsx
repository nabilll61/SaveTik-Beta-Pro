import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { safeLocalStorage } from '../lib/safeStorage';

interface ApkUpdateConfig {
  active: boolean;
  version: string;
  title: string;
  notice: string;
  changelog: string[];
  downloadUrl: string;
  forceUpdate: boolean;
}

interface ApkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApkUpdateConfig | null;
  onAdminClick?: () => void;
}

export const ApkUpdateModal: React.FC<ApkUpdateModalProps> = ({ isOpen, onClose, config, onAdminClick }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isOpen && config && config.active) {
      // If NOT forced update, we can check if they dismissed it in the current session
      if (!config.forceUpdate) {
        const isDismissed = sessionStorage.getItem('savetik-apk-update-dismissed') === 'true';
        if (isDismissed) {
          setShouldShow(false);
          return;
        }
      }
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [isOpen, config]);

  const handleDismiss = () => {
    if (config?.forceUpdate) return; // Prevent closing if force update
    sessionStorage.setItem('savetik-apk-update-dismissed', 'true');
    setShouldShow(false);
    onClose();
  };

  if (!shouldShow || !config) return null;

  return (
    <AnimatePresence>
      <div 
        id="apk-update-overlay"
        className="fixed inset-0 bg-black/80 z-[99999] backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          id="apk-update-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-[#141417] text-white rounded-[28px] p-6 max-w-sm w-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[90vh]"
        >
          {/* Close button if not forced */}
          {!config.forceUpdate && (
            <button
              id="apk-update-close-btn"
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all active:scale-90"
            >
              <X size={16} />
            </button>
          )}

          {/* App Logo & Version info */}
          <div className="flex items-center gap-3.5 mb-5 select-none">
            <div 
              onClick={onAdminClick}
              className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-[#6366F1] to-[#D946EF] p-[1.5px] shadow-lg shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
              title="Akses Admin"
            >
              <div className="w-full h-full bg-[#141417] rounded-[17px] flex items-center justify-center">
                <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#818CF8] to-[#E879F9] bg-clip-text text-transparent font-sans">S</span>
              </div>
            </div>
            <div>
              <h3 className="font-black text-sm text-neutral-200 tracking-tight leading-none uppercase">SaveTik Pro</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-neutral-400 font-semibold font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">Versi {config.version}</span>
                <span className="bg-[#D946EF]/20 text-[#F472B6] text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-widest border border-[#D946EF]/10">NEW</span>
              </div>
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="mb-4">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-300 leading-tight">
              {config.title || 'Major Update!'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-medium leading-relaxed">
              {config.notice || 'A new major update is ready, update now!'}
            </p>
          </div>

          {/* Scrollable Changelog box */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-5 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar">
            <p className="text-[10px] font-black uppercase text-neutral-400 tracking-wider mb-3 flex items-center gap-1.5 select-none">
              <Sparkles size={12} className="text-[#F472B6]" />
              Daftar Perubahan (Changelog):
            </p>
            {config.changelog && config.changelog.length > 0 ? (
              <ul className="space-y-3 text-[11px] text-neutral-300 font-semibold">
                {config.changelog.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#D946EF] shrink-0 mt-1.5 shadow-[0_0_8px_#6366F1]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-500 italic">Tidak ada rincian perubahan khusus.</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5">
            <a
              id="apk-update-now-link"
              href={config.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#D946EF] text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_25px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 select-none"
            >
              <Download size={14} className="stroke-[3]" />
              Update Sekarang
            </a>

            {!config.forceUpdate && (
              <button
                id="apk-update-later-btn"
                onClick={handleDismiss}
                className="w-full py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all active:scale-98 select-none"
              >
                Nanti Saja
              </button>
            )}

            {config.forceUpdate && (
              <p className="text-[10px] text-center text-neutral-500 font-semibold mt-1">
                * Versi ini wajib diperbarui untuk tetap menggunakan layanan SaveTik.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
