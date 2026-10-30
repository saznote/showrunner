import React, { useEffect, useState } from 'react';
import { AvatarEmotion } from '../types';
import { DollarSign, Sparkles, Zap, Flame, Eye, TrendingUp, Box, FileBox, Upload } from 'lucide-react';
import { VrmAvatarViewer } from './VrmAvatarViewer';

interface AvatarVisualizerProps {
  emotion: AvatarEmotion;
  isSpeaking: boolean;
  currentCaption?: string;
  overlayText?: string;
  activeSectionTitle?: string;
  is3dMode?: boolean;
  vrmFile?: File | null;
  onToggle3d?: (active: boolean) => void;
  onOpenUploadModal?: () => void;
  onVrmLoaded?: (vrmData: { title?: string; author?: string; version?: string }) => void;
}

export const AvatarVisualizer: React.FC<AvatarVisualizerProps> = ({
  emotion,
  isSpeaking,
  currentCaption,
  overlayText,
  activeSectionTitle,
  is3dMode = false,
  vrmFile = null,
  onToggle3d,
  onOpenUploadModal,
  onVrmLoaded,
}) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  // Lip-sync animation when speaking (for 2D avatar)
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(false);
      return;
    }
    const interval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 140);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div className="relative w-full aspect-[9/16] max-w-[340px] mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-[#0d121d] to-[#080b12] border-2 border-slate-800/80 shadow-2xl flex flex-col justify-between p-4 select-none group">
      {/* Background Studio Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-10 left-1/4 w-60 h-40 bg-purple-600/20 rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
      </div>

      {/* Top Bar: Section Indicator, Live REC badge & 2D/3D VRM Toggle */}
      <div className="relative z-20 flex items-center justify-between text-xs font-semibold gap-1.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white backdrop-blur-md shadow-lg shadow-red-900/40">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="font-mono tracking-wider font-bold">REC • SHORT</span>
        </div>

        {/* 2D / 3D VRM Mode Switch */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 backdrop-blur-md">
          <button
            onClick={() => onToggle3d && onToggle3d(false)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
              !is3dMode ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => {
              if (onToggle3d) onToggle3d(true);
              if (!vrmFile && onOpenUploadModal) onOpenUploadModal();
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
              is3dMode ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-2.5 h-2.5" />
            <span>3D VRM</span>
          </button>
        </div>

        {activeSectionTitle && (
          <div className="px-2 py-1 rounded-full bg-slate-800/80 text-amber-300 border border-amber-500/30 backdrop-blur-md font-mono text-[9px] tracking-wide uppercase truncate max-w-[90px]">
            {activeSectionTitle}
          </div>
        )}
      </div>

      {/* Dynamic Screen Overlay Badge (MrBeast / Viral Style Hook) */}
      {overlayText && (
        <div className="relative z-20 my-2 transition-all transform duration-300">
          <div className="bg-yellow-400 text-black font-extrabold text-sm sm:text-base uppercase tracking-tight px-3 py-1.5 rounded-xl shadow-[0_6px_0_#b45309] text-center rotate-[-1deg] border-2 border-black inline-block w-full">
            {overlayText}
          </div>
        </div>
      )}

      {/* Virtual Avatar Centerpiece: 3D VRM or 2D Vector */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-1 w-full overflow-hidden">
        {is3dMode ? (
          <div className="w-full h-full min-h-[280px] relative rounded-2xl overflow-hidden">
            <VrmAvatarViewer
              vrmFile={vrmFile}
              isSpeaking={isSpeaking}
              emotion={emotion}
              onVrmLoaded={onVrmLoaded}
              onOpenUploadModal={onOpenUploadModal}
            />
          </div>
        ) : (
          <>
            {/* Glowing Aura */}
            <div className="relative">
              <div className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 ${
                emotion === 'money_eyes'
                  ? 'bg-emerald-500/35'
                  : emotion === 'shocked'
                  ? 'bg-red-500/35'
                  : isSpeaking
                  ? 'bg-indigo-500/35'
                  : 'bg-slate-700/20'
              }`} />

              {/* SVG Stylized Avatar */}
              <div className={`relative w-44 h-44 sm:w-48 sm:h-48 transition-transform duration-300 ${
                isSpeaking ? 'animate-float scale-105' : 'scale-100'
              }`}>
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <linearGradient id="avatarHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="50%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <linearGradient id="neonVisorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                    <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1E293B" />
                      <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                  </defs>

                  {/* Shoulders / Cyber Hoodie */}
                  <path
                    d="M 30 195 C 40 150, 70 142, 100 142 C 130 142, 160 150, 170 195 Z"
                    fill="url(#jacketGrad)"
                    stroke="#334155"
                    strokeWidth="2.5"
                  />
                  {/* Hoodie Neon Trim */}
                  <path
                    d="M 85 142 L 100 170 L 115 142"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    fill="none"
                  />

                  {/* Neck */}
                  <rect x="88" y="125" width="24" height="22" rx="4" fill="#6366F1" />

                  {/* Head Base */}
                  <ellipse cx="100" cy="85" rx="46" ry="52" fill="url(#avatarHeadGrad)" stroke="#6366F1" strokeWidth="2.5" />

                  {/* Headset Headband */}
                  <path
                    d="M 48 76 C 48 40, 152 40, 152 76"
                    stroke="#0F172A"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 50 76 C 50 44, 150 44, 150 76"
                    stroke="#EF4444"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Earcups */}
                  <rect x="42" y="68" width="14" height="28" rx="6" fill="#0F172A" stroke="#EF4444" strokeWidth="2" />
                  <rect x="144" y="68" width="14" height="28" rx="6" fill="#0F172A" stroke="#EF4444" strokeWidth="2" />

                  {/* Studio Boom Mic */}
                  <path
                    d="M 46 86 Q 60 115 84 112"
                    stroke="#1E293B"
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx="85" cy="112" r="5" fill="#EF4444" />
                  <circle cx="85" cy="112" r="2.5" fill="#FFFFFF" />

                  {/* Hair / Cyber Bangs */}
                  <path
                    d="M 64 56 C 80 40, 120 40, 136 56 C 120 50, 105 48, 85 52 Z"
                    fill="#0F172A"
                  />

                  {/* EYEBROWS */}
                  {emotion === 'shocked' ? (
                    <>
                      <path d="M 72 62 Q 82 54 92 62" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M 108 62 Q 118 54 128 62" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </>
                  ) : emotion === 'smirk' ? (
                    <>
                      <path d="M 72 64 Q 82 59 92 66" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M 108 60 Q 118 55 128 58" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <path d="M 72 65 Q 82 61 92 65" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      <path d="M 108 65 Q 118 61 128 65" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    </>
                  )}

                  {/* EYES / VISOR */}
                  {emotion === 'money_eyes' ? (
                    <g className="animate-pulse">
                      <circle cx="82" cy="78" r="14" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                      <text x="76" y="84" fill="#34D399" fontSize="16" fontWeight="bold" fontFamily="monospace">€</text>
                      <circle cx="118" cy="78" r="14" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
                      <text x="112" y="84" fill="#34D399" fontSize="16" fontWeight="bold" fontFamily="monospace">€</text>
                    </g>
                  ) : emotion === 'shocked' ? (
                    <g>
                      <ellipse cx="82" cy="78" rx="13" ry="15" fill="#FFFFFF" />
                      <circle cx="82" cy="78" r="5" fill="#0F172A" />
                      <circle cx="85" cy="75" r="2" fill="#FFFFFF" />
                      <ellipse cx="118" cy="78" rx="13" ry="15" fill="#FFFFFF" />
                      <circle cx="118" cy="78" r="5" fill="#0F172A" />
                      <circle cx="121" cy="75" r="2" fill="#FFFFFF" />
                    </g>
                  ) : (
                    <g>
                      <rect x="66" y="70" width="68" height="18" rx="8" fill="#0F172A" stroke="url(#neonVisorGrad)" strokeWidth="2" />
                      <rect x="70" y="77" width="24" height="4" rx="2" fill="#38BDF8" className="animate-pulse" />
                      <rect x="106" y="77" width="24" height="4" rx="2" fill="#EC4899" className="animate-pulse" />
                    </g>
                  )}

                  {/* MOUTH & LIP SYNC */}
                  {isSpeaking ? (
                    mouthOpen ? (
                      <ellipse cx="100" cy="108" rx="11" ry="8" fill="#0F172A" stroke="#EF4444" strokeWidth="2">
                        <animate attributeName="ry" values="5;10;5" dur="0.25s" repeatCount="indefinite" />
                      </ellipse>
                    ) : (
                      <ellipse cx="100" cy="108" rx="9" ry="4" fill="#0F172A" stroke="#EF4444" strokeWidth="1.5" />
                    )
                  ) : emotion === 'smirk' ? (
                    <path d="M 90 106 Q 102 112 112 105" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  ) : emotion === 'shocked' ? (
                    <ellipse cx="100" cy="110" rx="9" ry="12" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" />
                  ) : (
                    <path d="M 91 108 Q 100 111 109 108" stroke="#CBD5E1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  )}
                </svg>

                {/* Floating Emotion Badges */}
                {emotion === 'money_eyes' && (
                  <div className="absolute -top-3 -right-2 p-1.5 rounded-full bg-emerald-500 text-black shadow-lg animate-bounce">
                    <DollarSign className="w-5 h-5 stroke-[3]" />
                  </div>
                )}
                {emotion === 'shocked' && (
                  <div className="absolute -top-3 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow-lg animate-ping">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                )}
                {emotion === 'smirk' && (
                  <div className="absolute -top-3 -right-2 p-1.5 rounded-full bg-indigo-500 text-white shadow-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Audio Waveform Bars when speaking */}
            <div className="flex items-center gap-1.5 h-6 mt-2">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isSpeaking
                      ? 'bg-gradient-to-t from-red-500 to-amber-400'
                      : 'bg-slate-700/50 h-1.5'
                  }`}
                  style={{
                    height: isSpeaking ? `${Math.sin((i + Date.now() / 200) * 1.5) * 12 + 16}px` : '4px',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Subtitle / Viral Caption Box (MrBeast style yellow/white highlighted subtitles) */}
      <div className="relative z-20 min-h-[74px] flex items-center justify-center">
        {currentCaption ? (
          <div className="bg-black/85 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 text-center shadow-xl w-full">
            <p className="text-sm font-extrabold text-white leading-snug tracking-tight">
              {currentCaption.split(' ').map((word, wIdx) => {
                const isHighlight =
                  word.includes('€') ||
                  word.includes('$') ||
                  /\d+/.test(word) ||
                  ['millionnaire', 'jackpot', 'vues', 'secret', 'buzz', 'abonnés', 'fortune', 'braquage'].includes(
                    word.toLowerCase().replace(/[^a-z0-9]/gi, '')
                  );
                return (
                  <span
                    key={wIdx}
                    className={`inline-block mr-1 ${
                      isHighlight
                        ? 'text-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.6)] font-black text-[15px]'
                        : 'text-white'
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </p>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500 font-mono">
            En attente de réplique de l'avatar...
          </div>
        )}
      </div>

      {/* Mobile TikTok / Shorts UI Overlays (Like, Comment, Share buttons) */}
      <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4 text-white/90">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-red-500/80 transition-colors cursor-pointer">
            <Flame className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">84.2k</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-blue-500/80 transition-colors cursor-pointer">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">1.9k</span>
        </div>
      </div>
    </div>
  );
};
