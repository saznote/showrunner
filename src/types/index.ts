export type AvatarEmotion = 'shocked' | 'money_eyes' | 'smirk' | 'talking' | 'pointing' | 'thinking';

export interface ScriptSection {
  timing: string;
  title: string;
  dialogue: string;
  visual: string;
  sfx: string;
  overlayText: string;
  emotion: AvatarEmotion;
}

export interface RpmInfo {
  low: number;
  high: number;
  avg: number;
  label: string;
}

export interface EarningsInfo {
  adsenseLow: number;
  adsenseHigh: number;
  adsenseAvg: number;
  estimatedSponsorship: number;
  totalEstimated: number;
  explanation: string;
}

export interface ScriptData {
  videoTitle: string;
  creatorName: string;
  views: number;
  viewsFormatted: string;
  subscriberCount: string;
  channelCreationDate: string;
  niche: string;
  wordCount: number;
  estimatedDurationSeconds: number;
  rpm: RpmInfo;
  earnings: EarningsInfo;
  sections: {
    hook: ScriptSection;
    context: ScriptSection;
    jackpot: ScriptSection;
    secret: ScriptSection;
    outro: ScriptSection;
  };
  fullScriptWithVisuals: string;
  cleanSpeech: string;
  viralitySecrets: string[];
  secretBuzzTitle?: string;
  secretBuzzExplanation?: string;
}

export interface VideoPreset {
  id: string;
  videoTitle: string;
  creatorName: string;
  currentViews: string;
  subscriberCount: string;
  channelCreationDate: string;
  niche: string;
  tag: string;
  badgeColor: string;
  avatarTone: string;
}
