import React, { useState } from 'react';
import { ScriptData } from '../types';
import {
  Film,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Download,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { playKaching, playWhoosh, playPop, playTension } from '../utils/audio';

interface MontagePlanTableProps {
  scriptData: ScriptData;
}

export const MontagePlanTable: React.FC<MontagePlanTableProps> = ({ scriptData }) => {
  const [copied, setCopied] = useState(false);

  const shots = [
    {
      step: '01',
      timing: scriptData.sections.hook.timing,
      title: scriptData.sections.hook.title,
      dialogue: scriptData.sections.hook.dialogue,
      visual: scriptData.sections.hook.visual,
      sfx: scriptData.sections.hook.sfx,
      overlayText: scriptData.sections.hook.overlayText,
      emotion: scriptData.sections.hook.emotion,
      cameraShot: 'Plan serré (Close-up) + Zoom avant rapide 115%',
      colorBadge: 'bg-red-500/20 text-red-400 border-red-500/40',
    },
    {
      step: '02',
      timing: scriptData.sections.context.timing,
      title: scriptData.sections.context.title,
      dialogue: scriptData.sections.context.dialogue,
      visual: scriptData.sections.context.visual,
      sfx: scriptData.sections.context.sfx,
      overlayText: scriptData.sections.context.overlayText,
      emotion: scriptData.sections.context.emotion,
      cameraShot: 'Plan moyen + Incrustation B-roll écran partagé',
      colorBadge: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    },
    {
      step: '03',
      timing: scriptData.sections.jackpot.timing,
      title: scriptData.sections.jackpot.title,
      dialogue: scriptData.sections.jackpot.dialogue,
      visual: scriptData.sections.jackpot.visual,
      sfx: scriptData.sections.jackpot.sfx,
      overlayText: scriptData.sections.jackpot.overlayText,
      emotion: scriptData.sections.jackpot.emotion,
      cameraShot: 'Motion graphic plein écran + Avatar détouré en bas à droite',
      colorBadge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      step: '04',
      timing: scriptData.sections.secret.timing,
      title: scriptData.sections.secret.title,
      dialogue: scriptData.sections.secret.dialogue,
      visual: scriptData.sections.secret.visual,
      sfx: scriptData.sections.secret.sfx,
      overlayText: scriptData.sections.secret.overlayText,
      emotion: scriptData.sections.secret.emotion,
      cameraShot: 'Travelling horizontal + Effet surbrillance néon',
      colorBadge: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    },
    {
      step: '05',
      timing: scriptData.sections.outro.timing,
      title: scriptData.sections.outro.title,
      dialogue: scriptData.sections.outro.dialogue,
      visual: scriptData.sections.outro.visual,
      sfx: scriptData.sections.outro.sfx,
      overlayText: scriptData.sections.outro.overlayText,
      emotion: scriptData.sections.outro.emotion,
      cameraShot: 'Plan large dynamique + Flèche pointée vers les commentaires',
      colorBadge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
  ];

  const handleCopyMontagePlan = () => {
    let sheet = `📋 PLAN DE MONTAGE SHORTS - ${scriptData.videoTitle} (${scriptData.creatorName})\n\n`;
    shots.forEach((s) => {
      sheet += `=== PLAN ${s.step} [${s.timing}] : ${s.title} ===\n`;
      sheet += `CAMÉRA / CADRAGE : ${s.cameraShot}\n`;
      sheet += `DIALOGUE : "${s.dialogue}"\n`;
      sheet += `INDICATIONS VISUELLES : [VISUEL: ${s.visual}]\n`;
      sheet += `EFFET SONORE (SFX) : ${s.sfx}\n`;
      sheet += `TITRAGE ÉCRAN : ${s.overlayText}\n\n`;
    });

    navigator.clipboard.writeText(sheet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playSfxSound = (sfx: string) => {
    const s = sfx.toLowerCase();
    if (s.includes('kaching') || s.includes('pièce') || s.includes('billet') || s.includes('argent')) {
      playKaching();
    } else if (s.includes('whoosh') || s.includes('rapide')) {
      playWhoosh();
    } else if (s.includes('pop') || s.includes('cloche')) {
      playPop();
    } else {
      playTension();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            Plan de Montage Vidéo Découpage Shot-by-Shot
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Prêt à importer dans CapCut, Premiere Pro ou DaVinci Resolve pour synchroniser les visuels de l'avatar.
          </p>
        </div>

        <button
          onClick={handleCopyMontagePlan}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-all self-start sm:self-auto border border-slate-700 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Copié dans le presse-papier !</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copier le Plan de Montage</span>
            </>
          )}
        </button>
      </div>

      {/* Shot Cards List */}
      <div className="space-y-4">
        {shots.map((shot) => (
          <div
            key={shot.step}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center border border-slate-700">
                  {shot.step}
                </span>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${shot.colorBadge}`}>
                  [{shot.timing}] {shot.title}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                  • {shot.cameraShot}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playSfxSound(shot.sfx)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Écouter le bruitage associé"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{shot.sfx}</span>
                </button>
              </div>
            </div>

            {/* Grid with Dialogue and Visual breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Dialogue */}
              <div className="lg:col-span-6 space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                  Réplique de l'Avatar :
                </span>
                <p className="text-sm font-semibold text-white leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  "{shot.dialogue}"
                </p>
              </div>

              {/* Visual Asset & Overlay */}
              <div className="lg:col-span-6 space-y-2">
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs">
                  <span className="font-bold text-purple-300 block mb-1">
                    🎬 [VISUEL À L'ÉCRAN] :
                  </span>
                  <p className="text-purple-200 leading-normal">
                    {shot.visual}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400">Titrage animé :</span>
                  <span className="font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
                    {shot.overlayText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
