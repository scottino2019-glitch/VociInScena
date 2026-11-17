import { synthesizeUtterance, estimateMp3Duration } from '../../lib/ttsEngine.ts';

function parseBody(req: any) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { text, voice, pitchHz, ratePct, volumePct, emotion } = parseBody(req);
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
    return res.status(200).json({
      audioBase64: buffer.toString('base64'),
      durationSec,
      bytes: buffer.length,
    });
  } catch (error: any) {
    console.error('TTS preview error:', error);
    return res.status(500).json({ error: error?.message || 'Errore nella sintesi vocale' });
  }
}
