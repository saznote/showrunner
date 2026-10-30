import React, { useState, useEffect } from 'react';
import { ScriptData, AvatarEmotion } from '../types';
import { AvatarVisualizer } from './AvatarVisualizer';
import { MontagePlanTable } from './MontagePlanTable';
import { FinancialDissector } from './FinancialDissector';
import { TeleprompterModal } from './TeleprompterModal';
import {
  FileText,
  Film,
  DollarSign,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Download,
  Maximize2,
  Volume2,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Flame,
  Clock,
  VolumeX,
  Mic,
  Sliders,
} from 'lucide-react';
import { playKaching, playWhoosh, playPop, playTension } from '../utils/audio';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { AudioPlayerStudio } from './AudioPlayerStudio';
import { speakHumanText, stopHumanSpeech, ELEVENLABS_PRESETS } from '../utils/voiceManager';
import { VrmAvatarManagerModal } from './VrmAvatarManagerModal';
import { SettingsStudio } from './SettingsStudio';
import { Box, Settings, Upload } from 'lucide-react';

interface ScriptStudioProps {
  scriptData: ScriptData;
  onUpdateSection?: (sectionKey: 'hook' | 'context' | 'jackpot' | 'secret' | 'outro', dialogue: string) => void;
  onOpenSettings?: () => void;
  vrmFile?: File | null;
  onVrmFileChange?: (file: File | null) => void;
  is3dMode?: boolean;
  onToggle3d?: (active: boolean) => void;
  selectedVoiceId?: string;
  onSelectVoice?: (voiceId: string, voiceURI?: string) => void;
  speechRate?: number;
  onRateChange?: (rate: number) => void;
  elevenLabsApiKey?: string;
  onApiKeyChange?: (key: string) => void;
  geminiApiKey?: string;
  onGeminiKeyChange?: (key: string) => void;
  groqApiKey?: string;
  onGroqKeyChange?: (key: string) => void;
}

