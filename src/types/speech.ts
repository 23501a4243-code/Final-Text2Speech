export type SpeechType = 
  | 'best_man' 
  | 'maid_of_honor' 
  | 'parent_wedding'
  | 'groom_bride_toast' 
  | 'anniversary'
  | 'graduation'
  | 'award'
  | 'baby_shower'
  | 'retirement' 
  | 'eulogy' 
  | 'farewell' 
  | 'birthday_roast';

export type SpeechTone = 'funny' | 'heartfelt' | 'formal' | 'balanced';

export type SpeechLength = 'short' | 'medium' | 'long';

export interface QuestionDefinition {
  id: string;
  label: string;
  placeholder: string;
  helpText?: string;
  multiline?: boolean;
  required?: boolean;
  exampleSnippet?: string;
}

export interface SpeechTypeMetadata {
  id: SpeechType;
  title: string;
  subtitle: string;
  category: 'Wedding' | 'Celebration' | 'Memorial' | 'Milestone';
  icon: string;
  accentColor: string;
  questions: QuestionDefinition[];
  defaultTone: SpeechTone;
  defaultLength: SpeechLength;
  audienceTips: string[];
}

export interface SpeechAnswers {
  recipientName: string;
  speakerRole: string;
  relationship: string;
  yearsKnown?: string;
  storiesAnecdotes: string;
  admiredQualities: string;
  quirksInsideJokes?: string;
  wishesClosingThought: string;
  audienceContext?: string;
  customAnswers?: Record<string, string>;
}

export interface CueCard {
  cardIndex: number;
  stageCue: string;
  content: string;
  timingEstimate: string; // e.g., "0:00 - 0:45"
  keyTip?: string;
}

export interface SpeechVersion {
  id: string;
  timestamp: number;
  label: string; // e.g., "Initial Generation", "Tone: Funny", "Manual Edit", "Rehearsal Checkpoint"
  content: string;
  wordCount: number;
  tone: SpeechTone;
  length: SpeechLength;
  author: 'user' | 'ai';
  changesSummary?: string;
}

export interface SpeechProject {
  id: string;
  title: string;
  speechType: SpeechType;
  tone: SpeechTone;
  length: SpeechLength;
  answers: SpeechAnswers;
  content: string;
  drafts: {
    id: string;
    tone: SpeechTone;
    length: SpeechLength;
    content: string;
    createdAt: number;
  }[];
  activeDraftIndex: number;
  versions?: SpeechVersion[];
  cueCards: CueCard[];
  wordCount: number;
  estimatedMinutes: number;
  createdAt: number;
  updatedAt: number;
  isFavorited?: boolean;
}

export interface DeliveryAnalysis {
  wordCount: number;
  readingMinutes: number;
  targetWpm: number;
  pacingScore: number; // 0-100
  toneDistribution: {
    humor: number;
    emotion: number;
    formality: number;
  };
  emotionalArc: {
    section: string;
    sentiment: 'uplifting' | 'humorous' | 'emotional' | 'celebratory';
    percentage: number;
  }[];
  coachAdvice: string[];
}
