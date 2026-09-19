export type VoiceGender = 'male' | 'female';

export interface VoiceOptionInfo {
  id: VoiceGender;
  name: string;
  subtitle: string;
  description: string;
  previewSample: string;
  gender: VoiceGender;
  matchedVoiceName: string;
}

export interface SpeechSynthesizerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
  rate: number; // 0.6 to 1.6
  pitch: number;
  selectedGender: VoiceGender;
  selectedVoice: SpeechSynthesisVoice | null;
  isPreviewing: boolean;
  previewingGender: VoiceGender | null;
  maleVoiceName: string;
  femaleVoiceName: string;
}

export type StateChangeCallback = (state: SpeechSynthesizerState) => void;

export const VOICE_PROFILES: Record<VoiceGender, {
  name: string;
  subtitle: string;
  description: string;
  previewSample: string;
  malePitch: number;
  femalePitch: number;
}> = {
  male: {
    name: 'Marcus',
    subtitle: 'Confident & Articulate',
    description: 'A natural, confident, professional male voice with steady cadence and clear projection.',
    previewSample: 'Good evening everyone. It is an absolute privilege to share this special moment with all of you today.',
    malePitch: 0.92,
    femalePitch: 1.0,
  },
  female: {
    name: 'Elena',
    subtitle: 'Warm & Poised',
    description: 'A natural, warm, professional female voice with encouraging inflection and balanced pacing.',
    previewSample: 'Good evening everyone. Standing here today fills my heart with joy, and I am so honored to celebrate with you.',
    malePitch: 1.0,
    femalePitch: 1.08,
  },
};

const MALE_KEYWORDS = [
  'david', 'guy', 'mark', 'george', 'daniel', 'alex', 'christopher', 'male',
  'brian', 'arthur', 'ryan', 'oliver', 'richard', 'tom', 'james', 'eric', 'steffan'
];

const FEMALE_KEYWORDS = [
  'zira', 'jenny', 'aria', 'samantha', 'victoria', 'karen', 'female',
  'susan', 'hazel', 'catherine', 'emma', 'ava', 'sonia', 'serena', 'lisa'
];

class RehearsalSpeechService {
  private synth: SpeechSynthesis | null = null;
  private sentences: string[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private rate: number = 1.0;
  private selectedGender: VoiceGender = 'male';
  private maleVoice: SpeechSynthesisVoice | null = null;
  private femaleVoice: SpeechSynthesisVoice | null = null;
  private isPreviewing: boolean = false;
  private previewingGender: VoiceGender | null = null;
  private listeners: StateChangeCallback[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  private initVoices() {
    if (!this.synth) return;
    const allVoices = this.synth.getVoices();
    if (allVoices.length === 0) return;

    const enVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const voicesPool = enVoices.length > 0 ? enVoices : allVoices;

    // 1. Resolve Best Male Voice
    this.maleVoice = voicesPool.find(v => {
      const name = v.name.toLowerCase();
      return MALE_KEYWORDS.some(k => name.includes(k));
    }) || voicesPool[0] || null;

    // 2. Resolve Best Female Voice
    this.femaleVoice = voicesPool.find(v => {
      const name = v.name.toLowerCase();
      return FEMALE_KEYWORDS.some(k => name.includes(k));
    }) || (voicesPool.length > 1 ? voicesPool[1] : voicesPool[0]) || null;

    this.notify();
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.selectedGender === 'male' ? this.maleVoice : this.femaleVoice;
  }

  public getVoiceOptionInfo(gender: VoiceGender): VoiceOptionInfo {
    const profile = VOICE_PROFILES[gender];
    const voiceObj = gender === 'male' ? this.maleVoice : this.femaleVoice;
    return {
      id: gender,
      name: profile.name,
      subtitle: profile.subtitle,
      description: profile.description,
      previewSample: profile.previewSample,
      gender,
      matchedVoiceName: voiceObj ? voiceObj.name : `Standard English ${gender === 'male' ? 'Male' : 'Female'}`,
    };
  }

  public setVoiceGender(gender: VoiceGender) {
    if (this.selectedGender === gender) return;
    this.selectedGender = gender;
    this.notify();

    // If active playback is ongoing, seamlessly switch voice on the current sentence
    if (this.isPlaying && !this.isPaused) {
      this.playSentence(this.currentIndex);
    }
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.6, Math.min(1.6, rate));
    this.notify();
    if (this.isPlaying && !this.isPaused) {
      this.playSentence(this.currentIndex);
    }
  }

  public loadSpeech(text: string): string[] {
    this.stop();
    const rawSentences = text
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);

    this.sentences = (rawSentences || [text])
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.currentIndex = 0;
    this.notify();
    return this.sentences;
  }

