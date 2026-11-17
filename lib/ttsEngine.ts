import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import googleTTS from 'google-tts-api';
import { Mp3Encoder } from '@breezystack/lamejs';

export interface VoiceDef {
  id: string;
  name: string;
  gender: 'male' | 'female';
  lang: string;
  langLabel: string;
}

export const AVAILABLE_VOICES: VoiceDef[] = [
  // Italian
  { id: 'it-IT-DiegoNeural', name: 'Diego (Naturale, Espressivo)', gender: 'male', lang: 'it-IT', langLabel: 'Italiano' },
  { id: 'it-IT-GiuseppeNeural', name: 'Giuseppe (Profondo, Rilassato)', gender: 'male', lang: 'it-IT', langLabel: 'Italiano' },
  { id: 'it-IT-ElsaNeural', name: 'Elsa (Chiara, Brillante)', gender: 'female', lang: 'it-IT', langLabel: 'Italiano' },
  { id: 'it-IT-IsabellaNeural', name: 'Isabella (Dolce, Calda)', gender: 'female', lang: 'it-IT', langLabel: 'Italiano' },
  { id: 'google-tts:it', name: 'Google TTS Italiano (Standard)', gender: 'female', lang: 'it-IT', langLabel: 'Italiano' },
  // Japanese (Giapponese)
  { id: 'ja-JP-NanamiNeural', name: 'Nanami (七海 - Chiara, Espressiva)', gender: 'female', lang: 'ja-JP', langLabel: 'Giapponese' },
  { id: 'ja-JP-KeitaNeural', name: 'Keita (圭太 - Caldo, Giovanile)', gender: 'male', lang: 'ja-JP', langLabel: 'Giapponese' },
  { id: 'ja-JP-AoiNeural', name: 'Aoi (葵 - Dolce, Delicata)', gender: 'female', lang: 'ja-JP', langLabel: 'Giapponese' },
  { id: 'ja-JP-NaokiNeural', name: 'Naoki (直樹 - Autorevole, Calmo)', gender: 'male', lang: 'ja-JP', langLabel: 'Giapponese' },
  { id: 'google-tts:ja', name: 'Google TTS Giapponese (日本語)', gender: 'female', lang: 'ja-JP', langLabel: 'Giapponese' },
  // Korean (Coreano)
  { id: 'ko-KR-SunHiNeural', name: 'Sun-Hi (선희 - Vivace, Melodica)', gender: 'female', lang: 'ko-KR', langLabel: 'Coreano' },
  { id: 'ko-KR-InJoonNeural', name: 'In-Joon (인준 - Profondo, Raffinato)', gender: 'male', lang: 'ko-KR', langLabel: 'Coreano' },
  { id: 'google-tts:ko', name: 'Google TTS Coreano (한국어)', gender: 'female', lang: 'ko-KR', langLabel: 'Coreano' },
  // Chinese Mandarin (Cinese Mandarino)
  { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (晓晓 - Dolce, Naturale)', gender: 'female', lang: 'zh-CN', langLabel: 'Cinese' },
  { id: 'zh-CN-YunxiNeural', name: 'Yunxi (云希 - Dinamico, Giovanile)', gender: 'male', lang: 'zh-CN', langLabel: 'Cinese' },
  { id: 'zh-CN-YunjianNeural', name: 'Yunjian (云健 - Narrativo, Serio)', gender: 'male', lang: 'zh-CN', langLabel: 'Cinese' },
  { id: 'google-tts:zh-CN', name: 'Google TTS Cinese (普通话)', gender: 'female', lang: 'zh-CN', langLabel: 'Cinese' },
  // Cantonese (Hong Kong)
  { id: 'zh-HK-HiuMaanNeural', name: 'HiuMaan (曉曼 - Femminile)', gender: 'female', lang: 'zh-HK', langLabel: 'Cantonese' },
  { id: 'zh-HK-WanLungNeural', name: 'WanLung (雲龍 - Maschile)', gender: 'male', lang: 'zh-HK', langLabel: 'Cantonese' },
  // Vietnamese (Vietnamita)
  { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Femminile Melodica)', gender: 'female', lang: 'vi-VN', langLabel: 'Vietnamita' },
  { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Maschile Calmo)', gender: 'male', lang: 'vi-VN', langLabel: 'Vietnamita' },
  // Thai (Tailandese)
  { id: 'th-TH-PremwadeeNeural', name: 'Premwadee (เปรมวดี - Femminile)', gender: 'female', lang: 'th-TH', langLabel: 'Tailandese' },
  { id: 'th-TH-NiwatNeural', name: 'Niwat (นิวัฒน์ - Maschile)', gender: 'male', lang: 'th-TH', langLabel: 'Tailandese' },
  // Hindi (Indiano)
  { id: 'hi-IN-SwaraNeural', name: 'Swara (स्वरा - Femminile Dolce)', gender: 'female', lang: 'hi-IN', langLabel: 'Hindi' },
  { id: 'hi-IN-MadhurNeural', name: 'Madhur (मधुर - Maschile Caldo)', gender: 'male', lang: 'hi-IN', langLabel: 'Hindi' },
  // Arabic (Arabo)
  { id: 'ar-SA-ZariyahNeural', name: 'Zariyah (زريعة - Femminile Espressiva)', gender: 'female', lang: 'ar-SA', langLabel: 'Arabo' },
  { id: 'ar-SA-HamedNeural', name: 'Hamed (حامد - Maschile Profondo)', gender: 'male', lang: 'ar-SA', langLabel: 'Arabo' },
  // English
  { id: 'en-US-GuyNeural', name: 'Guy (American Male, Natural)', gender: 'male', lang: 'en-US', langLabel: 'Inglese' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (Warm Storyteller)', gender: 'male', lang: 'en-US', langLabel: 'Inglese' },
  { id: 'en-US-JennyNeural', name: 'Jenny (American Female, Crisp)', gender: 'female', lang: 'en-US', langLabel: 'Inglese' },
  { id: 'en-US-AriaNeural', name: 'Aria (Dynamic & Expressive)', gender: 'female', lang: 'en-US', langLabel: 'Inglese' },
  { id: 'google-tts:en', name: 'Google TTS English (Standard)', gender: 'female', lang: 'en-US', langLabel: 'Inglese' },
  // Spanish
  { id: 'es-ES-AlvaroNeural', name: 'Álvaro (Spagnolo Maschile)', gender: 'male', lang: 'es-ES', langLabel: 'Spagnolo' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (Spagnolo Femminile)', gender: 'female', lang: 'es-ES', langLabel: 'Spagnolo' },
  // French
  { id: 'fr-FR-HenriNeural', name: 'Henri (Francese Maschile)', gender: 'male', lang: 'fr-FR', langLabel: 'Francese' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise (Francese Femminile)', gender: 'female', lang: 'fr-FR', langLabel: 'Francese' },
  // German
  { id: 'de-DE-ConradNeural', name: 'Conrad (Tedesco Maschile)', gender: 'male', lang: 'de-DE', langLabel: 'Tedesco' },
  { id: 'de-DE-KatjaNeural', name: 'Katja (Tedesco Femminile)', gender: 'female', lang: 'de-DE', langLabel: 'Tedesco' },
];

export function makeSilenceMp3(seconds: number, sampleRate = 24000, bitrate = 96): Buffer {
  if (seconds <= 0) return Buffer.alloc(0);
  const encoder = new Mp3Encoder(1, sampleRate, bitrate);
  const numSamples = Math.floor(sampleRate * Math.max(0.1, seconds));
  const samples = new Int16Array(numSamples);
  const parts: Buffer[] = [];
  const d1 = encoder.encodeBuffer(samples);
  if (d1.length > 0) parts.push(Buffer.from(d1));
  const d2 = encoder.flush();
  if (d2.length > 0) parts.push(Buffer.from(d2));
  return Buffer.concat(parts);
}

export interface EmotionTuning {
  pitchDeltaHz: number;
  rateDeltaPct: number;
  volumeDeltaPct: number;
}

export function getEmotionTuning(emotion: string): EmotionTuning {
  switch (emotion?.toLowerCase()) {
    case 'entusiasta':
    case 'gioioso':
      return { pitchDeltaHz: 12, rateDeltaPct: 15, volumeDeltaPct: 10 };
    case 'calmo':
    case 'rilassato':
      return { pitchDeltaHz: -4, rateDeltaPct: -12, volumeDeltaPct: -5 };
    case 'serio':
    case 'autoritario':
      return { pitchDeltaHz: -8, rateDeltaPct: -8, volumeDeltaPct: 10 };
    case 'sorpreso':
    case 'incredulo':
      return { pitchDeltaHz: 20, rateDeltaPct: 10, volumeDeltaPct: 12 };
    case 'triste':
    case 'malinconico':
      return { pitchDeltaHz: -14, rateDeltaPct: -18, volumeDeltaPct: -15 };
    case 'ironico':
    case 'scherzoso':
      return { pitchDeltaHz: 6, rateDeltaPct: 5, volumeDeltaPct: 5 };
    default:
      return { pitchDeltaHz: 0, rateDeltaPct: 0, volumeDeltaPct: 0 };
  }
}

export function estimateMp3Duration(bufferLength: number, bitrateKbps = 96): number {
  const bytesPerSec = (bitrateKbps * 1000) / 8;
  return Number((bufferLength / bytesPerSec).toFixed(2));
}

async function synthesizeWithGoogleTts(text: string, langCode: string, ratePct: number): Promise<Buffer> {
  const results = await googleTTS.getAllAudioBase64(text, {
    lang: langCode,
    slow: ratePct < -10,
    host: 'https://translate.google.com',
    timeout: 12000,
    splitPunct: ',.?!;:',
  });
  return Buffer.concat(results.map((r) => Buffer.from(r.base64, 'base64')));
}

export async function synthesizeUtterance(params: {
  text: string;
  voice: string;
  pitchHz?: number;
  ratePct?: number;
  volumePct?: number;
  emotion?: string;
}): Promise<Buffer> {
  const { text, voice, pitchHz = 0, ratePct = 0, volumePct = 0, emotion = 'neutro' } = params;
  const tuning = getEmotionTuning(emotion);

  const finalPitch = Math.max(-50, Math.min(50, pitchHz + tuning.pitchDeltaHz));
  const finalRate = Math.max(-50, Math.min(80, ratePct + tuning.rateDeltaPct));
  const finalVolume = Math.max(-50, Math.min(50, volumePct + tuning.volumeDeltaPct));

  // If user explicitly chose a Google TTS voice, synthesize directly via Google TTS
  if (voice && voice.startsWith('google-tts:')) {
    const langCode = voice.replace('google-tts:', '') || 'it';
    return await synthesizeWithGoogleTts(text, langCode, finalRate);
  }

  const pitchStr = `${finalPitch >= 0 ? '+' : ''}${finalPitch}Hz`;
  const rateStr = `${finalRate >= 0 ? '+' : ''}${finalRate}%`;
  const volStr = `${finalVolume >= 0 ? '+' : ''}${finalVolume}%`;

  const resolvedVoice = voice && !voice.startsWith('browser:') ? voice : 'it-IT-DiegoNeural';

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(resolvedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text, {
      pitch: pitchStr,
      rate: rateStr,
      volume: volStr,
    });

    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const timer = setTimeout(() => {
        reject(new Error('Edge TTS stream timeout'));
      }, 12000);

      audioStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      audioStream.on('close', () => {
        clearTimeout(timer);
        resolve(Buffer.concat(chunks));
      });

      audioStream.on('error', (err: any) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  } catch (edgeErr) {
    console.warn('Edge TTS failed, falling back to Google TTS:', edgeErr);
    const langPrefix = resolvedVoice.split('-')[0] || 'it';
    const langCode = langPrefix === 'zh' ? 'zh-CN' : langPrefix;
    return await synthesizeWithGoogleTts(text, langCode, finalRate);
  }
}

export async function generateDialogueAudio(params: {
  characters: Record<string, any>;
  lines: Array<any>;
}) {
  const { characters, lines } = params;
  const mp3Chunks: Buffer[] = [];
  const cues: Array<{ lineId: string; characterId: string; startSec: number; endSec: number }> = [];
  let currentTime = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const charConfig = characters[line.characterId] || {
      voice: 'it-IT-DiegoNeural',
      defaultPitch: 0,
      defaultRate: 0,
    };

    const lineText = (line.text || '').trim();
    if (!lineText) continue;

    const pitchHz = (charConfig.defaultPitch || 0) + (Number(line.pitchOffset) || 0);
    const ratePct = (charConfig.defaultRate || 0) + (Number(line.rateOffset) || 0);
    const volumePct = Number(line.volumeOffset) || 0;

    const lineBuffer = await synthesizeUtterance({
      text: lineText,
      voice: charConfig.voice,
      pitchHz,
      ratePct,
      volumePct,
      emotion: line.emotion || 'neutro',
    });

    const lineDuration = estimateMp3Duration(lineBuffer.length);
    const startSec = Number(currentTime.toFixed(2));
    const endSec = Number((currentTime + lineDuration).toFixed(2));

    cues.push({
      lineId: line.id,
      characterId: line.characterId,
      startSec,
      endSec,
    });

    mp3Chunks.push(lineBuffer);
    currentTime += lineDuration;

    const pauseSec = Math.max(0.2, Math.min(4.0, Number(line.pauseAfterSec) || 0.6));
    if (i < lines.length - 1 || pauseSec > 0.5) {
      const pauseBuffer = makeSilenceMp3(pauseSec);
      if (pauseBuffer.length > 0) {
        mp3Chunks.push(pauseBuffer);
        currentTime += pauseSec;
      }
    }
  }

  const fullMp3Buffer = Buffer.concat(mp3Chunks);

  return {
    audioBase64: fullMp3Buffer.toString('base64'),
    totalDurationSec: Number(currentTime.toFixed(2)),
    bytes: fullMp3Buffer.length,
    buffer: fullMp3Buffer,
    cues,
  };
}
