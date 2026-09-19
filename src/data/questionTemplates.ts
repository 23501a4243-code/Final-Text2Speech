import { SpeechTypeMetadata, SpeechType } from '../types/speech';

export const SPEECH_TYPES: SpeechTypeMetadata[] = [
  {
    id: 'best_man',
    title: 'Best Man Speech',
    subtitle: 'Witty, respectful roasts, brotherhood, and a toast to the happy couple',
    category: 'Wedding',
    icon: 'GlassWater',
    accentColor: 'from-amber-500 to-yellow-600',
    defaultTone: 'balanced',
    defaultLength: 'medium',
    audienceTips: [
      'Gently poke fun at the groom, but keep it PG-13 for grandparents and family.',
      'Always dedicate at least 40% of the speech to honoring the bride/spouse.',
      'Never mention exes, old college debauchery, or divorce stats.',
      'End with a genuine, heartfelt toast raising your glass.'
    ],
    questions: [
      {
        id: 'recipientName',
        label: 'Who is the groom (and spouse)?',
        placeholder: 'e.g., David and his gorgeous bride Sarah',
        required: true,
        exampleSnippet: 'David & Sarah',
      },
      {
        id: 'relationship',
        label: 'How do you know him & for how long?',
        placeholder: 'e.g., College roommates at Michigan for 4 years, now best friends for 12 years',
        required: true,
        exampleSnippet: 'College roommates and brothers in all but blood for 10 years',
      },
      {
        id: 'storiesAnecdotes',
        label: 'Share 2-3 funny, memorable, or defining moments',
        placeholder: 'e.g., The time his car broke down in the rain and he insisted on fixing it with duct tape; how nervous he was before their first date at Little Italy...',
        multiline: true,
        required: true,
        exampleSnippet: 'The road trip where he tried to fix an alternator with zip ties; how he texted me after their 1st date saying "I am going to marry this girl"',
      },
      {
        id: 'admiredQualities',
        label: 'What do you admire most about him as a friend/man?',
        placeholder: 'e.g., Fiercely loyal, never hesitates to show up at 2 AM, how his eyes light up whenever Sarah walks in the room...',
        multiline: true,
        required: true,
      },
      {
        id: 'quirksInsideJokes',
        label: 'Any lighthearted quirks or inside jokes to gently poke fun at?',
        placeholder: 'e.g., His obsession with fantasy football spreadsheets, his terrible cooking skills...',
      },
      {
        id: 'wishesClosingThought',
        label: 'Your wishes & toast for their marriage journey',
        placeholder: 'e.g., May your love grow deeper every day and may Dave always remember that Sarah is right.',
        required: true,
      },
    ],
  },
  {
    id: 'maid_of_honor',
    title: 'Maid of Honor Speech',
    subtitle: 'Sisterhood, cherished childhood secrets, tears of joy, and warm blessings',
    category: 'Wedding',
    icon: 'Sparkles',
    accentColor: 'from-rose-500 to-pink-600',
    defaultTone: 'heartfelt',
    defaultLength: 'medium',
    audienceTips: [
      'Balance happy tears with bright laughter.',
      'Welcome the spouse into the family/inner circle warmly.',
      'Keep the focus on the bride while highlighting how the partner makes her truly shine.'
    ],
    questions: [
      {
        id: 'recipientName',
        label: 'Who is the bride (and her partner)?',
        placeholder: 'e.g., Emily and her husband Liam',
        required: true,
      },
      {
        id: 'relationship',
        label: 'What is your relationship to her?',
        placeholder: 'e.g., Older sister, inseparable childhood best friend since kindergarten',
        required: true,
      },
      {
        id: 'storiesAnecdotes',
        label: 'Share 2 memorable childhood or friendship memories',
        placeholder: 'e.g., Building pillow forts dreaming about our wedding days; the moment she called me after Liam proposed in Kyoto...',
        multiline: true,
        required: true,
      },
      {
        id: 'admiredQualities',
        label: 'What makes her uniquely special and radiant?',
        placeholder: 'e.g., Her empathy, infectious laughter, how she puts everyone before herself...',
        multiline: true,
        required: true,
      },
      {
        id: 'quirksInsideJokes',
        label: 'When did you realize her partner was "The One"?',
        placeholder: 'e.g., The Thanksgiving dinner when Liam ate her burnt pecan pie with a genuine smile...',
      },
      {
        id: 'wishesClosingThought',
        label: 'Your toast & blessings for their future together',
        placeholder: 'e.g., To endless adventures, spontaneous dance parties in the kitchen, and a lifetime of happiness.',
        required: true,
      },
    ],
  },
  {
    id: 'retirement',
    title: 'Retirement Celebration',
    subtitle: 'Celebrating decades of leadership, legendary work memories, and new horizons',
    category: 'Milestone',
    icon: 'Award',
    accentColor: 'from-blue-500 to-indigo-600',
    defaultTone: 'balanced',
    defaultLength: 'medium',
    audienceTips: [
      'Acknowledge both the hard professional accomplishments and the human relationships.',
      'Share a memorable office anecdote that illustrates their personality.',
      'Send them off into retirement with enthusiasm (golf, gardening, travel, or naps).'
    ],
    questions: [
      {
        id: 'recipientName',
        label: 'Who is retiring & what is their title/role?',
        placeholder: 'e.g., Robert Henderson, Senior Engineering Director',
        required: true,
      },
      {
        id: 'relationship',
        label: 'How many years did they serve & what was your working connection?',
        placeholder: 'e.g., 28 years at the company; I have been on his product team for the past 9 years',
        required: true,
      },
      {
        id: 'storiesAnecdotes',
        label: 'Key career achievements & legendary workplace moments',
        placeholder: 'e.g., Guided us through the 2018 migration without a hiccup; famously brought homemade cinnamon rolls to Friday standups...',
        multiline: true,
        required: true,
      },
      {
        id: 'admiredQualities',
        label: 'What leadership or mentorship qualities will be missed most?',
        placeholder: 'e.g., Unflappable calm under pressure, always championing younger team members...',
        multiline: true,
        required: true,
      },
      {
        id: 'quirksInsideJokes',
        label: 'Favorite work quirks or running jokes',
        placeholder: 'e.g., His 10-minute "quick question" calls, color-coded whiteboard markers...',
      },
      {
        id: 'wishesClosingThought',
        label: 'Wishes for their next chapter (hobbies, travel, family)',
        placeholder: 'e.g., More time on the sailboat, less time checking Slack notifications at 6 AM.',
        required: true,
      },
    ],
  },
  {
    id: 'eulogy',
    title: 'Funeral Eulogy & Memorial',
    subtitle: 'Honoring a cherished life, timeless values, deep love, and enduring legacy',
    category: 'Memorial',
    icon: 'Heart',
    accentColor: 'from-purple-500 to-slate-700',
    defaultTone: 'heartfelt',
    defaultLength: 'medium',
    audienceTips: [
      'Focus on the living impact: how they made people feel, what they taught us.',
      'A touch of gentle, fond humor often brings immense comfort and warmth.',
      'Speak slowly; taking a deep breath during grief is powerful and respected.'
    ],
    questions: [
      {
        id: 'recipientName',
        label: 'Who are we honoring today?',
        placeholder: 'e.g., Margaret "Grandma Peggy" Thompson',
        required: true,
      },
      {
        id: 'relationship',
        label: 'What was your relationship to them?',
        placeholder: 'e.g., Grandson / Youngest daughter / Lifelong friend of 40 years',
        required: true,
      },
      {
        id: 'storiesAnecdotes',
        label: 'Share a story or memory that captures their true essence',
        placeholder: 'e.g., Sitting on the porch teaching me how to sketch; her tireless volunteering at the community shelter...',
        multiline: true,
        required: true,
      },
      {
        id: 'admiredQualities',
        label: 'What values, wisdom, or life lessons did they bestow?',
        placeholder: 'e.g., Unconditional kindness, unwavering integrity, the power of a warm cup of tea and listening...',
        multiline: true,
        required: true,
      },
      {
        id: 'quirksInsideJokes',
        label: 'Little endearing habits or sayings they were famous for',
        placeholder: 'e.g., Never letting anyone leave her house hungry; her signature greeting...',
      },
      {
        id: 'wishesClosingThought',
        label: 'Closing comfort and words of remembrance for the gathered family',
        placeholder: 'e.g., Her memory lives on in every kindness we extend to one another. May she rest in peace.',
        required: true,
      },
    ],
  },
  {
    id: 'farewell',
    title: 'Farewell / Going Away Party',
    subtitle: 'Bittersweet goodbyes, fond memories, laughter, and exciting new adventures',
    category: 'Celebration',
    icon: 'Send',
    accentColor: 'from-emerald-500 to-teal-600',
    defaultTone: 'funny',
    defaultLength: 'medium',
    audienceTips: [
      'Celebrate their exciting new leap while letting them know they will be deeply missed.',
      'Keep the atmosphere energetic and upbeat.'
    ],
    questions: [
      {
        id: 'recipientName',
        label: 'Who is moving / moving on?',
        placeholder: 'e.g., Alex Rivera, moving to London for graduate school',
        required: true,
      },
      {
        id: 'relationship',
        label: 'How long have you been connected and in what context?',
        placeholder: 'e.g., Neighbor and best gym buddy for 5 years',
        required: true,
      },
      {
        id: 'storiesAnecdotes',
        label: 'Funniest or craziest adventures together',
        placeholder: 'e.g., Getting lost in the subway after midnight, the half-marathon we barely trained for...',
        multiline: true,
        required: true,
      },
      {
        id: 'admiredQualities',
        label: 'What will everyone miss most about their presence?',
        placeholder: 'e.g., Her electric optimism, impromptu trivia nights, unmatched karaoke courage...',
        multiline: true,
        required: true,
      },
      {
        id: 'quirksInsideJokes',
        label: 'Inside jokes or warnings for their new city/team',
        placeholder: 'e.g., Warn London about her coffee dependency...',
      },
      {
        id: 'wishesClosingThought',
        label: 'Your send-off toast & promise to visit',
        placeholder: 'e.g., To conquering the UK, and remember your spare couch belongs to me.',
        required: true,
      },
    ],
  },
  {
    id: 'birthday_roast',
    title: 'Milestone Birthday Roast & Toast',
    subtitle: 'Sharp wit, playful aging jabs, genuine admiration, and raising a glass to 30, 40, 50+',
    category: 'Milestone',
    icon: 'PartyPopper',
    accentColor: 'from-amber-500 to-rose-600',
    defaultTone: 'funny',
    defaultLength: 'medium',
    audienceTips: [
      'Punch with affection: make them laugh at themselves, but end with authentic love.',
      'Great for 30th, 40th, 50th, 60th birthdays.'
    ],
    questions: [
      {
        id: 'recipientName',
        label: 'Who is celebrating & what milestone age?',
        placeholder: 'e.g., Jason turning the big 4-0!',
        required: true,
      },
      {
        id: 'relationship',
        label: 'How are you connected to the birthday star?',
        placeholder: 'e.g., Brother-in-law and partner-in-crime for 15 years',
        required: true,
      },
      {
        id: 'storiesAnecdotes',
        label: 'Hilarious aging moments or signature blunders',
        placeholder: 'e.g., Bought a mountain bike last month that has not left the garage; groaning every time he stands up...',
        multiline: true,
        required: true,
      },
      {
        id: 'admiredQualities',
        label: 'What makes them an exceptional person beneath the teasing?',
        placeholder: 'e.g., The best dad to his two girls, the first to volunteer for any friend in need...',
        multiline: true,
        required: true,
      },
      {
        id: 'quirksInsideJokes',
        label: 'Their most hilarious obsession or habit',
        placeholder: 'e.g., Obsession with lawn care perfection, secret 90s boyband playlist...',
      },
      {
        id: 'wishesClosingThought',
        label: 'Your grand birthday toast',
        placeholder: 'e.g., Like a fine vintage wine: slightly sour, expensive to maintain, but beloved by all.',
        required: true,
      },
    ],
  },
];

