import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, Activity, Disc, Sparkles, Sliders } from 'lucide-react';

export interface AudioWaveformVisualizerProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  accentColor?: string;
  barCount?: number;
  height?: number;
  showDetails?: boolean;
  title?: string;
  className?: string;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  audioRef,
  accentColor = '#6366F1',
  barCount = 42,
  height = 56,
  showDetails = true,
  title,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [animFrame, setAnimFrame] = useState<number>(0);
  const [visualMode, setVisualMode] = useState<'waveform' | 'equalizer'>('waveform');

  // Real-time Web Audio API analyzer frequency data array
  const [freqData, setFreqData] = useState<Uint8Array | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Generate static baseline waveform shape for song profile
  const baseHeights = useMemo(() => {
    const bars: number[] = [];
    let seed = 12345;
    if (title) {
      for (let i = 0; i < title.length; i++) {
        seed += title.charCodeAt(i) * (i + 1);
      }
    }
    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < barCount; i++) {
      // Create natural envelope shape (lower at start and end, peak in middle)
      const normIdx = i / barCount;
      const envelope = Math.sin(normIdx * Math.PI);
      const randomFactor = 0.3 + pseudoRandom() * 0.7;
      const val = Math.min(1.0, Math.max(0.15, envelope * randomFactor * 1.2));
      bars.push(val);
    }
    return bars;
  }, [barCount, title]);

  // Animation Loop for live bar height pulses
  useEffect(() => {
    let animationId: number;

    const renderLoop = () => {
      setAnimFrame((prev) => (prev + 1) % 10000);

      if (isPlaying) {
        animationId = requestAnimationFrame(renderLoop);
      }
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  const progressRatio = duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;
  const currentBarIndex = Math.floor(progressRatio * barCount);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    setHoverX(x);
    setHoverTime(ratio * duration);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0 || !onSeek) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Top Meta Bar */}
      {showDetails && (
        <div className="flex items-center justify-between text-[11px] font-mono font-black text-neo-text">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-neo-bg dark:bg-[#251e2b] px-2 py-0.5 neo-border-thin rounded-[4px]">
              <Activity size={12} className={isPlaying ? "text-emerald-500 animate-pulse" : "text-neo-text opacity-50"} />
              <span className="uppercase text-[9px] font-black">
                {isPlaying ? 'AUDIO AKTIFKAN' : 'AUDIO DIHENTIKAN'}
              </span>
            </div>

            {title && (
              <span className="truncate max-w-[150px] sm:max-w-[220px] text-[10px] opacity-75 font-sans font-bold">
                {title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <button
              type="button"
              onClick={() => setVisualMode(v => v === 'waveform' ? 'equalizer' : 'waveform')}
              className="p-1 hover:bg-neo-bg-sec bg-neo-card neo-border-thin rounded-[4px] text-neo-text transition-all cursor-pointer flex items-center gap-1 text-[9px] font-black uppercase"
              title="Ganti Tampilan Gelombang"
            >
              <Sliders size={11} />
              <span className="hidden sm:inline">{visualMode === 'waveform' ? 'Gelombang' : 'Equalizer'}</span>
            </button>

            {/* Live Indicator */}
            <span className="flex items-center gap-1 text-[10px] font-bold">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
              {formatTime(currentTime)}:{formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Waveform Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ height: `${height}px` }}
        className="relative w-full bg-neo-bg dark:bg-[#1a1520] neo-border p-2 rounded-xl flex items-center justify-between gap-1 cursor-pointer overflow-hidden group transition-all hover:border-[#6366F1]"
      >
        {/* Background Grid Accent Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

        {/* Played Progress Background Shadow */}
        <div
          className="absolute top-0 left-0 bottom-0 bg-[#6366F1]/10 dark:bg-[#6366F1]/20 pointer-events-none transition-all duration-75 border-r border-[#6366F1]"
          style={{ width: `${progressRatio * 100}%` }}
        />

        {/* Hover Line Marker */}
        {hoverTime !== null && (
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-amber-400 z-20 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            style={{ left: `${hoverX}px` }}
          >
            {/* Hover Timestamp Badge */}
            <div className="absolute -top-6 -translate-x-1/2 bg-amber-400 text-black font-mono text-[9px] font-black px-1.5 py-0.5 neo-border-thin rounded whitespace-nowrap shadow-md">
              {formatTime(hoverTime)}
            </div>
          </div>
        )}

        {/* Audio Waveform / Equalizer Bars */}
        {baseHeights.map((baseVal, idx) => {
          const barProgressRatio = (idx + 0.5) / barCount;
          const isPlayed = barProgressRatio <= progressRatio;
          const isCurrentBar = idx === currentBarIndex;

          let dynamicHeightMultiplier = 1.0;

          if (isPlaying) {
            if (freqData && freqData.length > 0) {
              const freqIdx = Math.floor((idx / barCount) * (freqData.length / 2));
              const freqVal = freqData[freqIdx] || 0;
              dynamicHeightMultiplier = 0.3 + (freqVal / 255) * 1.4;
            } else {
              // Synthetic modulation when AudioContext source is cross-origin
              const phase = (animFrame * 0.12) + (idx * 0.35);
              const sineWave = (Math.sin(phase) + Math.cos(phase * 0.7)) * 0.35;
              dynamicHeightMultiplier = 0.7 + sineWave + (isCurrentBar ? 0.3 : 0);
            }
          }

          let barHeightPercent = Math.min(100, Math.max(12, baseVal * dynamicHeightMultiplier * 100));

          if (visualMode === 'equalizer' && isPlaying) {
            barHeightPercent = Math.min(100, Math.max(15, (baseVal * 0.4 + (Math.sin(animFrame * 0.15 + idx * 0.4) + 1) * 0.3) * 100));
          }

          return (
            <div
              key={idx}
              className="relative flex-1 h-full flex items-center justify-center group/bar"
            >
              <div
                style={{
                  height: `${barHeightPercent}%`,
                  backgroundColor: isPlayed 
                    ? (isCurrentBar ? '#10B981' : accentColor) 
                    : 'rgba(156, 163, 175, 0.35)',
                  boxShadow: isPlayed && isPlaying ? `0 0 6px ${accentColor}80` : 'none'
                }}
                className={`w-full rounded-full transition-all duration-75 origin-center ${
                  isCurrentBar && isPlaying ? 'animate-pulse scale-y-110' : ''
                }`}
              />
            </div>
          );
        })}

        {/* Center Playing Wave Pulse Animation line */}
        {isPlaying && (
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#6366F1]/30 pointer-events-none" />
        )}
      </div>

      {/* Bottom Visualizer Tip */}
      <div className="flex items-center justify-between text-[9px] font-mono text-neo-text opacity-60">
        <span className="flex items-center gap-1">
          <Sparkles size={10} className="text-amber-500" />
          geser pada grafik gelombang untuk melompat posisi lagu
        </span>
        <span className="font-bold uppercase tracking-wider">
          {isPlaying ? '' : ''}
        </span>
      </div>
    </div>
  );
};

export default AudioWaveformVisualizer;
