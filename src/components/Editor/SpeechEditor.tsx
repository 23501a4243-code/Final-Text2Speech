import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { SpeechProject, SpeechTone, SpeechLength } from '../../types/speech';
import { exportSpeechToPdf, downloadAsText } from '../../services/pdfExporter';
import { requestAdjustTone, requestAdjustLength, requestRefineSection } from '../../services/api';
import { speechSynthesizer, VoiceGender } from '../../services/speechSynthesis';

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

  React.useEffect(() => {
    return speechSynthesizer.subscribe((state) => {
      setSelectedVoiceGender(state.selectedGender);
    });
  }, []);

  // Copy text to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(project.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Live content edit
  const handleContentChange = (newText: string) => {
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
  };

  // Tone rewrite
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

        const updatedDrafts = [...project.drafts, newDraft];

        onUpdateProject({
          ...project,
          tone: newTone,
          content: response.speech,
          wordCount: response.wordCount,
          estimatedMinutes: response.estimatedMinutes,
          cueCards: response.cueCards && response.cueCards.length > 0 ? response.cueCards : project.cueCards,
          drafts: updatedDrafts,
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

  // Length adjustment
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
        onUpdateProject({
          ...project,
          length: newLength,
          content: response.speech,
          wordCount: response.wordCount,
          estimatedMinutes: response.estimatedMinutes,
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
        handleContentChange(response.refinedText);
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

      {/* Main Textarea Reading Surface */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-purple-200/80 bg-white shadow-lg relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-100 text-xs text-slate-400">
          <span className="font-semibold text-purple-700">Podium Sheet • Direct Edit Enabled</span>
          <span>Click any line to customize wording</span>
        </div>

        <textarea
          value={project.content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={16}
          className="w-full bg-transparent text-slate-900 font-serif text-lg sm:text-xl leading-relaxed outline-none resize-y selection:bg-purple-200 selection:text-purple-900 placeholder-slate-400"
          placeholder="Speech will appear here..."
        />

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

    </div>
  );
};
