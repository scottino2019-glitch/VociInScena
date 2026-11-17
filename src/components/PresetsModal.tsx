import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { SAMPLE_PRESETS } from '../constants/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  activePresetId,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b2327]/55 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] rounded-2xl max-w-2xl w-full border-2 border-[var(--border-strong)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)] bg-[var(--bg-subtle)]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[var(--ink-main)]" />
            <h3 className="text-lg font-bold text-[var(--ink-main)]">
              Scegli uno Scenario di Esempio
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1.5 rounded-lg text-[var(--ink-main)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 bg-[var(--bg-canvas)]">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectPreset(preset.id);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-[var(--bg-selected)] border-[var(--btn-primary)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-base font-extrabold text-[var(--ink-main)]">
                    {preset.title}
                  </div>
                  <div className="text-sm font-semibold text-[var(--ink-muted)] leading-snug">
                    {preset.description}
                  </div>
                  <div className="text-sm font-bold text-[var(--ink-main)] pt-0.5">
                    Personaggi: {preset.char1.name} &amp; {preset.char2.name} · {preset.lines.length} battute
                  </div>
                </div>
                {isSelected && (
                  <span className="p-1.5 rounded-full bg-[var(--btn-primary)] text-[var(--btn-ink)] shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[var(--bg-subtle)] border-t border-[var(--border-card)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-[var(--ink-main)] hover:bg-[var(--bg-card)] rounded-xl transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
