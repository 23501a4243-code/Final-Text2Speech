import React from 'react';
import { 
  X, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Award, 
  GlassWater,
  PartyPopper
} from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/demoScenarios';
import { SpeechProject } from '../types/speech';

interface DemoMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDemo: (project: SpeechProject) => void;
}

export const DemoMenuModal: React.FC<DemoMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-purple-200 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <Flame className="w-5 h-5 text-purple-600 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">
                Hackathon Demo Scenarios
              </h2>
              <p className="text-xs text-slate-500">1-click pre-filled realistic speeches for rapid judging</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Cards List */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {DEMO_SCENARIOS.map((demo) => (
            <div
              key={demo.id}
              onClick={() => {
                onSelectDemo(demo.project);
                onClose();
              }}
              className="p-5 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:bg-purple-50/40 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                    {demo.badge}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    {demo.project.speechType.replace(/_/g, ' ')} • {demo.project.tone}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-purple-700 transition-colors">
                  {demo.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {demo.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-purple-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Load Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
