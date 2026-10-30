import React, { useState } from 'react';
import { VIDEO_PRESETS } from '../data/presets';
import { VideoPreset } from '../types';
import {
  Sparkles,
  Youtube,
  Eye,
  Users,
  Calendar,
  Layers,
  Wand2,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface VideoInputFormProps {
  onSubmit: (formData: {
    videoTitle: string;
    creatorName: string;
    videoUrl?: string;
    currentViews: string;
    subscriberCount: string;
    channelCreationDate: string;
    niche: string;
    avatarTone: string;
    customNotes: string;
  }) => void;
  isLoading: boolean;
}

export const VideoInputForm: React.FC<VideoInputFormProps> = ({ onSubmit, isLoading }) => {
  const [videoTitle, setVideoTitle] = useState('KAIZEN : 1 an pour gravir l\'Everest !');
  const [creatorName, setCreatorName] = useState('Inoxtag');
  const [videoUrl, setVideoUrl] = useState('https://youtube.com/watch?v=kaizen-everest');
  const [currentViews, setCurrentViews] = useState('38 000 000');
  const [subscriberCount, setSubscriberCount] = useState('8.9M');
  const [channelCreationDate, setChannelCreationDate] = useState('Février 2015');
  const [niche, setNiche] = useState('Divertissement & Aventure');
  const [avatarTone, setAvatarTone] = useState('Analyste ironique, direct et percutant');
  const [customNotes, setCustomNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const niches = [
    'Divertissement & Aventure',
    'Gaming & Esports',
    'Tech & Intelligence Artificielle',
    'Finance & Business & Crypto',
    'Prank & Micro-Trottoir',
    'Vlog & Lifestyle',
    'Fitness & Sport',
    'Culture & Science & Storytelling',
  ];

  const tones = [
    'Analyste ironique, direct et percutant',
    'Showman électrisant (style MrBeast / Alex Hormozi)',
    'Enquêteur mystérieux & suspense haletant',
    'Cynique & désabusé face aux sommes folles',
    'Pédagogue data & stratège YouTube',
  ];

  const handleApplyPreset = (preset: VideoPreset) => {
    setVideoTitle(preset.videoTitle);
    setCreatorName(preset.creatorName);
    setCurrentViews(preset.currentViews);
    setSubscriberCount(preset.subscriberCount);
    setChannelCreationDate(preset.channelCreationDate);
    setNiche(preset.niche);
    setAvatarTone(preset.avatarTone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      videoTitle: videoTitle.trim(),
      creatorName: creatorName.trim(),
      videoUrl: videoUrl.trim(),
      currentViews: currentViews.trim(),
      subscriberCount: subscriberCount.trim(),
      channelCreationDate: channelCreationDate.trim(),
      niche,
      avatarTone,
      customNotes: customNotes.trim(),
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-white font-heading flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Showrunner : Fiche Vidéo à Traiter
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Renseigne les 4 informations clés pour générer le script Short viral (120-140 mots) et son plan de montage.
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Règles Shorts 45-60s activées
        </div>
      </div>

      {/* 1-Click Viral Case Presets */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Cas d'école viraux prêts à l'emploi (1-clic) :
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {VIDEO_PRESETS.map((preset) => {
            const isSelected = creatorName === preset.creatorName && videoTitle === preset.videoTitle;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-red-500 bg-red-950/40 shadow-md shadow-red-900/20 text-white'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mb-1.5 ${preset.badgeColor}`}>
                    {preset.tag}
                  </span>
                  <p className="font-bold truncate text-white">{preset.creatorName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{preset.videoTitle}</p>
                </div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400">
                  {preset.currentViews} vues
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* The 4-Question Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question 1: Video Title / Creator / Link */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 border border-red-500/50 flex items-center justify-center text-xs font-mono font-bold">
                1
              </span>
              Titre de la vidéo virale et nom du créateur
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Requis</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Créateur ou Nom de la chaîne</label>
              <input
                type="text"
                required
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Ex: Inoxtag, MrBeast, Squeezie..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Titre exact ou sujet de la vidéo</label>
              <input
                type="text"
                required
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Ex: Kaizen : 1 an pour gravir l'Everest"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Question 2: Views Count */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 flex items-center justify-center text-xs font-mono font-bold">
                2
              </span>
              Nombre de vues actuel de la vidéo
            </label>
            <span className="text-[11px] text-emerald-400/80 font-mono">Calcul Jackpot RPM</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Eye className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={currentViews}
              onChange={(e) => setCurrentViews(e.target.value)}
              placeholder="Ex: 38 000 000 ou 4.5M ou 850 000"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Question 3: Subs & Creation Date */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/50 flex items-center justify-center text-xs font-mono font-bold">
                3
              </span>
              Nombre d'abonnés & Date de création de la chaîne
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Contexte Chaîne</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <label className="text-xs text-slate-400 mb-1 block">Nombre d'abonnés</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Users className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={subscriberCount}
                  onChange={(e) => setSubscriberCount(e.target.value)}
                  placeholder="Ex: 8.9M ou 1.2M ou 450k"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date de création de la chaîne</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={channelCreationDate}
                  onChange={(e) => setChannelCreationDate(e.target.value)}
                  placeholder="Ex: Février 2015 ou 2012"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question 4: Niche / Theme */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 border border-purple-500/50 flex items-center justify-center text-xs font-mono font-bold">
                4
              </span>
              Thématique / Niche de la vidéo
            </label>
            <span className="text-[11px] text-purple-400 font-mono">Calibre le RPM</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            >
              {niches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <div className="text-xs text-slate-400 flex items-center bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
              <Layers className="w-4 h-4 mr-2 text-purple-400 shrink-0" />
              <span>
                {niche.includes('Finance')
                  ? 'RPM élevé : 5.50€ - 11.00€ pour 1k vues'
                  : niche.includes('Tech')
                  ? 'RPM bon : 3.50€ - 7.50€ pour 1k vues'
                  : niche.includes('Gaming')
                  ? 'RPM volume : 1.00€ - 2.20€ pour 1k vues'
                  : 'RPM standard : 1.50€ - 3.20€ pour 1k vues'}
              </span>
            </div>
          </div>
        </div>

        {/* Advanced Options Accordion */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            {showAdvanced ? 'Masquer les options de ton de l\'avatar' : 'Personnaliser le ton de l\'avatar & instructions'}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">
                  Personnalité / Ton de l'avatar showrunner :
                </label>
                <select
                  value={avatarTone}
                  onChange={(e) => setAvatarTone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  {tones.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">
                  Consigne particulière pour ce script (optionnel) :
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Ex: Insister sur la miniature 3D, faire une blague sur le sponsor..."
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl font-heading font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 transition-all shadow-xl shadow-red-900/30 flex items-center justify-center gap-2.5 text-base sm:text-lg disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Le Showrunner calcule le jackpot et écrit le script...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>Générer le Script Short Viral & le Plan de Montage</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
