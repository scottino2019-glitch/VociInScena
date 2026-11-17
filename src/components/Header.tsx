import React from 'react';
import { Volume2, FileText, Sparkles, PlusCircle } from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  onOpenPresets: () => void;
  onOpenImport: () => void;
  onAddNewLine: () => void;
  currentPairing: 'mf' | 'ff' | 'mm';
  onQuickPairing: (type: 'mf' | 'ff' | 'mm') => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onChangeTheme,
  onOpenPresets,
  onOpenImport,
  onAddNewLine,
  currentPairing,
  onQuickPairing,
}) => {
  return (
    <header className="border-b-2 border-[var(--chrome-border)] bg-[var(--chrome-bg)] transition-colors sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-highlight)] text-[#16192c] flex items-center justify-center shadow-xs">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-[var(--chrome-ink)] tracking-tight block leading-tight whitespace-nowrap">
              VociInScena
            </span>
            <span className="text-sm text-[var(--chrome-muted)] font-bold hidden sm:block whitespace-nowrap">
              Studio Dialoghi Vocali Senza AI
            </span>
          </div>
        </div>

        {/* Zone 2: Quick Gender Pairing Tabs */}
        <div className="flex items-center p-1 bg-[var(--chrome-pill)] rounded-xl text-sm font-bold overflow-x-auto max-w-full border border-white/15">
          <button
            type="button"
            onClick={() => onQuickPairing('mf')}
            title="Dialogo tra Maschile e Femminile"
            className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              currentPairing === 'mf'
                ? 'bg-[var(--bg-highlight)] text-[#16192c] font-extrabold'
                : 'text-[var(--chrome-ink)] hover:bg-white/10'
            }`}
          >
            👨 Maschio + 👩 Femmina
          </button>
          <button
            type="button"
            onClick={() => onQuickPairing('ff')}
            title="Dialogo tra Femminile e Femminile"
            className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              currentPairing === 'ff'
                ? 'bg-[var(--bg-highlight)] text-[#16192c] font-extrabold'
                : 'text-[var(--chrome-ink)] hover:bg-white/10'
            }`}
          >
            👩 Femmina + 👩 Femmina
          </button>
          <button
            type="button"
            onClick={() => onQuickPairing('mm')}
            title="Dialogo tra Maschile e Maschile"
            className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              currentPairing === 'mm'
                ? 'bg-[var(--bg-highlight)] text-[#16192c] font-extrabold'
                : 'text-[var(--chrome-ink)] hover:bg-white/10'
            }`}
          >
            👨 Maschio + 👨 Maschio
          </button>
        </div>

        {/* Zone 3: Actions & Palette Switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPresets}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-extrabold text-[#16192c] bg-[var(--bg-highlight)] hover:brightness-95 rounded-xl transition-all whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#78350f]" />
            <span>Carica Esempi</span>
          </button>

          <button
            type="button"
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-[var(--chrome-ink)] bg-[var(--chrome-pill)] border border-white/20 hover:bg-white/15 rounded-xl transition-colors whitespace-nowrap shrink-0"
            title="Importa o esporta script di testo"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Importa Testo</span>
          </button>

          <button
            type="button"
            onClick={onAddNewLine}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-extrabold text-[#ecfdf5] bg-[#0f766e] hover:bg-[#0d625b] border border-emerald-300/30 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuova Battuta</span>
          </button>

          {/* 3 Multi-Hue Contrasting Theme Switcher */}
          <div
            role="group"
            aria-label="Scegli palette di colori"
            className="flex items-center p-1 bg-[var(--chrome-pill)] border border-white/15 rounded-xl text-sm font-bold shrink-0"
          >
            {(
              [
                { id: 'indigo', label: '💎 Indaco' },
                { id: 'light', label: '☀️ Chiaro' },
                { id: 'plum', label: '🌺 Prugna' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeTheme(opt.id)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  theme === opt.id
                    ? 'bg-[var(--bg-highlight)] text-[#16192c] font-extrabold'
                    : 'text-[var(--chrome-ink)] hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
