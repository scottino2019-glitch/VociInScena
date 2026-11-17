import { generateDialogueAudio } from '../../lib/ttsEngine.ts';

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
    const { characters, lines } = parseBody(req);
    if (!characters || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Configurazione personaggi o battute non valida' });
    }

    const result = await generateDialogueAudio({ characters, lines });
    return res.status(200).json({
      audioBase64: result.audioBase64,
      totalDurationSec: result.totalDurationSec,
      bytes: result.bytes,
      cues: result.cues,
    });
  } catch (error: any) {
    console.error('Dialogue generation error:', error);
    return res.status(500).json({ error: error?.message || 'Errore nella generazione del dialogo' });
  }
}
