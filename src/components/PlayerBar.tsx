import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { AudioCue, Character, DialogueLine } from '../types';
import { formatTime, downloadBase64Mp3, base64ToMp3BlobUrl, speakLocal, stopLocalSpeech } from '../utils/audio';

interface PlayerBarProps {
  characters: Record<'char1' | 'char2', Character>;
  lines: DialogueLine[];
  onActiveLineChange: (lineId: string | null) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  characters,
  lines,
  onActiveLineChange,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [cues, setCues] = useState<AudioCue[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Refs to avoid recreating Audio or interrupting play() when state/props update
  const cuesRef = useRef<AudioCue[]>(cues);
  const onActiveLineChangeRef = useRef(onActiveLineChange);
  const playbackRateRef = useRef(playbackRate);
  const lastActiveLineIdRef = useRef<string | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localCancelRef = useRef<boolean>(false);

  const isPlayingRef = useRef(isPlaying);
  const currentTimeRef = useRef(currentTime);
  const totalDurationRef = useRef(totalDuration);
  const hasAudioRef = useRef(Boolean(audioBase64));

  cuesRef.current = cues;
  onActiveLineChangeRef.current = onActiveLineChange;
  playbackRateRef.current = playbackRate;
  isPlayingRef.current = isPlaying;
  currentTimeRef.current = currentTime;
  totalDurationRef.current = totalDuration;
  hasAudioRef.current = Boolean(audioBase64);

  const setTransientStatus = (msg: string, durationMs = 3000) => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    setStatusMessage(msg);
    if (durationMs > 0) {
      statusTimerRef.current = setTimeout(() => {
        setStatusMessage(null);
      }, durationMs);
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      const activeCue = cuesRef.current.find((c) => cur >= c.startSec && cur <= c.endSec);
      const nextLineId = activeCue ? activeCue.lineId : null;
      if (lastActiveLineIdRef.current !== nextLineId) {
        lastActiveLineIdRef.current = nextLineId;
        onActiveLineChangeRef.current(nextLineId);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      lastActiveLineIdRef.current = null;
      onActiveLineChangeRef.current(null);
      setCurrentTime(0);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
      audio.playbackRate = playbackRateRef.current;
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
      localCancelRef.current = true;
      stopLocalSpeech();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const safePlay = async (audio: HTMLAudioElement): Promise<boolean> => {
    try {
      audio.playbackRate = playbackRateRef.current;
      await audio.play();
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Interrupted intentionally by pause/seek/new generation — ignore silently
        return false;
      }
      if (err?.name === 'NotAllowedError') {
        setTransientStatus('Audio pronto! Premi il tasto Play per ascoltare.', 5000);
        return false;
      }
      throw err;
    }
  };

  const playLocalDialogueSequence = async () => {
    const validLines = lines.filter((l) => l.text.trim().length > 0);
    if (validLines.length === 0) return;

    localCancelRef.current = false;
    setIsPlaying(true);
    setTransientStatus('Riproduzione tramite sintesi vocale del browser (anteprima locale).', 5000);

    for (let i = 0; i < validLines.length; i++) {
      if (localCancelRef.current) break;
      const line = validLines[i];
      const speaker = characters[line.characterId];
      onActiveLineChangeRef.current(line.id);

      await new Promise<void>((resolve) => {
        speakLocal(line.text.trim(), {
          lang: speaker.voice.slice(0, 5) || 'it-IT',
          pitch: (speaker.defaultPitch || 0) + (line.pitchOffset || 0),
          rate: (speaker.defaultRate || 0) + (line.rateOffset || 0),
          gender: speaker.gender,
          emotion: line.emotion,
          onEnd: () => resolve(),
        });
      });

      if (localCancelRef.current) break;
      const pauseMs = Math.max(200, Math.min(3000, (line.pauseAfterSec || 0.6) * 1000));
      if (i < validLines.length - 1) {
        await new Promise<void>((r) => setTimeout(r, pauseMs));
      }
    }

    setIsPlaying(false);
    onActiveLineChangeRef.current(null);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audioBase64) {
      if (isPlaying) {
        localCancelRef.current = true;
        stopLocalSpeech();
        setIsPlaying(false);
        onActiveLineChangeRef.current(null);
      }
      return;
    }
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
    } else {
      try {
        await safePlay(audio);
      } catch (err: any) {
        console.error(err);
        setStatusMessage(`Errore riproduzione: ${err.message}`);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !totalDuration) return;
    const target = Number(e.target.value);
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleRestart = async () => {
    const audio = audioRef.current;
    if (!audio || !audioBase64) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (audio.paused) {
      try {
        await safePlay(audio);
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  const handleGenerateAudio = async () => {
    if (isGenerating || lines.length === 0) return;
    setIsGenerating(true);
    setTransientStatus('Sintesi vocale in corso...', 0);
    localCancelRef.current = true;
    stopLocalSpeech();

    try {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
      }

      const response = await fetch('/api/tts/generate-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characters,
          lines,
        }),
      });

      if (response.status === 404) {
        setIsGenerating(false);
        void playLocalDialogueSequence();
        return;
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Errore durante la generazione audio');
      }

      const data = await response.json();
      const newCues: AudioCue[] = data.cues || [];
      cuesRef.current = newCues;
      lastActiveLineIdRef.current = null;
      onActiveLineChangeRef.current(null);

      setAudioBase64(data.audioBase64);
      setCues(newCues);
      setTotalDuration(data.totalDurationSec || 0);
      setCurrentTime(0);

      if (audio) {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        const nextUrl = base64ToMp3BlobUrl(data.audioBase64);
        blobUrlRef.current = nextUrl;

        audio.src = nextUrl;
        audio.currentTime = 0;
        const started = await safePlay(audio);
        if (started) {
          setTransientStatus('Audio generato con successo!', 3000);
        }
      } else {
        setTransientStatus('Audio generato con successo!', 3000);
      }
    } catch (error: any) {
      console.error(error);
      setTransientStatus(`Errore: ${error.message}`, 0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMp3 = () => {
    if (!audioBase64) return;
    const safeTitle = `dialogo_${characters.char1.name}_${characters.char2.name}`.toLowerCase();
    downloadBase64Mp3(audioBase64, safeTitle);
  };

  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    playbackRateRef.current = newRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const barCount = 48;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;
      const playingNow = isPlayingRef.current;
      const durationNow = totalDurationRef.current;
      const timeNow = currentTimeRef.current;
      const hasAudioNow = hasAudioRef.current;

      const styles = getComputedStyle(document.documentElement);
      const waveActive = styles.getPropertyValue('--wave-active').trim() || '#0f5c6e';
      const waveIdle = styles.getPropertyValue('--wave-idle').trim() || 'rgba(15, 92, 110, 0.35)';

      for (let i = 0; i < barCount; i++) {
        const progressRatio = durationNow > 0 ? timeNow / durationNow : 0;
        const barRatio = i / barCount;
        const isPast = barRatio <= progressRatio;

        let barHeight = 6;
        if (playingNow) {
          const wave = Math.sin(phase + i * 0.35) * Math.cos(phase * 0.8 + i * 0.2);
          barHeight = Math.max(6, Math.abs(wave) * (height - 8) + 4);
        } else if (hasAudioNow) {
          barHeight = Math.max(4, Math.sin(i * 0.4) * (height * 0.35) + height * 0.2);
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        ctx.fillStyle = isPast
          ? waveActive
          : playingNow
          ? waveActive
          : waveIdle;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (playingNow) {
        phase += 0.12;
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const activeCue = cues.find((c) => currentTime >= c.startSec && currentTime <= c.endSec);
  const activeSpeaker = activeCue ? characters[activeCue.characterId as 'char1' | 'char2'] : null;

  return (
    <div className="border-t-2 border-[var(--chrome-border)] bg-[var(--chrome-bg)] sticky bottom-0 z-40 transition-colors shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Zone: Main Generate & Download CTAs */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={handleGenerateAudio}
              disabled={isGenerating || lines.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm text-[#16192c] bg-[var(--bg-highlight)] hover:brightness-95 disabled:opacity-50 transition-all active:scale-98 whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sintesi in corso...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#78350f]" />
                  <span>{audioBase64 ? 'Rigenera Audio' : 'Crea Audio Dialogo'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMp3}
              disabled={!audioBase64 || isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-[#ecfdf5] bg-[#0f766e] hover:bg-[#0d625b] border border-emerald-300/30 disabled:opacity-40 transition-all whitespace-nowrap"
              title="Scarica il file MP3 del dialogo sul tuo computer"
            >
              <Download className="w-4 h-4" />
              <span>Scarica MP3</span>
            </button>
          </div>

          {/* Middle Zone: Playback Controls & Waveform Scrubber */}
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
            {/* Play/Pause & Restart Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRestart}
                disabled={!audioBase64}
                title="Ricomincia dall'inizio"
                className="p-2.5 rounded-xl text-[var(--chrome-ink)] hover:bg-white/10 transition-colors disabled:opacity-35"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={(!audioBase64 && !isPlaying) || isGenerating}
                className="w-11 h-11 rounded-full bg-[var(--bg-highlight)] hover:brightness-95 text-[#16192c] flex items-center justify-center transition-all active:scale-95 disabled:opacity-35"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Waveform & Scrubber */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <div className="relative w-full h-8 flex items-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={32}
                  className="w-full h-full pointer-events-none rounded"
                />
                <input
                  type="range"
                  min="0"
                  max={totalDuration || 1}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!audioBase64}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>

              {/* Time Indicators & Current Speaker Info */}
              <div className="flex items-center justify-between text-sm font-mono tabular-nums font-bold text-[var(--chrome-ink)] px-0.5">
                <span>{formatTime(currentTime)}</span>

                {activeSpeaker ? (
                  <span className="font-sans text-sm font-extrabold text-[var(--bg-highlight)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--bg-highlight)] animate-pulse" />
                    <span>Voce: {activeSpeaker.name}</span>
                  </span>
                ) : (
                  <span className="font-sans text-sm font-semibold text-[var(--chrome-muted)]">
                    {lines.length} battute · Sintesi Neurale Senza AI
                  </span>
                )}

                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Playback Speed selector */}
            <div className="hidden lg:flex items-center p-1 bg-[var(--chrome-pill)] rounded-xl text-sm font-bold shrink-0 border border-white/15">
              {[0.8, 1.0, 1.25].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleRateChange(rate)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    playbackRate === rate
                      ? 'bg-[var(--bg-highlight)] text-[#16192c] font-extrabold'
                      : 'text-[var(--chrome-ink)] hover:bg-white/10'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div className="mt-2.5 text-sm font-extrabold text-center text-[var(--bg-highlight)] transition-all">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
};
