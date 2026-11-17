import { useEffect, useState } from 'react';
import { Gender, VoiceOption } from '../types';

const LANG_LABELS: Record<string, string> = {
  it: 'Italiano',
  ja: 'Giapponese',
  ko: 'Coreano',
  zh: 'Cinese',
  en: 'Inglese',
  es: 'Spagnolo',
  fr: 'Francese',
  de: 'Tedesco',
  pt: 'Portoghese',
  hi: 'Hindi',
  ar: 'Arabo',
  vi: 'Vietnamita',
  th: 'Tailandese',
  ru: 'Russo',
};

const PRIORITY_LANGS = ['it', 'ja', 'ko', 'zh', 'en', 'es', 'fr', 'de'];

const FEMALE_HINT_REGEX =
  /female|woman|donna|femmin|elsa|alice|federica|chiara|lucia|sofia|giulia|isabella|paola|silvia|samantha|victoria|karen|jenny|aria|nanami|kyoko|haruka|aoi|sun-?hi|sora|xiaoxiao|ting-?ting|mei-?jia|elvira|paulina|monica|denise|amelie|katja|anna|zira|helena|sabina|maria|it-it-x-it[ab]-|ja-jp-x-ja[ab]-|ko-kr-x-ko[ab]-|en-us-x-tp[cf]-|\(f\)/i;

const MALE_HINT_REGEX =
  /male|man|uomo|masch|diego|giuseppe|giorgio|luca|cosimo|carlo|keita|in-?joon|yunxi|yunjian|guy|christopher|david|mark|daniel|alvaro|jorge|henri|thomas|conrad|stefan|it-it-x-it[cd]-|ja-jp-x-ja[cd]-|ko-kr-x-ko[cd]-|en-us-x-tp[dm]-|\(m\)/i;

export function isBrowserVoiceId(voiceId: string): boolean {
  return Boolean(voiceId && voiceId.startsWith('browser:'));
}

export function getVoiceLang(voiceId: string, deviceVoices: VoiceOption[] = []): string {
  if (!voiceId) return 'it-IT';
  if (voiceId.startsWith('browser:')) {
    const found = deviceVoices.find((v) => v.id === voiceId);
    return found?.lang || 'it-IT';
  }
  if (voiceId.startsWith('google-tts:')) {
    const code = voiceId.replace('google-tts:', '');
    if (code === 'it') return 'it-IT';
    if (code === 'ja') return 'ja-JP';
    if (code === 'ko') return 'ko-KR';
    if (code === 'zh-CN' || code === 'zh') return 'zh-CN';
    if (code === 'en') return 'en-US';
    return code || 'it-IT';
  }
  return voiceId.slice(0, 5) || 'it-IT';
}

function inferDeviceGender(voice: SpeechSynthesisVoice): Gender {
  const haystack = `${voice.name} ${voice.voiceURI}`;
  if (MALE_HINT_REGEX.test(haystack)) return 'male';
  if (FEMALE_HINT_REGEX.test(haystack)) return 'female';
  return 'female';
}

function getLangLabel(lang: string): string {
  const prefix = (lang || 'it').split('-')[0].toLowerCase();
  return LANG_LABELS[prefix] || lang || 'Altra';
}

function formatDeviceVoiceName(voice: SpeechSynthesisVoice): string {
  const cleanName = voice.name
    .replace(/^Microsoft\s+/i, '')
    .replace(/\s+-\s+/g, ' ');
  const isGoogle = /google|android|chrome os/i.test(`${voice.name} ${voice.voiceURI}`);
  const prefix = isGoogle ? 'Google/Android' : 'Dispositivo';
  return `${cleanName} (${prefix})`;
}

export function mapBrowserVoices(): VoiceOption[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const raw = window.speechSynthesis.getVoices() || [];
  const seen = new Set<string>();
  const mapped: VoiceOption[] = [];

  for (const v of raw) {
    const baseKey = v.voiceURI || v.name;
    if (!baseKey) continue;
    const id = `browser:${baseKey}`;
    if (seen.has(id)) continue;
    seen.add(id);

    mapped.push({
      id,
      name: formatDeviceVoiceName(v),
      gender: inferDeviceGender(v),
      lang: v.lang || 'it-IT',
      langLabel: getLangLabel(v.lang || 'it-IT'),
      source: 'browser',
    });
  }

  return mapped.sort((a, b) => {
    const aPrefix = a.lang.split('-')[0].toLowerCase();
    const bPrefix = b.lang.split('-')[0].toLowerCase();
    const aPriority = PRIORITY_LANGS.indexOf(aPrefix);
    const bPriority = PRIORITY_LANGS.indexOf(bPrefix);

    const aRank = aPriority === -1 ? 99 : aPriority;
    const bRank = bPriority === -1 ? 99 : bPriority;
    if (aRank !== bRank) return aRank - bRank;

    const aGoogle = /Google|Android/i.test(a.name) ? 0 : 1;
    const bGoogle = /Google|Android/i.test(b.name) ? 0 : 1;
    if (aGoogle !== bGoogle) return aGoogle - bGoogle;

    return a.name.localeCompare(b.name);
  });
}

export function pickBestDeviceVoice(
  deviceVoices: VoiceOption[],
  langPrefix: string,
  gender: Gender
): VoiceOption | undefined {
  if (deviceVoices.length === 0) return undefined;
  const normPrefix = (langPrefix || 'it').split('-')[0].toLowerCase();
  const sameLang = deviceVoices.filter((v) =>
    v.lang.toLowerCase().startsWith(normPrefix)
  );
  const pool = sameLang.length > 0 ? sameLang : deviceVoices;

  const exactGender = pool.filter((v) => v.gender === gender);
  if (exactGender.length > 0) {
    return exactGender[0];
  }
  // Return second voice for second speaker if available so two speakers can differ
  return gender === 'male' && pool.length > 1 ? pool[pool.length - 1] : pool[0];
}

export function useDeviceVoices() {
  const [deviceVoices, setDeviceVoices] = useState<VoiceOption[]>(() => mapBrowserVoices());

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const refresh = () => {
      setDeviceVoices(mapBrowserVoices());
    };

    refresh();
    window.speechSynthesis.addEventListener('voiceschanged', refresh);

    // Some Android WebViews / Chrome mobile builds populate voices asynchronously without firing voiceschanged cleanly
    const t1 = setTimeout(refresh, 300);
    const t2 = setTimeout(refresh, 1200);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', refresh);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return deviceVoices;
}
