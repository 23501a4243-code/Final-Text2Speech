import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  PlayCircle, 
  Layers, 
  Sparkles, 
  Smile, 
  Heart, 
  Shield, 
  FileText, 
  Plus, 
  Loader2, 
  Clock, 
  RotateCcw,
  Wand2,
  Bookmark,
  Share2,
  Volume2,
  User,
  History,
  Bold,
  Italic,
  Underline,
  Highlighter,
  Maximize2,
  Eye,
  Edit3,
  Undo2,
  Redo2,
  Tag
} from 'lucide-react';
import { SpeechProject, SpeechTone, SpeechLength, SpeechVersion } from '../../types/speech';
import { exportSpeechToPdf, downloadAsText } from '../../services/pdfExporter';
import { requestAdjustTone, requestAdjustLength, requestRefineSection } from '../../services/api';
import { speechSynthesizer, VoiceGender } from '../../services/speechSynthesis';
import { VersionHistoryModal } from './VersionHistoryModal';

interface SpeechEditorProps {
  project: SpeechProject;
  onUpdateProject: (updated: SpeechProject) => void;
  onNavigateToRehearsal: () => void;
  onNavigateToCueCards: () => void;
  apiKey?: string;
}

export const SpeechEditor: React.FC<SpeechEditorProps> = ({
  project,
  onUpdateProject,
  onNavigateToRehearsal,
  onNavigateToCueCards,
  apiKey,
}) => {
  const [copied, setCopied] = useState(false);
  const [isToneLoading, setIsToneLoading] = useState(false);
  const [isLengthLoading, setIsLengthLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [activeRefinePrompt, setActiveRefinePrompt] = useState<string | null>(null);
  const [selectedVoiceGender, setSelectedVoiceGender] = useState<VoiceGender>(speechSynthesizer.getState().selectedGender);

  // Rich-Text & Podium Display State
  const [viewMode, setViewMode] = useState<'editor' | 'podium_preview'>('editor');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'podium_xl'>('large');
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Undo / Redo history stack for manual edits
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return speechSynthesizer.subscribe((state) => {
      setSelectedVoiceGender(state.selectedGender);
    });
  }, []);

  // Initialize version history if project has none
  useEffect(() => {
    if (!project.versions || project.versions.length === 0) {
      const initialVersion: SpeechVersion = {
        id: 'ver-initial-' + project.id,
        timestamp: project.createdAt || Date.now(),
        label: 'Initial Speech Draft',
        content: project.content,
        wordCount: project.wordCount,
        tone: project.tone,
        length: project.length,
        author: 'ai',
        changesSummary: 'Initial generated speech',
      };
      onUpdateProject({
        ...project,
        versions: [initialVersion],
      });
    }
  }, [project.id]);

  // Copy text to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(project.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Record undo state before edit
  const pushToUndo = (oldText: string) => {
    setUndoStack(prev => [...prev.slice(-20), oldText]);
    setRedoStack([]); // Clear redo upon new action
  };

  // Live content edit with debounced version snapshotting
  const handleContentChange = (newText: string, label: string = 'Manual Edit') => {
    pushToUndo(project.content);

    const words = newText.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const estimatedMinutes = Math.round((wordCount / 130) * 10) / 10;

    const updatedDrafts = [...project.drafts];
    if (updatedDrafts[project.activeDraftIndex]) {
      updatedDrafts[project.activeDraftIndex] = {
        ...updatedDrafts[project.activeDraftIndex],
        content: newText,
      };
    }

    onUpdateProject({
      ...project,
      content: newText,
      wordCount,
      estimatedMinutes,
      drafts: updatedDrafts,
      updatedAt: Date.now(),
    });

    // Debounced automatic version snapshot for significant manual revisions (after 3s pause)
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentVersions = project.versions || [];
      const lastVersion = currentVersions[0];

      // Only create automated version if content changed significantly (> 3 words difference)
      if (!lastVersion || Math.abs(lastVersion.wordCount - wordCount) >= 3 || lastVersion.content !== newText) {
        const autoVersion: SpeechVersion = {
          id: 'ver-auto-' + Date.now(),
          timestamp: Date.now(),
          label: label,
          content: newText,
          wordCount,
          tone: project.tone,
          length: project.length,
          author: 'user',
          changesSummary: `Manual revision (${wordCount} words)`,
        };

        onUpdateProject({
          ...project,
          content: newText,
          wordCount,
          estimatedMinutes,
          drafts: updatedDrafts,
          versions: [autoVersion, ...currentVersions],
          updatedAt: Date.now(),
        });
      }
    }, 3000);
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prevText = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, project.content]);

    const words = prevText.trim().split(/\s+/).filter(w => w.length > 0);
    onUpdateProject({
      ...project,
      content: prevText,
      wordCount: words.length,
      estimatedMinutes: Math.round((words.length / 130) * 10) / 10,
      updatedAt: Date.now(),
    });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextText = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, project.content]);

    const words = nextText.trim().split(/\s+/).filter(w => w.length > 0);
    onUpdateProject({
      ...project,
      content: nextText,
      wordCount: words.length,
      estimatedMinutes: Math.round((words.length / 130) * 10) / 10,
      updatedAt: Date.now(),
    });
  };

  // Insert formatting or wrap selection
  const applyTextFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = project.content;

    let newContent = '';
    if (start !== end) {
      // Wrap selection
      const selected = current.substring(start, end);
      newContent = current.substring(0, start) + prefix + selected + suffix + current.substring(end);
    } else {
      // Insert at cursor
      newContent = current.substring(0, start) + prefix + suffix + current.substring(start);
    }

    handleContentChange(newContent, 'Formatted Text');

    // Restore focus and cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  // Insert stage cue directive
  const insertStageCue = (cue: string) => {
    const textarea = textareaRef.current;
    const insertText = `\n${cue}\n`;
    if (!textarea) {
      handleContentChange(project.content + insertText, 'Inserted Stage Cue');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = project.content;
    const newContent = current.substring(0, start) + insertText + current.substring(end);

    handleContentChange(newContent, `Inserted Cue: ${cue}`);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertText.length, start + insertText.length);
    }, 50);
  };

  // Manual Milestone Checkpoint
  const handleSaveCheckpoint = (label: string) => {
    const newVersion: SpeechVersion = {
      id: 'ver-checkpoint-' + Date.now(),
      timestamp: Date.now(),
      label,
      content: project.content,
      wordCount: project.wordCount,
      tone: project.tone,
      length: project.length,
      author: 'user',
      changesSummary: 'User checkpoint bookmark',
    };

    const currentVersions = project.versions || [];
    onUpdateProject({
      ...project,
      versions: [newVersion, ...currentVersions],
      updatedAt: Date.now(),
    });
  };

  // Restore previous historical version
  const handleRestoreVersion = (version: SpeechVersion) => {
    const words = version.content.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const estimatedMinutes = Math.round((wordCount / 130) * 10) / 10;

    const restoredLogVersion: SpeechVersion = {
      id: 'ver-restore-' + Date.now(),
      timestamp: Date.now(),
      label: `Restored: "${version.label}"`,
      content: version.content,
      wordCount,
      tone: version.tone,
      length: version.length,
      author: 'user',
      changesSummary: `Restored snapshot from ${new Date(version.timestamp).toLocaleTimeString()}`,
    };

    const currentVersions = project.versions || [];

    onUpdateProject({
      ...project,
      content: version.content,
      tone: version.tone,
      length: version.length,
      wordCount,
      estimatedMinutes,
      versions: [restoredLogVersion, ...currentVersions],
      updatedAt: Date.now(),
    });
  };

  // Tone rewrite with automatic version history tracking
  const handleToneChange = async (newTone: SpeechTone) => {
    if (newTone === project.tone || isToneLoading) return;
    setIsToneLoading(true);

    try {
      const response = await requestAdjustTone({
        existingContent: project.content,
        newTone,
        speechType: project.speechType,
        answers: project.answers,
        apiKey,
      });

      if (response.success && response.speech) {
        const newDraft = {
          id: 'draft-' + Date.now(),
          tone: newTone,
          length: project.length,
          content: response.speech,
          createdAt: Date.now(),
        };

        const newVersion: SpeechVersion = {
          id: 'ver-ai-tone-' + Date.now(),
          timestamp: Date.now(),
          label: `Tone Shift: ${newTone.toUpperCase()}`,
          content: response.speech,
          wordCount: response.wordCount,
          tone: newTone,
          length: project.length,
          author: 'ai',
          changesSummary: `AI rewritten with ${newTone} voice`,
        };

        const updatedDrafts = [...project.drafts, newDraft];
        const updatedVersions = [newVersion, ...(project.versions || [])];

        onUpdateProject({
          ...project,
          tone: newTone,
          content: response.speech,
          wordCount: response.wordCount,
          estimatedMinutes: response.estimatedMinutes,
          cueCards: response.cueCards && response.cueCards.length > 0 ? response.cueCards : project.cueCards,
          drafts: updatedDrafts,
          versions: updatedVersions,
          activeDraftIndex: updatedDrafts.length - 1,
          updatedAt: Date.now(),
        });
      }
    } catch (err) {
      console.error('Tone shift error:', err);
    } finally {
      setIsToneLoading(false);
    }
  };

  // Length adjustment with automatic version history tracking
  const handleLengthChange = async (newLength: SpeechLength) => {
    if (newLength === project.length || isLengthLoading) return;
    setIsLengthLoading(true);

    try {
      const response = await requestAdjustLength({
        existingContent: project.content,
        targetLength: newLength,
        speechType: project.speechType,
        apiKey,
      });

      if (response.success && response.speech) {
        const newVersion: SpeechVersion = {
          id: 'ver-ai-length-' + Date.now(),
          timestamp: Date.now(),
          label: `Length Adjusted: ${newLength.toUpperCase()}`,
          content: response.speech,
          wordCount: response.wordCount,
          tone: project.tone,
          length: newLength,
          author: 'ai',
          changesSummary: `Speech scaled to ${newLength} duration`,
        };

        onUpdateProject({
          ...project,
          length: newLength,
          content: response.speech,
          wordCount: response.wordCount,
          estimatedMinutes: response.estimatedMinutes,
          versions: [newVersion, ...(project.versions || [])],
          updatedAt: Date.now(),
        });
      }
    } catch (err) {
      console.error('Length adjustment error:', err);
    } finally {
      setIsLengthLoading(false);
    }
  };

  // Quick AI Refine Section
  const handleQuickRefine = async (instruction: string) => {
    if (isRefining) return;
    setIsRefining(true);
    setActiveRefinePrompt(instruction);

    try {
      const response = await requestRefineSection({
        selectedText: project.content,
        instruction,
        apiKey,
      });

      if (response.success && response.refinedText) {
        handleContentChange(response.refinedText, `AI Polish: ${instruction}`);
      }
    } catch (err) {
      console.error('Quick refine error:', err);
    } finally {
      setIsRefining(false);
      setActiveRefinePrompt(null);
    }
  };

  // Draft switching
  const handleSelectDraft = (index: number) => {
    const targetDraft = project.drafts[index];
    if (!targetDraft) return;

    const words = targetDraft.content.trim().split(/\s+/).filter(w => w.length > 0);
    onUpdateProject({
      ...project,
      activeDraftIndex: index,
      content: targetDraft.content,
      tone: targetDraft.tone,
      length: targetDraft.length,
      wordCount: words.length,
      estimatedMinutes: Math.round((words.length / 130) * 10) / 10,
    });
  };

  // Font size class mapper
  const fontSizeClasses = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-lg sm:text-xl leading-relaxed',
    podium_xl: 'text-xl sm:text-2xl leading-loose tracking-wide',
  }[fontSize];

  // Render Podium Sheet with Visual Badges for Stage Cues
  const renderPodiumVisualSheet = () => {
    const paragraphs = project.content.split('\n\n').filter(p => p.trim().length > 0);

    return (
      <div className="space-y-6 py-2">
        {paragraphs.map((para, pIdx) => {
          // Check for bracketed stage cues like [PAUSE - 2s]
          const lines = para.split('\n');
          const isToast = pIdx === paragraphs.length - 1 || para.toLowerCase().includes('raise your glasses') || para.toLowerCase().startsWith('to ');

          return (
            <div
              key={pIdx}
              className={`p-4 sm:p-6 rounded-2xl transition-all border ${
                isToast 
                  ? 'bg-amber-50/60 border-amber-200/90 shadow-sm'
                  : 'bg-white border-purple-100/80 shadow-xs'
              }`}
            >
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                const isCue = /^\[.*\]$/.test(trimmed);

                if (isCue) {
                  return (
                    <div key={lIdx} className="my-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 shadow-sm">
                        <Tag className="w-3.5 h-3.5 text-purple-600" />
                        {trimmed}
                      </span>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className={`font-serif text-slate-800 mb-2 ${fontSizeClasses}`}>
                    {trimmed}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const versionCount = (project.versions && project.versions.length) || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Card */}
      <div className="glass-panel rounded-3xl p-6 border border-purple-100 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 capitalize">
              {project.speechType.replace(/_/g, ' ')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 capitalize">
              Tone: {project.tone}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              {project.wordCount} words (~{project.estimatedMinutes} mins spoken)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            {project.title}
          </h1>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Version History Button */}
          <button
            onClick={() => setIsVersionHistoryOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-xs sm:text-sm border border-purple-200 flex items-center gap-2 transition-all shadow-sm"
            title="Open Version History & Revision Timeline"
          >
            <History className="w-4 h-4 text-purple-600" />
            <span>History ({versionCount})</span>
          </button>

          {/* Voice Selector & Practice Button */}
          <div className="flex items-center rounded-xl bg-purple-50/80 p-1 border border-purple-200">
            <button
              type="button"
              onClick={() => speechSynthesizer.setVoiceGender(selectedVoiceGender === 'male' ? 'female' : 'male')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-100 flex items-center gap-1.5 transition-all"
              title="Click to toggle Voice Partner"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Voice: {selectedVoiceGender === 'male' ? 'Marcus' : 'Elena'}</span>
            </button>
            <button
              onClick={onNavigateToRehearsal}
              className="ml-1 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Rehearse</span>
            </button>
          </div>

          <button
            onClick={onNavigateToCueCards}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 font-semibold text-xs sm:text-sm border border-purple-200 flex items-center gap-2 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Cue Cards ({project.cueCards.length})</span>
          </button>

          <button
            onClick={() => exportSpeechToPdf(project)}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold border border-purple-200 flex items-center gap-1.5 transition-all shadow-sm"
            title="Download PDF Podium Sheet"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            onClick={() => downloadAsText(project)}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold border border-purple-200 flex items-center gap-1.5 transition-all shadow-sm"
            title="Download Plain Text"
          >
            <FileText className="w-4 h-4 text-purple-600" />
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold border border-purple-200 flex items-center gap-1.5 transition-all shadow-sm"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Control Toolbars: Tone Shifter & Length Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tone Shifter Box */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              1-Click Tone Shifter
            </span>
            {isToneLoading && (
              <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Rewriting in new tone...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleToneChange('balanced')}
              disabled={isToneLoading}
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                project.tone === 'balanced'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/70 border border-purple-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Balanced
            </button>

            <button
              onClick={() => handleToneChange('funny')}
              disabled={isToneLoading}
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                project.tone === 'funny'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/70 border border-purple-100'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              Funny
            </button>

            <button
              onClick={() => handleToneChange('heartfelt')}
              disabled={isToneLoading}
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                project.tone === 'heartfelt'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/70 border border-purple-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Heartfelt
            </button>

            <button
              onClick={() => handleToneChange('formal')}
              disabled={isToneLoading}
              className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                project.tone === 'formal'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/70 border border-purple-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Formal
            </button>
          </div>
        </div>

        {/* Length Control Box */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Length & Time Target
            </span>
            {isLengthLoading && (
              <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Adjusting length...
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleLengthChange('short')}
              disabled={isLengthLoading}
              className={`p-2.5 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${
                project.length === 'short'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/70 border border-purple-100'
              }`}
            >
              <span>Short</span>
              <span className="text-[10px] opacity-80">300–400w</span>
            </button>

            <button
              onClick={() => handleLengthChange('medium')}
              disabled={isLengthLoading}
              className={`p-2.5 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${
                project.length === 'medium'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/70 border border-purple-100'
              }`}
            >
              <span>Medium</span>
              <span className="text-[10px] opacity-80">500–700w</span>
            </button>

            <button
              onClick={() => handleLengthChange('long')}
              disabled={isLengthLoading}
              className={`p-2.5 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all ${
                project.length === 'long'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'bg-purple-50/70 text-slate-700 hover:bg-purple-100/70 border border-purple-100'
              }`}
            >
              <span>Long</span>
              <span className="text-[10px] opacity-80">800w+</span>
            </button>
          </div>
        </div>

      </div>

      {/* Drafts Tab Bar & AI Refine Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Drafts Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-1.5">Drafts:</span>
          {project.drafts.map((d, idx) => (
            <button
              key={d.id || idx}
              onClick={() => handleSelectDraft(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                project.activeDraftIndex === idx
                  ? 'bg-purple-100 text-purple-700 border border-purple-300 font-semibold shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-purple-100'
              }`}
            >
              <span>Draft {idx + 1}</span>
              <span className="text-[10px] opacity-70">({d.tone})</span>
            </button>
          ))}
        </div>

        {/* Inline AI Polish Tools */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-purple-600" />
            AI Polish:
          </span>
          <button
            onClick={() => handleQuickRefine('Make this speech funnier with light teasing')}
            disabled={isRefining}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-medium border border-purple-200 transition-colors shadow-sm"
          >
            😄 Funnier
          </button>
          <button
            onClick={() => handleQuickRefine('Increase heartfelt emotional resonance')}
            disabled={isRefining}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-medium border border-purple-200 transition-colors shadow-sm"
          >
            ❤️ More Heart
          </button>
          <button
            onClick={() => handleQuickRefine('Punch up the ending toast with memorable flair')}
            disabled={isRefining}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-medium border border-purple-200 transition-colors shadow-sm"
          >
            🥂 Stronger Toast
          </button>
        </div>

      </div>

      {/* RICH TEXT FORMATTING TOOLBAR */}
      <div className="glass-panel p-3.5 rounded-2xl border border-purple-100 bg-white/95 shadow-sm flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Text Styling & Undo/Redo */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-2 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-purple-200 mx-1" />

          {/* Bold, Italic, Underline */}
          <button
            onClick={() => applyTextFormat('**', '**')}
            className="p-2 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-purple-100 transition-all font-bold"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyTextFormat('*', '*')}
            className="p-2 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-purple-100 transition-all italic"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyTextFormat('<u>', '</u>')}
            className="p-2 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-purple-100 transition-all"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-purple-200 mx-1" />

          {/* Quick Stage Cue Insertion Palette */}
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">
            Stage Cues:
          </span>
          <button
            onClick={() => insertStageCue('[PAUSE FOR LAUGHTER - 2s]')}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
            title="Insert Laughter Pause"
          >
            😄 [Pause 2s]
          </button>
          <button
            onClick={() => insertStageCue('[SLOW DOWN - SINCERE EYE CONTACT]')}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors"
            title="Insert Sincere Eye Contact"
          >
            ❤️ [Eye Contact]
          </button>
          <button
            onClick={() => insertStageCue('[RAISE GLASS HIGH - LOOK AT CROWD]')}
            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold transition-colors"
            title="Insert Raise Glass Toast Cue"
          >
            🥂 [Raise Glass]
          </button>
        </div>

        {/* Right: View Mode Toggle & Font Size */}
        <div className="flex items-center gap-3">
          
          {/* Font Sizing */}
          <div className="flex items-center bg-purple-50/70 p-1 rounded-xl border border-purple-200/80 text-xs">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg transition-all ${
                fontSize === 'normal' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-600'
              }`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg transition-all ${
                fontSize === 'large' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-600'
              }`}
              title="Large Font Size"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('podium_xl')}
              className={`px-2 py-1 rounded-lg transition-all font-bold ${
                fontSize === 'podium_xl' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600'
              }`}
              title="Podium Extra-Large"
            >
              Podium XL
            </button>
          </div>

          {/* Mode Switcher: Edit vs Visual Podium */}
          <div className="flex items-center bg-purple-100/60 p-1 rounded-xl border border-purple-200 text-xs">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'editor'
                  ? 'bg-white text-purple-800 shadow-sm'
                  : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Direct Edit</span>
            </button>
            <button
              onClick={() => setViewMode('podium_preview')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'podium_preview'
                  ? 'bg-white text-purple-800 shadow-sm'
                  : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-purple-600" />
              <span>Podium Visual</span>
            </button>
          </div>

        </div>

      </div>

      {/* Main Textarea Reading Surface */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-purple-200/80 bg-white shadow-lg relative min-h-[420px]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-100 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-purple-700">
              {viewMode === 'editor' ? 'Podium Sheet • Direct Edit & Cues' : 'Podium Visual Cue Sheet'}
            </span>
            <span>•</span>
            <span className="text-slate-500">
              {versionCount} {versionCount === 1 ? 'version saved' : 'versions saved in history'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVersionHistoryOpen(true)}
              className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>View Revisions</span>
            </button>
          </div>
        </div>

        {viewMode === 'editor' ? (
          <textarea
            ref={textareaRef}
            value={project.content}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={16}
            className={`w-full bg-transparent text-slate-900 font-serif leading-relaxed outline-none resize-y selection:bg-purple-200 selection:text-purple-900 placeholder-slate-400 ${fontSizeClasses}`}
            placeholder="Speech will appear here..."
          />
        ) : (
          renderPodiumVisualSheet()
        )}

        {/* Bottom Word & Timing Bar */}
        <div className="mt-6 pt-4 border-t border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="text-slate-800 font-semibold">{project.wordCount} words</span>
            <span>•</span>
            <span className="text-purple-700 font-semibold">~{project.estimatedMinutes} minutes at comfortable speaking pace (130 WPM)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToRehearsal}
              className="text-purple-700 hover:text-purple-800 font-semibold flex items-center gap-1.5 hover:underline"
            >
              <PlayCircle className="w-4 h-4 text-purple-600" />
              <span>Launch Teleprompter Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        project={project}
        onRestoreVersion={handleRestoreVersion}
        onSaveCheckpoint={handleSaveCheckpoint}
      />

    </div>
  );
};
