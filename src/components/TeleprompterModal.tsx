import React, { useState, useEffect, useRef } from 'react';
import { ScriptData } from '../types';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
  FlipHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { playKaching, playWhoosh, playPop, playTension } from '../utils/audio';

interface TeleprompterModalProps {
  scriptData: ScriptData;
  isOpen: boolean;
  onClose: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  scriptData,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1 to 5
  const [fontSize, setFontSize] = useState(32); // px
  const [isMirrored, setIsMirrored] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    let animId: number;
    const scrollStep = () => {
      if (isPlaying && containerRef.current) {
        containerRef.current.scrollTop += scrollSpeed * 0.75;
      }
      animId = requestAnimationFrame(scrollStep);
    };

    if (isPlaying) {
      animId = requestAnimationFrame(scrollStep);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, scrollSpeed]);

  // Keyboard shortcuts (Space = Play/Pause, Esc = Close, Up/Down = Speed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'Escape') {
        onClose();
      } else if (e.code === 'ArrowUp') {
        setScrollSpeed((prev) => Math.min(prev + 1, 6));
      } else if (e.code === 'ArrowDown') {
        setScrollSpeed((prev) => Math.max(prev - 1, 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sectionsList = [
    scriptData.sections.hook,
    scriptData.sections.context,
    scriptData.sections.jackpot,
    scriptData.sections.secret,
    scriptData.sections.outro,
  ];

  const handleResetScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 text-white flex flex-col backdrop-blur-md select-none">
      {/* Top Controls Bar */}
      <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h2 className="font-heading font-bold text-lg text-white">
            Prompteur Studio Tournage Shorts
          </h2>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
            {scriptData.wordCount} mots • ~{scriptData.estimatedDurationSeconds}s
          </span>
        </div>

        {/* Floating Toolbar Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Défiler (Espace)'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleResetScroll}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Revenir au début"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Vitesse :</span>
            <input
              type="range"
              min="1"
              max="6"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-20 accent-emerald-500"
            />
            <span className="text-emerald-400 font-bold">{scrollSpeed}x</span>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Taille :</span>
            <button
              onClick={() => setFontSize((f) => Math.max(f - 4, 20))}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 font-bold"
            >
              A-
            </button>
            <span className="text-white">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(f + 4, 56))}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 font-bold"
            >
              A+
            </button>
          </div>

          {/* Mirror mode (for physical teleprompter glass) */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2.5 rounded-xl border ${
              isMirrored
                ? 'bg-indigo-600 border-indigo-400 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Miroir pour vitre de téléprompteur"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Sound Preview */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title="Effets sonores au clic"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-colors"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Reading Focus Marker Line */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/3 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-20" />

      {/* Prompter Scrolling Canvas */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto px-6 sm:px-16 md:px-28 py-20 font-sans tracking-wide leading-relaxed transition-all ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-4xl mx-auto space-y-16">
          {sectionsList.map((sec, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 shadow-2xl relative"
            >
              {/* Timing badge & Visual indication */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800 text-base font-mono">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white font-bold">
                  [{sec.timing}] {sec.title}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (!soundEnabled) return;
                    if (sec.sfx.toLowerCase().includes('kaching') || sec.sfx.toLowerCase().includes('pièce')) {
                      playKaching();
                    } else if (sec.sfx.toLowerCase().includes('whoosh')) {
                      playWhoosh();
                    } else if (sec.sfx.toLowerCase().includes('pop')) {
                      playPop();
                    } else {
                      playTension();
                    }
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  SFX: {sec.sfx} 🔊
                </button>
              </div>

              {/* Visual Cue Alert */}
              <div className="text-sm sm:text-base font-mono text-purple-400 bg-purple-950/40 border border-purple-800/50 px-3.5 py-2 rounded-xl mb-4 font-semibold">
                [VISUEL: {sec.visual}]
              </div>

              {/* Dialogue to speak */}
              <p className="font-bold text-white leading-normal tracking-wide">
                {sec.dialogue}
              </p>

              {/* Screen overlay reminder */}
              {sec.overlayText && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-yellow-400">
                  <span>TEXTE ÉCRAN :</span>
                  <span className="bg-yellow-400/20 px-2 py-0.5 rounded font-bold">
                    {sec.overlayText}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* End of Script Marker */}
          <div className="text-center py-16 text-slate-500 font-mono text-xl border-t border-dashed border-slate-800">
            🎬 FIN DU SHORT • COUPEZ !
          </div>
        </div>
      </div>
    </div>
  );
};
