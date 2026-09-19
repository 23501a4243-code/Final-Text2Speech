import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  Printer, 
  Layers, 
  Clock, 
  Lightbulb, 
  Grid, 
  Maximize,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SpeechProject, CueCard } from '../../types/speech';
import { exportCueCardsToPdf } from '../../services/pdfExporter';

interface CueCardViewerProps {
  project: SpeechProject;
  onBackToStudio: () => void;
}

export const CueCardViewer: React.FC<CueCardViewerProps> = ({
  project,
  onBackToStudio,
}) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  const cards = project.cueCards && project.cueCards.length > 0
    ? project.cueCards
    : [
        {
          cardIndex: 1,
          stageCue: '[PAUSE - SMILE & MAKE EYE CONTACT]',
          content: 'Introduce self, welcome family & guests. Compliment the honoree and setting.',
          timingEstimate: '0:00 - 0:45',
          keyTip: 'Sweep your gaze across both sides of the room before saying the first word.',
        },
        {
          cardIndex: 2,
          stageCue: '[LEAN IN - PAUSE FOR CHUCKLE]',
          content: 'The core funny story: memorable adventures and defining quirks.',
          timingEstimate: '0:45 - 1:45',
          keyTip: 'Pause for 2 full seconds after the joke to let the laughter bloom.',
        },
        {
          cardIndex: 3,
          stageCue: '[TRANSITION TO SINCERITY - LOWER VOLUME]',
          content: 'Admired qualities, loyalty, character, and honoring the partner/family.',
          timingEstimate: '1:45 - 2:45',
          keyTip: 'Speak with warmth directly to the honoree.',
        },
        {
          cardIndex: 4,
          stageCue: '[RAISE GLASS HIGH - CONFIDENT SMILE]',
          content: 'Final blessings, wishes for the future, and leading the room in the toast.',
          timingEstimate: '2:45 - 3:30',
          keyTip: 'Raise your glass firmly, look across the crowd, and say "Cheers!"',
        },
      ];

  const activeCard = cards[activeCardIndex] || cards[0];

  const handleNext = () => {
    setActiveCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setActiveCardIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Bar */}
      <div className="glass-panel rounded-3xl p-6 border border-purple-100 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToStudio}
            className="text-xs text-purple-700 hover:text-purple-800 flex items-center gap-1 font-semibold mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
          </button>
          <h1 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600" />
            Stage Cue Cards: {project.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pocket-ready index cards with stage directions and delivery tips for stress-free podium speaking.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-purple-50/80 p-1 rounded-xl border border-purple-200/80">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'single' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Maximize className="w-3.5 h-3.5" />
              Flip View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Grid All ({cards.length})
            </button>
          </div>

          <button
            onClick={() => exportCueCardsToPdf(project)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
            title="Download PDF Index Cards"
          >
            <Download className="w-4 h-4" />
            <span>PDF Cards</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white hover:bg-purple-50 text-slate-700 border border-purple-200 transition-colors shadow-sm"
            title="Print Cue Cards"
          >
            <Printer className="w-4 h-4 text-purple-600" />
          </button>

        </div>
      </div>

      {/* SINGLE CARD FLIP VIEW */}
      {viewMode === 'single' ? (
        <div className="space-y-6">
          
          {/* Main 4x6 Index Card Simulation */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-purple-300/80 rounded-3xl p-8 sm:p-12 shadow-xl relative min-h-[380px] flex flex-col justify-between">
              
              {/* Card Header Strip */}
              <div className="flex items-center justify-between pb-6 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-600 text-white uppercase tracking-wider shadow-sm">
                    Card {activeCard.cardIndex} of {cards.length}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    {activeCard.timingEstimate}
                  </span>
                </div>
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest font-sans">
                  SpeechFlow
                </span>
              </div>

              {/* Stage Cue Directive */}
              <div className="my-6">
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>{activeCard.stageCue}</span>
                </div>

                {/* Spoken Content Bullet Points */}
                <div className="mt-6 text-slate-900 font-serif text-lg sm:text-xl leading-relaxed">
                  {activeCard.content}
                </div>
              </div>

              {/* Delivery Coach Tip on Card */}
              {activeCard.keyTip && (
                <div className="pt-5 border-t border-purple-100 flex items-center gap-2.5 text-xs text-slate-600">
                  <Lightbulb className="w-4 h-4 text-purple-600 shrink-0" />
                  <span><strong className="text-purple-900">Delivery Tip:</strong> {activeCard.keyTip}</span>
                </div>
              )}

            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrev}
              disabled={activeCardIndex === 0}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-purple-50 disabled:opacity-40 text-slate-700 font-semibold text-xs border border-purple-200 flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-purple-600" />
              <span>Previous Card</span>
            </button>

            <span className="text-xs font-semibold text-slate-600">
              {activeCardIndex + 1} / {cards.length}
            </span>

            <button
              onClick={handleNext}
              disabled={activeCardIndex === cards.length - 1}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-purple-50 disabled:opacity-40 text-slate-700 font-semibold text-xs border border-purple-200 flex items-center gap-2 transition-all shadow-sm"
            >
              <span>Next Card</span>
              <ArrowRight className="w-4 h-4 text-purple-600" />
            </button>
          </div>

        </div>
      ) : (
        /* GRID ALL CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white border border-purple-100 hover:border-purple-300 rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-purple-100 text-xs">
                  <span className="font-bold text-purple-700 uppercase">
                    Card {card.cardIndex}
                  </span>
                  <span className="text-slate-500">{card.timingEstimate}</span>
                </div>

                <div className="my-3 py-2 px-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
                  {card.stageCue}
                </div>

                <p className="text-slate-800 font-serif text-sm leading-relaxed mt-3">
                  {card.content}
                </p>
              </div>

              {card.keyTip && (
                <div className="mt-4 pt-3 border-t border-purple-100 text-[11px] text-slate-600 italic">
                  💡 {card.keyTip}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
