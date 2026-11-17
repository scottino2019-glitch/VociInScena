import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AVAILABLE_VOICES,
  synthesizeUtterance,
  generateDialogueAudio,
  estimateMp3Duration,
} from './lib/ttsEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Prevent browser 404 noise for /favicon.ico
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

// Routes
app.get('/api/voices', (_req, res) => {
  res.json({ voices: AVAILABLE_VOICES });
});

// Single line preview
app.post('/api/tts/preview-line', async (req, res) => {
  try {
    const { text, voice, pitchHz, ratePct, volumePct, emotion } = req.body || {};
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
    const { characters, lines } = req.body || {};
    if (!characters || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Configurazione personaggi o battute non valida' });
    }

    const result = await generateDialogueAudio({ characters, lines });
    res.json({
      audioBase64: result.audioBase64,
      totalDurationSec: result.totalDurationSec,
      bytes: result.bytes,
      cues: result.cues,
    });
  } catch (error: any) {
    console.error('Dialogue generation error:', error);
    res.status(500).json({ error: error.message || 'Errore nella generazione del dialogo' });
  }
});

// Direct MP3 download stream endpoint
app.post('/api/tts/download', async (req, res) => {
  try {
    const { characters, lines, filename } = req.body || {};
    if (!characters || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).send('Parametri non validi');
    }

    const result = await generateDialogueAudio({ characters, lines });
    const fullMp3 = result.buffer;
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

// Catch-all JSON 404 for unknown API paths
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint API non trovato' });
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
