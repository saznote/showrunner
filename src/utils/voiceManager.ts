// Human-like Voice & AI TTS Engine Manager

export interface VoiceOption {
  id: string;
  name: string;
  provider: 'browser_neural' | 'elevenlabs' | 'gemini';
  gender: 'male' | 'female';
  tone: string;
  badge: string;
  voiceId?: string; // For ElevenLabs
  browserVoiceURI?: string;
  sampleDescription: string;
}

export const ELEVENLABS_PRESETS: VoiceOption[] = [
  {
    id: 'eleven_adam',
    name: 'Adam (ElevenLabs)',
    provider: 'elevenlabs',
    gender: 'male',
    tone: 'Grave, impactant, narrateur YouTube star',
    badge: 'Ultra-Réaliste IA',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    sampleDescription: 'Voix profonde style documentaire américain et analyses criminelles / business.',
  },
  {
    id: 'eleven_antoni',
    name: 'Antoni (ElevenLabs)',
    provider: 'elevenlabs',
    gender: 'male',
    tone: 'Énergique, captivant, style MrBeast',
    badge: 'Dynamique Shorts',
    voiceId: 'ErXwobaYiN019PkySvjV',
    sampleDescription: 'Voix rapide et percutante parfaite pour stopper le scroll dans les 3 premières secondes.',
  },
  {
    id: 'eleven_rachel',
    name: 'Rachel (ElevenLabs)',
    provider: 'elevenlabs',
    gender: 'female',
    tone: 'Claire, confiante, experte data & tech',
    badge: 'Ultra-Réaliste IA',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    sampleDescription: 'Voix posée et professionnelle pour disséquer les chiffres et les jackpots.',
  },
  {
    id: 'eleven_josh',
    name: 'Josh (ElevenLabs)',
    provider: 'elevenlabs',
    gender: 'male',
    tone: 'Jeune, punchy, vlogueur moderne',
    badge: 'Jeune Créateur',
    voiceId: 'TxGEqnHWrfWFTfGW9XjX',
    sampleDescription: 'Ton naturel et spontané avec des inflexions modernes pour capter les 15-25 ans.',
  },
];

// Find best high-definition French human voices available in the browser
export function getAvailableHumanVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return resolve([]);
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for French voices
      const frenchVoices = allVoices.filter(
        (v) => v.lang.startsWith('fr') || v.lang.includes('FR') || v.lang.includes('fr_')
      );

      // Prioritize natural / neural / online / high definition voices
      frenchVoices.sort((a, b) => {
        const aScore = getVoiceQualityScore(a);
        const bScore = getVoiceQualityScore(b);
        return bScore - aScore;
      });

      resolve(frenchVoices.length > 0 ? frenchVoices : allVoices);
    };

    const initialVoices = window.speechSynthesis.getVoices();
    if (initialVoices.length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
      };
      // Timeout fallback
      setTimeout(loadVoices, 800);
    }
  });
}

function getVoiceQualityScore(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const name = voice.name.toLowerCase();
  if (name.includes('natural')) score += 50;
  if (name.includes('neural')) score += 45;
  if (name.includes('online')) score += 30;
  if (name.includes('google')) score += 25;
  if (name.includes('enhanced')) score += 20;
  if (name.includes('premium')) score += 15;
  if (voice.lang.startsWith('fr-FR')) score += 10;
  return score;
}

// Speak text using browser's best human-like speech synthesizer with pacing optimization
export function speakHumanText(
  text: string,
  options: {
    voiceURI?: string;
    rate?: number; // 0.8 to 1.5 (default 1.12 for fast Shorts pacing)
    pitch?: number; // 0.9 to 1.1
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = options.rate || 1.12; // punchy Shorts rhythm
  utterance.pitch = options.pitch || 1.02;

  const allVoices = window.speechSynthesis.getVoices();
  if (options.voiceURI) {
    const matched = allVoices.find((v) => v.voiceURI === options.voiceURI);
    if (matched) utterance.voice = matched;
  } else {
    // Pick the highest scored human French voice
    const frVoices = allVoices.filter(
      (v) => v.lang.startsWith('fr') || v.lang.includes('FR')
    );
    frVoices.sort((a, b) => getVoiceQualityScore(b) - getVoiceQualityScore(a));
    if (frVoices.length > 0) utterance.voice = frVoices[0];
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }
  if (options.onError) {
    utterance.onerror = options.onError;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopHumanSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
