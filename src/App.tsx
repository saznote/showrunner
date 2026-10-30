import React, { useState, useEffect } from 'react';
import { VideoInputForm } from './components/VideoInputForm';
import { ScriptStudio } from './components/ScriptStudio';
import { ShowrunnerHeroBanner } from './components/ShowrunnerHeroBanner';
import { ScriptData } from './types';
import { SettingsStudio } from './components/SettingsStudio';
import { getStoredVrmFile } from './utils/avatarStorage';
import {
  Youtube,
  Sparkles,
  History,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Share2,
  Bookmark,
  Settings,
} from 'lucide-react';

// Initial preloaded script for Inoxtag Kaizen Everest so the app is instantly populated and magnificent!
const INITIAL_SCRIPT_DATA: ScriptData = {
  videoTitle: "KAIZEN : 1 an pour gravir l'Everest !",
  creatorName: 'Inoxtag',
  views: 38000000,
  viewsFormatted: '38 000 000',
  subscriberCount: '8.9M',
  channelCreationDate: 'Février 2015',
  niche: 'Divertissement & Aventure',
  wordCount: 131,
  estimatedDurationSeconds: 52,
  rpm: {
    low: 1.8,
    high: 3.4,
    avg: 2.6,
    label: 'Divertissement & Documentaire Long (1.80€ - 3.40€)',
  },
  earnings: {
    adsenseLow: 68400,
    adsenseHigh: 129200,
    adsenseAvg: 98800,
    estimatedSponsorship: 250000,
    totalEstimated: 348800,
    explanation:
      "Calculé sur 38 millions de vues avec un RPM moyen de 2.60€ boosté par la durée exceptionnelle du documentaire (2h30 favorisant les mid-rolls) et plus de 250k€ de partenariats intégrés.",
  },
  sections: {
    hook: {
      timing: '0-3s',
      title: 'LE HOOK',
      dialogue:
        "Tu crois qu'Inoxtag a juste gagné une médaille sur l'Everest ? Attends de voir le jackpot indécent généré par son documentaire Kaizen !",
      visual:
        "Zoom avant fulgurant sur l'avatar avec yeux en pièces d'or + son de caisse enregistreuse 'KACHING'",
      sfx: 'Kaching / Bass drop',
      overlayText: 'LE PACTOLE DE KAIZEN 💸',
      emotion: 'shocked',
    },
    context: {
      timing: '3-15s',
      title: 'LA VIDÉO / LA CHAÎNE',
      dialogue:
        "Sur sa chaîne lancée en février 2015 qui pèse aujourd'hui 8,9 millions d'abonnés, son film Kaizen vient de franchir la barre mythique des 38 millions de vues.",
      visual:
        "Capture animée de la chaîne d'Inoxtag, focus sur la date 2015 et compteur de vues qui s'emballe à 38M",
      sfx: 'Whoosh rapide',
      overlayText: 'INOXTAG • 38M DE VUES 🚀',
      emotion: 'talking',
    },
    jackpot: {
      timing: '15-30s',
      title: "LE JACKPOT (L'ARGENT)",
      dialogue:
        "Dans cette niche aventure au format long de 2h30, le RPM explose à 2,60€. Rien qu'avec AdSense, la vidéo a rapporté près de 98 000 euros. Et avec les sponsors majeurs, le pactole total dépasse les 340 000 euros !",
      visual:
        "Pluie de liasses de billets 3D, graphique montant en flèche à 98 800 € puis flash géant à 340 000 €",
      sfx: 'Jackpot arcade + pluie de pièces',
      overlayText: 'JACKPOT : +348 800 € 💰',
      emotion: 'money_eyes',
    },
    secret: {
      timing: '30-45s',
      title: 'LE SECRET DU BUZZ',
      dialogue:
        "Le secret de ce braquage ? Le storytelling de la quête impossible et une avant-première au cinéma qui a créé une hystérie collective et propulsé le CTR à des sommets jamais vus.",
      visual:
        "Zoom sur la miniature avec encadré rouge sur le sommet de l'Everest + capture de la salle de cinéma en délire",
      sfx: "Son d'ampoule Eureka + glitch",
      overlayText: 'MASTERCLASS RETENTION 🧠',
      emotion: 'smirk',
    },
    outro: {
      timing: '45-55s',
      title: 'OUTRO & ENGAGEMENT',
      dialogue:
        "Et toi, avec 340 000 euros en poche, tu grimpes l'Everest ou tu t'achètes une maison au soleil ? Dis-le moi en commentaire et abonne-toi pour le prochain jackpot !",
      visual:
        "L'avatar pointe énergiquement vers la zone de commentaire avec bulle géante et logo YouTube vibrant",
      sfx: 'Cloche de notification + Pop',
      overlayText: 'TU FERAIS QUOI AVEC CE CASH ? 👇',
      emotion: 'pointing',
    },
  },
  fullScriptWithVisuals: `[0-3s] [VISUEL: Zoom avant fulgurant sur l'avatar avec yeux en pièces d'or + son de caisse enregistreuse 'KACHING']
Tu crois qu'Inoxtag a juste gagné une médaille sur l'Everest ? Attends de voir le jackpot indécent généré par son documentaire Kaizen !

[3-15s] [VISUEL: Capture animée de la chaîne d'Inoxtag, focus sur la date 2015 et compteur de vues qui s'emballe à 38M]
Sur sa chaîne lancée en février 2015 qui pèse aujourd'hui 8,9 millions d'abonnés, son film Kaizen vient de franchir la barre mythique des 38 millions de vues.

[15-30s] [VISUEL: Pluie de liasses de billets 3D, graphique montant en flèche à 98 800 € puis flash géant à 340 000 €]
Dans cette niche aventure au format long de 2h30, le RPM explose à 2,60€. Rien qu'avec AdSense, la vidéo a rapporté près de 98 000 euros. Et avec les sponsors majeurs, le pactole total dépasse les 340 000 euros !

[30-45s] [VISUEL: Zoom sur la miniature avec encadré rouge sur le sommet de l'Everest + capture de la salle de cinéma en délire]
Le secret de ce braquage ? Le storytelling de la quête impossible et une avant-première au cinéma qui a créé une hystérie collective et propulsé le CTR à des sommets jamais vus.

[45-55s] [VISUEL: L'avatar pointe énergiquement vers la zone de commentaire avec bulle géante et logo YouTube vibrant]
Et toi, avec 340 000 euros en poche, tu grimpes l'Everest ou tu t'achètes une maison au soleil ? Dis-le moi en commentaire et abonne-toi pour le prochain jackpot !`,
  cleanSpeech: `Tu crois qu'Inoxtag a juste gagné une médaille sur l'Everest ? Attends de voir le jackpot indécent généré par son documentaire Kaizen !

Sur sa chaîne lancée en février 2015 qui pèse aujourd'hui 8,9 millions d'abonnés, son film Kaizen vient de franchir la barre mythique des 38 millions de vues.

Dans cette niche aventure au format long de 2h30, le RPM explose à 2,60€. Rien qu'avec AdSense, la vidéo a rapporté près de 98 000 euros. Et avec les sponsors majeurs, le pactole total dépasse les 340 000 euros !

Le secret de ce braquage ? Le storytelling de la quête impossible et une avant-première au cinéma qui a créé une hystérie collective et propulsé le CTR à des sommets jamais vus.

Et toi, avec 340 000 euros en poche, tu grimpes l'Everest ou tu t'achètes une maison au soleil ? Dis-le moi en commentaire et abonne-toi pour le prochain jackpot !`,
  viralitySecrets: [
    "Format hybride cinéma/YouTube : L'événement physique a transformé la sortie en rendez-vous culturel national.",
    "Rétention par le suspense mortel : Le danger réel de l'Everest maintient un taux de visionnage moyen supérieur à 65% sur plus de 2 heures.",
    "Boucle de valorisation multi-plateforme : Les Shorts et teasers ont drainé des millions d'utilisateurs vers la vidéo longue.",
  ],
  secretBuzzTitle: "La Rétention par l'Événement National et le Format Cinéma",
  secretBuzzExplanation:
    "Inoxtag a combiné le teasing d'une année entière, la menace de mort inhérente à l'Everest et une distribution au cinéma pour exploser les métriques habituelles de l'algorithme YouTube.",
};

