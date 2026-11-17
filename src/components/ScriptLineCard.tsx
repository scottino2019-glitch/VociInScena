import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader2, ChevronUp, ChevronDown, Copy, Trash2, Sliders, Clock } from 'lucide-react';
import { Character, DialogueLine } from '../types';
import { EMOTIONS } from '../constants/presets';
import { base64ToMp3BlobUrl } from '../utils/audio';

interface ScriptLineCardProps {
  line: DialogueLine;
  index: number;
  totalLines: number;
  characters: Record<'char1' | 'char2', Character>;
  isActive: boolean;
  onUpdate: (updated: Partial<DialogueLine>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ScriptLineCard: React.FC<ScriptLineCardProps> = ({
  line,
  index,
  totalLines,
  characters,
  isActive,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}) => {
  const [isPlayingSolo, setIsPlayingSolo] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const speaker = characters[line.characterId];

  const handleSoloPlay = async () => {
    if (isPlayingSolo) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingSolo(false);
      return;
    }

    if (!line.text.trim()) return;
    setIsPlayingSolo(true);

    try {
      const response = await fetch('/api/tts/preview-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: line.text.trim(),
          voice: speaker.voice,
          pitchHz: (speaker.defaultPitch || 0) + (line.pitchOffset || 0),
          ratePct: (speaker.defaultRate || 0) + (line.rateOffset || 0),
          volumePct: line.volumeOffset || 0,
          emotion: line.emotion,
        }),
      });

      if (!response.ok) throw new Error('Errore anteprima battuta');
      const data = await response.json();

      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      const url = base64ToMp3BlobUrl(data.audioBase64);
      blobUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingSolo(false);
      audio.onpause = () => setIsPlayingSolo(false);
      audio.onerror = () => setIsPlayingSolo(false);

