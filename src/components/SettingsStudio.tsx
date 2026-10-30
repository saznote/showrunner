import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Settings,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileBox,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Volume2,
  Play,
  Square,
  Sliders,
  Check,
  Eye,
  EyeOff,
  Save,
  Cpu,
  Layers,
  Loader2,
  Mic,
  Zap,
  Info,
  ChevronRight,
} from 'lucide-react';
import {
  getAvailableHumanVoices,
  speakHumanText,
  stopHumanSpeech,
  ELEVENLABS_PRESETS,
  VoiceOption,
} from '../utils/voiceManager';
import { playKaching, playPop } from '../utils/audio';
import {
  saveVrmFileToStorage,
  getStoredVrmFile,
  removeStoredVrmFile,
} from '../utils/avatarStorage';

export interface SettingsStudioProps {
  isOpen: boolean;
  onClose: () => void;
  // Avatar state
  vrmFile: File | null;
  onVrmFileChange: (file: File | null) => void;
  is3dActive: boolean;
  onToggle3d: (active: boolean) => void;
  // Voice state
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string, voiceURI?: string) => void;
  speechRate: number;
  onRateChange: (rate: number) => void;
  // API Keys state
  geminiApiKey: string;
  onGeminiKeyChange: (key: string) => void;
  elevenLabsApiKey: string;
  onElevenLabsKeyChange: (key: string) => void;
  groqApiKey: string;
  onGroqKeyChange: (key: string) => void;
  // Optional toast callback
  onSaveNotification?: (msg: string) => void;
}

