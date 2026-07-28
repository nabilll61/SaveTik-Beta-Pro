import React, { useState } from 'react';
import { Shield, X, AlertTriangle, User, Lock, Key, Eye, EyeOff, Check, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'credentials' | 'token'>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          token: step === 'token' ? token : '',
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.requireToken) {
          setStep('token');
          setError('');
        } else {
          setError('');
          onSuccess();
        }
      } else {
        setError(data.message || 'tidak valid!');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal terhubung ke server untuk verifikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUsername('');
    setPassword('');
    setToken('');
    setStep('token');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-[100000] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-slate-800 shadow-2xl p-7 max-w-sm w-full relative rounded-3xl text-white backdrop-blur-xl ring-1 ring-white/10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
        
        {/* Modal Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-sky-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-3.5 shadow-lg shadow-emerald-500/10 text-emerald-400">
            <Shield size={28} className="stroke-[2.5]" />
          </div>
          <h2 className="font-heading font-black text-xl text-white uppercase tracking-wider flex items-center gap-2">
            Akses Admin
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Satu kali login, sesi tersimpan otomatis.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-1">
            <AlertTriangle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {step === 'credentials' ? (
            <>
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 p-3 pl-10 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-2xl transition-all placeholder:text-slate-500"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 p-3 pl-10 pr-10 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-2xl transition-all placeholder:text-slate-500"
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Token Akses Input */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-300 mb-1.5 flex justify-between items-center">
                  <span>Silahkan Masukin Token Dibawah</span>
                  <span className="text-[10px] text-emerald-400 capitalize normal-case font-normal animate-pulse">silahkan isi token akses</span>
                </label>
                <div className="relative">
                  <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    type={showToken ? "text" : "password"} 
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 p-3 pl-10 pr-10 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-2xl transition-all placeholder:text-slate-600"
                    placeholder="Masukkan Token"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
                    title={showToken ? "Sembunyikan token" : "Tampilkan token"}
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Back to credentials */}
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setError('');
                }}
                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer font-bold"
              >
                ← Kembali
              </button>
            </>
          )}
          
          {/* Simpan Login Checkbox & Auto-fill Link */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div 
                onClick={() => setRememberLogin(!rememberLogin)}
                className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
                  rememberLogin 
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20' 
                    : 'bg-slate-950 border-slate-700 group-hover:border-slate-500'
                }`}
              >
                {rememberLogin && <Check size={14} strokeWidth={3} />}
              </div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                Simpan Login
              </span>
            </label>

            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/20"
              title="Isi cepat kredensial staf"
            >
              <Sparkles size={12} />
              Savetik Beta Neww
            </button>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'MEMVERIFIKASI...' : step === 'credentials' ? 'LANJUTKAN' : 'VERIFIKASI TOKEN'}
          </button>
        </form>
      </div>
    </div>
  );
}