export const ScriptStudio: React.FC<ScriptStudioProps> = ({
  scriptData,
  onUpdateSection,
  onOpenSettings,
  vrmFile: propVrmFile,
  onVrmFileChange: propOnVrmFileChange,
  is3dMode: propIs3dMode,
  onToggle3d: propOnToggle3d,
  selectedVoiceId: propSelectedVoiceId,
  onSelectVoice: propOnSelectVoice,
  speechRate: propSpeechRate,
  onRateChange: propOnRateChange,
  elevenLabsApiKey: propElevenLabsApiKey,
  onApiKeyChange: propOnApiKeyChange,
  geminiApiKey: propGeminiApiKey,
  onGeminiKeyChange: propOnGeminiKeyChange,
  groqApiKey: propGroqApiKey,
  onGroqKeyChange: propOnGroqKeyChange,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'montage' | 'financial' | 'secrets'>('script');
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Avatar speech & preview player state
  const [isPlayingScript, setIsPlayingScript] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [overlayText, setOverlayText] = useState<string>('');
  const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>('smirk');
  const [activeSectionTitle, setActiveSectionTitle] = useState<string>('LE HOOK [0-3s]');

  const sectionsList = [
    { key: 'hook', data: scriptData.sections.hook },
    { key: 'context', data: scriptData.sections.context },
    { key: 'jackpot', data: scriptData.sections.jackpot },
    { key: 'secret', data: scriptData.sections.secret },
    { key: 'outro', data: scriptData.sections.outro },
  ];

  // Initialize display when scriptData changes
  useEffect(() => {
    if (sectionsList[0]?.data) {
      setCurrentCaption(sectionsList[0].data.dialogue);
      setOverlayText(sectionsList[0].data.overlayText);
      setCurrentEmotion(sectionsList[0].data.emotion);
      setActiveSectionTitle(`${sectionsList[0].data.title} [${sectionsList[0].data.timing}]`);
    }
  }, [scriptData]);

  // Unified Settings Hub State
  const [isInternalSettingsOpen, setIsInternalSettingsOpen] = useState(false);
  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      setIsInternalSettingsOpen(true);
    }
  };

  // Human voice configuration state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [localVoiceId, setLocalVoiceId] = useState(() => {
    try {
      return localStorage.getItem('showrunner_voice_id') || 'neural_fr_punchy';
    } catch (e) {
      return 'neural_fr_punchy';
    }
  });
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [localSpeechRate, setLocalSpeechRate] = useState(() => {
    try {
      const saved = localStorage.getItem('showrunner_speech_rate');
      return saved ? parseFloat(saved) : 1.12;
    } catch (e) {
      return 1.12;
    }
  });
  const [localElevenLabsApiKey, setLocalElevenLabsApiKey] = useState(() => {
    try {
      return localStorage.getItem('elevenlabs_api_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [localGeminiApiKey, setLocalGeminiApiKey] = useState(() => {
    try {
      return localStorage.getItem('gemini_user_api_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [localGroqApiKey, setLocalGroqApiKey] = useState(() => {
    try {
      return localStorage.getItem('groq_api_key') || '';
    } catch (e) {
      return '';
    }
  });

  const selectedVoiceId = propSelectedVoiceId || localVoiceId;
  const speechRate = propSpeechRate !== undefined ? propSpeechRate : localSpeechRate;
  const elevenLabsApiKey = propElevenLabsApiKey !== undefined ? propElevenLabsApiKey : localElevenLabsApiKey;
  const geminiApiKey = propGeminiApiKey !== undefined ? propGeminiApiKey : localGeminiApiKey;
  const groqApiKey = propGroqApiKey !== undefined ? propGroqApiKey : localGroqApiKey;

  const handleApiKeyChange = (key: string) => {
    if (propOnApiKeyChange) propOnApiKeyChange(key);
    setLocalElevenLabsApiKey(key);
    try {
      localStorage.setItem('elevenlabs_api_key', key);
    } catch (e) {}
  };

  const handleSelectVoice = (voiceId: string, voiceURI?: string) => {
    if (propOnSelectVoice) propOnSelectVoice(voiceId, voiceURI);
    setLocalVoiceId(voiceId);
    if (voiceURI) setSelectedVoiceURI(voiceURI);
    try {
      localStorage.setItem('showrunner_voice_id', voiceId);
    } catch (e) {}
  };

  const handleRateChange = (rate: number) => {
    if (propOnRateChange) propOnRateChange(rate);
    setLocalSpeechRate(rate);
    try {
      localStorage.setItem('showrunner_speech_rate', String(rate));
    } catch (e) {}
  };

  // 3D VRM Avatar Management & Lipsync State
  const [isVrmModalOpen, setIsVrmModalOpen] = useState(false);
  const [localVrmFile, setLocalVrmFile] = useState<File | null>(null);
  const [localIs3dMode, setLocalIs3dMode] = useState(() => {
    try {
      return localStorage.getItem('showrunner_3d_mode') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [vrmInfo, setVrmInfo] = useState<{ title?: string; author?: string; version?: string } | null>(null);

  const vrmFile = propVrmFile !== undefined ? propVrmFile : localVrmFile;
  const is3dMode = propIs3dMode !== undefined ? propIs3dMode : localIs3dMode;

  const handleVrmFileChange = (file: File | null) => {
    if (propOnVrmFileChange) propOnVrmFileChange(file);
    setLocalVrmFile(file);
  };

  const handleToggle3d = (active: boolean) => {
    if (propOnToggle3d) propOnToggle3d(active);
    setLocalIs3dMode(active);
    try {
      localStorage.setItem('showrunner_3d_mode', String(active));
    } catch (e) {}
  };

  // High-Definition Human Voice & Audio Playback
  useEffect(() => {
    if (!isPlayingScript) {
      stopHumanSpeech();
      return;
    }

    const currentSection = sectionsList[activeSectionIndex]?.data;
    if (!currentSection) {
      setIsPlayingScript(false);
      return;
    }

    setCurrentCaption(currentSection.dialogue);
    setOverlayText(currentSection.overlayText);
    setCurrentEmotion(currentSection.emotion);
    setActiveSectionTitle(`${currentSection.title} [${currentSection.timing}]`);

    // Trigger procedural SFX for current section
    if (currentSection.sfx.toLowerCase().includes('kaching') || currentSection.sfx.toLowerCase().includes('pièce')) {
      playKaching();
    } else if (currentSection.sfx.toLowerCase().includes('whoosh')) {
      playWhoosh();
    } else if (currentSection.sfx.toLowerCase().includes('pop')) {
      playPop();
    } else {
      playTension();
    }

    let isCancelled = false;
    let activeAudio: HTMLAudioElement | null = null;

    const onSectionFinish = () => {
      if (isCancelled) return;
      if (activeSectionIndex < sectionsList.length - 1) {
        setTimeout(() => {
          setActiveSectionIndex((prev) => prev + 1);
        }, 320);
      } else {
        setIsPlayingScript(false);
        setActiveSectionIndex(0);
      }
    };

    // ElevenLabs AI Studio Synthesis (if selected with custom key)
    if (selectedVoiceId.startsWith('eleven_') && elevenLabsApiKey) {
      const preset = ELEVENLABS_PRESETS.find((p) => p.id === selectedVoiceId);
      const voiceId = preset?.voiceId || 'pNInz6obpgDQGcFmaJgB';

      fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentSection.dialogue,
          voiceId,
          apiKey: elevenLabsApiKey,
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (isCancelled) return;
          if (json.success && json.audioBase64) {
            activeAudio = new Audio(`data:${json.mimeType || 'audio/mpeg'};base64,${json.audioBase64}`);
            activeAudio.playbackRate = speechRate;
            activeAudio.onended = onSectionFinish;
            activeAudio.onerror = () => {
              // Fallback to neural natural human browser voice
              speakHumanText(currentSection.dialogue, {
                voiceURI: selectedVoiceURI,
                rate: speechRate,
                onEnd: onSectionFinish,
                onError: onSectionFinish,
              });
            };
            activeAudio.play();
          } else {
            speakHumanText(currentSection.dialogue, {
              voiceURI: selectedVoiceURI,
              rate: speechRate,
              onEnd: onSectionFinish,
              onError: onSectionFinish,
            });
          }
        })
        .catch(() => {
          if (isCancelled) return;
          speakHumanText(currentSection.dialogue, {
            voiceURI: selectedVoiceURI,
            rate: speechRate,
            onEnd: onSectionFinish,
            onError: onSectionFinish,
          });
        });
    } else {
      // High-Definition Neural Human Voice (100% Free, Natural Prosody)
      speakHumanText(currentSection.dialogue, {
        voiceURI: selectedVoiceURI,
        rate: speechRate,
        onEnd: onSectionFinish,
        onError: onSectionFinish,
      });
    }

    return () => {
      isCancelled = true;
      stopHumanSpeech();
      if (activeAudio) {
        activeAudio.pause();
        activeAudio = null;
      }
    };
  }, [isPlayingScript, activeSectionIndex, selectedVoiceId, selectedVoiceURI, speechRate, elevenLabsApiKey]);

  const handleTogglePlay = () => {
    if (isPlayingScript) {
      setIsPlayingScript(false);
    } else {
      setActiveSectionIndex(0);
      setIsPlayingScript(true);
    }
  };

  const handleSelectSection = (index: number) => {
    setActiveSectionIndex(index);
    const sec = sectionsList[index].data;
    setCurrentCaption(sec.dialogue);
    setOverlayText(sec.overlayText);
    setCurrentEmotion(sec.emotion);
    setActiveSectionTitle(`${sec.title} [${sec.timing}]`);

    if (sec.sfx.toLowerCase().includes('kaching')) playKaching();
    else if (sec.sfx.toLowerCase().includes('whoosh')) playWhoosh();
    else if (sec.sfx.toLowerCase().includes('pop')) playPop();
    else playTension();
  };

  const handleCopy = (type: 'visuals' | 'clean' | 'srt') => {
    let content = '';
    if (type === 'visuals') {
      content = scriptData.fullScriptWithVisuals;
    } else if (type === 'clean') {
      content = scriptData.cleanSpeech;
    } else if (type === 'srt') {
      content = generateSrt(scriptData);
    }

    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const generateSrt = (data: ScriptData): string => {
    return `1\n00:00:00,000 --> 00:00:03,000\n${data.sections.hook.dialogue}\n\n2\n00:00:03,000 --> 00:00:15,000\n${data.sections.context.dialogue}\n\n3\n00:00:15,000 --> 00:00:30,000\n${data.sections.jackpot.dialogue}\n\n4\n00:00:30,000 --> 00:00:45,000\n${data.sections.secret.dialogue}\n\n5\n00:00:45,000 --> 00:00:55,000\n${data.sections.outro.dialogue}\n`;
  };

  const downloadSrtFile = () => {
    const srtText = generateSrt(scriptData);
    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Short_${scriptData.creatorName.replace(/\s+/g, '_')}_Subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Word count compliance check (120 - 140 words)
  const isWordCountOptimal = scriptData.wordCount >= 115 && scriptData.wordCount <= 145;

  return (
    <div className="space-y-6">
      {/* Top Video Identity & Metrics Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                {scriptData.niche}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {scriptData.channelCreationDate} • {scriptData.subscriberCount} abonnés
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
              "{scriptData.videoTitle}"
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Par <span className="font-bold text-white">{scriptData.creatorName}</span> •{' '}
              <span className="text-emerald-400 font-mono font-bold">
                {scriptData.viewsFormatted} vues
              </span>
            </p>
          </div>

          {/* Timing & Word Counter Gauges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Words Badge */}
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                isWordCountOptimal
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400">
                  Volume Mots
                </span>
                <span className="text-lg font-bold font-mono">
                  {scriptData.wordCount}{' '}
                  <span className="text-xs font-normal">/ 120-140 max</span>
                </span>
              </div>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isWordCountOptimal ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </div>

            {/* Duration Badge */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-white">
              <Clock className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400">
                  Durée Estimée
                </span>
                <span className="text-lg font-bold font-mono text-indigo-300">
                  ~{scriptData.estimatedDurationSeconds}s{' '}
                  <span className="text-xs font-normal text-slate-400">(45-60s)</span>
                </span>
              </div>
            </div>

            {/* Jackpot Pill */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 flex items-center gap-2 font-mono">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] uppercase tracking-wider block text-slate-400">
                  AdSense Estimé
                </span>
                <span className="text-lg font-bold">
                  +{new Intl.NumberFormat('fr-FR').format(scriptData.earnings.adsenseAvg)} €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 mt-4 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isPlayingScript
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/30'
              }`}
            >
              {isPlayingScript ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Avatar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Écouter l'Avatar Vocaliser (Short)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsTeleprompterOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Prompteur Plein Écran</span>
            </button>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-amber-500/40 transition-colors cursor-pointer"
              title="Changer la voix humaine de l'avatar"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Voix : {selectedVoiceId.startsWith('eleven_') ? 'ElevenLabs' : 'Humaine HD'}
              </span>
            </button>

            <button
              onClick={handleOpenSettings}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 hover:border-amber-500/50 shadow-md transition-all cursor-pointer"
              title="Centre de réglages complet : Avatar 3D, Voix, Clés API gratuites"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Paramètres Studio</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCopy('visuals')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Copier avec [VISUEL]"
            >
              {copiedType === 'visuals' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copier Script + [VISUEL]</span>
            </button>

            <button
              onClick={() => handleCopy('clean')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Copier dialogue seul"
            >
              {copiedType === 'clean' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Dialogue Seul</span>
            </button>

            <button
              onClick={downloadSrtFile}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Télécharger fichier .SRT pour CapCut / Premiere"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export .SRT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audio Player Studio with Voice API & Natural Voices */}
      <AudioPlayerStudio
        scriptData={scriptData}
        activeSectionIndex={activeSectionIndex}
        onSectionChange={handleSelectSection}
        isSpeaking={isPlayingScript}
        onSpeakingChange={setIsPlayingScript}
        selectedVoiceId={selectedVoiceId}
        onVoiceChange={(vId, vURI) => {
          handleSelectVoice(vId, vURI);
        }}
        speechRate={speechRate}
        onRateChange={handleRateChange}
        elevenLabsApiKey={elevenLabsApiKey}
        onOpenSettings={() => setIsVoiceModalOpen(true)}
      />

      {/* Main Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('script')}
          className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'script'
              ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Script Complet & Visuels</span>
        </button>

        <button
          onClick={() => setActiveTab('montage')}
          className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'montage'
              ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>2. Plan de Montage (5 Plans)</span>
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'financial'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>3. Jackpot & Disséqueur RPM</span>
        </button>

        <button
          onClick={() => setActiveTab('secrets')}
          className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'secrets'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>4. Secret du Buzz & Virality</span>
        </button>
      </div>

      {/* Studio Workspace Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Tab Content (7 cols on xl) */}
        <div className="xl:col-span-7 space-y-4">
          {activeTab === 'script' && (
            <div className="space-y-4">
              {sectionsList.map((sec, idx) => {
                const isCurrentActive = activeSectionIndex === idx;
                return (
                  <div
                    key={sec.key}
                    onClick={() => handleSelectSection(idx)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrentActive
                        ? 'bg-slate-900 border-red-500 shadow-xl shadow-red-950/30 ring-1 ring-red-500'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Section Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white uppercase tracking-wider">
                          [{sec.data.timing}] {sec.data.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                          SFX: {sec.data.sfx}
                        </span>
                        {isCurrentActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse">
                            EN COURS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visual Indication Badge */}
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs font-mono text-purple-300 mb-3 flex items-start gap-2">
                      <span className="font-bold text-purple-400 shrink-0">🎬 [VISUEL] :</span>
                      <span>{sec.data.visual}</span>
                    </div>

                    {/* Dialogue Line */}
                    <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                      "{sec.data.dialogue}"
                    </p>

                    {/* Bottom Screen Overlay preview */}
                    {sec.data.overlayText && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Titrage Vidéo :</span>
                        <span className="font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                          {sec.data.overlayText}
                        </span>
                      </div>
                    )}

                    {sec.key === 'jackpot' && (
                      <div className="mt-3 flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs">
                        <span className="text-emerald-300 font-mono text-[11px] flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          Graphique comparatif AdSense vs Total Recharts
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('financial');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Voir Graphique 📊</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'montage' && <MontagePlanTable scriptData={scriptData} />}

          {activeTab === 'financial' && <FinancialDissector scriptData={scriptData} />}

          {activeTab === 'secrets' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 border border-purple-500/30">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold block mb-1">
                  Décryptage du Showrunner
                </span>
                <h3 className="text-xl font-bold text-white font-heading">
                  {scriptData.secretBuzzTitle || 'Le Secret Algorithmique du Buzz'}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {scriptData.secretBuzzExplanation ||
                    scriptData.viralitySecrets[0] ||
                    'La vidéo exploite un pic de rétention maximal dès le début avec une promesse forte non démentie.'}
                </p>
              </div>

              {/* Virality Bullet Hacks */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="font-heading font-bold text-white text-base flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  3 Leviers Psychologiques Utilisés pour Ce Script :
                </h4>

                <div className="space-y-2.5">
                  {scriptData.viralitySecrets.map((secret, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                        {sIdx + 1}
                      </span>
                      <p className="leading-relaxed">{secret}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to action analysis */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-heading font-bold text-white text-sm flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Psychologie de l'Outro (Pourquoi ça force les commentaires) :
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  L'avatar ne demande pas simplement de "liker" la vidéo (action passive ignorée par 98% des spectateurs). Il pose une question d'identification personnelle directe liée à l'argent : <span className="text-yellow-400 font-semibold">"{scriptData.sections.outro.dialogue}"</span>. L'ego et l'imaginaire financier poussent l'utilisateur à taper sa réponse immédiatement.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Avatar Preview Mockup (5 cols on xl) */}
        <div className="xl:col-span-5 sticky top-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs gap-2">
              <span className="font-heading font-bold text-white flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Simulateur Avatar (9:16)
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {/* VRM Avatar Selector Button - opens Settings Avatar Tab */}
                <button
                  onClick={handleOpenSettings}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/40 hover:bg-purple-500/25 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Gérer l'avatar 3D (.VRM) ou charger depuis votre PC"
                >
                  <Box className="w-3 h-3 text-purple-400" />
                  <span>
                    {vrmFile
                      ? `VRM: ${vrmInfo?.title || 'Personnalisé'}`
                      : is3dMode
                      ? '3D Cyber'
                      : 'Avatar 3D (.vrm)'}
                  </span>
                </button>

                {/* Voice Selector Button */}
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Changer de voix humaine"
                >
                  <Mic className="w-3 h-3 text-amber-400" />
                  <span>{selectedVoiceId.startsWith('eleven_') ? 'ElevenLabs' : 'Voix Humaine'}</span>
                </button>

                {/* Unified Settings Button */}
                <button
                  onClick={handleOpenSettings}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-500/50 hover:text-white transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Ouvrir tous les réglages (Avatar 3D, Voix, Clés API)"
                >
                  <Settings className="w-3 h-3 text-amber-400" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* The Vertical 9:16 Player Component */}
            <AvatarVisualizer
              emotion={currentEmotion}
              isSpeaking={isPlayingScript}
              currentCaption={currentCaption}
              overlayText={overlayText}
              activeSectionTitle={activeSectionTitle}
              is3dMode={is3dMode}
              vrmFile={vrmFile}
              onToggle3d={handleToggle3d}
              onOpenUploadModal={() => setIsVrmModalOpen(true)}
              onVrmLoaded={setVrmInfo}
            />

            {/* Player Quick Controls */}
            <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                {sectionsList.map((s, idx) => (
                  <button
                    key={s.key}
                    onClick={() => handleSelectSection(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      activeSectionIndex === idx
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={s.data.title}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={handleTogglePlay}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPlayingScript
                    ? 'bg-amber-500 text-black'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isPlayingScript ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingScript ? 'Pause' : 'Lecture'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Teleprompter Modal */}
      <TeleprompterModal
        scriptData={scriptData}
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
      />

      {/* Human AI Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        selectedVoiceId={selectedVoiceId}
        onSelectVoice={(voiceId, voiceURI) => {
          handleSelectVoice(voiceId, voiceURI);
        }}
        speechRate={speechRate}
        onRateChange={handleRateChange}
        elevenLabsApiKey={elevenLabsApiKey}
        onApiKeyChange={handleApiKeyChange}
      />

      {/* 3D VRM Avatar Manager Modal */}
      <VrmAvatarManagerModal
        isOpen={isVrmModalOpen}
        onClose={() => setIsVrmModalOpen(false)}
        onFileSelected={(file) => {
          handleVrmFileChange(file);
          handleToggle3d(true);
        }}
        currentVrmInfo={vrmInfo}
        onResetToDefault={() => {
          handleVrmFileChange(null);
          setVrmInfo(null);
        }}
        is3dActive={is3dMode}
        onToggle3d={handleToggle3d}
      />

      {/* Comprehensive Unified Settings Hub Modal */}
      <SettingsStudio
        isOpen={isInternalSettingsOpen}
        onClose={() => setIsInternalSettingsOpen(false)}
        vrmFile={vrmFile}
        onVrmFileChange={handleVrmFileChange}
        is3dActive={is3dMode}
        onToggle3d={handleToggle3d}
        selectedVoiceId={selectedVoiceId}
        onSelectVoice={handleSelectVoice}
        speechRate={speechRate}
        onRateChange={handleRateChange}
        geminiApiKey={geminiApiKey}
        onGeminiKeyChange={(key) => {
          if (propOnGeminiKeyChange) propOnGeminiKeyChange(key);
          setLocalGeminiApiKey(key);
        }}
        elevenLabsApiKey={elevenLabsApiKey}
        onElevenLabsKeyChange={handleApiKeyChange}
        groqApiKey={groqApiKey}
        onGroqKeyChange={(key) => {
          if (propOnGroqKeyChange) propOnGroqKeyChange(key);
          setLocalGroqApiKey(key);
        }}
      />
    </div>
  );
};
