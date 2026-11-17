import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader2, Square } from 'lucide-react';
import { Character, Gender, VoiceOption } from '../types';
import { VOICES, COLOR_CONFIGS } from '../constants/presets';
import { base64ToMp3BlobUrl, speakLocal, stopLocalSpeech } from '../utils/audio';
import { getVoiceLang, isBrowserVoiceId, pickBestDeviceVoice } from '../hooks/useDeviceVoices';

interface CharacterCardProps {
  character: Character;
  onUpdate: (updated: Partial<Character>) => void;
  label: string;
  deviceVoices: VoiceOption[];
  backendAvailable: boolean;
  onBackendUnavailable?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onUpdate,
  label,
  deviceVoices,
  backendAvailable,
  onBackendUnavailable,
}) => {
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

  const buildTestPhrase = (langCode: string) => {
    const prefix = (langCode || 'it').split('-')[0].toLowerCase();
    const charName = character.name || (character.gender === 'male' ? 'Marco' : 'Giulia');
    if (prefix === 'ja') return `こんにちは、${character.name || '圭太'}です。よろしくお願いします。`;
    if (prefix === 'ko') return `안녕하세요, 저는 ${character.name || '인준'}입니다. 만나서 반가워요.`;
    if (prefix === 'zh') return `你好，我是${character.name || '云希'}，很高兴和你对话。`;
    if (prefix === 'hi') return `नमस्ते, मैं ${character.name || 'मधुर'} हूँ, बातचीत के लिए तैयार हूँ।`;
    if (prefix === 'vi') return `Xin chào, tôi là ${character.name || 'Nam Minh'}, sẵn sàng trò chuyện.`;
    if (prefix === 'th') return `สวัสดี ฉันชื่อ ${character.name || 'นิวัฒน์'} พร้อมสำหรับการสนทนาแล้ว`;
    if (prefix === 'ar') return `مرحباً، أنا ${character.name || 'حامد'}، جاهز للمحادثة.`;
    if (prefix === 'en') return `Hello, I'm ${charName}, ready for our dialogue.`;
    if (prefix === 'es') return `Hola, soy ${charName}, listo para el diálogo.`;
    if (prefix === 'fr') return `Bonjour, je suis ${charName}, prêt pour le dialogue.`;
    if (prefix === 'de') return `Hallo, ich bin ${charName}, bereit für den Dialog.`;
    return `Ciao, sono ${charName}, pronto per il dialogo.`;
  };

  const handleTestVoice = () => {
    if (isPlayingTest) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopLocalSpeech();
      setIsPlayingTest(false);
      return;
    }

    const lang = getVoiceLang(character.voice, deviceVoices);
    const testPhrase = buildTestPhrase(lang);
    setIsPlayingTest(true);

    // Always speak synchronously inside click handler for Google/Android device voices or when server API is absent
    if (isBrowserVoiceId(character.voice) || !backendAvailable) {
      speakLocal(testPhrase, {
        voiceId: character.voice,
        lang,
        pitch: character.defaultPitch,
        rate: character.defaultRate,
        gender: character.gender,
        onEnd: () => setIsPlayingTest(false),
      });
      return;
    }

    void (async () => {
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

        if (response.status === 404) {
          onBackendUnavailable?.();
        }

        if (!response.ok) {
          speakLocal(testPhrase, {
            voiceId: character.voice,
            lang,
            pitch: character.defaultPitch,
            rate: character.defaultRate,
            gender: character.gender,
            onEnd: () => setIsPlayingTest(false),
          });
          return;
        }

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
      } catch {
        stopLocalSpeech();
        speakLocal(testPhrase, {
          voiceId: character.voice,
          lang,
          pitch: character.defaultPitch,
          rate: character.defaultRate,
          gender: character.gender,
          onEnd: () => setIsPlayingTest(false),
        });
      }
    })();
  };

  const handleGenderChange = (newGender: Gender) => {
    let nextVoice = character.voice;
    if (isBrowserVoiceId(character.voice) && deviceVoices.length > 0) {
      const curLang = getVoiceLang(character.voice, deviceVoices);
      nextVoice = pickBestDeviceVoice(deviceVoices, curLang, newGender)?.id || character.voice;
    } else {
      nextVoice = VOICES.find((v) => v.gender === newGender)?.id || character.voice;
    }

    onUpdate({
      gender: newGender,
      voice: nextVoice,
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${colorScheme.accent}`}
          title={isPlayingTest ? 'Ferma prova voce' : 'Ascolta una frase di prova per questo personaggio'}
        >
          {isPlayingTest ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Ferma</span>
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
            Voce (Google / Android / Neurale)
          </label>
          <select
            value={character.voice}
            onChange={(e) => onUpdate({ voice: e.target.value })}
            className="w-full text-sm font-semibold py-2.5 px-3 rounded-xl border-2 border-[var(--border-card)] bg-[var(--bg-input)] text-[var(--ink-main)] focus:border-[var(--accent-control)] outline-hidden"
          >
            {/* Device Google & Android Voices */}
            {deviceVoices.length > 0 && (
              <optgroup label="📱 Voci Google & Android (Dispositivo - Istantanee)">
                {deviceVoices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} — {voice.langLabel}
                  </option>
                ))}
              </optgroup>
            )}

            {/* Italian Server Voices */}
            <optgroup label="🇮🇹 Italiano (Server MP3 & Google TTS)">
              {matchingVoices
                .filter((v) => v.lang === 'it-IT')
                .map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
            </optgroup>

            {/* Eastern Languages */}
            <optgroup label="🌏 Lingue Orientali & Asiatiche (Server MP3)">
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
            <optgroup label="🌍 Altre Lingue (Server MP3)">
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
