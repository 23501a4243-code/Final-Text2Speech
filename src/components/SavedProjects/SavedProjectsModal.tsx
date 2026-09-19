import React from 'react';
import { 
  X, 
  FolderOpen, 
  Trash2, 
  Clock, 
  ArrowRight, 
  Layers, 
  Sparkles,
  FileText
} from 'lucide-react';
import { SpeechProject } from '../../types/speech';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SpeechProject[];
  currentProjectId: string;
  onSelectProject: (project: SpeechProject) => void;
  onDeleteProject: (id: string) => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-purple-200/90 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">
                Saved Speeches & Projects
              </h2>
              <p className="text-xs text-slate-500">
                {projects.length} saved {projects.length === 1 ? 'speech' : 'speeches'} available
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Projects */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {projects.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40 text-purple-600" />
              <p className="text-sm text-slate-600">No speeches saved yet.</p>
              <p className="text-xs text-slate-400 mt-1">Generate a speech or test a demo to save your drafts.</p>
            </div>
          ) : (
            projects.map((proj) => {
              const isActive = proj.id === currentProjectId;
              return (
                <div
                  key={proj.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-purple-50/90 border-purple-500 text-slate-900 shadow-sm'
                      : 'bg-white border-purple-100 hover:border-purple-200 text-slate-700 shadow-sm'
                  }`}
                >
                  <div 
                    onClick={() => {
                      onSelectProject(proj);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                        {proj.speechType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {proj.tone} tone
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white shadow-sm">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      {proj.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-600" />
                        {proj.wordCount} words (~{proj.estimatedMinutes}m)
                      </span>
                      <span>•</span>
                      <span>{proj.drafts.length} drafts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectProject(proj);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {projects.length > 1 && (
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
