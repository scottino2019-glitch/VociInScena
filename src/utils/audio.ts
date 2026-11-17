import { EmotionType } from '../types';

// Format seconds into MM:SS
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Convert base64 string to an audio/mpeg Blob
export function base64ToMp3Blob(base64Data: string): Blob {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: 'audio/mpeg' });
}

// Create an Object URL for smooth MP3 playback
export function base64ToMp3BlobUrl(base64Data: string): string {
  const blob = base64ToMp3Blob(base64Data);
  return URL.createObjectURL(blob);
}

// Trigger browser download for base64 audio
export function downloadBase64Mp3(base64Data: string, filename: string) {
  const blob = base64ToMp3Blob(base64Data);
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Hold reference to active utterance to prevent premature GC on Chrome/Android
let activeUtterance: SpeechSynthesisUtterance | null = null;

// Offline / Local browser SpeechSynthesis helper (Google & Android voices)
export function speakLocal(
  text: string,
  options: {
    voiceId?: string;
    lang?: string;
    pitch?: number;
    rate?: number;
    gender?: 'male' | 'female';
    emotion?: EmotionType;
    onEnd?: () => void;
  }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;

  const targetLang = options.lang || 'it-IT';
  utterance.lang = targetLang;

  // Base adjustments
  let pitchVal = 1.0;
  let rateVal = 1.0;

  if (options.pitch) {
    pitchVal += options.pitch / 50; // map -30..+30 to ~0.4..1.6
  }
  if (options.rate) {
    rateVal += options.rate / 60; // map -30..+50 to ~0.5..1.8
  }

  // Emotion adjustments
  switch (options.emotion) {
    case 'entusiasta':
      pitchVal += 0.18;
      rateVal += 0.14;
      break;
    case 'calmo':
      pitchVal -= 0.08;
      rateVal -= 0.14;
      break;
    case 'serio':
      pitchVal -= 0.14;
      rateVal -= 0.08;
      break;
    case 'sorpreso':
      pitchVal += 0.25;
      rateVal += 0.1;
      break;
    case 'triste':
      pitchVal -= 0.18;
      rateVal -= 0.18;
      break;
    case 'ironico':
      pitchVal += 0.08;
      break;
  }

  // Try to pick the exact chosen Google/Android voice or best language/gender match
  const voices = window.speechSynthesis.getVoices() || [];
  let chosenVoice: SpeechSynthesisVoice | undefined;

  if (options.voiceId && options.voiceId.startsWith('browser:')) {
    const wantedKey = options.voiceId.slice('browser:'.length);
    chosenVoice =
      voices.find((v) => (v.voiceURI || v.name) === wantedKey) ||
      voices.find((v) => v.name === wantedKey);
  }

  if (!chosenVoice && voices.length > 0) {
    const langPrefix = targetLang.split('-')[0].toLowerCase();
    const matchingVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
    const pool = matchingVoices.length > 0 ? matchingVoices : voices;

    // Prefer Google / Android voices in the matching language
    const googlePreferred = pool.filter((v) => /google|android/i.test(`${v.name} ${v.voiceURI}`));
    const searchPool = googlePreferred.length > 0 ? googlePreferred : pool;

    if (options.gender === 'female') {
      chosenVoice =
        searchPool.find((v) =>
          /elsa|alice|federica|chiara|lucia|nanami|sun-?hi|xiaoxiao|jenny|aria|elvira|denise|katja|female|woman|it-it-x-it[ab]-/i.test(
            `${v.name} ${v.voiceURI}`
          )
        ) || searchPool[0];
    } else {
      chosenVoice =
        searchPool.find((v) =>
          /diego|giuseppe|giorgio|carlo|cosimo|keita|in-?joon|yunxi|guy|alvaro|henri|conrad|male|man|it-it-x-it[cd]-/i.test(
            `${v.name} ${v.voiceURI}`
          )
        ) || searchPool[searchPool.length - 1];
    }
  }

  if (chosenVoice) {
    utterance.voice = chosenVoice;
    utterance.lang = chosenVoice.lang || targetLang;

    // Give subtle natural pitch separation if using a shared default voice (like single Google italiano)
    if (!options.pitch) {
      const voiceMeta = `${chosenVoice.name} ${chosenVoice.voiceURI}`;
      if (options.gender === 'male' && !/diego|giuseppe|giorgio|carlo|cosimo|male|it-it-x-it[cd]-/i.test(voiceMeta)) {
        pitchVal -= 0.14;
      } else if (options.gender === 'female' && /diego|giuseppe|giorgio|carlo|cosimo|male|it-it-x-it[cd]-/i.test(voiceMeta)) {
        pitchVal += 0.14;
      }
    }
  }

  utterance.pitch = Math.max(0.5, Math.min(2.0, pitchVal));
  utterance.rate = Math.max(0.5, Math.min(2.0, rateVal));

  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    options.onEnd?.();
  };

  utterance.onend = finish;
  utterance.onerror = finish;

  window.speechSynthesis.speak(utterance);
}

// Stop any ongoing local speech
export function stopLocalSpeech() {
  activeUtterance = null;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
