import React, { useState } from 'react';
import { X, Check, Copy, ArrowRight, FileText } from 'lucide-react';
import { Character, DialogueLine } from '../types';

interface ScriptImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Record<'char1' | 'char2', Character>;
  lines: DialogueLine[];
  onImport: (newLines: DialogueLine[], updatedChars?: { char1Name?: string; char2Name?: string }) => void;
}

export const ScriptImportModal: React.FC<ScriptImportModalProps> = ({
  isOpen,
  onClose,
  characters,
  lines,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [pastedText, setPastedText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportText = lines
    .map((line) => {
      const speakerName = characters[line.characterId]?.name || 'Personaggio';
      return `${speakerName}: ${line.text}`;
    })
    .join('\n\n');

  const handleParseAndImport = () => {
    if (!pastedText.trim()) return;

    const rawLines = pastedText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed: DialogueLine[] = [];
    const discoveredNames: string[] = [];

    const pattern = /^(\[?[\w\sÀ-ÿ\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af()]+\]?)\s*[:\-\—]\s*(.+)$/i;

    let alternateTurn: 'char1' | 'char2' = 'char1';

    for (let i = 0; i < rawLines.length; i++) {
      const lineStr = rawLines[i];
      const match = lineStr.match(pattern);

      if (match) {
        const rawName = match[1].replace(/[\[\]]/g, '').trim();
        const text = match[2].trim();

        if (!discoveredNames.includes(rawName)) {
          discoveredNames.push(rawName);
        }

        let charId: 'char1' | 'char2' = 'char1';
        if (rawName.toLowerCase() === characters.char1.name.toLowerCase()) {
          charId = 'char1';
        } else if (rawName.toLowerCase() === characters.char2.name.toLowerCase()) {
          charId = 'char2';
        } else if (discoveredNames.indexOf(rawName) === 1) {
          charId = 'char2';
        } else {
          charId = 'char1';
        }

        parsed.push({
          id: `line-${Date.now()}-${i}`,
          characterId: charId,
          text,
          emotion: 'neutro',
          pitchOffset: 0,
          rateOffset: 0,
          volumeOffset: 0,
          pauseAfterSec: 0.6,
        });
      } else {
        parsed.push({
          id: `line-${Date.now()}-${i}`,
          characterId: alternateTurn,
          text: lineStr,
          emotion: 'neutro',
          pitchOffset: 0,
          rateOffset: 0,
          volumeOffset: 0,
          pauseAfterSec: 0.6,
        });
        alternateTurn = alternateTurn === 'char1' ? 'char2' : 'char1';
      }
    }

    if (parsed.length > 0) {
      const updatedChars: { char1Name?: string; char2Name?: string } = {};
      if (discoveredNames.length >= 1) updatedChars.char1Name = discoveredNames[0];
      if (discoveredNames.length >= 2) updatedChars.char2Name = discoveredNames[1];

      onImport(parsed, updatedChars);
      onClose();
    }
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b2327]/55 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] rounded-2xl max-w-2xl w-full border-2 border-[var(--border-strong)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)] bg-[var(--bg-subtle)]">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[var(--btn-primary)]" />
            <h3 className="text-lg font-bold text-[var(--ink-main)]">
              Gestione Script del Dialogo
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--ink-main)] hover:bg-[var(--bg-card)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[var(--border-card)] px-6 pt-2 bg-[var(--bg-card)]">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-[var(--btn-primary)] text-[var(--ink-main)]'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-main)]'
            }`}
          >
            Incolla e Importa Script
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-[var(--btn-primary)] text-[var(--ink-main)]'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink-main)]'
            }`}
          >
            Esporta Testo Attuale
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'import' ? (
            <div>
              <p className="text-sm font-medium text-[var(--ink-main)] mb-3 leading-relaxed">
                Incolla un dialogo scritto. Puoi usare il formato{' '}
                <code className="bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded text-[var(--ink-main)] font-bold">
                  Nome: Battuta
                </code>{' '}
                oppure semplici righe di testo alternate.
              </p>
              <textarea
                rows={10}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Esempio:\n${characters.char1.name}: Ciao, hai visto le ultime novità?\n${characters.char2.name}: Certo, il progetto è fantastico!\n${characters.char1.name}: Perfetto, procediamo subito con la registrazione.`}
                className="w-full text-sm sm:text-base font-mono font-medium text-[var(--ink-main)] bg-[var(--bg-input)] border-2 border-[var(--border-card)] rounded-xl p-3.5 focus:border-[var(--border-strong)] outline-hidden placeholder:text-[var(--ink-muted)]"
              />
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-[var(--ink-main)] mb-3 leading-relaxed">
                Copia il testo formattato del dialogo corrente per salvarlo o condividerlo.
              </p>
              <textarea
                readOnly
                rows={10}
                value={exportText}
                className="w-full text-sm sm:text-base font-mono font-medium text-[var(--ink-main)] bg-[var(--bg-input)] border-2 border-[var(--border-card)] rounded-xl p-3.5 outline-hidden select-all"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-subtle)] border-t border-[var(--border-card)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-[var(--ink-main)] hover:bg-[var(--bg-card)] rounded-xl transition-colors"
          >
            Annulla
          </button>

          {activeTab === 'import' ? (
            <button
              type="button"
              onClick={handleParseAndImport}
              disabled={!pastedText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[var(--btn-ink)] bg-[var(--btn-primary)] hover:bg-[var(--btn-primary-hover)] disabled:opacity-40 rounded-xl transition-colors"
            >
              <span>Importa nel Dialogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCopyExport}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[var(--btn-ink)] bg-[var(--btn-primary)] hover:bg-[var(--btn-primary-hover)] rounded-xl transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiato negli appunti!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copia Testo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