export const SettingsStudio: React.FC<SettingsStudioProps> = ({
  isOpen,
  onClose,
  vrmFile,
  onVrmFileChange,
  is3dActive,
  onToggle3d,
  selectedVoiceId,
  onSelectVoice,
  speechRate,
  onRateChange,
  geminiApiKey,
  onGeminiKeyChange,
  elevenLabsApiKey,
  onElevenLabsKeyChange,
  groqApiKey,
  onGroqKeyChange,
  onSaveNotification,
}) => {
  // Navigation tabs inside Settings
  const [activeTab, setActiveTab] = useState<'avatar' | 'voice' | 'ai_keys'>('avatar');

  // Avatar state
  const [avatarFileName, setAvatarFileName] = useState<string>(vrmFile ? vrmFile.name : '');
  const [avatarFileSize, setAvatarFileSize] = useState<number>(vrmFile ? vrmFile.size : 0);
  const [isDragging, setIsDragging] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice state
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isVoiceTesting, setIsVoiceTesting] = useState(false);
  const [voiceTestText, setVoiceTestText] = useState(
    "Salut les créateurs ! Bienvenue dans Showrunner Studio. Aujourd'hui, on dissèque un braquage algorithmique à plus de 300 000 euros !"
  );

  // Local API Key states for uncommitted editing
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiApiKey);
  const [localElevenLabsKey, setLocalElevenLabsKey] = useState(elevenLabsApiKey);
  const [localGroqKey, setLocalGroqKey] = useState(groqApiKey);

  // Key visibility toggles
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);

  // Key testing states
  const [testingGemini, setTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [testingElevenLabs, setTestingElevenLabs] = useState(false);
  const [elevenLabsTestResult, setElevenLabsTestResult] = useState<{
    success: boolean;
    message: string;
    remaining?: number;
    latencyMs?: number;
  } | null>(null);

  const [testingGroq, setTestingGroq] = useState(false);
  const [groqTestResult, setGroqTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  // Global save indicator
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Initialize and sync
  useEffect(() => {
    setLocalGeminiKey(geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    setLocalElevenLabsKey(elevenLabsApiKey);
  }, [elevenLabsApiKey]);

  useEffect(() => {
    setLocalGroqKey(groqApiKey);
  }, [groqApiKey]);

  useEffect(() => {
    if (vrmFile) {
      setAvatarFileName(vrmFile.name);
      setAvatarFileSize(vrmFile.size);
    }
  }, [vrmFile]);

  useEffect(() => {
    getAvailableHumanVoices().then((voices) => {
      setBrowserVoices(voices);
      if (voices.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(voices[0].voiceURI);
      }
    });
  }, []);

  if (!isOpen) return null;

  // ----------------------------------------------------
  // AVATAR HANDLING WITH NATIVE EXPLORER & INDEXEDDB
  // ----------------------------------------------------
  const handleFilePicked = async (file: File) => {
    setAvatarError(null);
    setAvatarSuccess(null);

    if (!file.name.toLowerCase().endsWith('.vrm')) {
      setAvatarError("Format invalide. Seuls les fichiers avec l'extension .vrm (modèles 3D humanoïdes) sont acceptés.");
      return;
    }

    try {
      setAvatarFileName(file.name);
      setAvatarFileSize(file.size);
      onVrmFileChange(file);
      onToggle3d(true);
      await saveVrmFileToStorage(file);
      setAvatarSuccess(`Avatar "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} Mo) chargé et sauvegardé avec succès !`);
      playKaching();
    } catch (err: any) {
      setAvatarError(`Erreur lors du chargement : ${err.message || 'Fichier inaccessible'}`);
    }
  };

  const handleNativeBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input to allow selecting same file again
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilePicked(e.dataTransfer.files[0]);
    }
  };

  const handleResetAvatar = async () => {
    onVrmFileChange(null);
    setAvatarFileName('');
    setAvatarFileSize(0);
    setAvatarSuccess(null);
    await removeStoredVrmFile();
    setAvatarSuccess('Avatar réinitialisé au modèle par défaut.');
    playPop();
  };

  // ----------------------------------------------------
  // VOICE TESTING HANDLER
  // ----------------------------------------------------
  const handleTestVoiceAudio = async () => {
    stopHumanSpeech();

    if (isVoiceTesting) {
      setIsVoiceTesting(false);
      return;
    }

    setIsVoiceTesting(true);
    playPop();

    // If using ElevenLabs with API key
    if (selectedVoiceId.startsWith('eleven_') && (localElevenLabsKey || elevenLabsApiKey)) {
      const preset = ELEVENLABS_PRESETS.find((p) => p.id === selectedVoiceId);
      const effectiveKey = localElevenLabsKey || elevenLabsApiKey;
      if (preset && preset.voiceId && effectiveKey) {
        try {
          const res = await fetch('/api/tts/elevenlabs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: voiceTestText,
              voiceId: preset.voiceId,
              apiKey: effectiveKey,
            }),
          });
          const json = await res.json();
          if (json.success && json.audioBase64) {
            const audio = new Audio(`data:${json.mimeType || 'audio/mpeg'};base64,${json.audioBase64}`);
            audio.onended = () => setIsVoiceTesting(false);
            audio.onerror = () => setIsVoiceTesting(false);
            audio.play();
            return;
          }
        } catch (e) {
          // fallback to web speech below
        }
      }
    }

    // Default to ultra-realistic browser human voice
    speakHumanText(voiceTestText, {
      voiceURI: selectedVoiceURI,
      rate: speechRate,
      onEnd: () => setIsVoiceTesting(false),
      onError: () => setIsVoiceTesting(false),
    });
  };

  // ----------------------------------------------------
  // API KEY TESTING HANDLERS
  // ----------------------------------------------------
  const handleTestGeminiKey = async () => {
    setTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await fetch('/api/settings/test-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: localGeminiKey }),
      });
      const data = await res.json();
      setGeminiTestResult({
        success: data.success,
        message: data.success
          ? `${data.message} (Latence: ${data.latencyMs}ms)`
          : data.error || 'Clé invalide ou refusée.',
        latencyMs: data.latencyMs,
      });
      if (data.success) playKaching();
    } catch (err: any) {
      setGeminiTestResult({
        success: false,
        message: `Erreur de connexion : ${err.message || 'Serveur indisponible'}`,
      });
    } finally {
      setTestingGemini(false);
    }
  };

  const handleTestElevenLabsKey = async () => {
    setTestingElevenLabs(true);
    setElevenLabsTestResult(null);
    try {
      const res = await fetch('/api/settings/test-elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: localElevenLabsKey }),
      });
      const data = await res.json();
      setElevenLabsTestResult({
        success: data.success,
        message: data.success ? data.message : data.error || 'Clé invalide.',
        remaining: data.remainingCharacters,
        latencyMs: data.latencyMs,
      });
      if (data.success) playKaching();
    } catch (err: any) {
      setElevenLabsTestResult({
        success: false,
        message: `Erreur : ${err.message || 'Serveur indisponible'}`,
      });
    } finally {
      setTestingElevenLabs(false);
    }
  };

  const handleTestGroqKey = async () => {
    setTestingGroq(true);
    setGroqTestResult(null);
    try {
      const res = await fetch('/api/settings/test-groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: localGroqKey }),
      });
      const data = await res.json();
      setGroqTestResult({
        success: data.success,
        message: data.success ? `${data.message} (${data.latencyMs}ms)` : data.error || 'Clé Groq invalide.',
        latencyMs: data.latencyMs,
      });
      if (data.success) playKaching();
    } catch (err: any) {
      setGroqTestResult({
        success: false,
        message: `Erreur : ${err.message || 'Serveur indisponible'}`,
      });
    } finally {
      setTestingGroq(false);
    }
  };

  // ----------------------------------------------------
  // GLOBAL SAVE HANDLER
  // ----------------------------------------------------
  const handleSaveAllSettings = () => {
    // 1. Save keys to state & localStorage
    onGeminiKeyChange(localGeminiKey);
    onElevenLabsKeyChange(localElevenLabsKey);
    onGroqKeyChange(localGroqKey);

    try {
      if (localGeminiKey) localStorage.setItem('gemini_user_api_key', localGeminiKey);
      else localStorage.removeItem('gemini_user_api_key');

      if (localElevenLabsKey) localStorage.setItem('elevenlabs_api_key', localElevenLabsKey);
      else localStorage.removeItem('elevenlabs_api_key');

      if (localGroqKey) localStorage.setItem('groq_api_key', localGroqKey);
      else localStorage.removeItem('groq_api_key');

      localStorage.setItem('showrunner_voice_id', selectedVoiceId);
      localStorage.setItem('showrunner_speech_rate', String(speechRate));
      localStorage.setItem('showrunner_3d_mode', String(is3dActive));
    } catch (e) {
      // ignore localStorage quota errors
    }

    playKaching();
    setSaveSuccessMessage('Tous les réglages ont été enregistrés avec succès !');

    if (onSaveNotification) {
      onSaveNotification('Paramètres, voix et avatar synchronisés.');
    }

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full h-[92vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-white text-lg tracking-tight">
                  Paramètres Showrunner Studio
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold">
                  CENTRE DE CONTRÔLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestion de l'Avatar 3D, Synthèse vocale & Clés API gratuites
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopHumanSpeech();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Save Toast Notification */}
        {saveSuccessMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300 font-semibold animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMessage(null)}
              className="text-emerald-400 hover:text-white uppercase font-mono text-[10px]"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('avatar')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'avatar'
                ? 'border-red-500 text-white font-bold bg-red-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileBox className="w-4 h-4 text-purple-400" />
            <span>1. Gestion de l'Avatar 3D (.VRM)</span>
            {vrmFile && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Avatar chargé" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'voice'
                ? 'border-red-500 text-white font-bold bg-red-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-400" />
            <span>2. Voix Humaines & Synthèse</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_keys')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ai_keys'
                ? 'border-red-500 text-white font-bold bg-red-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>3. IA Gratuites & Clés API</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Tests intégrés
            </span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: GESTION DE L'AVATAR (.VRM)                        */}
          {/* ======================================================== */}
          {activeTab === 'avatar' && (
            <div className="space-y-6">
              {/* Notification banners */}
              {avatarError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{avatarError}</span>
                  </div>
                  <button
                    onClick={() => setAvatarError(null)}
                    className="text-red-400 hover:text-white font-mono text-[10px] uppercase"
                  >
                    Fermer
                  </button>
                </div>
              )}

              {avatarSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{avatarSuccess}</span>
                  </div>
                  <button
                    onClick={() => setAvatarSuccess(null)}
                    className="text-emerald-400 hover:text-white font-mono text-[10px] uppercase"
                  >
                    Fermer
                  </button>
                </div>
              )}

              {/* Display mode toggle */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Moteur d'Avatar Actif</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        is3dActive
                          ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40'
                          : 'bg-red-900/40 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {is3dActive ? '3D VRM & Lipsync' : '2D Stylisé Studio'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Le mode 3D permet l'animation labiale synchronisée et les expressions faciales adaptées aux 5 sections du script.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggle3d(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      !is3dActive
                        ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-900/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    2D Stylisé
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle3d(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      is3dActive
                        ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-900/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    3D VRM Lipsync
                  </button>
                </div>
              </div>

              {/* Native PC File Selector Card (Foolproof, avoids drag & drop issues) */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-800/40 to-slate-900/80 border-2 border-purple-500/40 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-white">
                        Charger un Avatar 3D (.VRM) depuis votre Ordinateur
                      </h4>
                      <p className="text-xs text-slate-400">
                        Compatible avec tous les avatars VRM 0.0 et 1.0 (VRoid Studio, Booth, etc.)
                      </p>
                    </div>
                  </div>

                  {avatarFileName && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Actif
                    </span>
                  )}
                </div>

                {/* Hidden native input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".vrm,application/octet-stream"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilePicked(e.target.files[0]);
                    }
                  }}
                />

                {/* Primary Button to directly open file picker */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleNativeBrowseClick}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>📂 Parcourir les fichiers de mon PC (.vrm)</span>
                  </button>

                  {avatarFileName && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Réinitialiser</span>
                    </button>
                  )}
                </div>

                {/* Secondary Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleNativeBrowseClick}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-purple-400 bg-purple-950/40 text-purple-200'
                      : 'border-slate-700/80 hover:border-purple-500/60 bg-slate-950/40 text-slate-400'
                  }`}
                >
                  <p className="text-xs">
                    Ou glissez votre fichier <span className="text-white font-bold">.vrm</span> directement ici si supporté par votre explorateur
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Taille max recommandée : 50 Mo • Persistance automatique
                  </p>
                </div>

                {/* Current Avatar Details Card */}
                {avatarFileName ? (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-mono text-xs font-bold">
                        VRM
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-mono truncate max-w-xs sm:max-w-md">
                          {avatarFileName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Taille : {(avatarFileSize / (1024 * 1024)).toFixed(2)} Mo • Lipsync voyelles (A, I, U, E, O) actif
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold block">
                        Sauvegardé dans le navigateur
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      Aucun avatar personnalisé chargé pour l'instant. L'avatar cybernétique 3D procédural du studio est utilisé par défaut.
                    </span>
                  </div>
                )}
              </div>

              {/* Free Avatar Resources & Tips */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Où trouver ou créer des avatars .VRM gratuits ?
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <a
                    href="https://vroid.com/en/studio"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-white block group-hover:text-purple-300">VRoid Studio (100% Gratuit)</span>
                      <span className="text-[11px] text-slate-400">Créez votre avatar 3D sur mesure pour PC/Mac</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 ml-2" />
                  </a>

                  <a
                    href="https://hub.vroid.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-white block group-hover:text-purple-300">VRoid Hub (Bibliothèque CC0)</span>
                      <span className="text-[11px] text-slate-400">Milliers d'avatars prêts à l'emploi à télécharger</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: GESTION DES VOIX & SYNTHÈSE VOCALE               */}
          {/* ======================================================== */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Voice Engine Header */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Moteurs de Voix Disponibles</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Basculez entre les voix gratuites illimitées de votre navigateur et les voix cinéma IA ElevenLabs.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  <Check className="w-3.5 h-3.5" />
                  Audio HD Prêt
                </div>
              </div>

              {/* Free Human Natural Voices */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Voix Humaines Gratuites (Navigateur / Chrome / Edge)
                  </h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 font-bold">
                    100% Gratuit & Illimité
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Preset French Studio Voice */}
                  <div
                    onClick={() => onSelectVoice('neural_fr_punchy', selectedVoiceURI)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedVoiceId === 'neural_fr_punchy' || !selectedVoiceId.startsWith('eleven_')
                        ? 'bg-red-950/30 border-red-500 shadow-md shadow-red-900/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs">Français Shorts Punchy</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 font-bold">
                        Recommandé Shorts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Voix dynamique calibrée à 1.12x pour garder une rétention maximale sur les 3 premières secondes.
                    </p>
                  </div>

                  {/* Browser voices list if available */}
                  {browserVoices.slice(0, 3).map((v) => (
                    <div
                      key={v.voiceURI}
                      onClick={() => {
                        setSelectedVoiceURI(v.voiceURI);
                        onSelectVoice('browser_custom', v.voiceURI);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedVoiceURI === v.voiceURI && selectedVoiceId === 'browser_custom'
                          ? 'bg-red-950/30 border-red-500 shadow-md shadow-red-900/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-xs truncate max-w-[170px]">
                          {v.name.replace(/Google|Microsoft|Online/gi, '').trim() || v.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          {v.lang}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        Synthèse vocale native haute définition
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ElevenLabs AI Voices Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Voix Cinéma Ultra-Réalistes (ElevenLabs)
                  </h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 border border-amber-500/20 font-bold">
                    Nécessite Clé API (10k car. gratuits)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ELEVENLABS_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => onSelectVoice(preset.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedVoiceId === preset.id
                          ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-900/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{preset.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{preset.sampleDescription}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sliders: Speech Rate & Pacing */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-red-400" />
                    Rythme et Vitesse d'Élocution :
                  </span>
                  <span className="font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {speechRate.toFixed(2)}x {speechRate >= 1.1 ? '(Dynamique Shorts ⚡)' : '(Normal)'}
                  </span>
                </div>

                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.02"
                  value={speechRate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.80x (Posé / Analyse)</span>
                  <span className="text-red-400 font-bold">1.12x (Idéal YouTube Shorts)</span>
                  <span>1.40x (Ultra Rapide)</span>
                </div>
              </div>

              {/* Interactive Voice Test Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Tester la Voix en Direct :
                  </span>

                  {isVoiceTesting && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Lecture en cours...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={voiceTestText}
                    onChange={(e) => setVoiceTestText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    placeholder="Phrase de test..."
                  />

                  <button
                    type="button"
                    onClick={handleTestVoiceAudio}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isVoiceTesting
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                    }`}
                  >
                    {isVoiceTesting ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Arrêter</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Écouter le test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: IA GRATUITES & CLÉS API AVEC TESTS INTÉGRÉS      */}
          {/* ======================================================== */}
          {activeTab === 'ai_keys' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white">
                    Clés API optionnelles mais puissantes : utilisez les généreux tiers gratuits !
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Showrunner Studio fonctionne déjà en mode procédural complet sans clé. En renseignant vos clés gratuites ci-dessous, vous débloquez l'IA de pointe Google Gemini, la vitesse fulgurante de Groq et le réalisme vocal d'ElevenLabs.
                  </p>
                </div>
              </div>

              {/* 1. GOOGLE GEMINI API */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-white">
                          Google Gemini API (AI Studio)
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/30 font-bold">
                          ⭐ Gratuit & Généreux
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Pour des scripts ultra-viraux avec modèle Gemini 2.5/3.8 Flash
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-700/40 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <span>Obtenir la clé gratuite</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Input & Test Button */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <div className="relative flex-1 w-full">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={localGeminiKey}
                      onChange={(e) => setLocalGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      title={showGeminiKey ? 'Masquer' : 'Afficher'}
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestGeminiKey}
                    disabled={testingGemini}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-blue-950/40"
                  >
                    {testingGemini ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Test en cours...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Tester la clé Gemini</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Result Message */}
                {geminiTestResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      geminiTestResult.success
                        ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                        : 'bg-red-950/80 border border-red-500/50 text-red-200'
                    }`}
                  >
                    {geminiTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span className="flex-1">{geminiTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* 2. ELEVENLABS API */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs">
                      11
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-white">
                          ElevenLabs API (Synthèse Vocale)
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-500/30 font-bold">
                          10 000 car. gratuits/mois
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Pour des voix ultra-réalistes (Adam, Antoni, Rachel) avec émotions
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://elevenlabs.io/app/speech-synthesis"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-700/40 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <span>Lien clé ElevenLabs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Input & Test Button */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <div className="relative flex-1 w-full">
                    <input
                      type={showElevenLabsKey ? 'text' : 'password'}
                      value={localElevenLabsKey}
                      onChange={(e) => setLocalElevenLabsKey(e.target.value)}
                      placeholder="sk_..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      title={showElevenLabsKey ? 'Masquer' : 'Afficher'}
                    >
                      {showElevenLabsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestElevenLabsKey}
                    disabled={testingElevenLabs}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-amber-950/40"
                  >
                    {testingElevenLabs ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Test en cours...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Tester ElevenLabs</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Result Message */}
                {elevenLabsTestResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      elevenLabsTestResult.success
                        ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                        : 'bg-red-950/80 border border-red-500/50 text-red-200'
                    }`}
                  >
                    {elevenLabsTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span className="flex-1">{elevenLabsTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* 3. GROQ CLOUD API */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-white">
                          Groq Cloud API (Llama 3.3 70B & Mixtral)
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 font-bold">
                          100% Gratuit & Ultra Rapide
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Inférence à plus de 500 tokens/seconde avec quota généreux
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/40 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <span>Lien clé Groq (Gratuit)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Input & Test Button */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <div className="relative flex-1 w-full">
                    <input
                      type={showGroqKey ? 'text' : 'password'}
                      value={localGroqKey}
                      onChange={(e) => setLocalGroqKey(e.target.value)}
                      placeholder="gsk_..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      title={showGroqKey ? 'Masquer' : 'Afficher'}
                    >
                      {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestGroqKey}
                    disabled={testingGroq}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-cyan-950/40"
                  >
                    {testingGroq ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Test en cours...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Tester la clé Groq</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Result Message */}
                {groqTestResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      groqTestResult.success
                        ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                        : 'bg-red-950/80 border border-red-500/50 text-red-200'
                    }`}
                  >
                    {groqTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <span className="flex-1">{groqTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* 4. OTHER FREE ALTERNATIVES */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-white">OpenRouter / Modèles Open-Source Gratuits</h5>
                  <p className="text-[11px] text-slate-400">
                    Accédez à DeepSeek, Mistral et Llama avec une seule clé d'agrégation.
                  </p>
                </div>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Créer clé OpenRouter</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* BOTTOM STICKY BAR: GLOBAL SAVE & CLOSE                   */}
        {/* ======================================================== */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Toutes les configurations sont stockées localement sur votre machine.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                stopHumanSpeech();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleSaveAllSettings}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>💾 Enregistrer les Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