      try {
        await audio.play();
      } catch (playErr: any) {
        if (playErr?.name === 'AbortError' || playErr?.name === 'NotAllowedError') {
          setIsPlayingSolo(false);
          return;
        }
        throw playErr;
      }
    } catch (err) {
      console.warn('Fallback SpeechSynthesis:', err);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(line.text);
        utt.lang = speaker.voice.slice(0, 5) || 'it-IT';
        utt.pitch = 1 + ((speaker.defaultPitch || 0) + (line.pitchOffset || 0)) / 40;
        utt.rate = 1 + ((speaker.defaultRate || 0) + (line.rateOffset || 0)) / 50;
        utt.onend = () => setIsPlayingSolo(false);
        utt.onerror = () => setIsPlayingSolo(false);
        window.speechSynthesis.speak(utt);
      } else {
        setIsPlayingSolo(false);
      }
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-200 bg-[var(--bg-card)] ${
        isActive
          ? 'border-[var(--accent-control)] ring-2 ring-[var(--accent-control)]/45'
          : 'border-[var(--border-card)] hover:border-[var(--border-strong)]'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Top bar of the line: Index, Speaker Selector, and Row Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            {/* Number index */}
            <span className="font-mono text-sm font-extrabold text-[var(--ink-main)] w-7">
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Speaker Selector Toggle */}
            <div className="flex items-center p-1 bg-[var(--bg-subtle)] rounded-xl text-sm border border-[var(--border-card)]">
              <button
                type="button"
                onClick={() => onUpdate({ characterId: 'char1' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  line.characterId === 'char1'
                    ? 'bg-[var(--btn-primary)] text-[var(--btn-ink)]'
                    : 'text-[var(--ink-main)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <span>{characters.char1.gender === 'male' ? '👨' : '👩'}</span>
                <span className="truncate max-w-[140px]">{characters.char1.name}</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ characterId: 'char2' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  line.characterId === 'char2'
                    ? 'bg-[var(--btn-primary)] text-[var(--btn-ink)]'
                    : 'text-[var(--ink-main)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <span>{characters.char2.gender === 'male' ? '👨' : '👩'}</span>
                <span className="truncate max-w-[140px]">{characters.char2.name}</span>
              </button>
            </div>
          </div>

          {/* Quick Line Actions (Solo Play, Move, Duplicate, Delete) */}
          <div className="flex items-center gap-1.5 text-[var(--ink-main)]">
            <button
              type="button"
              onClick={handleSoloPlay}
              disabled={isPlayingSolo || !line.text.trim()}
              title="Ascolta questa battuta"
              className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-40"
            >
              {isPlayingSolo ? (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--btn-primary)]" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              title="Personalizza tono, ritmo e pause per questa battuta"
              className={`p-2 rounded-lg transition-colors ${
                showAdvanced
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-ink)]'
                  : 'hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              title="Sposta su"
              className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-30"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === totalLines - 1}
              title="Sposta giù"
              className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplica battuta"
              className="p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={totalLines <= 1}
              title="Elimina battuta"
              className="p-2 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Line Text Input */}
        <textarea
          rows={2}
          value={line.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder={`Cosa dice ${speaker.name}? Scrivi qui la battuta del dialogo...`}
          className="w-full text-base leading-relaxed font-semibold text-[var(--ink-main)] bg-[var(--bg-input)] border-2 border-[var(--border-card)] rounded-xl p-3.5 focus:border-[var(--border-strong)] outline-hidden transition-all resize-y placeholder:text-[var(--ink-muted)]"
        />

        {/* Emotion Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm font-bold text-[var(--ink-main)] mr-1">
            Enfasi Emotiva:
          </span>
          {EMOTIONS.map((emo) => {
            const isSelected = line.emotion === emo.id;
            return (
              <button
                key={emo.id}
                type="button"
                onClick={() => onUpdate({ emotion: emo.id })}
                title={emo.description}
                className={`text-sm px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? `${emo.badgeClass} border-transparent`
                    : 'text-[var(--ink-main)] bg-[var(--bg-subtle)] border-[var(--border-card)] hover:bg-[var(--bg-selected)]'
                }`}
              >
                <span>{emo.emoji}</span>
                <span>{emo.label}</span>
              </button>
            );
          })}
        </div>

        {/* Advanced Acoustic Fine-Tuning Drawer */}
        {showAdvanced && (
          <div className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-[var(--bg-subtle)] p-4 rounded-xl border border-[var(--border-card)]">
            {/* Pitch Offset */}
            <div>
              <div className="flex justify-between mb-1.5 font-bold text-[var(--ink-main)]">
                <span>Variazione Tono</span>
                <span className="font-mono tabular-nums">
                  {line.pitchOffset > 0 ? `+${line.pitchOffset}` : line.pitchOffset} Hz
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                value={line.pitchOffset}
                onChange={(e) => onUpdate({ pitchOffset: Number(e.target.value) })}
                className="w-full h-2 bg-[var(--bg-card)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-control)]"
              />
              <div className="flex justify-between text-sm font-bold text-[var(--ink-muted)] mt-1">
                <span>-25 Hz</span>
                <span>+25 Hz</span>
              </div>
            </div>

            {/* Rate Offset */}
            <div>
              <div className="flex justify-between mb-1.5 font-bold text-[var(--ink-main)]">
                <span>Variazione Ritmo</span>
                <span className="font-mono tabular-nums">
                  {line.rateOffset > 0 ? `+${line.rateOffset}` : line.rateOffset}%
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="35"
                step="2"
                value={line.rateOffset}
                onChange={(e) => onUpdate({ rateOffset: Number(e.target.value) })}
                className="w-full h-2 bg-[var(--bg-card)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-control)]"
              />
              <div className="flex justify-between text-sm font-bold text-[var(--ink-muted)] mt-1">
                <span>Più lento</span>
                <span>Più veloce</span>
              </div>
            </div>

            {/* Pause After Line */}
            <div>
              <div className="flex justify-between mb-1.5 font-bold text-[var(--ink-main)]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                  <span>Pausa dopo</span>
                </span>
                <span className="font-mono tabular-nums">{line.pauseAfterSec.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={line.pauseAfterSec}
                onChange={(e) => onUpdate({ pauseAfterSec: Number(e.target.value) })}
                className="w-full h-2 bg-[var(--bg-card)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-control)]"
              />
              <div className="flex justify-between text-sm font-bold text-[var(--ink-muted)] mt-1">
                <span>0.2s</span>
                <span>2.5s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
