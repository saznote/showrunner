import React, { useState, useEffect, useRef } from 'react';
import { ScriptData } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Mic,
  Sliders,
  Check,
  Music,
  Radio,
  Zap,
} from 'lucide-react';
import {
  ELEVENLABS_PRESETS,
  getAvailableHumanVoices,
  speakHumanText,
  stopHumanSpeech,
} from '../utils/voiceManager';
import { playKaching, playWhoosh, playPop, playTension } from '../utils/audio';

interface AudioPlayerStudioProps {
  scriptData: ScriptData;
  activeSectionIndex: number;
  onSectionChange: (index: number) => void;
  isSpeaking: boolean;
  onSpeakingChange: (speaking: boolean) => void;
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string, voiceURI?: string) => void;
  speechRate: number;
  onRateChange: (rate: number) => void;
  elevenLabsApiKey: string;
  onOpenSettings: () => void;
}

export const AudioPlayerStudio: React.FC<AudioPlayerStudioProps> = ({
  scriptData,
  activeSectionIndex,
  onSectionChange,
  isSpeaking,
  onSpeakingChange,
  selectedVoiceId,
  onVoiceChange,
  speechRate,
  onRateChange,
  elevenLabsApiKey,
  onOpenSettings,
}) => {
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioStatusMessage, setAudioStatusMessage] = useState<string>('');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const sections = [
    { name: 'Hook (0-3s)', text: scriptData.sections.hook.dialogue, duration: 3 },
    { name: 'Chaîne (3-15s)', text: scriptData.sections.context.dialogue, duration: 12 },
    { name: 'Jackpot (15-30s)', text: scriptData.sections.jackpot.dialogue, duration: 15 },
    { name: 'Secret (30-45s)', text: scriptData.sections.secret.dialogue, duration: 15 },
    { name: 'Outro (45-55s)', text: scriptData.sections.outro.dialogue, duration: 10 },
  ];

  const totalEstimatedDuration = scriptData.estimatedDurationSeconds || 52;

  useEffect(() => {
    getAvailableHumanVoices().then((voices) => {
      setBrowserVoices(voices);
      if (voices.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(voices[0].voiceURI);
      }
    });
  }, []);

  // Update progress timer during playback
  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2;
          if (next >= totalEstimatedDuration) {
            return totalEstimatedDuration;
          }
          setProgress((next / totalEstimatedDuration) * 100);
          return next;
        });
      }, 200);
    } else {
      if (currentTime >= totalEstimatedDuration) {
        setCurrentTime(0);
        setProgress(0);
      }
    }
    return () => clearInterval(interval);
  }, [isSpeaking, totalEstimatedDuration, currentTime]);

  // Handle Full Script Speech Playback via selected Voice API
  const handlePlayFullScript = async () => {
    if (isSpeaking) {
      onSpeakingChange(false);
      stopHumanSpeech();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      return;
    }

    setCurrentTime(0);
    setProgress(0);
    onSectionChange(0);
    onSpeakingChange(true);
    setAudioStatusMessage('');

    // If ElevenLabs is selected and API key is present
    if (selectedVoiceId.startsWith('eleven_') && elevenLabsApiKey) {
      setIsGeneratingAudio(true);
      setAudioStatusMessage('Génération audio ElevenLabs en cours...');
      const preset = ELEVENLABS_PRESETS.find((p) => p.id === selectedVoiceId);
      const voiceId = preset?.voiceId || 'pNInz6obpgDQGcFmaJgB';

      try {
        const response = await fetch('/api/tts/elevenlabs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: scriptData.cleanSpeech,
            voiceId,
            apiKey: elevenLabsApiKey,
          }),
        });

        const json = await response.json();
        setIsGeneratingAudio(false);

        if (json.success && json.audioBase64) {
          const audioBlob = new Blob(
            [Uint8Array.from(atob(json.audioBase64), (c) => c.charCodeAt(0))],
            { type: 'audio/mpeg' }
          );
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          const audio = new Audio(url);
          audioElementRef.current = audio;
          audio.playbackRate = speechRate;

          audio.onended = () => {
            onSpeakingChange(false);
            setCurrentTime(totalEstimatedDuration);
            setProgress(100);
          };

          audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / (audio.duration || totalEstimatedDuration)) * 100);

            // Synchronize active section by time
            const t = audio.currentTime;
            if (t < 3) onSectionChange(0);
            else if (t < 15) onSectionChange(1);
            else if (t < 30) onSectionChange(2);
            else if (t < 45) onSectionChange(3);
            else onSectionChange(4);
          };

          audio.play();
          setAudioStatusMessage(`Lecture en cours via ElevenLabs (${preset?.name})`);
          return;
        }
      } catch (err) {
        setIsGeneratingAudio(false);
      }
    }

    // Default: High-Definition Human Neural Voice via Web Speech API
    setAudioStatusMessage(
      `Lecture vocale naturelle (${browserVoices.find((v) => v.voiceURI === selectedVoiceURI)?.name || 'Voix Humaine HD'})`
    );

    // Play section by section to trigger synchronized animations & SFX
    let currentIdx = 0;
    const playNextSection = (index: number) => {
      if (index >= sections.length) {
        onSpeakingChange(false);
        setCurrentTime(totalEstimatedDuration);
        setProgress(100);
        return;
      }

      onSectionChange(index);

      // Trigger SFX on cue
      if (index === 0 || index === 2) playKaching();
      else if (index === 1) playWhoosh();
      else if (index === 4) playPop();
      else playTension();

      speakHumanText(sections[index].text, {
        voiceURI: selectedVoiceURI,
        rate: speechRate,
        onEnd: () => {
          setTimeout(() => {
            playNextSection(index + 1);
          }, 280);
        },
        onError: () => {
          onSpeakingChange(false);
        },
      });
    };

    playNextSection(0);
  };

  const handleDownloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `Voix_${scriptData.creatorName.replace(/\s+/g, '_')}_Short.mp3`;
      a.click();
    } else {
      // Create a clean script text file with recording prompts
      const text = `🎙️ VOIX-OFF & REPERES POUR ENREGISTREMENT SHORTS\n\n${scriptData.cleanSpeech}`;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Texte_Voix_${scriptData.creatorName.replace(/\s+/g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const selectedVoiceLabel = selectedVoiceId.startsWith('eleven_')
    ? ELEVENLABS_PRESETS.find((p) => p.id === selectedVoiceId)?.name || 'ElevenLabs'
    : browserVoices.find((v) => v.voiceURI === selectedVoiceURI)?.name || 'Voix Humaine Naturelle HD';

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl space-y-4">
      {/* Top Banner: Voice Selector & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-950/40">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-base flex items-center gap-2">
              Studio d'Écoute Vocale & Synthèse Vocale IA
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Voix Naturelles
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Écoute l'intégralité du script déclamé avec le rythme et l'intonation humaine d'un créateur Shorts.
            </p>
          </div>
        </div>

        {/* Voice Selector Dropdown & Settings trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedVoiceId}
            onChange={(e) => {
              const val = e.target.value;
              onVoiceChange(val);
              if (val === 'browser_neural' && browserVoices.length > 0) {
                setSelectedVoiceURI(browserVoices[0].voiceURI);
              }
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <optgroup label="✨ Voix ElevenLabs Studio (IA Qualité Cinéma)">
              {ELEVENLABS_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.tone.slice(0, 30)}...
                </option>
              ))}
            </optgroup>
            <optgroup label="🌐 Voix Humaines Neuronales HD (100% Gratuites)">
              <option value="browser_neural">
                Voix Humaine HD Naturelle ({browserVoices.length} voix)
              </option>
            </optgroup>
          </select>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Options avancées de voix et clé ElevenLabs"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Main Playback Bar with Waveform & Scrubber */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main Big Play/Pause Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayFullScript}
              disabled={isGeneratingAudio}
              className={`px-5 py-3 rounded-xl font-heading font-bold text-sm flex items-center gap-2.5 transition-all shadow-lg cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-500 text-black shadow-amber-500/25'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/40'
              }`}
            >
              {isGeneratingAudio ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Génération ElevenLabs...</span>
                </>
              ) : isSpeaking ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Mettre en Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Écouter le Script Complet</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onSpeakingChange(false);
                stopHumanSpeech();
                setCurrentTime(0);
                setProgress(0);
                onSectionChange(0);
              }}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Réinitialiser la lecture"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Equalizer Wave Bars */}
          <div className="flex items-center gap-1.5 h-8">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? 'bg-gradient-to-t from-red-500 via-amber-400 to-emerald-400'
                    : 'bg-slate-800 h-2'
                }`}
                style={{
                  height: isSpeaking
                    ? `${Math.sin((i + Date.now() / 150) * 1.8) * 12 + 16}px`
                    : '4px',
                }}
              />
            ))}
          </div>

          {/* Speed Toggle & Download */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-[11px] font-mono">
              <span className="text-slate-500 px-1.5">Vitesse :</span>
              {[1.0, 1.12, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => onRateChange(rate)}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    speechRate === rate
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadAudio}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Télécharger l'audio ou texte voix-off"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Audio</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Timing Indicators */}
        <div className="space-y-1.5 pt-2">
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden cursor-pointer">
            <div
              className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              {Math.floor(currentTime)}s / ~{totalEstimatedDuration}s
            </span>
            <span className="text-amber-400 font-semibold truncate max-w-xs">
              {audioStatusMessage || `Prêt • Voix active : ${selectedVoiceLabel}`}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* 5 Sequential Section Audio Cues Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {sections.map((sec, idx) => {
          const isCurrent = activeSectionIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                onSectionChange(idx);
                // Speak this section specifically
                stopHumanSpeech();
                onSpeakingChange(true);
                if (idx === 0 || idx === 2) playKaching();
                else if (idx === 1) playWhoosh();
                else if (idx === 4) playPop();
                else playTension();

                speakHumanText(sec.text, {
                  voiceURI: selectedVoiceURI,
                  rate: speechRate,
                  onEnd: () => onSpeakingChange(false),
                  onError: () => onSpeakingChange(false),
                });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between cursor-pointer ${
                isCurrent
                  ? 'border-red-500 bg-red-950/40 text-white shadow-md'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[11px] truncate">{sec.name}</span>
                <Volume2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-red-400' : 'text-slate-500'}`} />
              </div>
              <p className="text-[10px] text-slate-500 truncate">{sec.text}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
