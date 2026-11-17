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

// Offline / Local browser SpeechSynthesis helper (for instant zero-network preview if desired)
export function speakLocal(
  text: string,
  options: {
    pitch?: number;
    rate?: number;
    gender?: 'male' | 'female';
    emotion?: EmotionType;
    onEnd?: () => void;
  }
) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'it-IT';

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
      pitchVal += 0.2;
      rateVal += 0.15;
      break;
    case 'calmo':
      pitchVal -= 0.1;
      rateVal -= 0.15;
      break;
    case 'serio':
      pitchVal -= 0.15;
      rateVal -= 0.1;
      break;
    case 'sorpreso':
      pitchVal += 0.3;
      rateVal += 0.1;
      break;
    case 'triste':
      pitchVal -= 0.2;
      rateVal -= 0.2;
      break;
    case 'ironico':
      pitchVal += 0.1;
      break;
  }

  utterance.pitch = Math.max(0.5, Math.min(2.0, pitchVal));
  utterance.rate = Math.max(0.5, Math.min(2.0, rateVal));

  // Try to pick a matching gender voice if available in the browser
  const voices = window.speechSynthesis.getVoices();
  const itVoices = voices.filter((v) => v.lang.startsWith('it'));
  if (itVoices.length > 0) {
    if (options.gender === 'female') {
      const female = itVoices.find((v) => /elsa|alice|federica|chiara|lucia|cosimo|female|donna/i.test(v.name)) || itVoices[0];
      utterance.voice = female;
    } else {
      const male = itVoices.find((v) => /diego|giuseppe|giorgio|carlo|male|uomo/i.test(v.name)) || itVoices[itVoices.length - 1];
      utterance.voice = male;
    }
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

// Stop any ongoing local speech
export function stopLocalSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
