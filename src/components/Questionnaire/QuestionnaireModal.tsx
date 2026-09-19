import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  HelpCircle, 
  Wand2, 
  Clock, 
  Heart, 
  Smile, 
  Shield, 
  GlassWater,
  PartyPopper,
  Send,
  Award,
  Loader2,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpeechType, SpeechTone, SpeechLength, SpeechAnswers, SpeechProject } from '../../types/speech';
import { SPEECH_TYPES, TONES_CONFIG, LENGTHS_CONFIG } from '../../data/questionTemplates';
import { requestGenerateSpeech } from '../../services/api';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeechGenerated: (project: SpeechProject) => void;
  apiKey?: string;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({
  isOpen,
  onClose,
  onSpeechGenerated,
  apiKey,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<SpeechType>('best_man');
  const [tone, setTone] = useState<SpeechTone>('balanced');
  const [length, setLength] = useState<SpeechLength>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('Synthesizing details...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form answers state
  const [answers, setAnswers] = useState<SpeechAnswers>({
    recipientName: '',
    speakerRole: '',
    relationship: '',
    storiesAnecdotes: '',
    admiredQualities: '',
    quirksInsideJokes: '',
    wishesClosingThought: '',
    audienceContext: '',
  });

  if (!isOpen) return null;

  const currentMetadata = SPEECH_TYPES.find(t => t.id === selectedType) || SPEECH_TYPES[0];

  const handleTypeSelect = (typeId: SpeechType) => {
    setSelectedType(typeId);
    const meta = SPEECH_TYPES.find(t => t.id === typeId);
    if (meta) {
      setTone(meta.defaultTone);
      setLength(meta.defaultLength);
    }
    setCurrentStep(2);
  };

  const handleInputChange = (field: keyof SpeechAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  // Pre-fill realistic example for testing
  const handlePreFillExample = () => {
    if (selectedType === 'best_man') {
      setAnswers({
        recipientName: 'David & Sarah',
        speakerRole: 'Best Man',
        relationship: 'College roommates at Michigan for 4 years, brothers ever since',
        storiesAnecdotes: 'The time his car broke down in South Bend during a downpour and he insisted on fixing the alternator with duct tape; the night he met Sarah at the rooftop bakery fundraiser and called me saying "I just met my future wife."',
        admiredQualities: 'Fiercely loyal, always shows up when you need him, and how radiant and grounded he is whenever Sarah is around.',
        quirksInsideJokes: 'His 14-tab spreadsheets comparing paper towels; refusal to read instruction manuals.',
        wishesClosingThought: 'May your shared road be full of laughter, great coffee, and may Dave always remember: happy wife, legendary life.',
        audienceContext: 'Summer vineyard reception with close college friends and family',
      });
    } else if (selectedType === 'maid_of_honor') {
      setAnswers({
        recipientName: 'Emma & Liam',
        speakerRole: 'Maid of Honor',
        relationship: 'Sisters and lifelong confidantes',
        storiesAnecdotes: 'Building pillow forts dreaming about dream weddings; Liam driving 3 hours in a midnight blizzard to deliver Emma\'s forgotten passport before her flight.',
        admiredQualities: 'Emma\'s giant heart, how she cries at dog commercials, and how Liam cherishes her with quiet reverence.',
        quirksInsideJokes: 'Her inability to whistle; secret love of 90s boybands.',
        wishesClosingThought: 'May you always choose each other every morning, and may your kitchen be filled with music and laughter.',
        audienceContext: 'Intimate country estate wedding',
      });
    } else if (selectedType === 'retirement') {
      setAnswers({
        recipientName: 'Robert Henderson, VP of Engineering',
        speakerRole: 'Director of Product',
        relationship: 'Colleague and mentee for 12 years',
        storiesAnecdotes: 'The Christmas Eve server outage where Robert came in a reindeer sweater with pizzas and debugged code beside junior engineers with a calm smile.',
        admiredQualities: 'His patience, wisdom, and how he lived by the rule: "We build systems, but we nurture people."',
        quirksInsideJokes: 'His classified green whiteboard markers; his famous 3-minute hallway power walks.',
        wishesClosingThought: 'May your golf handicap drop to single digits and may you enjoy every well-deserved sunset.',
        audienceContext: 'Company gala with executive team, staff, and family',
      });
    } else {
      setAnswers({
        recipientName: 'Grandma Peggy',
        speakerRole: 'Grandson',
        relationship: 'Grandson and lifelong pupil of her kitchen wisdom',
        storiesAnecdotes: 'Sitting on her front porch learning how to water her hydrangea bushes; how she never allowed anyone to leave her house hungry.',
        admiredQualities: 'Unconditional love, gentle patience, and her unwavering moral compass.',
        quirksInsideJokes: 'Her secret apple pie recipe that had half a cup more butter than she ever admitted.',
        wishesClosingThought: 'May her kindness live on through every act of generosity we show one another.',
        audienceContext: 'Memorial service with extended family and community members',
      });
    }
  };

  const handleGenerate = async () => {
    if (!answers.recipientName.trim()) {
      setErrorMessage('Please provide the recipient or subject of the speech.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    const phases = [
      'Analyzing personal memories & inside jokes...',
      'Balancing tone and audience resonance...',
      'Crafting comedic setups and emotional arc...',
      'Generating stage directions & cue cards...',
      'Polishing final delivery script...',
    ];

    let phaseIdx = 0;
    const interval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setGenerationPhase(phases[phaseIdx]);
    }, 900);

    try {
      const response = await requestGenerateSpeech({
        speechType: selectedType,
        tone,
        length,
        answers,
        apiKey,
      });

      clearInterval(interval);

      if (response.success && response.speech) {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#a855f7', '#ec4899', '#6366f1'],
        });

        const newProject: SpeechProject = {
          id: 'proj-' + Date.now(),
          title: `${answers.recipientName} - ${currentMetadata.title}`,
          speechType: selectedType,
          tone,
          length,
          answers,
          content: response.speech,
          drafts: [
            {
              id: 'draft-' + Date.now(),
              tone,
              length,
              content: response.speech,
              createdAt: Date.now(),
            },
          ],
          activeDraftIndex: 0,
          cueCards: response.cueCards || [],
          wordCount: response.wordCount,
          estimatedMinutes: response.estimatedMinutes,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setIsGenerating(false);
        onSpeechGenerated(newProject);
        onClose();
      } else {
        throw new Error(response.error || 'Failed to generate speech');
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      setErrorMessage(err.message || 'Error occurred during generation. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      
      <div className="relative w-full max-w-3xl bg-white border border-purple-200/90 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-6 sm:p-7 border-b border-purple-100 flex items-center justify-between bg-purple-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                Step {currentStep} of 3
              </span>
              <span className="text-xs text-slate-500">
                {currentStep === 1 && 'Select Speech Type'}
                {currentStep === 2 && 'Personal Memories & Stories'}
                {currentStep === 3 && 'Tone & Length Control'}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 mt-1">
              {currentStep === 1 && 'What kind of speech are you giving?'}
              {currentStep === 2 && `Tell us about ${answers.recipientName || 'them'}`}
              {currentStep === 3 && 'Set Tone & Delivery Pacing'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-purple-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-purple-100">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Select Event Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Choose the occasion. Each speech type adapts the questionnaire, storytelling structure, and comedy ratio:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SPEECH_TYPES.map((type) => {
                  const isSelected = selectedType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 text-slate-900 shadow-sm'
                          : 'bg-white border-purple-100 hover:border-purple-300 text-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                            {type.category}
                          </span>
                          <h4 className="font-serif font-bold text-base text-slate-900 mt-0.5">
                            {type.title}
                          </h4>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {type.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Questionnaire Fields */}
          {currentStep === 2 && (
            <div className="space-y-6">
              
              {/* Pre-fill helper banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-2 text-xs text-purple-800">
                  <Lightbulb className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Want to test quickly without typing? Click to load sample memories:</span>
                </div>
                <button
                  type="button"
                  onClick={handlePreFillExample}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-300 flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Pre-fill Sample Data</span>
                </button>
              </div>

              {/* Dynamic Questions for this Speech Type */}
              <div className="space-y-4">
                {currentMetadata.questions.map((q) => {
                  const rawVal = answers[q.id as keyof SpeechAnswers];
                  const val = typeof rawVal === 'string' ? rawVal : '';
                  return (
                    <div key={q.id} className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        {q.label} {q.required && <span className="text-purple-600">*</span>}
                      </label>
                      {q.multiline ? (
                        <textarea
                          rows={3}
                          value={val}
                          onChange={(e) => handleInputChange(q.id as keyof SpeechAnswers, e.target.value)}
                          placeholder={q.placeholder}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50/30 border border-purple-200/90 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900 text-sm placeholder-slate-400 transition-all outline-none resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleInputChange(q.id as keyof SpeechAnswers, e.target.value)}
                          placeholder={q.placeholder}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50/30 border border-purple-200/90 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-slate-900 text-sm placeholder-slate-400 transition-all outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* STEP 3: Tone & Length Selection */}
          {currentStep === 3 && (
            <div className="space-y-8">
              
              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Select Delivery Tone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TONES_CONFIG.map((t) => {
                    const isSelected = tone === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTone(t.id as SpeechTone)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-purple-50 border-purple-500 text-slate-900 shadow-sm'
                            : 'bg-white border-purple-100 hover:border-purple-300 text-slate-700 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {t.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {t.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Length Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Target Length & Spoken Duration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {LENGTHS_CONFIG.map((l) => {
                    const isSelected = length === l.id;
                    return (
                      <div
                        key={l.id}
                        onClick={() => setLength(l.id as SpeechLength)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-purple-50 border-purple-500 text-slate-900 shadow-sm'
                            : 'bg-white border-purple-100 hover:border-purple-300 text-slate-700 shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{l.name}</span>
                          </div>
                          <p className="text-xs text-purple-700 font-semibold mt-1">{l.wordRange}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{l.duration}</p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-purple-100">
                          {l.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audience Tips preview */}
              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-slate-600 space-y-1.5">
                <span className="font-bold text-purple-900">Audience Golden Rule:</span>
                <p>{currentMetadata.audienceTips[0]}</p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-purple-100 bg-purple-50/40 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-purple-100/50 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-purple-600" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Next: {currentStep === 1 ? 'Memories' : 'Tone & Length'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{generationPhase}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Personalized Speech</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
