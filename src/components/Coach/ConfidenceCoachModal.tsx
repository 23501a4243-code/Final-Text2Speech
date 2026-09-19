import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Gauge, 
  Heart, 
  Smile, 
  Shield, 
  Eye, 
  Activity, 
  CheckCircle2,
  Wind
} from 'lucide-react';
import { SpeechProject } from '../../types/speech';
import { analyzeSpeech } from '../../services/deliveryAnalyzer';

interface ConfidenceCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: SpeechProject;
}

export const ConfidenceCoachModal: React.FC<ConfidenceCoachModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'breathing' | 'stage_tips'>('analysis');
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  const analysis = analyzeSpeech(project.content, project.speechType, project.tone);

  // Box breathing timer
  useEffect(() => {
    let timer: any;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            setBreathingPhase((phase) => {
              if (phase === 'Inhale') return 'Hold';
              if (phase === 'Hold') return 'Exhale';
              return 'Inhale';
            });
            return breathingPhase === 'Inhale' ? 7 : breathingPhase === 'Hold' ? 8 : 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathingPhase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-purple-200/90 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900">
                Delivery & Confidence Coach
              </h2>
              <p className="text-xs text-slate-500">AI pacing analysis & podium psychology</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-purple-100 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'analysis'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Speech Pacing & Arc
          </button>
          <button
            onClick={() => setActiveTab('breathing')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'breathing'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-purple-600" />
            4-7-8 Breathing Calmer
          </button>
          <button
            onClick={() => setActiveTab('stage_tips')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'stage_tips'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Stage Presence Playbook
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Word Count</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">{analysis.wordCount}</div>
                  <span className="text-[10px] text-emerald-600 font-medium">Sweet spot: 450-650w</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Est. Duration</span>
                  <div className="text-xl font-bold text-purple-700 mt-1">~{analysis.readingMinutes}m</div>
                  <span className="text-[10px] text-slate-500">At 135 WPM</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pacing Score</span>
                  <div className="text-xl font-bold text-emerald-700 mt-1">{analysis.pacingScore}/100</div>
                  <span className="text-[10px] text-slate-500">High engagement</span>
                </div>
              </div>

              {/* Tone Balance Breakdown */}
              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tone Spectrum Balance
                </span>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1 text-slate-600">
                      <span className="flex items-center gap-1.5 text-purple-700 font-medium">
                        <Smile className="w-3.5 h-3.5" /> Humor & Levity
                      </span>
                      <span>{analysis.toneDistribution.humor}%</span>
                    </div>
                    <div className="w-full h-2 bg-purple-50 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${analysis.toneDistribution.humor}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-600">
                      <span className="flex items-center gap-1.5 text-rose-700 font-medium">
                        <Heart className="w-3.5 h-3.5" /> Heartfelt Emotion & Warmth
                      </span>
                      <span>{analysis.toneDistribution.emotion}%</span>
                    </div>
                    <div className="w-full h-2 bg-rose-50 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${analysis.toneDistribution.emotion}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-slate-600">
                      <span className="flex items-center gap-1.5 text-indigo-700 font-medium">
                        <Shield className="w-3.5 h-3.5" /> Dignity & Formality
                      </span>
                      <span>{analysis.toneDistribution.formality}%</span>
                    </div>
                    <div className="w-full h-2 bg-indigo-50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${analysis.toneDistribution.formality}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach Custom Advice */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Personalized Stage Directives
                </span>
                {analysis.coachAdvice.map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-purple-50/30 border border-purple-100 text-xs text-slate-700 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'breathing' && (
            <div className="text-center py-6 space-y-6">
              <h3 className="font-serif text-xl font-bold text-slate-900">
                4-7-8 Stage Fright Calmer
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Used by Navy SEALs and Broadway actors. Regulates adrenaline, drops heart rate by up to 15 BPM, and steadies your speaking voice.
              </p>

              {/* Breathing Circle Animation */}
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                <div 
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                    breathingPhase === 'Inhale' 
                      ? 'bg-purple-100/70 border-4 border-purple-500 scale-110' 
                      : breathingPhase === 'Hold' 
                      ? 'bg-indigo-100/70 border-4 border-indigo-400 scale-100' 
                      : 'bg-emerald-100/70 border-4 border-emerald-400 scale-90'
                  }`}
                />
                <div className="relative z-10">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">
                    {breathingPhase}
                  </div>
                  <div className="text-4xl font-serif font-bold text-purple-950">
                    {breathCount}
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
                >
                  {isBreathingActive ? 'Pause Exercise' : 'Start 2-Minute Breathing Exercise'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stage_tips' && (
            <div className="space-y-4 text-xs text-slate-700">
              
              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2">
                <h4 className="font-bold text-purple-800 text-sm flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-600" /> The 3-Quadrant Eye Contact Rule
                </h4>
                <p className="leading-relaxed">
                  Divide the room into Left, Center, and Right. Anchor your gaze on one friendly face in each quadrant for 3-5 seconds. This makes every guest feel personally addressed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                <h4 className="font-bold text-rose-800 text-sm flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" /> What to Do If You Get Choked Up or Cry
                </h4>
                <p className="leading-relaxed">
                  Never apologize for tears. Silence is powerful. Simply pause, take a sip of water, take a breath, smile at the recipient, and say: <em>"As you can see, this comes straight from the heart."</em> The room will erupt in warm applause.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2">
                <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" /> The Golden 2-Second Rule
                </h4>
                <p className="leading-relaxed">
                  When the audience laughs, stop speaking immediately. If you speak over their laughter, nobody will hear your next punchline. Wait 2 full seconds until the chuckle crests, then continue.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
