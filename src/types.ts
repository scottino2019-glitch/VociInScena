export type Gender = 'male' | 'female';
export type ThemeMode = 'indigo' | 'light' | 'plum';

export type EmotionType =
  | 'neutro'
  | 'entusiasta'
  | 'calmo'
  | 'serio'
  | 'sorpreso'
  | 'triste'
  | 'ironico';

export interface VoiceOption {
  id: string;
  name: string;
  gender: Gender;
  lang: string;
  langLabel: string;
}

export interface Character {
  id: 'char1' | 'char2';
  name: string;
  gender: Gender;
  voice: string;
  defaultPitch: number; // in Hz offset (-30 to +30)
  defaultRate: number;  // in % offset (-40 to +50)
  color: 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';
}

export interface DialogueLine {
  id: string;
  characterId: 'char1' | 'char2';
  text: string;
  emotion: EmotionType;
  pitchOffset: number; // in Hz (-30 to +30)
  rateOffset: number;  // in % (-30 to +50)
  volumeOffset: number;// in % (-20 to +20)
  pauseAfterSec: number; // in seconds (0.2 to 3.0)
}

export interface AudioCue {
  lineId: string;
  characterId: string;
  startSec: number;
  endSec: number;
}

export interface DialoguePreset {
  id: string;
  title: string;
  description: string;
  pairingType: 'mf' | 'ff' | 'mm';
  char1: { name: string; gender: Gender; voice: string; color: Character['color'] };
  char2: { name: string; gender: Gender; voice: string; color: Character['color'] };
  lines: Array<{
    characterId: 'char1' | 'char2';
    text: string;
    emotion: EmotionType;
    pauseAfterSec?: number;
  }>;
}
