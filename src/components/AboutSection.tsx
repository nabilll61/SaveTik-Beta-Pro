import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Globe, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Smartphone, 
  CheckCircle2, 
  Heart,
  Youtube,
  Instagram,
  Music,
  Video,
  ExternalLink,
  Info
} from 'lucide-react';

interface AboutConfig {
  explanation: string;
  developer: string;
  telegram: string;
  whatsappChannel: string;
}

interface AboutSectionProps {
  onBack: () => void;
}

export default function AboutSection({ onBack }: AboutSectionProps) {
  const [config, setConfig] = useState<AboutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch('/api/about/status');
        if (!res.ok) {
          throw new Error('Gagal mengambil informasi tentang website');
        }
        const data = await res.json();
        if (data && data.success !== false) {
          setConfig({
            explanation: data.explanation || '',
            developer: data.developer || '',
            telegram: data.telegram || '',
            whatsappChannel: data.whatsappChannel || ''
          });
        } else {
          throw new Error('Respons server tidak valid');
        }
      } catch (err: any) {
        console.error("Error loading about website data:", err);
        setError(err.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const platforms = [
    { name: 'TikTok', icon: Video, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' },
    { name: 'CapCut', icon: Sparkles, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/30' },
    { name: 'Spotify', icon: Music, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
    { name: 'Facebook', icon: Globe, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' }
  ];

  return (
    <div id="about-section-container" className="max-w-3xl mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-300">
      
      {/* BACK TO MAIN MENU BUTTON */}
      <div className="flex justify-start">
        <button
          id="about-back-btn"
          onClick={onBack}
          className="px-4 py-2 bg-neo-card hover:bg-neo-bg-sec text-neo-text font-heading font-black text-xs md:text-sm uppercase tracking-wider border-[3px] border-neo-border shadow-[3px_3px_0px_0px_var(--neo-border)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--neo-border)] transition-all flex items-center gap-2 cursor-pointer rounded-lg"
        >
          <ArrowLeft size={14} className="stroke-[3]" />
          <span>MENU UTAMA</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 bg-neo-card border-[3px] border-neo-border rounded-lg shadow-[4px_4px_0px_0px_var(--neo-border)] text-center">
          <div className="w-8 h-8 rounded-full border-4 border-t-indigo-600 border-indigo-200 animate-spin"></div>
          <span className="font-mono text-xs font-black uppercase text-neo-text opacity-60">Mengambil Data Server...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/10 border-[3px] border-neo-border rounded-lg shadow-[4px_4px_0px_0px_#EF4444] text-center space-y-3">
          <p className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Gagal Memuat Informasi</p>
          <p className="text-xs font-semibold text-neo-text opacity-85">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 bg-neo-card border-[3px] border-neo-border text-xs font-black uppercase tracking-wider text-neo-text hover:bg-neo-bg-sec rounded-lg shadow-[3px_3px_0px_0px_var(--neo-border)] active:translate-y-0.5 transition-all cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Developer, Explanation & Platforms (8 cols) */}
          <div className="md:col-span-8 space-y-8">
            
            {/* Card 3: Developer Info */}
            <div className="bg-neo-card p-6 border-[3px] border-neo-border rounded-[10px] shadow-[4px_4px_0px_0px_#10B981] space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <span className="bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider inline-block rounded">
                  PENGEMBANG
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full border-[3px] border-neo-border shadow-sm flex items-center justify-center text-white font-heading font-black text-xl">
                    {config?.developer ? config.developer.charAt(0).toUpperCase() : 'N'}
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase text-neo-text opacity-50 leading-none">Website Developer</p>
                    <h4 className="font-heading font-black text-sm text-neo-text leading-tight uppercase mt-1">
                      {config?.developer || 'Nabil Assihidiqi :)'}
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-neo-text opacity-85 leading-normal font-semibold border-t-2 border-neo-border/15 pt-3">
                  Berdedikasi untuk membangun utilitas pengunduhan gratis yang berkinerja tinggi, bersih, dan mengutamakan pengalaman pengguna terbaik tanpa iklan pop-up yang mengganggu.
                </p>
              </div>
            </div>

            {/* Card 1: Penjelasan Utama */}
            <div className="bg-neo-card p-6 border-[3px] border-neo-border rounded-[10px] shadow-[4px_4px_0px_0px_#6366F1] space-y-4">
              <div>
                <span className="bg-indigo-600 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider inline-block rounded">
                  INFORMASI UTAMA
                </span>
              </div>
              <h2 className="font-heading font-black text-lg md:text-xl text-neo-text uppercase tracking-wide">
                APA ITU SAVETIK?
              </h2>
              <p className="text-xs md:text-sm text-neo-text opacity-85 leading-relaxed font-semibold">
                {config?.explanation || 'SaveTik adalah platform pengunduh media gratis yang memungkinkan Anda mengunduh video dan audio dari berbagai platform media sosial secara instan.'}
              </p>
            </div>

            {/* Card 2: Platform yang Didukung */}
            <div className="bg-neo-card p-6 border-[3px] border-neo-border rounded-[10px] shadow-[4px_4px_0px_0px_#EC4899] space-y-4">
              <div>
                <span className="bg-pink-600 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider inline-block rounded">
                  LAYANAN DIDUKUNG
                </span>
              </div>
              <h3 className="font-heading font-black text-sm md:text-base text-neo-text uppercase tracking-wide">
                UNDUH DARI PLATFORM BERIKUT SECARA GRATIS:
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((plat) => {
                  const Icon = plat.icon;
                  return (
                    <div 
                      key={plat.name}
                      className="p-3 bg-neo-bg-sec border-2 border-neo-border flex items-center gap-2.5 transition-all rounded-lg"
                    >
                      <div className={`p-1.5 rounded-md border-2 border-neo-border shrink-0 ${plat.color}`}>
                        <Icon size={16} className="stroke-[3]" />
                      </div>
                      <span className="font-heading font-black text-xs uppercase text-neo-text tracking-wide">
                        {plat.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/10 border-[3px] border-neo-border rounded-lg text-amber-800 dark:text-amber-200 text-xs font-semibold leading-relaxed shadow-[2px_2px_0px_0px_var(--neo-border)]">
                🚀 <strong>Bebas Batasan:</strong> Semua platform di atas dapat diekstrak secara real-time dan langsung tanpa simulasi, tanpa pendaftaran, dan 100% bebas biaya selamanya.
              </div>
            </div>

          </div>

          {/* RIGHT: Social Channels (4 cols) */}
          <div className="md:col-span-4 space-y-8">
            
            {/* Card 4: Social Channels */}
            <div className="bg-neo-card p-5 border-[3px] border-neo-border rounded-[10px] shadow-[4px_4px_0px_0px_#3B82F6] space-y-4">
              <div>
                <span className="bg-blue-600 text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider inline-block rounded">
                  HUBUNGI KAMI
                </span>
              </div>

              <h4 className="font-heading font-black text-xs uppercase text-neo-text tracking-wide mb-1">
                SALURAN & CHAT RESMI:
              </h4>

              <div className="space-y-3">
                {/* Telegram Link */}
                <a 
                  href={`https://t.me/${config?.telegram.replace('@', '') || 'nabil_assihidiqi'}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full p-3 bg-[#E0F2FE] dark:bg-[#0369A1]/20 border-[3px] border-neo-border flex items-center justify-between font-heading font-black text-xs uppercase tracking-wide text-blue-800 dark:text-blue-200 hover:bg-[#BAE6FD] dark:hover:bg-[#0369A1]/40 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--neo-border)] transition-all cursor-pointer rounded-lg shadow-[3px_3px_0px_0px_var(--neo-border)]"
                >
                  <div className="flex items-center gap-2.5">
                    <Send size={15} className="stroke-[3]" />
                    <span>Telegram Admin</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] font-bold">@{config?.telegram || 'nabil_assihidiqi'}</span>
                    <ExternalLink size={11} />
                  </div>
                </a>

                {/* WhatsApp Channel Link */}
                <a 
                  href={config?.whatsappChannel || 'https://whatsapp.com/channel/0029VajM6666'}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full p-3 bg-[#DCFCE7] dark:bg-[#15803D]/20 border-[3px] border-neo-border flex items-center justify-between font-heading font-black text-xs uppercase tracking-wide text-emerald-800 dark:text-emerald-200 hover:bg-[#BBF7D0] dark:hover:bg-[#15803D]/40 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--neo-border)] transition-all cursor-pointer rounded-lg shadow-[3px_3px_0px_0px_var(--neo-border)]"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={15} className="stroke-[3]" />
                    <span>Saluran WA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] font-bold">Gabung Saluran</span>
                    <ExternalLink size={11} />
                  </div>
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Decorative footer credit */}
      <div className="text-center pt-6 border-t-2 border-neo-border/10">
        <p className="text-[10px] font-mono font-bold uppercase text-neo-text opacity-40">
          SaveTik - High Performance Multi-Platform Media Extractor Built by {config?.developer || 'Nabil Assihidiqi :)'}
        </p>
      </div>

    </div>
  );
}
