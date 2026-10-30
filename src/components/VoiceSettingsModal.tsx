import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Play,
  Pause,
  Sparkles,
  Zap,
  Mic,
  Sliders,
  Check,
  ShieldCheck,
  ExternalLink,
  Flame,
  Radio,
} from 'lucide-react';
import {
  getAvailableHumanVoices,
  speakHumanText,
  stopHumanSpeech,
  ELEVENLABS_PRESETS,
  VoiceOption,
} from '../utils/voiceManager';
import { playKaching } from '../utils/audio';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string, voiceURI?: string) => void;
  speechRate: number;
  onRateChange: (rate: number) => void;
  elevenLabsApiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedVoiceId,
  onSelectVoice,
  speechRate,
  onRateChange,
  elevenLabsApiKey,
  onApiKeyChange,
}) => {
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [activeTab, setActiveTab] = useState<'neural' | 'elevenlabs' | 'gemini'>('neural');
  const [audioTesting, setAudioTesting] = useState(false);

  useEffect(() => {
    getAvailableHumanVoices().then((voices) => {
      setBrowserVoices(voices);
      if (voices.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(voices[0].voiceURI);
      }
    });
  }, []);

  if (!isOpen) return null;

  const testPhrase =
    "Salut les créateurs ! C'est ton avatar Showrunner, et aujourd'hui on va disséquer un véritable braquage algorithmique à plus d'un million d'euros !";

  const handleTestVoice = async (voiceId: string, voiceURI?: string) => {
    stopHumanSpeech();
    setIsPlayingSample(true);
    setAudioTesting(true);
    playKaching();

    // If testing ElevenLabs with an API key
    if (voiceId.startsWith('eleven_') && elevenLabsApiKey) {
      const preset = ELEVENLABS_PRESETS.find((p) => p.id === voiceId);
      if (preset && preset.voiceId) {
        try {
          const res = await fetch('/api/tts/elevenlabs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: testPhrase,
              voiceId: preset.voiceId,
              apiKey: elevenLabsApiKey,
            }),
          });
          const json = await res.json();
          if (json.success && json.audioBase64) {
            const audio = new Audio(`data:${json.mimeType || 'audio/mpeg'};base64,${json.audioBase64}`);
            audio.onended = () => {
              setIsPlayingSample(false);
              setAudioTesting(false);
            };
            audio.play();
            return;
          }
        } catch (e) {
          // Fall back to neural browser voice
        }
      }
    }

    // Default to ultra-realistic browser neural voice
    speakHumanText(testPhrase, {
      voiceURI: voiceURI || selectedVoiceURI,
      rate: speechRate,
      onEnd: () => {
        setIsPlayingSample(false);
        setAudioTesting(false);
      },
      onError: () => {
        setIsPlayingSample(false);
        setAudioTesting(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Configuration de la Voix Humaine de l'Avatar
              </h3>
              <p className="text-xs text-slate-400">
                Choisis une voix humaine naturelle, percutante et calibrée pour le rythme Shorts.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopHumanSpeech();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('neural')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'neural'
                ? 'bg-emerald-950/50 border-emerald-500 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase block w-fit mb-1">
              Gratuit & Illimité
            </span>
            <p className="font-bold text-xs text-white">Voix Neuronales HD</p>
            <p className="text-[11px] text-slate-400">Microsoft Natural & Google HD</p>
          </button>

          <button
            onClick={() => setActiveTab('elevenlabs')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'elevenlabs'
                ? 'bg-amber-950/50 border-amber-500 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase block w-fit mb-1">
              10k Crédits Gratuits/mois
            </span>
            <p className="font-bold text-xs text-white">ElevenLabs Studio</p>
            <p className="text-[11px] text-slate-400">Qualité Cinéma & Clones</p>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`p-3 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
              activeTab === 'gemini'
                ? 'bg-indigo-950/50 border-indigo-500 text-white'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase block w-fit mb-1">
              Gemini AI
            </span>
            <p className="font-bold text-xs text-white">Gemini 3.8 Audio</p>
            <p className="text-[11px] text-slate-400">Zephyr, Puck, Fenrir</p>
          </button>
        </div>

        {/* Tab 1: Browser Neural Natural Voices */}
        {activeTab === 'neural' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Voix françaises haute définition détectées sur votre appareil :</span>
              <span className="text-emerald-400 font-mono font-bold">
                {browserVoices.length} voix disponibles
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {browserVoices.map((v) => {
                const isSelected = selectedVoiceURI === v.voiceURI;
                const isNatural =
                  v.name.toLowerCase().includes('natural') ||
                  v.name.toLowerCase().includes('neural') ||
                  v.name.toLowerCase().includes('google') ||
                  v.name.toLowerCase().includes('enhanced');

                return (
                  <div
                    key={v.voiceURI}
                    onClick={() => {
                      setSelectedVoiceURI(v.voiceURI);
                      onSelectVoice('browser_neural', v.voiceURI);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{v.name}</span>
                          {isNatural && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              HD NATURELLE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{v.lang}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestVoice('browser_neural', v.voiceURI);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Tester</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: ElevenLabs Studio */}
        {activeTab === 'elevenlabs' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">À propos d'ElevenLabs : </span>
                ElevenLabs offre <strong>10 000 caractères gratuits chaque mois</strong> sans engagement. 
                Si vous avez une clé gratuite, collez-la ci-dessous pour débloquer le rendu cinéma. Sinon, le studio bascule automatiquement sur les voix neuronales HD gratuites !
                <a
                  href="https://elevenlabs.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-400 hover:underline ml-1 font-semibold"
                >
                  Obtenir 10k crédits gratuits <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Votre clé API ElevenLabs (optionnelle, stockée localement) :
              </label>
              <input
                type="password"
                value={elevenLabsApiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="sk_..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 block font-medium">
                Profils de voix ElevenLabs optimisés pour YouTube Shorts :
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ELEVENLABS_PRESETS.map((preset) => {
                  const isSelected = selectedVoiceId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => onSelectVoice(preset.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 text-white'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white">{preset.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{preset.tone}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">Multilingual v2</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestVoice(preset.id);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Écouter</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Gemini Audio Studio */}
        {activeTab === 'gemini' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
              <span className="font-bold text-white">Voix Natives Gemini Audio : </span>
              Le modèle <code>gemini-3.8-flash-lite-tts</code> génère des fichiers audio WAV complets (24kHz 16-bit) avec prosodie naturelle.
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Zephyr (Dynamique Showman)', 'Puck (Ironique & Punchy)', 'Fenrir (Grave & Puissant)', 'Kore (Clair & Précis)'].map(
                (vName, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectVoice(`gemini_${vName.split(' ')[0].toLowerCase()}`)}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500 text-left"
                  >
                    <span className="font-bold text-white block">{vName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Modèle Gemini 3.8</span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Speech Pacing & Rhythm Controls */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Rythme & Débit Spécial Shorts (Rétention Algorithmique)
            </span>
            <span className="font-mono font-bold text-emerald-400">{speechRate.toFixed(2)}x</span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.9"
              max="1.35"
              step="0.05"
              value={speechRate}
              onChange={(e) => onRateChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <button
              onClick={() => onRateChange(1.0)}
              className={`px-2 py-1 rounded ${speechRate === 1.0 ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
            >
              1.0x (Standard)
            </button>
            <button
              onClick={() => onRateChange(1.12)}
              className={`px-2 py-1 rounded font-bold ${
                speechRate === 1.12 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'hover:text-white'
              }`}
            >
              ⚡ 1.12x (Idéal Shorts 45s)
            </button>
            <button
              onClick={() => onRateChange(1.25)}
              className={`px-2 py-1 rounded ${speechRate === 1.25 ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
            >
              1.25x (Turbo)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => handleTestVoice(selectedVoiceId)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            {isPlayingSample ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-current" />}
            <span>{isPlayingSample ? 'Arrêter le test' : 'Tester la réplique avatar'}</span>
          </button>

          <button
            onClick={() => {
              stopHumanSpeech();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-900/30 cursor-pointer"
          >
            Valider cette Voix
          </button>
        </div>
      </div>
    </div>
  );
};
