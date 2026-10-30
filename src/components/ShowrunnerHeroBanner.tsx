import React from 'react';
import { Sparkles, Youtube, CheckCircle2, ShieldCheck, Zap, DollarSign } from 'lucide-react';

export const ShowrunnerHeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/30 p-6 sm:p-8 shadow-2xl mb-8">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold tracking-wide">
            <Youtube className="w-4 h-4 text-red-500" />
            SHOWRUNNER SUITE • YOUTUBE SHORTS VIRAUX
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
            Studio Automatisé pour Avatar YouTube Analyste
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Bienvenue dans ton cockpit de production. En tant que showrunner, j'analyse les vidéos virales, dévoile leurs statistiques cachées et estime leur jackpot financier selon le RPM de la niche, le tout calibré pour les Shorts (45-60s, 120-140 mots).
          </p>

          {/* 5 Rules Checklist Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="text-red-400 font-bold block">[0-3s]</span> LE HOOK
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="text-blue-400 font-bold block">[3-15s]</span> VIDÉO & CHAÎNE
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="text-emerald-400 font-bold block">[15-30s]</span> JACKPOT (RPM)
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="text-purple-400 font-bold block">[30-45s]</span> SECRET DU BUZZ
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 col-span-2 sm:col-span-1">
              <span className="text-amber-400 font-bold block">[45-55s]</span> OUTRO ENGAGEMENT
            </div>
          </div>
        </div>

        {/* Live Avatar Badge */}
        <div className="shrink-0 flex items-center md:flex-col gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-indigo-600 to-amber-500 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>

          <div className="text-left md:text-center">
            <span className="font-bold text-white block">Avatar Analyste</span>
            <span className="text-[11px] text-emerald-400 font-mono">En Ligne • Prêt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
