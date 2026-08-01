import { useState } from 'react';
import { Menu, X, Sun, Moon, Smartphone, LogOut, Home, BookOpen, ShieldAlert, Heart, MessageSquare, Star, Clock, Info } from 'lucide-react';

interface NavbarProps {
  activeView: 'downloader' | 'guide' | 'restrictions' | 'donation' | 'history' | 'feedback' | 'favorites' | 'offline' | 'admin' | 'about';
  onViewChange: (view: 'downloader' | 'guide' | 'restrictions' | 'donation' | 'history' | 'feedback' | 'favorites' | 'offline' | 'admin' | 'about') => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onOpenInstallModal: () => void;
  onAdminAccess: () => void;
  onAdminLogout?: () => void;
  accentColor?: string;
}

export default function Navbar({ 
  activeView,
  onViewChange,
  theme,
  onThemeToggle,
  onOpenInstallModal,
  onAdminAccess,
  onAdminLogout,
  accentColor = '#FFE600'
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-20 bg-neo-card border-b-[4px] border-neo-border z-40 px-4 md:px-8 flex items-center justify-between transition-colors">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Icon (Mobile) */}
          <button 
            id="mobile-menu-toggle"
            onClick={toggleMenu}
            className="p-2 lg:hidden neo-border bg-neo-bg text-neo-text active:translate-y-0.5 transition-all cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="stroke-[3]" />
          </button>
          
          <button onClick={onAdminAccess} className="flex items-center gap-2 cursor-pointer border-none bg-transparent">
            <span className="font-heading font-black text-2xl md:text-3xl tracking-tight uppercase text-neo-text dark:text-white">
              Save<span className="text-blue-700 dark:text-blue-500 font-black">Tik</span>
            </span>
          </button>
        </div>

        {/* Right Side: Desktop Items & Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => {
                onViewChange('downloader');
              }}
              className={`font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'downloader'
                  ? 'underline underline-offset-4 decoration-[3px]'
                  : 'text-neo-text hover:opacity-80'
              }`}
              style={{ color: activeView === 'downloader' ? accentColor : undefined }}
            >
              <Home size={14} className="stroke-[2.5]" />
              <span>BERANDA</span>
            </button>
            
            <button
              onClick={() => {
                onViewChange('guide');
              }}
              className={`font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'guide'
                  ? 'underline underline-offset-4 decoration-[3px]'
                  : 'text-neo-text hover:opacity-80'
              }`}
              style={{ color: activeView === 'guide' ? accentColor : undefined }}
            >
              <BookOpen size={14} className="stroke-[2.5]" />
              <span>CARA PENGGUNAAN</span>
            </button>

            <button
              onClick={() => {
                onViewChange('restrictions');
              }}
              className={`font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'restrictions'
                  ? 'underline underline-offset-4 decoration-[3px]'
                  : 'text-neo-text hover:opacity-80'
              }`}
              style={{ color: activeView === 'restrictions' ? accentColor : undefined }}
            >
              <ShieldAlert size={14} className="stroke-[2.5]" />
              <span>LARANGAN</span>
            </button>

            <button
              onClick={() => {
                onViewChange('donation');
              }}
              className={`font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'donation'
                  ? 'underline underline-offset-4 decoration-[3px]'
                  : 'text-neo-text hover:opacity-80'
              }`}
              style={{ color: activeView === 'donation' ? accentColor : undefined }}
            >
              <Heart size={14} className="stroke-[2.5]" />
              <span>DONASI</span>
            </button>

            <button
              onClick={() => {
                onViewChange('feedback');
              }}
              className={`font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'feedback'
                  ? 'underline underline-offset-4 decoration-[3px]'
                  : 'text-neo-text hover:opacity-80'
              }`}
              style={{ color: activeView === 'feedback' ? accentColor : undefined }}
            >
              <MessageSquare size={14} className="stroke-[2.5]" />
              <span>FEEDBACK</span>
            </button>

            <button
              onClick={() => {
                onViewChange('favorites');
              }}
              className={`font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'favorites'
                  ? 'underline underline-offset-4 decoration-[3px]'
                  : 'text-neo-text hover:opacity-80'
              }`}
              style={{ color: activeView === 'favorites' ? accentColor : undefined }}
            >
              <Star size={14} className="stroke-[2.5]" />
              <span>FAVORIT</span>
            </button>

            <button
              onClick={() => {
                onViewChange('about');
              }}
              className={`font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'about'
                  ? 'underline underline-offset-4 decoration-[3px]'
                  : 'text-neo-text hover:opacity-80'
              }`}
              style={{ color: activeView === 'about' ? accentColor : undefined }}
            >
              <Info size={14} className="stroke-[2.5]" />
              <span>TENTANG WEBSITE</span>
            </button>

            {activeView === 'admin' && onAdminLogout && (
              <button
                onClick={onAdminLogout}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3 py-1.5 font-heading font-black text-xs uppercase tracking-wider neo-border shadow-neo-btn flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 rounded-lg ml-2"
                title="Keluar dari mode admin"
              >
                <LogOut size={14} className="stroke-[3]" />
                KELUAR ADMIN
              </button>
            )}

            <div className="bg-[#E2F7F2] dark:bg-[#1A3D35] neo-border-thin px-3 py-1.5 font-mono text-xs flex items-center gap-2 font-black text-[#14B8A6] transition-colors rounded-lg">
              ✓ ONLINE
            </div>
          </div>

          {/* Theme Toggle Quick Button */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 neo-border bg-neo-bg text-neo-text hover:bg-neo-bg-sec active:translate-y-0.5 transition-all shadow-neo-btn-press cursor-pointer rounded-lg"
            aria-label="Toggle theme"
            title={`Mode: ${theme}`}
          >
            {theme === 'light' ? <Moon size={18} className="stroke-[3]" /> : <Sun size={18} className="stroke-[3]" />}
          </button>
        </div>

        {/* Hamburger Drawer Slide-From-Left (Mobile & Tablet) */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 z-50 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleMenu}
        >
          <div 
            className={`w-[290px] max-w-full h-full bg-neo-bg border-r-[4px] border-neo-border p-6 flex flex-col justify-between transition-transform duration-300 overflow-y-auto ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-neo-border">
                <span className="font-heading font-black text-xl tracking-tight uppercase text-neo-text">
                  MENU SAVETIK
                </span>
                <button 
                  id="drawer-close"
                  onClick={toggleMenu}
                  className="p-1 neo-border bg-neo-card text-neo-text cursor-pointer rounded-md"
                >
                  <X size={18} className="stroke-[3]" />
                </button>
              </div>

              {/* Navigation links in drawer */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    onViewChange('downloader');
                    toggleMenu();
                  }}
                  className={`w-full text-left py-2.5 px-4 font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2 ${
                    activeView === 'downloader' ? 'bg-neo-bg-sec' : 'bg-neo-card text-neo-text'
                  }`}
                  style={{ color: activeView === 'downloader' ? accentColor : undefined }}
                >
                  <Home size={16} className="stroke-[2.5]" />
                  <span>BERANDA</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('guide');
                    toggleMenu();
                  }}
                  className={`w-full text-left py-2.5 px-4 font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2 ${
                    activeView === 'guide' ? 'bg-neo-bg-sec' : 'bg-neo-card text-neo-text'
                  }`}
                  style={{ color: activeView === 'guide' ? accentColor : undefined }}
                >
                  <BookOpen size={16} className="stroke-[2.5]" />
                  <span>CARA PENGGUNAAN</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('restrictions');
                    toggleMenu();
                  }}
                  className={`w-full text-left py-2.5 px-4 font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2 ${
                    activeView === 'restrictions' ? 'bg-neo-bg-sec' : 'bg-neo-card text-neo-text'
                  }`}
                  style={{ color: activeView === 'restrictions' ? accentColor : undefined }}
                >
                  <ShieldAlert size={16} className="stroke-[2.5]" />
                  <span>LARANGAN</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('history');
                    toggleMenu();
                  }}
                  className={`w-full text-left py-2.5 px-4 font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2 ${
                    activeView === 'history' ? 'bg-neo-bg-sec' : 'bg-neo-card text-neo-text'
                  }`}
                  style={{ color: activeView === 'history' ? accentColor : undefined }}
                >
                  <Clock size={16} className="stroke-[2.5]" />
                  <span>RIWAYAT</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('donation');
                    toggleMenu();
                  }}
                  className={`w-full text-left py-2.5 px-4 font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2 ${
                    activeView === 'donation' ? 'bg-neo-bg-sec' : 'bg-neo-card text-neo-text'
                  }`}
                  style={{ color: activeView === 'donation' ? accentColor : undefined }}
                >
                  <Heart size={16} className="stroke-[2.5]" />
                  <span>DONASI</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('feedback');
                    toggleMenu();
                  }}
                  className={`w-full text-left py-2.5 px-4 font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2 ${
                    activeView === 'feedback' ? 'bg-neo-bg-sec' : 'bg-neo-card text-neo-text'
                  }`}
                  style={{ color: activeView === 'feedback' ? accentColor : undefined }}
                >
                  <MessageSquare size={16} className="stroke-[2.5]" />
                  <span>FEEDBACK</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('favorites');
                    toggleMenu();
                  }}
                  className={`w-full text-left py-2.5 px-4 font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2 ${
                    activeView === 'favorites' ? 'bg-neo-bg-sec' : 'bg-neo-card text-neo-text'
                  }`}
                  style={{ color: activeView === 'favorites' ? accentColor : undefined }}
                >
                  <Star size={16} className="stroke-[2.5]" />
                  <span>FAVORIT</span>
                </button>

                <button
                  onClick={() => {
                    onViewChange('about');
                    toggleMenu();
                  }}
                  className={`w-full text-left py-2.5 px-4 font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2 ${
                    activeView === 'about' ? 'bg-neo-bg-sec' : 'bg-neo-card text-neo-text'
                  }`}
                  style={{ color: activeView === 'about' ? accentColor : undefined }}
                >
                  <Info size={16} className="stroke-[2.5]" />
                  <span>TENTANG WEBSITE</span>
                </button>

                {activeView === 'admin' && onAdminLogout && (
                  <button
                    onClick={() => {
                      onAdminLogout();
                      toggleMenu();
                    }}
                    className="w-full text-left py-2.5 px-4 bg-[#DC2626] text-white font-black text-xs neo-border shadow-neo-btn transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-wider rounded-lg flex items-center gap-2"
                  >
                    <LogOut size={16} className="stroke-[3]" />
                    KELUAR ADMIN
                  </button>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onOpenInstallModal();
                      toggleMenu();
                    }}
                    className="w-full py-3 px-4 bg-neo-card text-neo-text hover:bg-neo-bg-sec font-heading font-black text-xs uppercase tracking-wider neo-border shadow-neo-btn flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-0.5 rounded-lg"
                  >
                    <Smartphone size={16} className="stroke-[3]" />
                    INSTALL APP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Pad fixed top bar */}
      <div className="h-20" />
    </>
  );
}
