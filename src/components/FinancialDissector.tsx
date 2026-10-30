import React, { useState } from 'react';
import { ScriptData } from '../types';
import {
  DollarSign,
  TrendingUp,
  Percent,
  HelpCircle,
  Award,
  Layers,
  Calculator,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RevenueProgressionChart } from './RevenueProgressionChart';

interface FinancialDissectorProps {
  scriptData: ScriptData;
}

export const FinancialDissector: React.FC<FinancialDissectorProps> = ({ scriptData }) => {
  const [customViews, setCustomViews] = useState<number>(scriptData.views);
  const [customRpm, setCustomRpm] = useState<number>(scriptData.rpm.avg);

  const calculatedAdsense = Math.round((customViews / 1000) * customRpm);
  const sponsorEstimate =
    customViews > 1_000_000
      ? Math.round((customViews / 1000) * 15)
      : Math.round((customViews / 1000) * 8);
  const totalRevenue = calculatedAdsense + sponsorEstimate;

  const triggerJackpotCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
    });
  };

  const nicheRpmBenchmarks = [
    { niche: 'Finance / Business / Crypto', range: '5.50€ - 12.00€', color: 'text-amber-400' },
    { niche: 'Tech & Logiciels & IA', range: '3.50€ - 8.00€', color: 'text-cyan-400' },
    { niche: 'Santé & Fitness', range: '2.80€ - 5.50€', color: 'text-emerald-400' },
    { niche: 'Divertissement & Vlogs', range: '1.50€ - 3.20€', color: 'text-rose-400' },
    { niche: 'Gaming & Streams', range: '1.00€ - 2.20€', color: 'text-indigo-400' },
    { niche: 'Shorts 100% Défilement', range: '0.04€ - 0.12€ (Fonds Shorts)', color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Jackpot Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-current text-amber-400" />
              Jackpot Estimé de la Vidéo
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-1">
              {new Intl.NumberFormat('fr-FR').format(scriptData.earnings.adsenseAvg)} €
              <span className="text-sm font-normal text-slate-400 ml-2">AdSense net estimé</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fourchette réaliste :{' '}
              <span className="text-emerald-300 font-semibold font-mono">
                {new Intl.NumberFormat('fr-FR').format(scriptData.earnings.adsenseLow)} € -{' '}
                {new Intl.NumberFormat('fr-FR').format(scriptData.earnings.adsenseHigh)} €
              </span>
            </p>
          </div>

          <button
            onClick={triggerJackpotCelebration}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <DollarSign className="w-4 h-4 stroke-[3]" />
            Célébrer le Jackpot 💸
          </button>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">RPM Niche ({scriptData.niche})</span>
            <div className="text-xl font-bold font-mono text-amber-400">
              {scriptData.rpm.avg.toFixed(2)} €
              <span className="text-xs font-normal text-slate-400 ml-1">/ 1k vues</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Fourchette : {scriptData.rpm.low.toFixed(1)}€ - {scriptData.rpm.high.toFixed(1)}€
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Partenariat Sponsor Estimé</span>
            <div className="text-xl font-bold font-mono text-cyan-400">
              +{new Intl.NumberFormat('fr-FR').format(scriptData.earnings.estimatedSponsorship)} €
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Intégration B-roll ou placement 60s
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Gains Totaux Estimés</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              ≈ {new Intl.NumberFormat('fr-FR').format(scriptData.earnings.totalEstimated)} €
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              AdSense + Partenariats inclus
            </p>
          </div>
        </div>

        {/* Explanation paragraph */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Méthode de calcul du Showrunner : </span>
            {scriptData.earnings.explanation}
          </div>
        </div>
      </div>

      {/* Visual Comparative Chart: AdSense vs Total Revenue (Recharts) */}
      <RevenueProgressionChart scriptData={scriptData} />

      {/* Interactive Simulator: Adjust Views & RPM Live */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
        <h4 className="font-heading font-bold text-white text-base flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-400" />
          Simulateur Interactif de Rentabilité
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Vues Simulées :</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {new Intl.NumberFormat('fr-FR').format(customViews)} vues
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="50000000"
                step="50000"
                value={customViews}
                onChange={(e) => setCustomViews(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">RPM Publicitaire :</span>
                <span className="text-amber-400 font-mono font-bold">
                  {customRpm.toFixed(2)} € / 1 000 vues
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.1"
                value={customRpm}
                onChange={(e) => setCustomRpm(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center">
            <span className="text-xs text-slate-400">Résultat pour cette simulation :</span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1 text-emerald-400">
              {new Intl.NumberFormat('fr-FR').format(calculatedAdsense)} €
            </div>
            <span className="text-xs text-slate-500 mt-1">
              Calcul : ({new Intl.NumberFormat('fr-FR').format(customViews)} / 1 000) × {customRpm.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>

      {/* Benchmarks de RPM par thématique YouTube */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800">
        <h4 className="font-heading font-bold text-white text-base flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-purple-400" />
          Barème Réaliste des RPM YouTube (Marché FR / International)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {nicheRpmBenchmarks.map((bench, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl bg-slate-950/60 border ${
                scriptData.niche.toLowerCase().includes(bench.niche.toLowerCase().split(' ')[0])
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : 'border-slate-800'
              }`}
            >
              <span className="text-xs text-slate-300 font-medium block truncate">
                {bench.niche}
              </span>
              <span className={`text-sm font-mono font-bold mt-1 block ${bench.color}`}>
                {bench.range}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
