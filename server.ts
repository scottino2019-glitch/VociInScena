import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import googleTTS from 'google-tts-api';
import { Mp3Encoder } from '@breezystack/lamejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Predefined non-AI realistic voices
const AVAILABLE_VOICES = [
  // Italian
  { id: 'it-IT-DiegoNeural', name: 'Diego (Naturale, Espressivo)', gender: 'male', lang: 'it-IT', langLabel: 'Italiano' },
  { id: 'it-IT-GiuseppeNeural', name: 'Giuseppe (Profondo, Rilassato)', gender: 'male', lang: 'it-IT', langLabel: 'Italiano' },
  { id: 'it-IT-ElsaNeural', name: 'Elsa (Chiara, Brillante)', gender: 'female', lang: 'it-IT', langLabel: 'Italiano' },
  { id: 'it-IT-IsabellaNeural', name: 'Isabella (Dolce, Calda)', gender: 'female', lang: 'it-IT', langLabel: 'Italiano' },
  // Japanese (Giapponese)
  { id: 'ja-JP-NanamiNeural', name: 'Nanami (七海 - Chiara, Espressiva)', gender: 'female', lang: 'ja-JP', langLabel: 'Giapponese' },
  { id: 'ja-JP-KeitaNeural', name: 'Keita (圭太 - Caldo, Giovanile)', gender: 'male', lang: 'ja-JP', langLabel: 'Giapponese' },
  { id: 'ja-JP-AoiNeural', name: 'Aoi (葵 - Dolce, Delicata)', gender: 'female', lang: 'ja-JP', langLabel: 'Giapponese' },
  { id: 'ja-JP-NaokiNeural', name: 'Naoki (直樹 - Autorevole, Calmo)', gender: 'male', lang: 'ja-JP', langLabel: 'Giapponese' },
  // Korean (Coreano)
  { id: 'ko-KR-SunHiNeural', name: 'Sun-Hi (선희 - Vivace, Melodica)', gender: 'female', lang: 'ko-KR', langLabel: 'Coreano' },
  { id: 'ko-KR-InJoonNeural', name: 'In-Joon (인준 - Profondo, Raffinato)', gender: 'male', lang: 'ko-KR', langLabel: 'Coreano' },
  // Chinese Mandarin (Cinese Mandarino)
  { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (晓晓 - Dolce, Naturale)', gender: 'female', lang: 'zh-CN', langLabel: 'Cinese' },
  { id: 'zh-CN-YunxiNeural', name: 'Yunxi (云希 - Dinamico, Giovanile)', gender: 'male', lang: 'zh-CN', langLabel: 'Cinese' },
  { id: 'zh-CN-YunjianNeural', name: 'Yunjian (云健 - Narrativo, Serio)', gender: 'male', lang: 'zh-CN', langLabel: 'Cinese' },
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

// Helper to generate silent MP3 frames
function makeSilenceMp3(seconds: number, sampleRate = 24000, bitrate = 96): Buffer {
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

// Convert emotion modifier to pitch, rate, and volume adjustments
interface EmotionTuning {
  pitchDeltaHz: number;
  rateDeltaPct: number;
  volumeDeltaPct: number;
}

function getEmotionTuning(emotion: string): EmotionTuning {
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

// Synthesize a single utterance into MP3
async function synthesizeUtterance(params: {
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

  const pitchStr = `${finalPitch >= 0 ? '+' : ''}${finalPitch}Hz`;
  const rateStr = `${finalRate >= 0 ? '+' : ''}${finalRate}%`;
  const volStr = `${finalVolume >= 0 ? '+' : ''}${finalVolume}%`;

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice || 'it-IT-DiegoNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
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
    // Fallback: google-tts-api
    const langPrefix = (voice || '').split('-')[0] || 'it';
    const langCode = langPrefix === 'zh' ? 'zh-CN' : langPrefix;
    const isSlow = finalRate < -10;
    const base64 = await googleTTS.getAudioBase64(text, {
      lang: langCode,
      slow: isSlow,
      host: 'https://translate.google.com',
      timeout: 10000,
    });
    return Buffer.from(base64, 'base64');
  }
}

// Estimate duration of 24kHz 96kbps MP3 (96000 bps = 12000 bytes/sec)
function estimateMp3Duration(bufferLength: number, bitrateKbps = 96): number {
  const bytesPerSec = (bitrateKbps * 1000) / 8;
  return Number((bufferLength / bytesPerSec).toFixed(2));
}

// Routes
app.get('/api/voices', (_req, res) => {
  res.json({ voices: AVAILABLE_VOICES });
});

// Single line preview
app.post('/api/tts/preview-line', async (req, res) => {
  try {
    const { text, voice, pitchHz, ratePct, volumePct, emotion } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Testo mancante o non valido' });
    }

    const buffer = await synthesizeUtterance({
      text: text.trim(),
      voice,
      pitchHz: Number(pitchHz) || 0,
      ratePct: Number(ratePct) || 0,
      volumePct: Number(volumePct) || 0,
      emotion,
    });

    const durationSec = estimateMp3Duration(buffer.length);
    res.json({
      audioBase64: buffer.toString('base64'),
      durationSec,
      bytes: buffer.length,
    });
  } catch (error: any) {
    console.error('TTS preview error:', error);
    res.status(500).json({ error: error.message || 'Errore nella sintesi vocale' });
  }
});

// Full dialogue synthesis & stitching
app.post('/api/tts/generate-dialogue', async (req, res) => {
  try {
    const { characters, lines } = req.body;
    if (!characters || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Configurazione personaggi o battute non valida' });
    }

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

      // Add pause silence after line (except maybe after the very last line)
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

    res.json({
      audioBase64: fullMp3Buffer.toString('base64'),
      totalDurationSec: Number(currentTime.toFixed(2)),
      bytes: fullMp3Buffer.length,
      cues,
    });
  } catch (error: any) {
    console.error('Dialogue generation error:', error);
    res.status(500).json({ error: error.message || 'Errore nella generazione del dialogo' });
  }
});

// Direct MP3 download stream endpoint
app.post('/api/tts/download', async (req, res) => {
  try {
    const { characters, lines, filename } = req.body;
    if (!characters || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).send('Parametri non validi');
    }

    const mp3Chunks: Buffer[] = [];
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

      mp3Chunks.push(lineBuffer);

      const pauseSec = Math.max(0.2, Math.min(4.0, Number(line.pauseAfterSec) || 0.6));
      if (i < lines.length - 1) {
        const pauseBuffer = makeSilenceMp3(pauseSec);
        if (pauseBuffer.length > 0) {
          mp3Chunks.push(pauseBuffer);
        }
      }
    }

    const fullMp3 = Buffer.concat(mp3Chunks);
    const safeFilename = (filename || 'dialogo_vocale.mp3').replace(/[^a-zA-Z0-9_-]/g, '_') + '.mp3';

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', fullMp3.length);
    res.send(fullMp3);
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).send(error.message || 'Errore download audio');
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
