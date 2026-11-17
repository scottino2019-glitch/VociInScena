/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CharacterCard } from './components/CharacterCard';
import { ScriptLineCard } from './components/ScriptLineCard';
import { ScriptImportModal } from './components/ScriptImportModal';
import { PresetsModal } from './components/PresetsModal';
import { PlayerBar } from './components/PlayerBar';
import { Character, DialogueLine, ThemeMode } from './types';
import { SAMPLE_PRESETS } from './constants/presets';
import { PlusCircle, Sparkles, MessageSquare, Mic, SlidersHorizontal } from 'lucide-react';

export default function App() {
  // High-contrast multi-hue palette: rich indigo chrome, clear sky canvas, soft lilac cards, deep charcoal ink
  const [theme, setTheme] = useState<ThemeMode>('indigo');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [pairingType, setPairingType] = useState<'mf' | 'ff' | 'mm'>('mf');
  const [activePresetId, setActivePresetId] = useState<string>(SAMPLE_PRESETS[0].id);

  const [characters, setCharacters] = useState<Record<'char1' | 'char2', Character>>({
    char1: {
      id: 'char1',
      name: 'Marco',
      gender: 'male',
      voice: 'it-IT-DiegoNeural',
      defaultPitch: 0,
      defaultRate: 0,
      color: 'indigo',
    },
    char2: {
      id: 'char2',
      name: 'Giulia',
      gender: 'female',
      voice: 'it-IT-ElsaNeural',
      defaultPitch: 0,
      defaultRate: 0,
      color: 'rose',
    },
  });

  const [lines, setLines] = useState<DialogueLine[]>(() => {
    const initialPreset = SAMPLE_PRESETS[0];
    return initialPreset.lines.map((l, idx) => ({
      id: `line-${Date.now()}-${idx}`,
      characterId: l.characterId,
      text: l.text,
      emotion: l.emotion,
      pitchOffset: 0,
      rateOffset: 0,
      volumeOffset: 0,
      pauseAfterSec: l.pauseAfterSec || 0.6,
    }));
  });

  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);

  const handleQuickPairing = (type: 'mf' | 'ff' | 'mm') => {
    setPairingType(type);
    if (type === 'mf') {
      setCharacters({
        char1: {
          id: 'char1',
          name: 'Marco',
          gender: 'male',
          voice: 'it-IT-DiegoNeural',
          defaultPitch: 0,
          defaultRate: 0,
          color: 'indigo',
        },
        char2: {
          id: 'char2',
          name: 'Giulia',
          gender: 'female',
          voice: 'it-IT-ElsaNeural',
          defaultPitch: 0,
          defaultRate: 0,
          color: 'rose',
        },
      });
    } else if (type === 'ff') {
      setCharacters({
        char1: {
          id: 'char1',
          name: 'Elena',
          gender: 'female',
          voice: 'it-IT-ElsaNeural',
          defaultPitch: 0,
          defaultRate: 0,
          color: 'rose',
        },
        char2: {
          id: 'char2',
          name: 'Sofia',
          gender: 'female',
          voice: 'it-IT-IsabellaNeural',
          defaultPitch: 0,
          defaultRate: 0,
          color: 'emerald',
        },
      });
    } else if (type === 'mm') {
      setCharacters({
        char1: {
          id: 'char1',
          name: 'Matteo',
          gender: 'male',
          voice: 'it-IT-DiegoNeural',
          defaultPitch: 0,
          defaultRate: 0,
          color: 'indigo',
        },
        char2: {
          id: 'char2',
          name: 'Luca',
          gender: 'male',
          voice: 'it-IT-GiuseppeNeural',
          defaultPitch: 0,
          defaultRate: 0,
          color: 'amber',
        },
      });
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(preset.id);
    setPairingType(preset.pairingType);
    setCharacters({
      char1: {
        id: 'char1',
        name: preset.char1.name,
        gender: preset.char1.gender,
        voice: preset.char1.voice,
        defaultPitch: 0,
        defaultRate: 0,
        color: preset.char1.color,
      },
      char2: {
        id: 'char2',
        name: preset.char2.name,
        gender: preset.char2.gender,
        voice: preset.char2.voice,
        defaultPitch: 0,
        defaultRate: 0,
        color: preset.char2.color,
      },
    });

    setLines(
      preset.lines.map((l, idx) => ({
        id: `line-${Date.now()}-${idx}`,
        characterId: l.characterId,
        text: l.text,
        emotion: l.emotion,
        pitchOffset: 0,
        rateOffset: 0,
        volumeOffset: 0,
        pauseAfterSec: l.pauseAfterSec || 0.6,
      }))
    );
  };

  const handleAddNewLine = () => {
    const lastLine = lines[lines.length - 1];
    const nextChar = lastLine && lastLine.characterId === 'char1' ? 'char2' : 'char1';

    const newLine: DialogueLine = {
      id: `line-${Date.now()}`,
      characterId: nextChar,
      text: '',
      emotion: 'neutro',
      pitchOffset: 0,
      rateOffset: 0,
      volumeOffset: 0,
      pauseAfterSec: 0.6,
    };
    setLines([...lines, newLine]);
  };

  const handleUpdateLine = (index: number, updated: Partial<DialogueLine>) => {
    const copy = [...lines];
    copy[index] = { ...copy[index], ...updated };
    setLines(copy);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const copy = [...lines];
    const temp = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = temp;
    setLines(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index >= lines.length - 1) return;
    const copy = [...lines];
    const temp = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = temp;
    setLines(copy);
  };

  const handleDuplicate = (index: number) => {
    const lineToDup = lines[index];
    const duplicated: DialogueLine = {
      ...lineToDup,
      id: `line-${Date.now()}`,
    };
    const copy = [...lines];
    copy.splice(index + 1, 0, duplicated);
    setLines(copy);
  };

  const handleDelete = (index: number) => {
    if (lines.length <= 1) return;
    const copy = lines.filter((_, idx) => idx !== index);
    setLines(copy);
  };

  const handleImportParsed = (
    newLines: DialogueLine[],
    updatedChars?: { char1Name?: string; char2Name?: string }
  ) => {
    setLines(newLines);
    if (updatedChars) {
      setCharacters((prev) => ({
        char1: updatedChars.char1Name ? { ...prev.char1, name: updatedChars.char1Name } : prev.char1,
        char2: updatedChars.char2Name ? { ...prev.char2, name: updatedChars.char2Name } : prev.char2,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--ink-main)] transition-colors">
      {/* Top Bar Navigation */}
      <Header
        theme={theme}
        onChangeTheme={setTheme}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
        onAddNewLine={handleAddNewLine}
        currentPairing={pairingType}
        onQuickPairing={handleQuickPairing}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner: Non-AI Synthesis Specs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 bg-[var(--bg-card)] border-2 border-[var(--border-card)] rounded-2xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--btn-primary)] text-[var(--btn-ink)] flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-[var(--ink-main)]">
                Sintesi Vocale Diretta Senza AI
              </div>
              <div className="text-sm font-medium text-[var(--ink-muted)] leading-relaxed">
                Audio realistico per Italiano, Giapponese, Coreano, Cinese (Manhua), Hindi, Arabo e altre lingue. Esportabile in MP3 con tono, ritmo ed enfasi emotiva.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-mono tabular-nums font-bold text-[var(--ink-main)] shrink-0">
            <span>{lines.length} battute</span>
            <span>·</span>
            <span>{lines.reduce((acc, l) => acc + (l.text ? l.text.split(/\s+/).length : 0), 0)} parole</span>
          </div>
        </div>

        {/* Always-Visible Quick Presets Grid ("Scenari di Esempio Pronti") */}
        <section aria-label="Esempi Pronti">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-[var(--chrome-ink)] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--bg-highlight)]" />
              <span>Scenari di Esempio Pronti (Clicca per Caricare)</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-[var(--bg-selected)] border-[var(--btn-primary)]'
                      : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="text-base font-extrabold text-[var(--ink-main)]">
                    {preset.title}
                  </div>
                  <div className="text-sm font-semibold text-[var(--ink-muted)] mt-1 leading-snug">
                    {preset.description}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Characters Setup Grid */}
        <section aria-label="Configurazione Personaggi">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-extrabold text-[var(--chrome-ink)] uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[var(--bg-highlight)]" />
              <span>I Due Personaggi del Dialogo</span>
            </h2>
            <span className="text-sm font-semibold text-[var(--chrome-muted)]">
              Modifica nome, voce e impostazioni acustiche base
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CharacterCard
              character={characters.char1}
              onUpdate={(updated) =>
                setCharacters((prev) => ({
                  ...prev,
                  char1: { ...prev.char1, ...updated },
                }))
              }
              label="Personaggio 1"
            />
            <CharacterCard
              character={characters.char2}
              onUpdate={(updated) =>
                setCharacters((prev) => ({
                  ...prev,
                  char2: { ...prev.char2, ...updated },
                }))
              }
              label="Personaggio 2"
            />
          </div>
        </section>

        {/* Script & Timeline Section */}
        <section aria-label="Copione del Dialogo">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-[var(--chrome-ink)] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--bg-highlight)]" />
              <span>Copione &amp; Battute Vocali</span>
            </h2>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="text-sm font-bold text-[var(--bg-highlight)] hover:underline"
            >
              Incolla testo completo
            </button>
          </div>

          {/* List of Dialogue Line Cards */}
          <div className="space-y-3.5">
            {lines.map((line, index) => (
              <ScriptLineCard
                key={line.id}
                line={line}
                index={index}
                totalLines={lines.length}
                characters={characters}
                isActive={activeLineId === line.id}
                onUpdate={(updated) => handleUpdateLine(index, updated)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                onDuplicate={() => handleDuplicate(index)}
                onDelete={() => handleDelete(index)}
              />
            ))}
          </div>

          {/* Quick Add Line Bar */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 py-4 bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-card)] rounded-2xl hover:border-[var(--border-strong)] transition-colors">
            <button
              type="button"
              onClick={() => {
                const newLine: DialogueLine = {
                  id: `line-${Date.now()}`,
                  characterId: 'char1',
                  text: '',
                  emotion: 'neutro',
                  pitchOffset: 0,
                  rateOffset: 0,
                  volumeOffset: 0,
                  pauseAfterSec: 0.6,
                };
                setLines([...lines, newLine]);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--ink-main)] hover:bg-[var(--bg-subtle)] rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-[var(--accent-control)]" />
              <span>+ Battuta per {characters.char1.name}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const newLine: DialogueLine = {
                  id: `line-${Date.now()}`,
                  characterId: 'char2',
                  text: '',
                  emotion: 'neutro',
                  pitchOffset: 0,
                  rateOffset: 0,
                  volumeOffset: 0,
                  pauseAfterSec: 0.6,
                };
                setLines([...lines, newLine]);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--ink-main)] hover:bg-[var(--bg-subtle)] rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-[#e85d8a]" />
              <span>+ Battuta per {characters.char2.name}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Floating / Pinned Master Audio Player Console */}
      <PlayerBar
        characters={characters}
        lines={lines}
        onActiveLineChange={setActiveLineId}
      />

      {/* Centered Presets Modal ("Carica Esempi") */}
      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
      />

      {/* Import / Export Script Modal */}
      <ScriptImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        characters={characters}
        lines={lines}
        onImport={handleImportParsed}
      />
    </div>
  );
}
