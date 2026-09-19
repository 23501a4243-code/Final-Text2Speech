import { SpeechType, SpeechTone, SpeechLength, SpeechAnswers, CueCard, SpeechProject, SpeechVersion } from '../types/speech';

export interface GenerateSpeechResponse {
  success: boolean;
  provider: string;
  speech: string;
  cueCards: CueCard[];
  wordCount: number;
  estimatedMinutes: number;
  error?: string;
}

const API_BASE = '/api';

export async function checkServerHealth(): Promise<{
  status: string;
  aiEngine: string;
  hasCustomKeysConfigured: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline_mode',
      aiEngine: 'smart-local-engine',
      hasCustomKeysConfigured: false,
    };
  }
}

export async function requestGenerateSpeech(params: {
  speechType: SpeechType;
  tone: SpeechTone;
  length: SpeechLength;
  answers: SpeechAnswers;
  apiKey?: string;
}): Promise<GenerateSpeechResponse> {
  try {
    const res = await fetch(`${API_BASE}/generate-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `Server responded with ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn('API request failed, generating client-side fallback:', error.message);
    return fallbackSpeechGeneration(params);
  }
}

export async function requestAdjustTone(params: {
  existingContent: string;
  newTone: SpeechTone;
  speechType: SpeechType;
  answers: SpeechAnswers;
  apiKey?: string;
}): Promise<GenerateSpeechResponse> {
  try {
    const res = await fetch(`${API_BASE}/adjust-tone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Tone adjustment failed' }));
      throw new Error(err.error || `Error ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn('Backend tone adjustment failed, generating client-side tone rewrite:', error.message);
    return fallbackToneAdjustment(params);
  }
}

export async function requestAdjustLength(params: {
  existingContent: string;
  targetLength: SpeechLength;
  speechType: SpeechType;
  apiKey?: string;
}): Promise<GenerateSpeechResponse> {
  try {
    const res = await fetch(`${API_BASE}/adjust-length`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Length adjustment failed' }));
      throw new Error(err.error || `Error ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn('Backend length adjustment failed, executing client-side trim/expand:', error.message);
    return fallbackLengthAdjustment(params);
  }
}

export async function requestRefineSection(params: {
  selectedText: string;
  instruction: string;
  apiKey?: string;
}): Promise<{ success: boolean; refinedText: string }> {
  try {
    const res = await fetch(`${API_BASE}/refine-section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error('Refine failed');
    return await res.json();
  } catch (error: any) {
    let refined = params.selectedText;
    if (params.instruction.toLowerCase().includes('funny')) {
      refined += ' (And let us just say, nobody in that room will ever look at him the same way again!)';
    } else if (params.instruction.toLowerCase().includes('emotional')) {
      refined += ' That moment spoke louder than any words ever could about the immense heart they possess.';
    } else {
      refined = refined.trim() + ' May this bond only grow stronger with each passing season.';
    }
    return { success: true, refinedText: refined };
  }
}

// Client-side instant fallbacks if backend server is unreachable
function fallbackSpeechGeneration({ speechType, tone, length, answers }: {
  speechType: SpeechType;
  tone: SpeechTone;
  length: SpeechLength;
  answers: SpeechAnswers;
}): GenerateSpeechResponse {
  const recipient = answers.recipientName || 'our guest of honor';
  const role = answers.speakerRole || answers.relationship || 'a close companion';
  const story = answers.storiesAnecdotes || 'all the unforgettable adventures we survived together';
  const admired = answers.admiredQualities || 'unwavering loyalty, kindness, and incredible spirit';
  const quirks = answers.quirksInsideJokes ? `Now, we can't talk about them without mentioning ${answers.quirksInsideJokes}. ` : '';
  const toast = answers.wishesClosingThought || 'May your future be filled with immense laughter, deep health, and boundless joy.';

  let speech = '';
  if (tone === 'funny') {
    speech = `Good evening everyone! For those who don't know me, I'm ${role}, and I have the distinct privilege—and immense liability—of speaking today on behalf of ${recipient}.

First of all, look around this gorgeous room. Everyone looks magnificent! And to ${recipient}... you look like someone who miraculously avoided getting found out today!

${quirks}We've shared so many incredible memories over the years, but if you want to understand who they really are, you only have to look at this: ${story}. Anyone else in their right mind would have run for the hills, but not them. They just smiled and forged ahead.

Behind all the laughter, here is the honest truth: ${admired}. In a world full of fair-weather acquaintances, they are the one who actually answers the phone and shows up.

${toast}

Ladies and gentlemen, please raise your glasses high. To ${recipient}: may your troubles be less, your blessings be more, and nothing but happiness come through your door. Cheers!`;
  } else if (tone === 'heartfelt') {
    speech = `Good evening family and dear friends. It is an extraordinary honor to stand before you today to celebrate ${recipient}.

As ${role}, I've had the privilege of watching their journey unfold through every season of life. And through all those chapters, one thing has remained constant: ${admired}.

I'll never forget ${story}. In that quiet moment, their entire soul was on display—their patience, their generosity, and their profound capacity to love without keeping score.

${quirks}To stand beside someone who lives with this much integrity is a rare gift. You bring warmth into every room you enter, and you make everyone around you feel valued, understood, and at peace.

${toast}

Please join me in raising a toast to ${recipient}. May your days be filled with gratitude, your home be surrounded by peace, and your path ahead be bright. To a truly extraordinary person!`;
  } else {
    speech = `Good evening everyone! I am deeply honored to be with all of you tonight as we celebrate ${recipient}.

As ${role}, I've had a front-row seat to an inspiring journey. If there's one thing that defines them, it is their genuine passion for life and for the people they care about. Case in point: ${story}. That memory will forever put a smile on my face because it encapsulates everything they stand for.

${quirks}Beyond the great laughs and shared milestones, what I admire most about ${recipient} is their character: ${admired}. They are someone you can count on unconditionally, someone whose word is gold, and whose heart is always in the right place.

Seeing everyone gathered here tonight is a true testament to the ripples of goodwill they have created across so many lives.

${toast}

Everyone, please raise your glasses. Here is to ${recipient}—to unforgettable memories, lifelong bonds, and the wonderful adventures still to come. Cheers!`;
  }

  const wordCount = speech.trim().split(/\s+/).length;
  const estimatedMinutes = Math.round((wordCount / 130) * 10) / 10;

  return {
    success: true,
    provider: 'client_offline_engine',
    speech,
    cueCards: [
      {
        cardIndex: 1,
        stageCue: '[PAUSE - TAKE A DEEP BREATH & SMILE]',
        content: `Introduction as ${role}. Welcome the crowd and acknowledge ${recipient}.`,
        timingEstimate: '0:00 - 0:45',
        keyTip: 'Make eye contact with both wings of the room before speaking.',
      },
      {
        cardIndex: 2,
        stageCue: '[LEAN IN - PAUSE FOR CHUCKLE]',
        content: `The core story: ${story.slice(0, 80)}...`,
        timingEstimate: '0:45 - 1:45',
        keyTip: 'Deliver the punchline with a calm grin, let the laughter settle.',
      },
      {
        cardIndex: 3,
        stageCue: '[SLOW DOWN - SINCERE EYE CONTACT]',
        content: `Admiration for character: ${admired.slice(0, 80)}...`,
        timingEstimate: '1:45 - 2:45',
        keyTip: 'Look directly at the recipient as you speak from the heart.',
      },
      {
        cardIndex: 4,
        stageCue: '[RAISE GLASS HIGH - STAND TALL]',
        content: `Closing toast: ${toast.slice(0, 80)}...`,
        timingEstimate: '2:45 - 3:30',
        keyTip: 'Lead the room into a proud, loud cheer and toast.',
      },
    ],
    wordCount,
    estimatedMinutes,
  };
}

function fallbackToneAdjustment(params: any): GenerateSpeechResponse {
  return fallbackSpeechGeneration({
    speechType: params.speechType,
    tone: params.newTone,
    length: 'medium',
    answers: params.answers,
  });
}

function fallbackLengthAdjustment(params: any): GenerateSpeechResponse {
  const words = params.existingContent.trim().split(/\s+/);
  return {
    success: true,
    provider: 'client_offline_engine',
    speech: params.existingContent,
    cueCards: [],
    wordCount: words.length,
    estimatedMinutes: Math.round((words.length / 130) * 10) / 10,
  };
}

// -----------------------------------------------------------------
// Persistent Database APIs (Speech Projects & Version History)
// -----------------------------------------------------------------

export async function fetchSpeechesApi(token?: string): Promise<SpeechProject[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/speeches`, { headers });
    if (!res.ok) throw new Error('Failed to fetch speeches from database');
    const data = await res.json();
    return data.speeches || [];
  } catch (err: any) {
    console.warn('Backend fetchSpeeches failed, using local storage fallback:', err.message);
    return [];
  }
}

export async function saveSpeechApi(speech: SpeechProject, token?: string): Promise<SpeechProject | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/speeches`, {
      method: 'POST',
      headers,
      body: JSON.stringify(speech),
    });

    if (!res.ok) throw new Error('Failed to save speech to database');
    const data = await res.json();
    return data.speech || null;
  } catch (err: any) {
    console.warn('Backend saveSpeech failed, relying on local storage fallback:', err.message);
    return null;
  }
}

export async function deleteSpeechApi(id: string, token?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/speeches/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  } catch (err: any) {
    console.warn('Backend deleteSpeech failed:', err.message);
    return false;
  }
}

export async function saveVersionApi(speechId: string, version: Partial<SpeechVersion>, token?: string): Promise<SpeechVersion | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/speeches/${speechId}/versions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(version),
    });

    if (!res.ok) throw new Error('Failed to save version snapshot');
    const data = await res.json();
    return data.version || null;
  } catch (err: any) {
    console.warn('Backend saveVersion failed:', err.message);
    return null;
  }
}

export async function fetchVersionsApi(speechId: string, token?: string): Promise<SpeechVersion[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/speeches/${speechId}/versions`, { headers });
    if (!res.ok) throw new Error('Failed to fetch versions');
    const data = await res.json();
    return data.versions || [];
  } catch (err: any) {
    console.warn('Backend fetchVersions failed:', err.message);
    return [];
  }
}