export const TONES_CONFIG = [
  {
    id: 'funny',
    name: 'Funny & Witty',
    badge: 'High Energy',
    description: 'Packed with clever jokes, playful teasing, and audience laughter pauses.',
    icon: 'Smile',
    color: 'border-amber-500/60 bg-amber-500/10 text-amber-300',
  },
  {
    id: 'heartfelt',
    name: 'Heartfelt & Sincere',
    badge: 'Tear-Jerker',
    description: 'Deep emotional resonance, vulnerability, and meaningful expressions of love.',
    icon: 'Heart',
    color: 'border-rose-500/60 bg-rose-500/10 text-rose-300',
  },
  {
    id: 'balanced',
    name: 'The Perfect Blend',
    badge: 'Crowd Pleaser',
    description: 'The golden ratio: 50% witty stories + 50% warm sincerity and respect.',
    icon: 'Sparkles',
    color: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
  },
  {
    id: 'formal',
    name: 'Formal & Poised',
    badge: 'Sophisticated',
    description: 'Polished, structured, dignified, and elegant for formal banquet or corporate settings.',
    icon: 'Shield',
    color: 'border-blue-500/60 bg-blue-500/10 text-blue-300',
  },
];

export const LENGTHS_CONFIG = [
  {
    id: 'short',
    name: 'Short & Punchy',
    wordRange: '300 – 400 words',
    duration: '~2.5 to 3 mins',
    description: 'Crisp, memorable, fast-paced. Perfect for tight schedules or anxious speakers.',
  },
  {
    id: 'medium',
    name: 'The Classic Gold Standard',
    wordRange: '500 – 700 words',
    duration: '~4 to 5 mins',
    description: 'The sweet spot for wedding toasts and milestone tributes without losing audience attention.',
  },
  {
    id: 'long',
    name: 'Epic Keynote Tribute',
    wordRange: '800 – 1,000+ words',
    duration: '~7 to 9 mins',
    description: 'Detailed storytelling, deep emotional arcs, and expansive reflections for major events.',
  },
];
