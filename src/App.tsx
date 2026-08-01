// FILE STATUS: BARU DIPERBAIKI / RECENTLY REPAIRED - FIX FETCH ERROR & REDIRECT iFRAME COOKIE CHECK
import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Download,
  Youtube,
  Instagram
} from 'lucide-react';
import AdminLoginModal from "./components/AdminLoginModal";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DownloadResult from './components/DownloadResult';
import SkeletonLoader from './components/SkeletonLoader';
import GuideSection from './components/GuideSection';
import RestrictionsSection from './components/RestrictionsSection';
import DonationSection from './components/DonationSection';
import HistorySection from './components/HistorySection';
import FeedbackSection from './components/FeedbackSection';
import FavoritesSection from './components/FavoritesSection';
import OfflinePage from './components/OfflinePage';
import MaintenancePage from './components/MaintenancePage';
import InstallPwaModal, { usePwaInstall } from './components/InstallPwaModal';
import { VideoInfo } from './types';
import { safeLocalStorage } from './lib/safeStorage';
import { isApkOrWebView } from './lib/device';
import { ApkUpdateModal } from './components/ApkUpdateModal';
import AboutSection from './components/AboutSection';

export default function App() {
  const [extractedVideo, setExtractedVideo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'downloader' | 'guide' | 'restrictions' | 'donation' | 'history' | 'feedback' | 'favorites' | 'offline' | 'admin' | 'about'>('downloader');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return safeLocalStorage.getItem('savetik-admin-session') === 'true';
  });
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true;
  });

  const handleViewChange = (view: 'downloader' | 'guide' | 'restrictions' | 'donation' | 'history' | 'feedback' | 'favorites' | 'offline' | 'admin' | 'about') => {
    setActiveView(view);
  };

  const handleAdminAccess = () => {
    if (safeLocalStorage.getItem('savetik-admin-session') === 'true' || isAdminLoggedIn) {
      setIsAdminLoggedIn(true);
      setIsApkUpdateModalOpen(false);
      setActiveView('admin');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    safeLocalStorage.removeItem('savetik-admin-session');
    safeLocalStorage.removeItem('savetik-admin-session-id');
    setActiveView('downloader');
    showToast('Berhasil keluar dari mode Admin!', 'success');
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Koneksi internet kembali terhubung!', 'success');
      if (activeView === 'offline') {
        setActiveView('downloader');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setActiveView('offline');
      showToast('Koneksi internet terputus!', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeView]);

  // PWA Install Hook
  const { deferredPrompt, isStandalone, isIos } = usePwaInstall();

  // Mode Tampilan State: 'light' | 'dark' | 'auto'
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>(() => {
    const saved = safeLocalStorage.getItem('savetik-theme-mode');
    if (saved) return saved as 'light' | 'dark' | 'auto';
    return 'auto';
  });

  // Maintenance Mode & Theme Accent States
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => {
    return safeLocalStorage.getItem('savetik-maintenance-mode') === 'true';
  });
  const [maintenanceNotice, setMaintenanceNotice] = useState<string>(() => {
    return safeLocalStorage.getItem('savetik-maintenance-notice') || '';
  });
  const [maintenanceTitle, setMaintenanceTitle] = useState<string>(() => {
    return safeLocalStorage.getItem('savetik-maintenance-title') || '';
  });
  const [maintenanceBadge, setMaintenanceBadge] = useState<string>(() => {
    return safeLocalStorage.getItem('savetik-maintenance-badge') || '';
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return safeLocalStorage.getItem('savetik-accent-color') || '#FFE600';
  });

  // APK Update State
  const [apkUpdateConfig, setApkUpdateConfig] = useState<{
    active: boolean;
    version: string;
    title: string;
    notice: string;
    changelog: string[];
    downloadUrl: string;
    forceUpdate: boolean;
  } | null>(null);
  const [isApkUpdateModalOpen, setIsApkUpdateModalOpen] = useState(false);

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await fetch('/api/maintenance/status');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.warn("Received non-JSON response for maintenance status (auth redirect or SPA fallback?)");
          return;
        }
        const data = JSON.parse(text);
        if (data && data.success) {
          setIsMaintenanceMode(data.active);
          setMaintenanceNotice(data.notice || '');
          setMaintenanceTitle(data.title || '');
          setMaintenanceBadge(data.badge || '');
          
          // Sync with localStorage
          safeLocalStorage.setItem('savetik-maintenance-mode', data.active ? 'true' : 'false');
          safeLocalStorage.setItem('savetik-maintenance-notice', data.notice || '');
          safeLocalStorage.setItem('savetik-maintenance-title', data.title || '');
          safeLocalStorage.setItem('savetik-maintenance-badge', data.badge || '');
          if (data.endTime) {
            safeLocalStorage.setItem('savetik-maintenance-end-time', data.endTime.toString());
          }
        }
      } catch (err) {
        console.warn("Failed to fetch global maintenance status:", err);
      }
    };

    const fetchApkUpdateStatus = async () => {
      try {
        const response = await fetch('/api/apk-update/status');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          console.warn("Received non-JSON response for APK update status (auth redirect or SPA fallback?)");
          return;
        }
        const data = JSON.parse(text);
        if (data && data.success) {
          setApkUpdateConfig(data);
          if (data.active && isApkOrWebView()) {
            setIsApkUpdateModalOpen(true);
          } else {
            setIsApkUpdateModalOpen(false);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch global APK update status:", err);
      }
    };

    const handleMaintenanceChange = () => {
      setIsMaintenanceMode(safeLocalStorage.getItem('savetik-maintenance-mode') === 'true');
      setMaintenanceNotice(safeLocalStorage.getItem('savetik-maintenance-notice') || '');
      setMaintenanceTitle(safeLocalStorage.getItem('savetik-maintenance-title') || '');
      setMaintenanceBadge(safeLocalStorage.getItem('savetik-maintenance-badge') || '');
    };

    const handleAccentChange = (e: any) => {
      const newHex = e?.detail?.hex || safeLocalStorage.getItem('savetik-accent-color') || '#FFE600';
      setAccentColor(newHex);
    };

    const handleApkUpdateEvent = () => {
      fetchApkUpdateStatus();
    };

    // Run fetch immediately on load
    fetchMaintenanceStatus();
    fetchApkUpdateStatus();
    
    // Poll the server for maintenance and update configs every 10 seconds
    const interval = setInterval(() => {
      fetchMaintenanceStatus();
      fetchApkUpdateStatus();
    }, 10000);

    window.addEventListener('savetik-maintenance-changed', handleMaintenanceChange);
    window.addEventListener('savetik-accent-changed', handleAccentChange as EventListener);
    window.addEventListener('savetik-apk-update-changed', handleApkUpdateEvent);
    window.addEventListener('storage', handleMaintenanceChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('savetik-maintenance-changed', handleMaintenanceChange);
      window.removeEventListener('savetik-accent-changed', handleAccentChange as EventListener);
      window.removeEventListener('savetik-apk-update-changed', handleApkUpdateEvent);
      window.removeEventListener('storage', handleMaintenanceChange);
    };
  }, []);

  // Live Real-Time Telemetry Logging (Device, Browser, Region, Active Sessions)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Log Device OS & Browser
    const ua = navigator.userAgent;
    let os = 'Windows PC';
    if (/android/i.test(ua)) os = 'Android OS';
    else if (/iPad|iPhone|iPod/.test(ua)) os = 'Apple iOS';
    else if (/Macintosh|Mac OS X/.test(ua)) os = 'macOS';
    else if (/Linux/.test(ua)) os = 'Linux';

    let browser = 'Google Chrome';
    if (/edg/i.test(ua)) browser = 'Microsoft Edge';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
    else if (/firefox/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';

    const deviceStats = safeLocalStorage.getJSON<any>('savetik-device-stats', { os: {}, browser: {}, totalVisits: 0 });
    deviceStats.os[os] = (deviceStats.os[os] || 0) + 1;
    deviceStats.browser[browser] = (deviceStats.browser[browser] || 0) + 1;
    deviceStats.totalVisits = (deviceStats.totalVisits || 0) + 1;
    safeLocalStorage.setJSON('savetik-device-stats', deviceStats);

    // 2. Log Real Demographic Region
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    let regionName = 'Indonesia 🇮🇩';
    if (tz.includes('Kuala_Lumpur')) regionName = 'Malaysia 🇲🇾';
    else if (tz.includes('Singapore')) regionName = 'Singapore 🇸🇬';
    else if (tz.includes('Bangkok') || tz.includes('Ho_Chi_Minh')) regionName = 'Asia Tenggara 🌏';
    else if (!tz.includes('Jakarta') && !tz.includes('Makassar') && !tz.includes('Jayapura')) regionName = `Wilayah (${tz})`;

    const demoStats = safeLocalStorage.getJSON<any>('savetik-demographics', { regions: {}, total: 0 });
    const existing = demoStats.regions[regionName];
    if (typeof existing === 'object' && existing !== null) {
      existing.count = (existing.count || 0) + 1;
      existing.timezone = tz;
    } else if (typeof existing === 'number') {
      demoStats.regions[regionName] = { count: existing + 1, timezone: tz };
    } else {
      demoStats.regions[regionName] = { count: 1, timezone: tz };
    }
    demoStats.total = (demoStats.total || 0) + 1;
    safeLocalStorage.setJSON('savetik-demographics', demoStats);

    // 4. Real Server Telemetry
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone: tz })
    }).catch(() => {});
  }, []);

  // System Dark Mode state listener for device schedule
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const effectiveTheme: 'light' | 'dark' = themeMode === 'auto' 
    ? (systemIsDark ? 'dark' : 'light') 
    : themeMode;

  useEffect(() => {
    const root = window.document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    safeLocalStorage.setItem('savetik-theme-mode', themeMode);
  }, [effectiveTheme, themeMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = effectiveTheme === 'dark';

    // Set primary accent colors dynamically from state
    root.style.setProperty('--neo-accent', accentColor);

    // Calculate readable text color on accent background
    let textOnAccent = '#000000';
    if (accentColor && accentColor.startsWith('#')) {
      const hex = accentColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness < 128) textOnAccent = '#FFFFFF';
    }
    root.style.setProperty('--neo-accent-text', textOnAccent);

    // Set canvas website background colors
    const bg = isDark ? '#18141F' : '#FAF8FC';
    const bgSec = isDark ? '#231D2D' : '#F2EEF7';
    const cardBg = isDark ? '#2B2338' : '#FFFFFF';

    root.style.setProperty('--neo-bg', bg);
    root.style.setProperty('--neo-bg-sec', bgSec);
    root.style.setProperty('--neo-card', cardBg);
    document.body.style.backgroundColor = bg;
  }, [effectiveTheme, accentColor]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      const current = prev === 'auto' ? (systemIsDark ? 'dark' : 'light') : prev;
      return current === 'light' ? 'dark' : 'light';
    });
  };

  // Scrollbar auto-show and auto-hide effect
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | number;
    const handleScroll = () => {
      document.documentElement.classList.add('is-scrolling');
      document.body.classList.add('is-scrolling');
      clearTimeout(scrollTimeout as any);
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
        document.body.classList.remove('is-scrolling');
      }, 1000); // Hide after 1 second of inactivity
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout as any);
    };
  }, []);

  // Toast System state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error') => {
    setToast({ message, type });
  };

  // Auto Dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleExtract = async (videoUrl: string) => {
    setLoading(true);
    setExtractedVideo(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const alyachanUrl = localStorage.getItem('savetik-api-spotify-client-id') || '';
      const alyachanKey = localStorage.getItem('savetik-api-spotify-client-secret') || '';

      const res = await fetch('/api/download/info', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ 
          url: videoUrl,
          alyachanUrl,
          alyachanKey
        })
      });

      const text = await res.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Sesi autentikasi diperlukan atau server mengembalikan halaman HTML.');
      }
      const data = JSON.parse(text);

      if (res.ok && data.success && data.videoInfo) {
        setExtractedVideo(data.videoInfo);
        showToast('Video berhasil diekstrak! Pilih format unduhan.', 'success');
        
        // Add to history automatically
        const history = safeLocalStorage.getJSON<any[]>('savetik_history', []);
        if (!history.some((item: any) => item.id === data.videoInfo.id)) {
          safeLocalStorage.setJSON('savetik_history', [data.videoInfo, ...history].slice(0, 50));
        }

        // Increment total downloads counter
        const currentCounter = safeLocalStorage.getJSON<number>('savetik-download-counter', 0);
        safeLocalStorage.setJSON('savetik-download-counter', currentCounter + 1);

        // Record Audit Log
        const auditLogs = safeLocalStorage.getJSON<any[]>('savetik-audit-logs', []);
        const newLog = {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          date: new Date().toISOString().split('T')[0],
          category: 'EXTRACTOR',
          badge: 'SUCCESS',
          badgeColor: 'bg-[#D1FAE5] text-[#059669] border-[#10B981]',
          message: `Sukses mengekstrak media (${data.videoInfo.platform || 'Platform'}) "${data.videoInfo.title ? data.videoInfo.title.substring(0, 30) + '...' : 'Video'}"`,
          ip: 'Klien Sesi Aktif'
        };
        safeLocalStorage.setJSON('savetik-audit-logs', [newLog, ...auditLogs].slice(0, 100));

      } else {
        const errorMsg = data.message || 'Ekstraksi gagal. Pastikan link video valid dan publik.';
        showToast(errorMsg, 'error');

        // Log Real Error
        const errors = safeLocalStorage.getJSON<any[]>('savetik-error-tracker', []);
        const platformName = videoUrl.includes('tiktok') ? 'TikTok Engine' : videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? 'YouTube Engine' : videoUrl.includes('instagram') ? 'Instagram Scraper' : 'Extractor Core';
        const newError = {
          id: `err-${Date.now()}`,
          code: res.status === 429 ? 'ERR_RATE_LIMIT_429' : 'ERR_EXTRACT_FAILED',
          service: platformName,
          message: errorMsg,
          time: new Date().toLocaleTimeString('id-ID'),
          device: `${navigator.platform || 'Client'} • ${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'}`,
          status: 'UNRESOLVED',
          count: 1
        };
        safeLocalStorage.setJSON('savetik-error-tracker', [newError, ...errors].slice(0, 50));

        // Audit Log for Error
        const auditLogs = safeLocalStorage.getJSON<any[]>('savetik-audit-logs', []);
        const newLog = {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          date: new Date().toISOString().split('T')[0],
          category: 'EXTRACTOR',
          badge: 'SECURITY',
          badgeColor: 'bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]',
          message: `Gagal ekstraksi link (${videoUrl.substring(0, 35)}...): ${errorMsg}`,
          ip: 'Klien Sesi Aktif'
        };
        safeLocalStorage.setJSON('savetik-audit-logs', [newLog, ...auditLogs].slice(0, 100));
      }
    } catch (err) {
      showToast('Koneksi server terputus. Gagal melakukan ekstraksi.', 'error');

      const errors = safeLocalStorage.getJSON<any[]>('savetik-error-tracker', []);
      const newError = {
        id: `err-${Date.now()}`,
        code: 'ERR_NETWORK_DISCONNECTED',
        service: 'Network Gateway',
        message: 'Koneksi server terputus atau jaringan offline.',
        time: new Date().toLocaleTimeString('id-ID'),
        device: `${navigator.platform || 'Client'}`,
        status: 'UNRESOLVED',
        count: 1
      };
      safeLocalStorage.setJSON('savetik-error-tracker', [newError, ...errors].slice(0, 50));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = (video: VideoInfo) => {
    setExtractedVideo(video);
    setActiveView('downloader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neo-bg text-neo-text flex flex-col justify-between transition-colors">
      
      {/* 1. TOAST NOTIFICATION SYSTEM */}
      {toast && (
        <div 
          id="toast-container"
          className="fixed top-24 right-4 z-50 max-w-sm w-full bg-neo-card neo-border p-4 shadow-neo flex items-start gap-3 animate-in slide-in-from-right-10 duration-200"
        >
          {/* Toast Icon */}
          <div className="shrink-0">
            {toast.type === 'success' && (
              <div className="p-1 bg-[#E2F7F2] neo-border-thin">
                <CheckCircle size={18} className="text-[#14B8A6] stroke-[3]" />
              </div>
            )}
            {toast.type === 'warning' && (
              <div className="p-1 bg-[#FFF9EB] neo-border-thin">
                <AlertTriangle size={18} className="text-[#FCD34D] stroke-[3]" />
              </div>
            )}
            {toast.type === 'error' && (
              <div className="p-1 bg-[#FFF2F8] neo-border-thin">
                <XCircle size={18} className="text-[#E11D48] stroke-[3]" />
              </div>
            )}
          </div>

          {/* Toast Msg */}
          <div className="flex-1">
            <p className="text-xs font-black uppercase text-neo-text tracking-wide">
              {toast.type === 'success' ? 'Berhasil' : toast.type === 'warning' ? 'Perhatian' : 'Kesalahan'}
            </p>
            <p className="text-xs text-neo-text opacity-80 font-bold mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          </div>

          {/* Close Toast */}
          <button 
            id="toast-dismiss-btn"
            onClick={() => setToast(null)}
            className="text-neo-text opacity-40 hover:opacity-100 font-black text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. NAVBAR */}
      <Navbar 
        activeView={activeView}
        onViewChange={handleViewChange}
        theme={effectiveTheme}
        onThemeToggle={toggleTheme}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onAdminAccess={handleAdminAccess}
        onAdminLogout={handleAdminLogout}
        accentColor={accentColor}
      />

      {/* 3. MAIN APP ROUTING / VIEWS */}
      <main className="flex-grow pb-16">
        
        {activeView === 'guide' ? (
          /* How to Use / FAQ Guide View */
          <GuideSection onBack={() => handleViewChange('downloader')} />
        ) : activeView === 'restrictions' ? (
          /* Restrictions View */
          <RestrictionsSection onBack={() => handleViewChange('downloader')} />
        ) : activeView === 'donation' ? (
          /* Donation View */
          <DonationSection onBack={() => handleViewChange('downloader')} showToast={showToast} />
        ) : activeView === 'history' ? (
          /* History View */
          <HistorySection 
            onBack={() => handleViewChange('downloader')} 
            onSelectVideo={handleSelectVideo}
            showToast={showToast}
          />
        ) : activeView === 'favorites' ? (
          /* Favorites / Bookmarks View */
          <FavoritesSection
            onBack={() => handleViewChange('downloader')}
            onSelectVideo={handleSelectVideo}
            showToast={showToast}
          />
        ) : activeView === 'offline' ? (
          /* Offline Mode View */
          <OfflinePage
            onRetry={() => {
              if (navigator.onLine) {
                setIsOnline(true);
                handleViewChange('downloader');
                showToast('Koneksi internet terhubung kembali!', 'success');
              } else {
                showToast('Masih offline. Periksa koneksi internet Anda.', 'warning');
              }
            }}
            onBack={() => handleViewChange('downloader')}
          />
        ) : activeView === 'feedback' ? (
          /* Feedback / Bug Report / Feature Request View */
          <FeedbackSection onBack={() => handleViewChange('downloader')} showToast={showToast} />
        ) : activeView === 'about' ? (
          /* About Website View */
          <AboutSection onBack={() => handleViewChange('downloader')} />
        ) : activeView === 'admin' ? (
          <div className="pt-28 px-4 md:px-8">
            <AdminDashboard onLogout={handleAdminLogout} />
          </div>
        ) : isMaintenanceMode ? (
          /* Maintenance Mode View */
          <div className="pt-24">
            <MaintenancePage
              noticeMessage={maintenanceNotice}
              titleMessage={maintenanceTitle}
              badgeMessage={maintenanceBadge}
              onAdminLoginClick={handleAdminAccess}
              onRefresh={() => window.location.reload()}
            />
          </div>
        ) : (
          /* Landing Downloader View */
          <div className="space-y-2">
            
            {/* Hero extraction forms */}
            <Hero 
              onExtract={handleExtract} 
              loading={loading} 
              showToast={showToast}
            />

            {/* Render loading state */}
            {loading && <SkeletonLoader />}

            {/* Result extracted box */}
            {extractedVideo && (
              <DownloadResult 
                videoInfo={extractedVideo} 
                onClear={() => setExtractedVideo(null)} 
                showToast={showToast}
              />
            )}

            {/* Feature educational section */}
            <section className="py-4 md:py-8 px-4 md:px-8 max-w-5xl mx-auto">
              <div className="bg-neo-bg-sec border-3 border-neo-border p-6 md:p-10 relative">
                
                {/* Visual Label */}
                <span className="absolute -top-3 left-6 bg-[#6366F1] text-white px-3 py-1 text-xs font-black uppercase tracking-wider neo-border-thin rotate-[-1deg]">
                  BAGAIMANA CARA KERJANYA?
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                  <div className="space-y-2">
                    <div className="font-heading font-black text-2xl text-[#6366F1]">01.</div>
                    <h4 className="font-heading font-black uppercase text-sm tracking-wide text-neo-text">
                      Salin Tautan Video
                    </h4>
                    <p className="text-xs text-neo-text opacity-80 leading-relaxed font-semibold">
                      Buka aplikasi TikTok, YouTube, atau Instagram. Klik bagikan lalu salin tautan media (URL) yang ingin Anda simpan ke perangkat.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="font-heading font-black text-2xl text-[#E11D48]">02.</div>
                    <h4 className="font-heading font-black uppercase text-sm tracking-wide text-neo-text">
                      Tempel & Ekstrak
                    </h4>
                    <p className="text-xs text-neo-text opacity-80 leading-relaxed font-semibold">
                      Tempel tautan di kolom input di atas, lalu tekan tombol "Ekstrak Video" untuk memulai proses analisis secara otomatis.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="font-heading font-black text-2xl text-[#14B8A6]">03.</div>
                    <h4 className="font-heading font-black uppercase text-sm tracking-wide text-neo-text">
                      Unduh Langsung
                    </h4>
                    <p className="text-xs text-neo-text opacity-80 leading-relaxed font-semibold">
                      Pilih kualitas MP4 atau konversi otomatis ke MP3. Klik tombol unduh dan berkas akan segera tersimpan di galeri Anda.
                    </p>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

      </main>

      {/* PWA Install Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={(sessionId) => {
          setIsAdminLoggedIn(true);
          safeLocalStorage.setItem('savetik-admin-session', 'true');
          if (sessionId) {
            safeLocalStorage.setItem('savetik-admin-session-id', sessionId);
          }
          setIsAdminModalOpen(false);
          setIsApkUpdateModalOpen(false); // Close APK update modal upon admin login
          setActiveView("admin");
          showToast('Berhasil masuk sebagai Admin!', 'success');
        }}
      />
      <InstallPwaModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
        deferredPrompt={deferredPrompt} 
        isStandalone={isStandalone} 
        isIos={isIos} 
        showToast={showToast} 
      />

      <ApkUpdateModal
        isOpen={isApkUpdateModalOpen && activeView !== 'admin' && !isAdminModalOpen}
        onClose={() => setIsApkUpdateModalOpen(false)}
        config={apkUpdateConfig}
        onAdminAccess={handleAdminAccess}
      />

    </div>
  );
}
