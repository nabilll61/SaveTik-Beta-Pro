import React, { useState } from 'react';
import { Send, ArrowLeft, Lightbulb, Bug } from 'lucide-react';
import { safeLocalStorage } from '../lib/safeStorage';

interface FeedbackSectionProps {
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'warning' | 'error') => void;
}

export default function FeedbackSection({ onBack, showToast }: FeedbackSectionProps) {
  const [type, setType] = useState<'fitur' | 'bug'>('fitur');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const characterLimit = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    
    try {
      // Simulate API post
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const newFeedback = {
        id: Date.now().toString(),
        type,
        content,
        contact,
        createdAt: new Date().toISOString()
      };
      
      const existing = safeLocalStorage.getJSON<any[]>('savetik-feedbacks', []);
      safeLocalStorage.setJSON('savetik-feedbacks', [newFeedback, ...existing]);

      showToast('Kirim Feedback Berhasil! Terima kasih banyak atas masukannya.', 'success');
      setContent('');
      setContact('');
      onBack();
    } catch (err) {
      showToast('Kirim Feedback gagal. Silakan coba lagi nanti.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Back to main menu button */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-neo-card hover:bg-neo-bg-sec text-neo-text font-heading font-black text-xs md:text-sm uppercase tracking-wider border-[3px] border-neo-border shadow-[3px_3px_0px_0px_var(--neo-border)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--neo-border)] transition-all flex items-center gap-2 cursor-pointer rounded-lg"
        >
          <ArrowLeft size={14} className="stroke-[3]" />
          MENU UTAMA
        </button>
      </div>

      <div className="bg-neo-card border-[4px] border-neo-border p-6 shadow-neo-lg rounded-[12px]">
        <h2 className="font-heading font-black text-2xl uppercase text-neo-text tracking-wide mb-2 flex items-center gap-2">
          Kirim Masukan
        </h2>
        <p className="text-xs font-semibold text-neo-text opacity-70 mb-6 leading-relaxed">NEMU BUG ATAU PUNYA IDE FITUR? KABARIN LANGSUNG KE KAMI 🚀
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-neo-text">
              Kategori Masukan
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('fitur')}
                className={`py-3 px-4 border-[3px] font-heading font-black text-xs uppercase tracking-wider transition-all rounded-lg cursor-pointer flex items-center justify-center gap-2 ${
                  type === 'fitur' 
                    ? 'border-[#10B981] bg-[#D1FAE5] dark:bg-[#064E3B] text-[#059669] dark:text-[#34D399] shadow-[3px_3px_0px_0px_#10B981]' 
                    : 'border-neo-border bg-neo-bg text-neo-text opacity-70'
                }`}
              >
                <Lightbulb size={16} />
                <span>Ide Fitur</span>
              </button>
              <button
                type="button"
                onClick={() => setType('bug')}
                className={`py-3 px-4 border-[3px] font-heading font-black text-xs uppercase tracking-wider transition-all rounded-lg cursor-pointer flex items-center justify-center gap-2 ${
                  type === 'bug' 
                    ? 'border-[#EF4444] bg-[#FEE2E2] dark:bg-[#7F1D1D] text-[#DC2626] dark:text-[#FCA5A5] shadow-[3px_3px_0px_0px_#EF4444]' 
                    : 'border-neo-border bg-neo-bg text-neo-text opacity-70'
                }`}
              >
                <Bug size={16} />
                <span>Lapor Bug</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="block text-xs font-black uppercase tracking-wider text-neo-text">
                Detail Masukan
              </label>
              <span className={`text-[10px] font-bold ${content.length > characterLimit ? 'text-red-500' : 'text-neo-text opacity-50'}`}>
                {content.length}/{characterLimit}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, characterLimit))}
              required
              rows={4}
              className="w-full bg-neo-bg border-[3px] border-neo-border p-3 text-sm font-semibold text-neo-text focus:outline-none focus:border-[#6366F1] resize-none rounded-lg transition-colors placeholder:opacity-40"
              placeholder={type === 'fitur' 
                ? "Ceritain fitur baru yang kamu pengen ada di SaveTik..." 
                : "Jelasin secara detail error-nya pas lagi ngapain, pesan errornya apa (kalau ada)..."
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-neo-text">
              KONTAK ( OPSIONAL, KALAU MAU DIBALAS )
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-neo-bg border-[3px] border-neo-border p-3 text-sm font-semibold text-neo-text focus:outline-none focus:border-[#6366F1] rounded-lg transition-colors placeholder:opacity-40"
              placeholder="Email // Username Telegram // Username WhatsApp"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim() || content.length > characterLimit}
            className="w-full py-4 bg-[#6366F1] hover:bg-[#4F46E5] disabled:bg-gray-400 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest border-[3px] border-neo-border shadow-[4px_4px_0px_0px_var(--neo-border)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--neo-border)] transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center gap-2">MENGIRIM...</span>
            ) : (
              <>
                <Send size={18} className="stroke-[3]" />
                KIRIM SEKARANG
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
