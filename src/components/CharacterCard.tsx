import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Character, Gender } from '../types';
import { VOICES, COLOR_CONFIGS } from '../constants/presets';
import { base64ToMp3BlobUrl } from '../utils/audio';

interface CharacterCardProps {
  character: Character;
  onUpdate: (updated: Partial<Character>) => void;
  label: string;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onUpdate, label }) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const colorScheme = COLOR_CONFIGS[character.color] || COLOR_CONFIGS.indigo;

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

  const matchingVoices = VOICES.filter((v) => v.gender === character.gender);

  const handleTestVoice = async () => {
    if (isPlayingTest) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);

    let testPhrase = `Ciao, sono ${character.name || (character.gender === 'male' ? 'Marco' : 'Giulia')}, pronto per il dialogo.`;
    const v = character.voice || '';
    if (v.startsWith('ja-')) {
      testPhrase = `こんにちは、${character.name || '圭太'}です。よろしくお願いします。`;
    } else if (v.startsWith('ko-')) {
      testPhrase = `안녕하세요, 저는 ${character.name || '인준'}입니다. 만나서 반가워요.`;
    } else if (v.startsWith('zh-')) {
      testPhrase = `你好，我是${character.name || '云希'}，很高兴和你对话。`;
    } else if (v.startsWith('hi-')) {
      testPhrase = `नमस्ते, मैं ${character.name || 'मधुर'} हूँ, बातचीत के लिए तैयार हूँ।`;
    } else if (v.startsWith('vi-')) {
      testPhrase = `Xin chào, tôi là ${character.name || 'Nam Minh'}, sẵn sàng trò chuyện.`;
    } else if (v.startsWith('th-')) {
      testPhrase = `สวัสดี ฉันชื่อ ${character.name || 'นิวัฒน์'} พร้อมสำหรับการสนทนาแล้ว`;
    } else if (v.startsWith('ar-')) {
      testPhrase = `مرحباً، أنا ${character.name || 'حامد'}، جاهز للمحادثة.`;
    } else if (v.startsWith('en-')) {
      testPhrase = `Hello, I'm ${character.name || 'Guy'}, ready for our dialogue.`;
    } else if (v.startsWith('es-')) {
      testPhrase = `Hola, soy ${character.name || 'Álvaro'}, listo para el diálogo.`;
    } else if (v.startsWith('fr-')) {
      testPhrase = `Bonjour, je suis ${character.name || 'Henri'}, prêt pour le dialogue.`;
    } else if (v.startsWith('de-')) {
      testPhrase = `Hallo, ich bin ${character.name || 'Conrad'}, bereit für den Dialog.`;
    }

    try {
      const response = await fetch('/api/tts/preview-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testPhrase,
          voice: character.voice,
          pitchHz: character.defaultPitch,
          ratePct: character.defaultRate,
          volumePct: 0,
          emotion: 'neutro',
        }),
      });

      if (!response.ok) throw new Error('Errore durante la prova vocale');
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
      audio.onended = () => setIsPlayingTest(false);
      audio.onpause = () => setIsPlayingTest(false);
      audio.onerror = () => setIsPlayingTest(false);

      try {
        await audio.play();
      } catch (playErr: any) {
        if (playErr?.name === 'AbortError' || playErr?.name === 'NotAllowedError') {
          setIsPlayingTest(false);
          return;
        }
        throw playErr;
      }
    } catch (err) {
      console.warn('Fallback preview with SpeechSynthesis:', err);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(testPhrase);
        utt.lang = character.voice.slice(0, 5) || 'it-IT';
        utt.pitch = 1 + character.defaultPitch / 40;
        utt.rate = 1 + character.defaultRate / 50;
        utt.onend = () => setIsPlayingTest(false);
        utt.onerror = () => setIsPlayingTest(false);
        window.speechSynthesis.speak(utt);
      } else {
        setIsPlayingTest(false);
      }
    }
  };

  const handleGenderChange = (newGender: Gender) => {
    const defaultVoice = VOICES.find((v) => v.gender === newGender)?.id || character.voice;
    onUpdate({
      gender: newGender,
      voice: defaultVoice,
      name:
        character.name === 'Marco' && newGender === 'female'
          ? 'Giulia'
          : character.name === 'Giulia' && newGender === 'male'
          ? 'Marco'
          : character.name,
    });
  };

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border-2 ${colorScheme.border} bg-[var(--bg-card)] transition-all`}>
      {/* Header with avatar, label and test button */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-11 h-11 rounded-xl ${colorScheme.avatarBg} flex items-center justify-center font-bold text-lg shrink-0`}>
            {character.gender === 'male' ? '👨' : '👩'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-extrabold tracking-wide text-[var(--ink-muted)] uppercase">
              {label}
            </div>
            <input
              type="text"
              value={character.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="text-lg font-extrabold text-[var(--ink-main)] bg-transparent border-b-2 border-transparent hover:border-[var(--border-card)] focus:border-[var(--border-strong)] outline-hidden transition-colors px-0 py-0.5 w-full"
              placeholder="Nome personaggio..."
            />
          </div>
        </div>

        {/* Solo test button */}
        <button
          type="button"
          onClick={handleTestVoice}
          disabled={isPlayingTest}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${colorScheme.accent}`}
          title="Ascolta una frase di prova per questo personaggio"
        >
          {isPlayingTest ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>In ascolto...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Prova Voce</span>
            </>
          )}
        </button>
      </div>

      {/* Gender & Voice Select */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Gender Toggle */}
        <div>
          <label className="block text-sm font-bold text-[var(--ink-main)] mb-2">
            Genere
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-card)]">
            <button
              type="button"
              onClick={() => handleGenderChange('male')}
              className={`py-2 text-sm font-bold rounded-lg transition-all text-center ${
                character.gender === 'male'
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-ink)]'
                  : 'text-[var(--ink-main)] hover:bg-[var(--bg-card)]'
              }`}
            >
              👨 Maschile
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('female')}
              className={`py-2 text-sm font-bold rounded-lg transition-all text-center ${
                character.gender === 'female'
                  ? 'bg-[var(--btn-primary)] text-[var(--btn-ink)]'
                  : 'text-[var(--ink-main)] hover:bg-[var(--bg-card)]'
              }`}
            >
              👩 Femminile
            </button>
          </div>
        </div>

        {/* Voice Selector */}
        <div>
          <label className="block text-sm font-bold text-[var(--ink-main)] mb-2">
            Voce Sintetica Neurale
          </label>
          <select
            value={character.voice}
            onChange={(e) => onUpdate({ voice: e.target.value })}
            className="w-full text-sm font-semibold py-2.5 px-3 rounded-xl border-2 border-[var(--border-card)] bg-[var(--bg-input)] text-[var(--ink-main)] focus:border-[var(--accent-control)] outline-hidden"
          >
            {/* Italian */}
            <optgroup label="🇮🇹 Italiano">
              {matchingVoices
                .filter((v) => v.lang === 'it-IT')
                .map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
            </optgroup>

            {/* Eastern Languages */}
            <optgroup label="🌏 Lingue Orientali & Asiatiche">
              {matchingVoices
                .filter((v) =>
                  ['ja-JP', 'ko-KR', 'zh-CN', 'zh-HK', 'vi-VN', 'th-TH', 'hi-IN', 'ar-SA'].includes(v.lang)
                )
                .map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.langLabel})
                  </option>
                ))}
            </optgroup>

            {/* Other European Languages */}
            <optgroup label="🌍 Altre Lingue">
              {matchingVoices
                .filter((v) =>
                  ['en-US', 'es-ES', 'fr-FR', 'de-DE'].includes(v.lang)
                )
                .map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} ({voice.langLabel})
                  </option>
                ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Sliders: Base Pitch & Base Rate */}
      <div className="space-y-4 pt-4 border-t border-[var(--border-card)]">
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-[var(--ink-main)] font-bold">
              Tono Base (Altezza Vocale)
            </span>
            <span className="font-mono tabular-nums font-bold text-[var(--ink-main)]">
              {character.defaultPitch > 0 ? `+${character.defaultPitch}` : character.defaultPitch} Hz
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={character.defaultPitch}
            onChange={(e) => onUpdate({ defaultPitch: Number(e.target.value) })}
            className="w-full h-2 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-control)]"
          />
          <div className="flex justify-between text-sm font-bold text-[var(--ink-muted)] mt-1">
            <span>Profondo / Grave</span>
            <span>Naturale</span>
            <span>Squillante / Acuto</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-[var(--ink-main)] font-bold">
              Ritmo Base (Velocità)
            </span>
            <span className="font-mono tabular-nums font-bold text-[var(--ink-main)]">
              {character.defaultRate > 0 ? `+${character.defaultRate}` : character.defaultRate}%
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="40"
            step="2"
            value={character.defaultRate}
            onChange={(e) => onUpdate({ defaultRate: Number(e.target.value) })}
            className="w-full h-2 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-control)]"
          />
          <div className="flex justify-between text-sm font-bold text-[var(--ink-muted)] mt-1">
            <span>Lento / Riflessivo</span>
            <span>Normale</span>
            <span>Veloce / Dinamico</span>
          </div>
        </div>
      </div>
    </div>
  );
};
