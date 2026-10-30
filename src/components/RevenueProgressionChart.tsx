import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
} from 'recharts';
import { ScriptData } from '../types';
import { TrendingUp, BarChart3, LineChart as LineChartIcon, DollarSign, Sparkles } from 'lucide-react';

interface RevenueProgressionChartProps {
  scriptData: ScriptData;
}

interface MilestoneData {
  views: number;
  label: string;
  isCurrent: boolean;
  adSense: number;
  sponsors: number;
  total: number;
}

export const RevenueProgressionChart: React.FC<RevenueProgressionChartProps> = ({ scriptData }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const currentViews = scriptData.views;
  const rpm = scriptData.rpm.avg;

  // Generate realistic milestones scaled around current views
  const rawMilestones = [
    Math.round(currentViews * 0.1),
    Math.round(currentViews * 0.25),
    Math.round(currentViews * 0.5),
    currentViews,
    Math.round(currentViews * 1.5),
    Math.round(currentViews * 2.0),
  ];

  // Helper to format view numbers cleanly
  const formatViewsLabel = (v: number): string => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}Md`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
    return `${v}`;
  };

  const chartData: MilestoneData[] = rawMilestones.map((v) => {
    const isCurrent = v === currentViews;
    const adSense = Math.round((v / 1000) * rpm);
    
    // Sponsorship estimated scaling
    let sponsorMultiplier = 7;
    if (v > 10_000_000) sponsorMultiplier = 16;
    else if (v > 1_000_000) sponsorMultiplier = 12;
    else if (v > 300_000) sponsorMultiplier = 9;

    const sponsors = Math.round((v / 1000) * sponsorMultiplier);
    const total = adSense + sponsors;

    return {
      views: v,
      label: isCurrent ? `${formatViewsLabel(v)} (Actuel)` : formatViewsLabel(v),
      isCurrent,
      adSense,
      sponsors,
      total,
    };
  });

  const formatEuro = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M €`;
    if (val >= 1_000) return `${Math.round(val / 1_000)}k €`;
    return `${val} €`;
  };

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MilestoneData;
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 font-mono">
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <span className="font-bold text-white font-sans text-sm">{data.label}</span>
            {data.isCurrent && (
              <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/50 text-[10px] font-bold">
                PALIER ACTUEL
              </span>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                AdSense Brut :
              </span>
              <span className="font-bold text-emerald-300">
                {new Intl.NumberFormat('fr-FR').format(data.adSense)} €
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
                Sponsors Estimés :
              </span>
              <span className="font-bold text-cyan-300">
                +{new Intl.NumberFormat('fr-FR').format(data.sponsors)} €
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-6 text-white font-bold">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Total Estimé :
              </span>
              <span className="text-amber-300 text-sm">
                {new Intl.NumberFormat('fr-FR').format(data.total)} €
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentMilestone = chartData.find((d) => d.isCurrent) || chartData[3];
  const adSenseSharePercent = Math.round(
    (currentMilestone.adSense / (currentMilestone.total || 1)) * 100
  );
  const sponsorSharePercent = 100 - adSenseSharePercent;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h4 className="font-heading font-bold text-white text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Progression Comparative des Revenus (AdSense vs Total Estimé)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Évolution prévisionnelle des gains selon la croissance des vues et l'effet levier des sponsors.
          </p>
        </div>

        {/* View Switcher: Area vs Bar */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === 'area'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Courbe d'Accélération</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Colonnes Paliers</span>
          </button>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAdsense" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={formatEuro}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => (
                  <span className="text-xs text-slate-300 font-medium font-sans">
                    {val === 'total' ? 'Revenu Total Estimé (+ Sponsors)' : 'Revenu AdSense Seul'}
                  </span>
                )}
              />

              {/* Marker for current video views */}
              <ReferenceLine
                x={currentMilestone.label}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: '🎯 Actuel',
                  position: 'insideTopLeft',
                  fill: '#EF4444',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />

              <Area
                type="monotone"
                dataKey="total"
                name="total"
                stroke="#F59E0B"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                type="monotone"
                dataKey="adSense"
                name="adSense"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAdsense)"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={formatEuro}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => (
                  <span className="text-xs text-slate-300 font-medium font-sans">
                    {val === 'adSense' ? 'Revenu AdSense' : 'Sponsors Intégrés'}
                  </span>
                )}
              />

              <Bar dataKey="adSense" name="adSense" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="sponsors" name="sponsors" fill="#06B6D4" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insight Stats Below Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Part Pub AdSense</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {adSenseSharePercent}% du Total
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs">
            ADS
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Levier Sponsors / Marque</span>
            <span className="text-base font-bold text-cyan-400 font-mono">
              {sponsorSharePercent}% du Total
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold font-mono text-xs">
            SPON
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Objectif x2 Vues</span>
            <span className="text-base font-bold text-amber-400 font-mono">
              +{new Intl.NumberFormat('fr-FR').format(chartData[chartData.length - 1].total)} €
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold font-mono text-xs">
            x2
          </div>
        </div>
      </div>
    </div>
  );
};
