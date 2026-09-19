import React, { useState } from 'react';
import { 
  Mic2, 
  Sparkles, 
  PlayCircle, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Heart, 
  Smile, 
  Shield, 
  Award, 
  Volume2, 
  Clock, 
  FileText, 
  ChevronRight,
  Flame,
  Star,
  Quote
} from 'lucide-react';
import { SpeechTone } from '../types/speech';

interface LandingPageProps {
  onStartSpeech: () => void;
  onLoadDemo: (demoId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartSpeech,
  onLoadDemo,
}) => {
  const [activePreviewTone, setActivePreviewTone] = useState<SpeechTone>('balanced');

  const previewSpeeches: Record<SpeechTone, { title: string; excerpt: string; wpm: string; audience: string }> = {
    balanced: {
      title: 'The Perfect Blend (Best Man Speech)',
      excerpt: `"Dave, you look like a guy who miraculously won the greatest lottery in human history—and every person in this room knows it! But when his car blew an alternator in that thunderstorm sophomore year, Dave didn't call AAA; he said 'Jack, hold my flashlight.' That is who he is: when life throws a storm, he rolls up his sleeves. And Sarah, from the moment he met you, everything made sense. You didn't just become his partner; you became his home."`,
      wpm: '135 WPM (Ideal)',
      audience: 'Family, friends & college crew',
    },
    funny: {
      title: 'Funny & Witty (Best Man Speech)',
      excerpt: `"Good evening everyone! I'm Jack, Dave's official alibi provider for eleven years. Sarah, you look utterly stunning. Dave... you look like someone who is genuinely relieved the background check hasn't come back yet! Dave has an unbroken rule of never reading instruction manuals and making 14-tab spreadsheets about paper towels. But Sarah, seeing you two together proves that miracles happen to stubborn guys."`,
      wpm: '142 WPM (Playful)',
      audience: 'High laughter & roasts',
    },
    heartfelt: {
      title: 'Heartfelt & Poignant (Best Man Speech)',
      excerpt: `"When you've known someone through all of life's seasons, you get to witness their true core. Dave is the friend who shows up in your darkest hours without asking questions. Sarah, when he called me four years ago after your first date, his voice had a quiet awe I had never heard. You brought an effortless grace, peace, and sanctuary to his life. Tonight, I see a man who is truly, completely whole."`,
      wpm: '120 WPM (Emotional)',
      audience: 'Tear-jerker & intimate',
    },
    formal: {
      title: 'Formal & Poised (Best Man Speech)',
      excerpt: `"Distinguished guests, family, and honored friends. It is my profound privilege to stand as Best Man on this momentous occasion. Throughout our eleven years of fellowship, Dave has consistently demonstrated exemplary character, loyalty, and poise under adversity. Today marks the commencement of a distinguished partnership with Sarah, whose grace and intellect elevate everyone around her."`,
      wpm: '128 WPM (Dignified)',
      audience: 'Banquet & black-tie',
    },
  };

  return (
    <div className="relative overflow-hidden">
      
      {/* Background Pastel Lavender Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[480px] bg-gradient-to-b from-purple-200/40 via-lavender-100/25 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-purple-100/40 blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Notification Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50/90 border border-purple-200 text-xs text-purple-700 mb-8 shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span className="font-semibold">AI Speechwriter + Rehearsal Teleprompter</span>
          <span className="text-purple-300">•</span>
          <span className="text-purple-900 font-medium">White & Lavender Edition</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.15]">
          Never Freeze at the Podium Again.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600">
            Craft Authentic Speeches in Minutes.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
          From best-man roasts to tearful sisterly toasts and retirement tributes: answer guided questions about your favorite memories, polish your tone, and practice aloud with a synchronized teleprompter.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartSpeech}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-purple-600/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Mic2 className="w-5 h-5 text-white" />
            <span>Write My Speech Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onLoadDemo('demo-best-man')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-purple-50/80 text-purple-900 border border-purple-200 hover:border-purple-300 font-semibold text-base transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            <Flame className="w-4 h-4 text-purple-600 animate-pulse" />
            <span>Instant Demo: Jack's Best Man Speech</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>No Generic Cliches</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>Live Audio Teleprompter</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>Printable 4x6 Stage Cue Cards</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>PDF Podium Cue Sheet</span>
          </div>
        </div>

        {/* Interactive Live Tone Transformer Preview */}
        <div className="mt-16 max-w-4xl mx-auto text-left">
          <div className="glass-panel-lavender rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-200">
            
            {/* Widget Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Live Interactive Preview</span>
                <h3 className="text-xl font-bold text-slate-900 font-serif mt-0.5">
                  See Tone Shifting In Action
                </h3>
              </div>

              {/* Tone Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-white/90 p-1.5 rounded-xl border border-purple-200/70 shadow-sm">
                <button
                  onClick={() => setActivePreviewTone('balanced')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activePreviewTone === 'balanced'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Balanced
                </button>
                <button
                  onClick={() => setActivePreviewTone('funny')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activePreviewTone === 'funny'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  Funny
                </button>
                <button
                  onClick={() => setActivePreviewTone('heartfelt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activePreviewTone === 'heartfelt'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Heartfelt
                </button>
                <button
                  onClick={() => setActivePreviewTone('formal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    activePreviewTone === 'formal'
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-slate-600 hover:text-purple-700'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Formal
                </button>
              </div>
            </div>

            {/* Speech Excerpt Box */}
            <div className="mt-6 bg-white p-5 sm:p-7 rounded-2xl border border-purple-100 shadow-sm relative">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span className="font-semibold text-purple-700">{previewSpeeches[activePreviewTone].title}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3 text-purple-600" />
                    {previewSpeeches[activePreviewTone].wpm}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-100">
                    {previewSpeeches[activePreviewTone].audience}
                  </span>
                </div>
              </div>

              <p className="text-slate-800 font-serif text-base sm:text-lg leading-relaxed italic">
                {previewSpeeches[activePreviewTone].excerpt}
              </p>

              <div className="mt-5 pt-4 border-t border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2 text-purple-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Preserves your real memories while altering comedic cadence and delivery style</span>
                </div>
                <button
                  onClick={() => onLoadDemo('demo-best-man')}
                  className="text-purple-700 hover:text-purple-800 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Open Full Speech in Studio</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 1-Click Judge Demos Grid */}
      <section className="py-16 bg-white/60 border-y border-purple-100/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
              For Hackathon Evaluators
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Experience the Full Product in 60 Seconds
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Click any realistic scenario below to immediately test the questionnaire, speech generation, tone switcher, synchronized teleprompter rehearsal, and cue card export.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Demo 1: Best Man */}
            <div className="glass-panel rounded-2xl p-6 hover:border-purple-300 hover:shadow-md transition-all group flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                    Wedding • Best Man
                  </span>
                  <span className="text-xs text-slate-500">~4.2 mins</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-purple-700 transition-colors">
                  Jack's Speech for Dave & Sarah
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Brotherhood, the sophomore road trip radiator blowout with duct tape, and how meeting Sarah gave him true peace.
                </p>
              </div>
              <button
                onClick={() => onLoadDemo('demo-best-man')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 text-xs font-bold border border-purple-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Demo Speech</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Demo 2: Maid of Honor */}
            <div className="glass-panel rounded-2xl p-6 hover:border-rose-300 hover:shadow-md transition-all group flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Wedding • Maid of Honor
                  </span>
                  <span className="text-xs text-slate-500">~3.9 mins</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-rose-700 transition-colors">
                  Chloe's Speech for Emma & Liam
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Childhood pillow forts dreaming of dream weddings, tears over dog commercials, and Liam driving through a blizzard with a forgotten passport.
                </p>
              </div>
              <button
                onClick={() => onLoadDemo('demo-maid-of-honor')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-bold border border-rose-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Demo Speech</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Demo 3: Retirement */}
            <div className="glass-panel rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Career Milestone • Retirement
                  </span>
                  <span className="text-xs text-slate-500">~3.8 mins</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Tribute for Robert's 31-Year Career
                </h3>
                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  Floppy disks in 1993, Christmas Eve server triage in reindeer sweaters, green whiteboard markers, and trading sprint retrospectives for golf.
                </p>
              </div>
              <button
                onClick={() => onLoadDemo('demo-retirement')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold border border-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Demo Speech</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            How SpeechFlow Eliminates Stage Fright
          </h2>
          <p className="mt-3 text-slate-600">
            A three-step journey from panicked blank page to confident, standing-ovation delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="glass-panel p-8 rounded-2xl relative bg-white">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold font-serif text-xl flex items-center justify-center mb-6 border border-purple-200">
              1
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">Guided Story Extraction</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              No staring at a blinking cursor. We ask dynamic questions tailored to your relationship—extracting the quirks, inside jokes, and defining memories that make a speech truly unforgettable.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-8 rounded-2xl relative bg-white">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold font-serif text-xl flex items-center justify-center mb-6 border border-purple-200">
              2
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">AI Tone & Length Engine</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Generate a personalized first draft in seconds. Shift tone dynamically from hilarious roasts to tear-jerking sincerity, or adjust length to fit your exact time slot without losing emotional impact.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-8 rounded-2xl relative bg-white">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold font-serif text-xl flex items-center justify-center mb-6 border border-purple-200">
              3
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">Rehearsal & Stage Cue Cards</h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Listen to your speech read aloud with synchronized karaoke teleprompter tracking. Generate pocket-ready cue cards with timing stamps and stage directions like <em>[PAUSE FOR LAUGHTER]</em>.
            </p>
          </div>

        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-20 bg-purple-50/40 border-t border-purple-100/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-700 tracking-wider uppercase">Built for Real Life</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Every Feature Designed for Podium Confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-white border border-purple-100/90 hover:border-purple-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">TTS Teleprompter Rehearsal</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Native voice synthesis reads your speech at variable speeds with real-time sentence spotlights and a live words-per-minute meter to prevent rushing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-purple-100/90 hover:border-purple-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Stage Cue Cards with Directions</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Automatically formats talking points into 4x6 index cards featuring stage prompts: <em>[LOOK AT GROOM]</em>, <em>[PAUSE 2 SECONDS]</em>, and <em>[RAISE GLASS]</em>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-purple-100/90 hover:border-purple-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">AI Delivery & Confidence Coach</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Emotional arc analysis, pacing evaluation, 4-7-8 box breathing guides, and tactical advice on how to recover if you get choked up.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-purple-100/90 hover:border-purple-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Smile className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">1-Click Tone Shifting</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Easily transition between Funny, Heartfelt, Formal, and Balanced without losing your personal facts and stories.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-purple-100/90 hover:border-purple-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Pro PDF & TXT Export</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Download formatted podium sheets with large readable font, line spacing, and delivery highlights ready for printing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-purple-100/90 hover:border-purple-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Drafts & History Persistence</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Save multiple versions and return anytime to refine your speech across rehearsals.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof / Quotes */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-purple-100 bg-white relative shadow-sm">
            <Quote className="w-8 h-8 text-purple-300 mb-4" />
            <p className="text-slate-700 text-base italic leading-relaxed">
              "I procrastinated on my brother's Best Man speech until 48 hours before the wedding. SpeechFlow helped me turn our college disasters into a speech that had 150 guests crying laughing and the bride hugging me in tears."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                M
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Marcus Vance</h5>
                <p className="text-xs text-slate-500">Best Man, Napa Valley Wedding</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-rose-100 bg-white relative shadow-sm">
            <Quote className="w-8 h-8 text-rose-300 mb-4" />
            <p className="text-slate-700 text-base italic leading-relaxed">
              "The audio rehearsal feature was the game changer. Following the highlighted lines while the voice read it aloud taught me exactly when to slow down and pause for the jokes. I walked to the mic feeling like a pro."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center">
                E
              </div>
              <div>
                <h5 className="font-bold text-slate-900 text-sm">Elena Rossi</h5>
                <p className="text-xs text-slate-500">Maid of Honor, Lake Como</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel-lavender p-10 sm:p-14 rounded-3xl border border-purple-200 shadow-xl relative overflow-hidden">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Ready to Give a Speech They'll Never Forget?
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
            Answer a few quick questions and walk away with a personalized, rehearsed speech in under 5 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartSpeech}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-purple-600/25 hover:scale-105 active:scale-95 transition-all"
            >
              Start Free Speechwriter
            </button>
            <button
              onClick={() => onLoadDemo('demo-best-man')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white text-purple-900 border border-purple-200 hover:bg-purple-50 font-semibold text-sm transition-all shadow-sm"
            >
              Test Pre-Filled Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-purple-100 text-xs text-slate-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-purple-600" />
          <span className="font-semibold text-slate-700">SpeechFlow AI</span>
          <span>— Event Speechwriter & Rehearsal Coach</span>
        </div>
        <p>© 2026 SpeechFlow AI. Built with Google Gemini API & Web Speech API.</p>
      </footer>

    </div>
  );
};