export default function App() {
  const [currentScript, setCurrentScript] = useState<ScriptData>(INITIAL_SCRIPT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [history, setHistory] = useState<ScriptData[]>([]);

  // Settings Studio Centralized State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [vrmFile, setVrmFile] = useState<File | null>(null);
  const [is3dMode, setIs3dMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('showrunner_3d_mode') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    try {
      return localStorage.getItem('showrunner_voice_id') || 'neural_fr_punchy';
    } catch (e) {
      return 'neural_fr_punchy';
    }
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('showrunner_speech_rate');
      return saved ? parseFloat(saved) : 1.12;
    } catch (e) {
      return 1.12;
    }
  });
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('gemini_user_api_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('elevenlabs_api_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [groqApiKey, setGroqApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('groq_api_key') || '';
    } catch (e) {
      return '';
    }
  });

  // Restore avatar from IndexedDB and load history
  useEffect(() => {
    // 1. Restore .VRM Avatar from IndexedDB
    getStoredVrmFile().then((file) => {
      if (file) {
        setVrmFile(file);
        setIs3dMode(true);
      }
    });

    // 2. Load script history
    try {
      const saved = localStorage.getItem('showrunner_scripts_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage not available');
    }
  }, []);

  const saveToHistory = (script: ScriptData) => {
    const updated = [script, ...history.filter((s) => s.videoTitle !== script.videoTitle)].slice(0, 10);
    setHistory(updated);
    try {
      localStorage.setItem('showrunner_scripts_history', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleGenerateScript = async (formData: {
    videoTitle: string;
    creatorName: string;
    videoUrl?: string;
    currentViews: string;
    subscriberCount: string;
    channelCreationDate: string;
    niche: string;
    avatarTone: string;
    customNotes: string;
  }) => {
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, geminiApiKey }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setCurrentScript(json.data);
        saveToHistory(json.data);
        setNotification({
          message: `Nouveau script généré avec succès ! (${json.data.wordCount} mots, jackpot : ~${new Intl.NumberFormat('fr-FR').format(json.data.earnings.adsenseAvg)} €)`,
          type: 'success',
        });

        // Smooth scroll down to the script studio
        const studioEl = document.getElementById('script-studio-section');
        if (studioEl) {
          studioEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        throw new Error(json.error || 'Erreur lors de la génération');
      }
    } catch (err: any) {
      console.error(err);
      setNotification({
        message: `Erreur : ${err.message || 'Impossible de joindre le serveur'}`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Studio Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-white text-base tracking-tight">
                  SHOWRUNNER STUDIO
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold hidden sm:inline-block">
                  SHORTS AVATAR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                YouTube Shorts Viraux • Jackpot RPM • Découpage Visuel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Engine status indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Moteur RPM v2.4 Actif</span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 font-semibold transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Paramètres</span>
            </button>

            <a
              href="#nouveau-script"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold transition-all shadow-md shadow-red-900/20"
            >
              + Nouvelle Vidéo
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner with Showrunner Identity & 5 Rules */}
        <ShowrunnerHeroBanner />

        {/* Global Notification Toast */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-semibold transition-all shadow-xl ${
              notification.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                : 'bg-red-950/80 border border-red-500 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-75 hover:opacity-100 uppercase font-mono px-2 py-1 rounded bg-black/30"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Section 1: The 4-Question Input Form Requested by User */}
        <section id="nouveau-script">
          <VideoInputForm onSubmit={handleGenerateScript} isLoading={isLoading} />
        </section>

        {/* Section 2: The Full Script Studio Workspace */}
        <section id="script-studio-section" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Studio de Production & Télé-Prompteur
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Prêt pour enregistrement Avatar
            </span>
          </div>

          <ScriptStudio
            scriptData={currentScript}
            onOpenSettings={() => setIsSettingsOpen(true)}
            vrmFile={vrmFile}
            onVrmFileChange={setVrmFile}
            is3dMode={is3dMode}
            onToggle3d={(active) => {
              setIs3dMode(active);
              try {
                localStorage.setItem('showrunner_3d_mode', String(active));
              } catch (e) {}
            }}
            selectedVoiceId={selectedVoiceId}
            onSelectVoice={(vId) => {
              setSelectedVoiceId(vId);
              try {
                localStorage.setItem('showrunner_voice_id', vId);
              } catch (e) {}
            }}
            speechRate={speechRate}
            onRateChange={(rate) => {
              setSpeechRate(rate);
              try {
                localStorage.setItem('showrunner_speech_rate', String(rate));
              } catch (e) {}
            }}
            elevenLabsApiKey={elevenLabsApiKey}
            onApiKeyChange={(key) => {
              setElevenLabsApiKey(key);
              try {
                localStorage.setItem('elevenlabs_api_key', key);
              } catch (e) {}
            }}
            geminiApiKey={geminiApiKey}
            onGeminiKeyChange={(key) => {
              setGeminiApiKey(key);
              try {
                localStorage.setItem('gemini_user_api_key', key);
              } catch (e) {}
            }}
            groqApiKey={groqApiKey}
            onGroqKeyChange={(key) => {
              setGroqApiKey(key);
              try {
                localStorage.setItem('groq_api_key', key);
              } catch (e) {}
            }}
          />
        </section>

        {/* Section 3: History of analyzed videos */}
        {history.length > 1 && (
          <section className="pt-6 border-t border-slate-800/80">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400 flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-slate-400" />
              Historique des Vidéos Traitées ({history.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentScript(h)}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <p className="text-xs font-bold text-white truncate">{h.videoTitle}</p>
                    <p className="text-[11px] text-slate-400">
                      {h.creatorName} • {h.viewsFormatted} vues
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold shrink-0">
                    +{new Intl.NumberFormat('fr-FR').format(h.earnings.adsenseAvg)} €
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Showrunner Studio • Chaîne YouTube Automatisée & Scripts Shorts Viraux</span>
          <span className="text-slate-400">
            Format 45-60s • 120-140 mots • RPM Niche Calibré
          </span>
        </div>
      </footer>

      {/* Centralized Settings Studio Modal */}
      <SettingsStudio
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        vrmFile={vrmFile}
        onVrmFileChange={setVrmFile}
        is3dActive={is3dMode}
        onToggle3d={(active) => {
          setIs3dMode(active);
          try {
            localStorage.setItem('showrunner_3d_mode', String(active));
          } catch (e) {}
        }}
        selectedVoiceId={selectedVoiceId}
        onSelectVoice={(vId) => {
          setSelectedVoiceId(vId);
          try {
            localStorage.setItem('showrunner_voice_id', vId);
          } catch (e) {}
        }}
        speechRate={speechRate}
        onRateChange={(rate) => {
          setSpeechRate(rate);
          try {
            localStorage.setItem('showrunner_speech_rate', String(rate));
          } catch (e) {}
        }}
        geminiApiKey={geminiApiKey}
        onGeminiKeyChange={(key) => {
          setGeminiApiKey(key);
          try {
            localStorage.setItem('gemini_user_api_key', key);
          } catch (e) {}
        }}
        elevenLabsApiKey={elevenLabsApiKey}
        onElevenLabsKeyChange={(key) => {
          setElevenLabsApiKey(key);
          try {
            localStorage.setItem('elevenlabs_api_key', key);
          } catch (e) {}
        }}
        groqApiKey={groqApiKey}
        onGroqKeyChange={(key) => {
          setGroqApiKey(key);
          try {
            localStorage.setItem('groq_api_key', key);
          } catch (e) {}
        }}
        onSaveNotification={(msg) => {
          setNotification({ message: msg, type: 'success' });
        }}
      />
    </div>
  );
}
