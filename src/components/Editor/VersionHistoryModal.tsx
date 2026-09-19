import React, { useState } from 'react';
import {
  X,
  History,
  RotateCcw,
  Clock,
  Sparkles,
  User,
  Check,
  Copy,
  ChevronRight,
  GitCompare,
  Eye,
  Plus,
  Bookmark,
  FileText
} from 'lucide-react';
import { SpeechProject, SpeechVersion } from '../../types/speech';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: SpeechProject;
  onRestoreVersion: (version: SpeechVersion) => void;
  onSaveCheckpoint: (label: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  project,
  onRestoreVersion,
  onSaveCheckpoint,
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(true);
  const [copied, setCopied] = useState(false);
  const [newCheckpointName, setNewCheckpointName] = useState('');
  const [isCreatingCheckpoint, setIsCreatingCheckpoint] = useState(false);

  if (!isOpen) return null;

  // Ensure there is at least an initial version if none exists yet
  const versions: SpeechVersion[] = (project.versions && project.versions.length > 0)
    ? project.versions
    : [
        {
          id: 'ver-initial-' + project.id,
          timestamp: project.createdAt || Date.now(),
          label: 'Initial Speech Generation',
          content: project.content,
          wordCount: project.wordCount,
          tone: project.tone,
          length: project.length,
          author: 'ai',
          changesSummary: 'Original generated draft',
        },
      ];

  // Default selected version is the previous one (or first in list)
  const currentSelected = versions.find(v => v.id === selectedVersionId) || versions[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckpointName.trim()) return;
    onSaveCheckpoint(newCheckpointName.trim());
    setNewCheckpointName('');
    setIsCreatingCheckpoint(false);
  };

  // Compute sentence-level diff between selected version and current project content
  const renderDiff = () => {
    const historicalSentences = currentSelected.content
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    const currentSentences = project.content
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    const historicalSet = new Set(historicalSentences);
    const currentSet = new Set(currentSentences);

    // Removed in current (present in historical but missing now)
    const removedLines = historicalSentences.filter(s => !currentSet.has(s));
    // Added in current (present now but not in historical)
    const addedLines = currentSentences.filter(s => !historicalSet.has(s));

    if (removedLines.length === 0 && addedLines.length === 0) {
      return (
        <div className="p-6 text-center text-slate-500 bg-purple-50/50 rounded-2xl border border-purple-100">
          <p className="text-sm font-semibold text-purple-900">This version matches the current active speech.</p>
          <p className="text-xs text-slate-500 mt-1">No modifications have been made since this version was recorded.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {addedLines.length > 0 && (
          <div className="rounded-2xl p-4 bg-emerald-50/80 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Added or Revised in Current Speech ({addedLines.length})</span>
            </div>
            <div className="space-y-1.5 font-serif text-sm text-emerald-950">
              {addedLines.map((line, i) => (
                <div key={i} className="p-2 rounded-lg bg-emerald-100/70 border border-emerald-200/80 leading-relaxed">
                  + {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {removedLines.length > 0 && (
          <div className="rounded-2xl p-4 bg-rose-50/80 border border-rose-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
              <span className="text-rose-600 font-mono font-bold">-</span>
              <span>Removed from Selected Version ({removedLines.length})</span>
            </div>
            <div className="space-y-1.5 font-serif text-sm text-rose-950">
              {removedLines.map((line, i) => (
                <div key={i} className="p-2 rounded-lg bg-rose-100/70 border border-rose-200/80 line-through opacity-80 leading-relaxed">
                  - {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-purple-200 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-purple-100 flex items-center justify-between bg-purple-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Version History
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-200 text-purple-800 border border-purple-300">
                  {versions.length} Revisions
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Track manual edits, AI rewrites, and restore previous drafts at any time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreatingCheckpoint ? (
              <button
                onClick={() => setIsCreatingCheckpoint(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Milestone Checkpoint</span>
              </button>
            ) : (
              <form onSubmit={handleCreateCheckpoint} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newCheckpointName}
                  onChange={(e) => setNewCheckpointName(e.target.value)}
                  placeholder="e.g. Pre-rehearsal cut"
                  className="px-3 py-1 text-xs rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingCheckpoint(false)}
                  className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </form>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Pane Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Revision Timeline List (5 cols) */}
          <div className="md:col-span-5 border-r border-purple-100 p-4 sm:p-5 overflow-y-auto space-y-2.5 bg-slate-50/50 max-h-[40vh] md:max-h-[68vh]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
              Revision Timeline
            </span>

            {versions.map((ver, idx) => {
              const isSelected = ver.id === currentSelected.id;
              const isLatest = idx === 0;
              const dateStr = new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date(ver.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div
                  key={ver.id || idx}
                  onClick={() => setSelectedVersionId(ver.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-purple-100/80 border-purple-400 shadow-sm ring-1 ring-purple-400/50'
                      : 'bg-white hover:bg-purple-50/50 border-purple-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      {ver.author === 'user' ? (
                        <User className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>{ver.label}</span>
                    </span>

                    {isLatest && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white shadow-sm">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {dateStr}
                    </span>
                    <span className="font-semibold text-purple-700 text-[11px]">
                      {ver.wordCount} words
                    </span>
                  </div>

                  {ver.changesSummary && (
                    <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                      {ver.changesSummary}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Version Preview & Diff (7 cols) */}
          <div className="md:col-span-7 p-5 sm:p-6 overflow-y-auto max-h-[50vh] md:max-h-[68vh] flex flex-col justify-between space-y-4">
            <div>
              {/* Toolbar above preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-purple-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-slate-900">
                      {currentSelected.label}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 capitalize">
                      {currentSelected.tone}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Recorded {new Date(currentSelected.timestamp).toLocaleString()} • {currentSelected.wordCount} words
                  </span>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      showDiff
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>{showDiff ? 'Comparing Diff' : 'Compare vs Current'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(currentSelected.content)}
                    className="p-1.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 border border-purple-200 transition-colors shadow-sm"
                    title="Copy this version"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Preview Body */}
              {showDiff ? (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                    Visual Change Analysis (Selected vs Active)
                  </span>
                  {renderDiff()}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 font-serif text-base sm:text-lg leading-relaxed text-slate-800 whitespace-pre-line">
                  {currentSelected.content}
                </div>
              )}
            </div>

            {/* Bottom Restore Bar */}
            <div className="pt-4 border-t border-purple-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Restoring will load this version into your editor while preserving your timeline.
              </span>
              <button
                onClick={() => {
                  onRestoreVersion(currentSelected);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore This Version</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
