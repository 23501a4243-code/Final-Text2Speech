import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Gauge, 
  Settings, 
  Layers, 
  ArrowLeft,
  FastForward,
  CheckCircle2,
  UserCheck,
  User,
  Sparkles,
  Radio,
  Check
} from 'lucide-react';
import { SpeechProject } from '../../types/speech';
import { 
  speechSynthesizer, 
  SpeechSynthesizerState, 
  VoiceGender, 
  VOICE_PROFILES 
} from '../../services/speechSynthesis';

interface RehearsalStudioProps {
  project: SpeechProject;
  onBackToEditor: () => void;
  onNavigateToCueCards: () => void;
}

export const RehearsalStudio: React.FC<RehearsalStudioProps> = ({
  project,
  onBackToEditor,
  onNavigateToCueCards,
}) => {
  const [synthState, setSynthState] = useState<SpeechSynthesizerState>(speechSynthesizer.getState());
  const [sentences, setSentences] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const timerRef = useRef<any>(null);
  const activeSentenceRef = useRef<HTMLDivElement>(null);

  // Load speech into synthesizer
  useEffect(() => {
    const loaded = speechSynthesizer.loadSpeech(project.content);
    setSentences(loaded);

    const unsubscribe = speechSynthesizer.subscribe((state) => {
      setSynthState(state);
    });

    return () => {
      speechSynthesizer.stop();
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [project.content]);

  // Stopwatch tracking
  useEffect(() => {
    if (synthState.isPlaying && !synthState.isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [synthState.isPlaying, synthState.isPaused]);

  // Scroll active sentence into view
  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [synthState.currentSentenceIndex]);

  // Audio Handlers
  const handlePlay = () => {
    if (synthState.isPaused) {
      speechSynthesizer.resume();
    } else {
      speechSynthesizer.play();
    }
  };

  const handlePause = () => {
    speechSynthesizer.pause();
  };

  const handleResume = () => {
    speechSynthesizer.resume();
  };

  const handleStop = () => {
    speechSynthesizer.stop();
    setElapsedSeconds(0);
  };

  const handleReset = () => {
    speechSynthesizer.stop();
    setElapsedSeconds(0);
    speechSynthesizer.play();
  };

  const handleSelectVoice = (gender: VoiceGender) => {
    speechSynthesizer.setVoiceGender(gender);
  };

  const handlePreview = (e: React.MouseEvent, gender: VoiceGender) => {
    e.stopPropagation(); // prevent triggering parent card selection
    speechSynthesizer.previewVoice(gender);
  };

  const handleSpeedChange = (speed: number) => {
    speechSynthesizer.setRate(speed);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Words Per Minute estimate calculation
  const wordsSpokenSoFar = sentences
    .slice(0, synthState.currentSentenceIndex)
    .join(' ')
    .split(/\s+/).filter(w => w.length > 0).length;

  const currentWpm = elapsedSeconds > 5 
    ? Math.round((wordsSpokenSoFar / elapsedSeconds) * 60)
    : Math.round(synthState.rate * 130);

  const getPacingStatus = () => {
    if (currentWpm < 115) return { label: 'Deliberate & Measured (Slow)', color: 'text-indigo-600' };
    if (currentWpm > 165) return { label: 'Rushing (Slow down!)', color: 'text-rose-600' };
    return { label: 'Optimal Podium Pace (130-150 WPM)', color: 'text-emerald-700' };
  };

  const pacingInfo = getPacingStatus();

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-[#FAF8FF] p-6 overflow-y-auto' : 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
      
      {/* Top Header & Rehearsal Metrics */}
      <div className="glass-panel rounded-3xl p-6 border border-purple-100 bg-white shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <button
              onClick={onBackToEditor}
              className="text-xs text-purple-700 hover:text-purple-800 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
            </button>
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
              Interactive Teleprompter Mode
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Rehearsal Studio: {project.title}
          </h1>
        </div>

        {/* Live Gauges */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          
          {/* Stopwatch */}
          <div className="px-3.5 py-2 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center gap-2 shadow-sm">
            <Clock className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Elapsed / Target</div>
              <div className="text-sm font-bold text-slate-900">
                {formatTime(elapsedSeconds)} <span className="text-slate-400 font-normal">/ ~{project.estimatedMinutes}m</span>
              </div>
            </div>
          </div>

          {/* WPM Pacing Meter */}
          <div className="px-3.5 py-2 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center gap-2 shadow-sm">
            <Gauge className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Pacing Gauge</div>
              <div className={`text-xs font-bold ${pacingInfo.color}`}>
                ~{currentWpm} WPM ({pacingInfo.label.split(' ')[0]})
              </div>
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 border border-purple-200 transition-colors shadow-sm"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Teleprompter'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* VOICE SELECTION SECTION */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-bold text-slate-800">Select Rehearsal Voice Partner</span>
            <span className="text-xs text-slate-400 font-normal hidden sm:inline">• Choose a voice before starting playback</span>
          </div>
          <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
            Active: {synthState.selectedGender === 'male' ? 'Marcus (Male)' : 'Elena (Female)'}
          </span>
        </div>

        {/* 2 Selectable Cards: Male & Female */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Male Voice */}
          <div
            onClick={() => handleSelectVoice('male')}
            className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between ${
              synthState.selectedGender === 'male'
                ? 'bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/60 border-purple-500 shadow-md ring-2 ring-purple-500/20 scale-[1.01]'
                : 'bg-white hover:bg-purple-50/40 border-slate-200/90 hover:border-purple-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                    synthState.selectedGender === 'male' 
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-500/20' 
                      : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        {VOICE_PROFILES.male.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                        Male Voice
                      </span>
                    </div>
                    <p className="text-xs text-purple-700 font-semibold">
                      {VOICE_PROFILES.male.subtitle}
                    </p>
                  </div>
                </div>

                {/* Radio check indicator */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  synthState.selectedGender === 'male'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {synthState.selectedGender === 'male' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {VOICE_PROFILES.male.description}
              </p>

              {/* Engine metadata pill */}
              <div className="text-[11px] text-slate-400 font-mono truncate mb-4 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                Engine: <span className="text-slate-600 font-sans">{synthState.maleVoiceName}</span>
              </div>
            </div>

            {/* Preview Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handlePreview(e, 'male')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  synthState.isPreviewing && synthState.previewingGender === 'male'
                    ? 'bg-purple-600 text-white animate-pulse'
                    : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {synthState.isPreviewing && synthState.previewingGender === 'male' ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                    <span>Playing Sample... (Click to Stop)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>Preview Male Voice</span>
                  </>
                )}
              </button>

              {synthState.selectedGender === 'male' && (
                <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Female Voice */}
          <div
            onClick={() => handleSelectVoice('female')}
            className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between ${
              synthState.selectedGender === 'female'
                ? 'bg-gradient-to-br from-purple-50/90 via-white to-pink-50/60 border-purple-500 shadow-md ring-2 ring-purple-500/20 scale-[1.01]'
                : 'bg-white hover:bg-purple-50/40 border-slate-200/90 hover:border-purple-200 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                    synthState.selectedGender === 'female' 
                      ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-purple-500/20' 
                      : 'bg-pink-50 text-pink-700'
                  }`}>
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-slate-900">
                        {VOICE_PROFILES.female.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 uppercase tracking-wider">
                        Female Voice
                      </span>
                    </div>
                    <p className="text-xs text-purple-700 font-semibold">
                      {VOICE_PROFILES.female.subtitle}
                    </p>
                  </div>
                </div>

                {/* Radio check indicator */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  synthState.selectedGender === 'female'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {synthState.selectedGender === 'female' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {VOICE_PROFILES.female.description}
              </p>

              {/* Engine metadata pill */}
              <div className="text-[11px] text-slate-400 font-mono truncate mb-4 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                Engine: <span className="text-slate-600 font-sans">{synthState.femaleVoiceName}</span>
              </div>
            </div>

            {/* Preview Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handlePreview(e, 'female')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  synthState.isPreviewing && synthState.previewingGender === 'female'
                    ? 'bg-purple-600 text-white animate-pulse'
                    : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {synthState.isPreviewing && synthState.previewingGender === 'female' ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                    <span>Playing Sample... (Click to Stop)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>Preview Female Voice</span>
                  </>
                )}
              </button>

              {synthState.selectedGender === 'female' && (
                <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Floating Audio & Speed Controls Bar */}
      <div className="sticky top-20 z-30 mb-6 glass-panel-lavender rounded-2xl p-4 border border-purple-200 shadow-md bg-white/95 flex flex-wrap items-center justify-between gap-4">
        
        {/* Play, Pause, Resume & Stop Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Main Play / Pause / Resume Button */}
          {!synthState.isPlaying && !synthState.isPaused ? (
            <button
              onClick={handlePlay}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              title="Practice & Rehearse"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>Practice with {synthState.selectedGender === 'male' ? 'Marcus' : 'Elena'}</span>
            </button>
          ) : synthState.isPlaying ? (
            <button
              onClick={handlePause}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              title="Pause Rehearsal"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              title="Resume Rehearsal"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>Resume</span>
            </button>
          )}

          {/* Stop Button */}
          <button
            onClick={handleStop}
            disabled={!synthState.isPlaying && !synthState.isPaused && synthState.currentSentenceIndex === 0}
            className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-purple-200 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title="Stop and Reset"
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Restart from Beginning Button */}
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 border border-purple-200 transition-colors shadow-sm"
            title="Restart from Beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Audio Wave Visualizer */}
          {synthState.isPlaying && !synthState.isPaused && (
            <div className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 h-10">
              <div className="w-1 bg-purple-600 rounded-full wave-bar" />
              <div className="w-1 bg-purple-600 rounded-full wave-bar" />
              <div className="w-1 bg-purple-600 rounded-full wave-bar" />
              <div className="w-1 bg-purple-600 rounded-full wave-bar" />
              <div className="w-1 bg-purple-600 rounded-full wave-bar" />
            </div>
          )}
        </div>

        {/* Quick Voice Switcher Pill in Toolbar */}
        <div className="flex items-center gap-1 bg-purple-50/80 p-1 rounded-xl border border-purple-200 text-xs">
          <button
            onClick={() => handleSelectVoice('male')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              synthState.selectedGender === 'male'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Marcus (Male)
          </button>
          <button
            onClick={() => handleSelectVoice('female')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              synthState.selectedGender === 'female'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            Elena (Female)
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Speed:</span>
          <div className="flex items-center bg-purple-50/70 p-1 rounded-xl border border-purple-200/80">
            <button
              onClick={() => handleSpeedChange(0.8)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                synthState.rate < 0.9 ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              0.8x
            </button>
            <button
              onClick={() => handleSpeedChange(1.0)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                synthState.rate >= 0.9 && synthState.rate <= 1.1 ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              1.0x
            </button>
            <button
              onClick={() => handleSpeedChange(1.25)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                synthState.rate > 1.1 && synthState.rate <= 1.4 ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              1.25x
            </button>
            <button
              onClick={() => handleSpeedChange(1.5)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                synthState.rate > 1.4 ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              1.5x
            </button>
          </div>
        </div>

        {/* Font Size Adjuster */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Size:</span>
          <div className="flex items-center bg-purple-50/70 p-1 rounded-xl border border-purple-200/80">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                fontSize === 'normal' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-600'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded-lg text-sm font-semibold transition-all ${
                fontSize === 'large' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-600'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2 py-1 rounded-lg text-base font-bold transition-all ${
                fontSize === 'huge' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-600'
              }`}
            >
              A++
            </button>
          </div>
        </div>

        {/* Cue cards link */}
        <button
          onClick={onNavigateToCueCards}
          className="text-xs text-slate-700 hover:text-purple-700 flex items-center gap-1.5 font-medium py-1.5 px-3 rounded-lg bg-white border border-purple-200 hover:bg-purple-50 transition-colors shadow-sm"
        >
          <Layers className="w-3.5 h-3.5 text-purple-600" />
          <span>Cue Cards</span>
        </button>

      </div>

      {/* Teleprompter Scrolling Container with Sentence-by-Sentence Karaoke Highlighting */}
      <div className="glass-panel rounded-3xl p-8 sm:p-14 border border-purple-200/90 bg-white shadow-lg min-h-[480px]">
        
        <div className="space-y-6 max-w-3xl mx-auto">
          {sentences.map((sentence, idx) => {
            const isCurrent = idx === synthState.currentSentenceIndex;
            const isPast = idx < synthState.currentSentenceIndex;

            const textClasses = {
              normal: 'text-lg leading-relaxed',
              large: 'text-2xl sm:text-3xl leading-relaxed',
              huge: 'text-3xl sm:text-4xl leading-loose',
            }[fontSize];

            return (
              <div
                key={idx}
                ref={isCurrent ? activeSentenceRef : null}
                onClick={() => speechSynthesizer.jumpToSentence(idx)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isCurrent
                    ? 'bg-purple-100/90 border-l-4 border-purple-600 text-purple-950 font-serif font-semibold shadow-sm scale-[1.01]'
                    : isPast
                    ? 'text-slate-400 hover:text-slate-600 font-serif opacity-75'
                    : 'text-slate-800 hover:text-purple-900 font-serif'
                } ${textClasses}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-[11px] font-sans font-bold text-slate-400 mt-1 select-none">
                    {idx + 1}
                  </span>
                  <span>{sentence}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Quick Stage Coach Tip */}
      <div className="mt-6 p-4 rounded-2xl bg-white border border-purple-100 flex items-center justify-between text-xs text-slate-500 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Click on any numbered line above to jump audio directly to that sentence.</span>
        </div>
        <span className="text-purple-600 font-medium hidden sm:inline">
          Voice: {synthState.selectedGender === 'male' ? 'Marcus (Natural Male)' : 'Elena (Warm Female)'} • Web Speech API
        </span>
      </div>

    </div>
  );
};
