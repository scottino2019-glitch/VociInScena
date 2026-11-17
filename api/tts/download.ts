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
    return res.status(405).send('Metodo non consentito');
  }

  try {
    const { characters, lines, filename } = parseBody(req);
    if (!characters || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).send('Parametri non validi');
    }

    const result = await generateDialogueAudio({ characters, lines });
    const fullMp3 = result.buffer;
    const safeFilename = (filename || 'dialogo_vocale.mp3').replace(/[^a-zA-Z0-9_-]/g, '_') + '.mp3';

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', fullMp3.length);
    return res.status(200).send(fullMp3);
  } catch (error: any) {
    console.error('Download error:', error);
    return res.status(500).send(error?.message || 'Errore download audio');
  }
}