  /**
   * Preview a voice without interfering with the loaded speech position
   */
  public previewVoice(gender: VoiceGender) {
    if (!this.synth) return;

    // If already previewing this voice, stop it (toggle behavior)
    if (this.isPreviewing && this.previewingGender === gender) {
      this.stopPreview();
      return;
    }

    // Stop existing playback or preview
    this.stopPreview();
    if (this.isPlaying) {
      this.pause();
    }

    this.isPreviewing = true;
    this.previewingGender = gender;
    this.notify();

    const profile = VOICE_PROFILES[gender];
    const utterance = new SpeechSynthesisUtterance(profile.previewSample);
    const voiceObj = gender === 'male' ? this.maleVoice : this.femaleVoice;

    if (voiceObj) {
      utterance.voice = voiceObj;
    }
    utterance.rate = this.rate;
    utterance.pitch = gender === 'male' ? profile.malePitch : profile.femalePitch;

    utterance.onend = () => {
      this.isPreviewing = false;
      this.previewingGender = null;
      this.notify();
    };

    utterance.onerror = () => {
      this.isPreviewing = false;
      this.previewingGender = null;
      this.notify();
    };

    this.synth.speak(utterance);
  }

  public stopPreview() {
    if (!this.synth) return;
    if (this.isPreviewing) {
      this.synth.cancel();
      this.isPreviewing = false;
      this.previewingGender = null;
      this.notify();
    }
  }

  /**
   * Play from current sentence or start from beginning
   */
  public play() {
    if (!this.synth || this.sentences.length === 0) return;
    this.stopPreview();

    if (this.isPaused) {
      this.isPaused = false;
      this.isPlaying = true;
      this.playSentence(this.currentIndex);
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.playSentence(this.currentIndex);
  }

  /**
   * Pause playback cleanly
   */
  public pause() {
    if (!this.synth || !this.isPlaying) return;
    this.isPaused = true;
    this.isPlaying = false;
    this.synth.cancel(); // Cleans up audio buffer
    this.notify();
  }

  /**
   * Resume playback from the paused sentence
   */
  public resume() {
    if (!this.synth || !this.isPaused) return;
    this.stopPreview();
    this.isPaused = false;
    this.isPlaying = true;
    this.playSentence(this.currentIndex);
  }

  /**
   * Stop playback completely and reset to beginning
   */
  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentIndex = 0;
    this.isPreviewing = false;
    this.previewingGender = null;
    this.notify();
  }

  public jumpToSentence(index: number) {
    if (index >= 0 && index < this.sentences.length) {
      this.currentIndex = index;
      if (this.isPlaying) {
        this.playSentence(this.currentIndex);
      } else {
        this.notify();
      }
    }
  }

  private playSentence(index: number) {
    if (!this.synth) return;
    this.synth.cancel();

    if (index >= this.sentences.length) {
      this.stop();
      return;
    }

    this.currentIndex = index;
    const text = this.sentences[index];
    const utterance = new SpeechSynthesisUtterance(text);

    const voiceObj = this.getSelectedVoice();
    if (voiceObj) {
      utterance.voice = voiceObj;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.selectedGender === 'male' 
      ? VOICE_PROFILES.male.malePitch 
      : VOICE_PROFILES.female.femalePitch;

    utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        if (this.currentIndex < this.sentences.length) {
          this.playSentence(this.currentIndex);
        } else {
          this.stop();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      if (this.isPlaying && !this.isPaused) {
        this.currentIndex++;
        if (this.currentIndex < this.sentences.length) {
          this.playSentence(this.currentIndex);
        } else {
          this.stop();
        }
      }
    };

    this.activeUtterance = utterance;
    this.synth.speak(utterance);
    this.notify();
  }

  public subscribe(cb: StateChangeCallback): () => void {
    this.listeners.push(cb);
    cb(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  public getState(): SpeechSynthesizerState {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentSentenceIndex: this.currentIndex,
      totalSentences: this.sentences.length,
      rate: this.rate,
      pitch: this.selectedGender === 'male' ? VOICE_PROFILES.male.malePitch : VOICE_PROFILES.female.femalePitch,
      selectedGender: this.selectedGender,
      selectedVoice: this.getSelectedVoice(),
      isPreviewing: this.isPreviewing,
      previewingGender: this.previewingGender,
      maleVoiceName: this.maleVoice ? this.maleVoice.name : 'Natural Male Voice',
      femaleVoiceName: this.femaleVoice ? this.femaleVoice.name : 'Natural Female Voice',
    };
  }
}

export const speechSynthesizer = new RehearsalSpeechService();
