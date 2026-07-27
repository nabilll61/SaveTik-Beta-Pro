import React, { useState, useEffect } from 'react';
import { Wrench, RefreshCw, AlertTriangle, Clock, Server, CheckCircle2, Calendar, Sparkles, Lock, Zap } from 'lucide-react';
import { safeLocalStorage } from '../lib/safeStorage';

interface MaintenancePageProps {
  titleMessage?: string;
  badgeMessage?: string;
  noticeMessage?: string;
  onAdminLoginClick?: () => void;
  onRefresh?: () => void;
}

export default function MaintenancePage({
  titleMessage,
  badgeMessage,
  noticeMessage,
  onAdminLoginClick,
  onRefresh
}: MaintenancePageProps) {
  // 1. Live Real-Time Date & Clock
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  // 2. Countdown State (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 15,
    seconds: 0
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Initialize and update live time & countdown
  useEffect(() => {
    // Determine Target End Time
    let targetMs: number;
    const storedEndTime = safeLocalStorage.getItem('savetik-maintenance-end-time');
    
    if (storedEndTime && !isNaN(parseInt(storedEndTime, 10))) {
      targetMs = parseInt(storedEndTime, 10);
    } else {
      // Default: 15 minutes from now
      targetMs = Date.now() + 15 * 60 * 1000;
      safeLocalStorage.setItem('savetik-maintenance-end-time', targetMs.toString());
    }

    const timer = setInterval(() => {
      // Update Live Clock Date & Time
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      setCurrentDateTime(now.toLocaleDateString('id-ID', options));

      // Calculate Countdown Difference
      const diff = Math.max(0, targetMs - Date.now());

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsCompleted(true);
        
        // Auto finish maintenance mode
        safeLocalStorage.setItem('savetik-maintenance-mode', 'false');
        window.dispatchEvent(new Event('savetik-maintenance-changed'));
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours: hrs, minutes: mins, seconds: secs });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="min-h-[85vh] flex items-center justify-center max-w-3xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-neo-card border-[4px] border-neo-border p-6 md:p-10 shadow-[8px_8px_0px_0px_var(--neo-border)] rounded-[24px] relative overflow-hidden text-center w-full">
        
        {/* Top Animated Cyber Stripe */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse"></div>

        {/* Top Header Group to prevent inline wrapping on narrow screens */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Real-time Current Date & Time Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neo-bg border-[2px] border-neo-border rounded-full text-xs font-mono font-bold text-neo-text shadow-[2px_2px_0px_0px_var(--neo-border)]">
            <Calendar size={14} className="text-[#6366F1] shrink-0" />
            <span>{currentDateTime || "Waktu Lokal Terdeteksi..."}</span>
          </div>

          {/* Clickable Central Logo Badge for Admin Access */}
          <div className="relative inline-block group">
            <button
              onClick={onAdminLoginClick}
              type="button"
              title="Akses Admin"
              className="w-28 h-28 bg-[#FEF3C7] dark:bg-[#78350F] border-[4px] border-neo-border rounded-3xl flex items-center justify-center mx-auto shadow-[6px_6px_0px_0px_var(--neo-border)] hover:scale-105 active:scale-95 transition-all cursor-pointer relative overflow-hidden group-hover:border-indigo-500"
            >
              <Wrench size={52} className="text-[#D97706] dark:text-[#FBBF24] stroke-[2.5] group-hover:rotate-45 transition-transform duration-300" />
              <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Lock size={28} className="text-indigo-600 dark:text-indigo-300" />
              </div>
            </button>
            
            <div className="absolute -bottom-2 -right-2 p-2 bg-[#DC2626] border-[2px] border-neo-border rounded-full text-white shadow-[2px_2px_0px_0px_var(--neo-border)] animate-bounce">
              <AlertTriangle size={18} className="stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4 mb-4 flex justify-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 text-white font-heading font-black text-xs uppercase tracking-wider border-[3px] border-neo-border rounded-xl shadow-[3px_3px_0px_0px_var(--neo-border)] ${
            isCompleted ? 'bg-emerald-600' : 'bg-[#DC2626]'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-white' : 'bg-white animate-ping'}`}></span>
            <span>{isCompleted ? "PEMELIHARAAN SELESAI OTOMATIS" : (badgeMessage || "SEDANG PERBAIKAN • MAINTENANCE MODE")}</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="font-heading font-black text-2xl md:text-4xl uppercase tracking-tight text-neo-text mb-3">
          {titleMessage || "Sistem Dalam Pemeliharaan"}
        </h1>

        {/* Live Countdown Timer Section */}
        <div className="p-5 bg-neo-bg border-[3px] border-neo-border rounded-2xl mb-6 shadow-[4px_4px_0px_0px_var(--neo-border)]">
          <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-amber-600 dark:text-amber-400 font-mono mb-3">
            <Clock size={16} />
            <span>WAKTU MUNDUR ESTIMASI SELESAI OTOMATIS</span>
          </div>

          {!isCompleted ? (
            <div className="flex justify-center items-center gap-3 md:gap-5 my-2">
              <div className="bg-neo-card border-[3px] border-neo-border p-3 md:p-4 rounded-xl shadow-[3px_3px_0px_0px_var(--neo-border)] min-w-[70px] md:min-w-[85px]">
                <span className="font-mono font-black text-2xl md:text-4xl text-[#6366F1]">
                  {formatNumber(timeLeft.hours)}
                </span>
                <span className="block text-[10px] font-bold text-neo-text opacity-70 uppercase tracking-widest mt-1">
                  JAM
                </span>
              </div>

              <span className="font-mono font-black text-2xl md:text-3xl text-neo-text">:</span>

              <div className="bg-neo-card border-[3px] border-neo-border p-3 md:p-4 rounded-xl shadow-[3px_3px_0px_0px_var(--neo-border)] min-w-[70px] md:min-w-[85px]">
                <span className="font-mono font-black text-2xl md:text-4xl text-[#10B981]">
                  {formatNumber(timeLeft.minutes)}
                </span>
                <span className="block text-[10px] font-bold text-neo-text opacity-70 uppercase tracking-widest mt-1">
                  MENIT
                </span>
              </div>

              <span className="font-mono font-black text-2xl md:text-3xl text-neo-text">:</span>

              <div className="bg-neo-card border-[3px] border-neo-border p-3 md:p-4 rounded-xl shadow-[3px_3px_0px_0px_var(--neo-border)] min-w-[70px] md:min-w-[85px]">
                <span className="font-mono font-black text-2xl md:text-4xl text-[#EF4444] animate-pulse">
                  {formatNumber(timeLeft.seconds)}
                </span>
                <span className="block text-[10px] font-bold text-neo-text opacity-70 uppercase tracking-widest mt-1">
                  DETIK
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
              <CheckCircle2 size={18} />
              <span>WAKTU MUNDUR HABIS • SISTEM DIBUKA OTOMATIS!</span>
            </div>
          )}
        </div>

        {/* Custom Developer Notice Box */}
        <div className="p-4 bg-neo-bg border-[3px] border-neo-border rounded-xl mb-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-600 dark:text-amber-400 font-mono">
            <Server size={16} />
            <span>Pesan Tim Pengembang:</span>
          </div>
          <p className="text-xs md:text-sm font-bold text-neo-text opacity-90 leading-relaxed">
            {noticeMessage || "Aplikasi SaveTik sedang menjalani pemeliharaan berkala dan optimasi server ekstraksi video. Setelah hitung mundur di atas selesai, sistem akan kembali online secara otomatis."}
          </p>
        </div>

        {/* Restoration Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs font-mono font-bold">
          <div className="p-3 bg-neo-bg border-[2px] border-neo-border rounded-xl flex items-center justify-center gap-2 text-neo-text">
            <Sparkles size={16} className="text-[#6366F1]" />
            <span>Selesai Otomatis: Aktif</span>
          </div>
          <div className="p-3 bg-neo-bg border-[2px] border-neo-border rounded-xl flex items-center justify-center gap-2 text-neo-text">
            <Server size={16} className="text-[#10B981]" />
            <span>Status Data: Aman 100%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRefresh || (() => window.location.reload())}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-heading font-black text-xs uppercase tracking-wider border-[3px] border-neo-border shadow-[3px_3px_0px_0px_var(--neo-border)] active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_var(--neo-border)] transition-all flex items-center justify-center gap-2 rounded-xl cursor-pointer"
          >
            <RefreshCw size={18} className="stroke-[3]" />
            CEK STATUS OTOMATIS
          </button>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-[10px] font-mono font-bold text-neo-text opacity-50 uppercase">
          SaveTik Maintenance & System Upgrade Engine • 2026
        </p>

      </div>
    </div>
  );
}
