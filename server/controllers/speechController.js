import { 
  buildSpeechGenerationPrompt, 
  buildToneAdjustmentPrompt, 
  buildLengthAdjustmentPrompt, 
  buildCueCardsPrompt 
} from '../prompts/speechPrompts.js';

// Helper to call Google Gemini REST API
async function callGemini(prompt, apiKey) {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) throw new Error('No content returned from Gemini');
  return candidate.trim();
}

// Helper to call OpenAI API
async function callOpenAI(prompt, apiKey) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an award-winning speechwriter and delivery coach.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// Smart algorithmic generator fallback (ensures flawless hackathon demos even offline or without keys)
function generateSmartSpeechLocal({ speechType, tone, length, answers }) {
  const recipient = answers.recipientName || 'our guest of honor';
  const relationship = answers.relationship || answers.speakerRole || 'a dear lifelong friend';
  const stories = answers.storiesAnecdotes || 'all the unforgettable adventures we survived together';
  const admired = answers.admiredQualities || 'unfaltering loyalty, warmth, and unmatched character';
  const quirks = answers.quirksInsideJokes ? `Of course, no celebration would be complete without acknowledging ${answers.quirksInsideJokes}. ` : '';
  const wishes = answers.wishesClosingThought || 'May the days ahead bring boundless joy, bold adventures, and endless love.';

  if (speechType === 'best_man') {
    if (tone === 'funny') {
      return `Good evening everyone! For those of you who don't know me, I'm the Best Man, and Dave's official alibi provider for over a decade.

First of all, to the bride: you look utterly stunning. And to the groom: you look like you're still wondering how on earth she agreed to this without a background check!

${relationship}. Over the years, I've witnessed my fair share of legendary moments. Like the time: ${stories}. When that happened, anyone else would have admitted defeat, but not him. He just looked at me with that wild grin and figured out how to turn a total disaster into an unforgettable victory.

${quirks}Now, we poke fun because we love him. But beneath the jokes, here is the truth: ${admired}. When you have him in your corner, you never walk into a fight alone.

And then along came the love of his life. From the moment they met, everything transformed. He started smiling wider, standing taller, and suddenly realized that happiness isn't a spreadsheet—it's having the right partner holding your hand through life's unexpected detours.

${wishes}

Everyone, please raise your glasses. To the bride and groom: may your laughter be loud, your love enduring, and may he always remember who is in charge. Cheers!`;
    } else if (tone === 'heartfelt') {
      return `Good evening family and cherished friends. It is one of the greatest honors of my life to stand here tonight beside ${recipient}.

${relationship}. When you've known someone through all of life's seasons—the quiet doubts, the hard-fought milestones, and the dream-chasing—you get to witness their true core. And what I know about ${recipient} is this: ${admired}.

I'll never forget ${stories}. That moment captured everything you need to know about his spirit—his unconditional devotion to the people he loves.

${quirks}When he met his partner, I watched an already extraordinary man become whole. You brought an unmistakable peace, a brilliant light, and a sense of effortless sanctuary to his world. You didn't just join his journey; you became the horizon he'd been searching for.

${wishes}

Please join me in raising a toast to ${recipient}. May your home always be filled with grace, deep understanding, and a love that only deepens with every tomorrow. To love!`;
    } else if (tone === 'formal') {
      return `Distinguished guests, family, and honored friends. It is my privilege and distinct honor to welcome you all this evening to celebrate ${recipient}.

As ${relationship}, I have had the opportunity to observe their unwavering commitment to excellence, integrity, and honor. In life, true character is revealed not during comfortable moments, but in times of challenge. Consider this defining reflection: ${stories}. 

Throughout every chapter, ${admired} have defined their leadership and personal relationships. ${quirks}Tonight marks the commencement of a distinguished partnership built on mutual respect and enduring affection.

${wishes}

Ladies and gentlemen, let us raise our glasses in tribute to this exemplary union and to a future of shared honor and distinction. To the happy couple.`;
    } else {
      // Balanced
      return `Good evening everyone! I am deeply honored to stand here tonight as we celebrate ${recipient}.

As ${relationship}, I've had a front-row seat to an incredible journey. If you know anything about them, you know they are someone who tackles life with both passion and heart. Take for example: ${stories}. Moments like that remind you that life is rarely predictable, but with someone this loyal and spirited, it's always an adventure.

${quirks}Beyond the shared laughs and fond memories, what stands out most about ${recipient} is their character: ${admired}. They are the rare kind of person who shows up when it matters most, who listens without judgment, and who gives their whole heart to the things and people they believe in.

Seeing them standing here today with their partner brings everything full circle. You complement each other in every way that counts—bringing out the best, grounding each other in turbulent moments, and multiplying every ounce of joy.

${wishes}

Ladies and gentlemen, please raise your glasses high. To ${recipient}: may your journey together be blessed with laughter, resilience, adventure, and everlasting happiness. Cheers!`;
    }
  }

  // Generic balanced/heartfelt fallback for other speech types
  return `Good evening everyone. It is a genuine honor to speak today on behalf of ${recipient}.

As ${relationship}, I've had the distinct joy of sharing countless chapters together. To truly understand who they are, you only have to look at: ${stories}.

${quirks}What I have always admired most about ${recipient} is their undeniable character: ${admired}. In a world that moves so fast, they are someone who grounds everyone around them with sincerity, strength, and unmistakable warmth.

Looking around this room today, you see a testament to the immense impact one remarkable life can have. Every story shared, every smile exchanged is a reflection of the love they have poured into all of us.

${wishes}

Please join me in raising our glasses and our hearts in tribute to ${recipient}. To life, to friendship, and to every bright chapter still to come. Cheers!`;
}

// Synthesize Cue Cards locally if offline
function generateLocalCueCards(speechText) {
  const paragraphs = speechText.split('\n\n').filter(p => p.trim().length > 20);
  const cues = [
    { cue: '[PAUSE - TAKE A DEEP BREATH & SMILE]', tip: 'Sweep the room with your eyes, establish warm connection.' },
    { cue: '[PAUSE FOR LAUGHTER / REACTION]', tip: 'Deliver the humorous line with confidence and wait for the room to respond.' },
    { cue: '[SLOW DOWN - SINCERE & HEARTFELT]', tip: 'Lower your vocal pitch slightly to draw the audience in emotionally.' },
    { cue: '[DIRECT EYE CONTACT WITH HONOREE]', tip: 'Speak these words directly to the recipient, not to the paper.' },
    { cue: '[RAISE GLASS HIGH - LOOK AT CROWD]', tip: 'Stand tall, raise your glass proudly, and lead the final cheer.' },
  ];

  if (paragraphs.length >= 4) {
    return paragraphs.slice(0, 5).map((para, idx) => {
      const cueObj = cues[idx % cues.length];
      const startMin = Math.floor(idx * 0.8);
      const endMin = Math.floor((idx + 1) * 0.8);
      return {
        cardIndex: idx + 1,
        stageCue: cueObj.cue,
        content: para.slice(0, 220) + (para.length > 220 ? '...' : ''),
        timingEstimate: `${startMin}:${(idx * 45) % 60 < 10 ? '0' : ''}${(idx * 45) % 60} - ${endMin}:${((idx + 1) * 45) % 60 < 10 ? '0' : ''}${((idx + 1) * 45) % 60}`,
        keyTip: cueObj.tip,
      };
    });
  }

  // Fallback 4 cue cards
  return [
    {
      cardIndex: 1,
      stageCue: '[PAUSE - TAKE A DEEP BREATH & SMILE]',
      content: 'Opening hook & introduction. Welcoming guests and setting the joyful atmosphere.',
      timingEstimate: '0:00 - 0:45',
      keyTip: 'Make eye contact across both sides of the room.',
    },
    {
      cardIndex: 2,
      stageCue: '[PAUSE FOR CHUCKLES / LEAN IN]',
      content: 'The core story & humorous anecdote. Highlighting their personality and memorable moments.',
      timingEstimate: '0:45 - 1:45',
      keyTip: 'Pause after the punchline—let the laughter land.',
    },
    {
      cardIndex: 3,
      stageCue: '[TRANSITION TO WARM SINCERITY - SLOW DOWN]',
      content: 'Heartfelt tribute to their character, loyalty, and the partner/family.',
      timingEstimate: '1:45 - 2:45',
      keyTip: 'Look directly at the recipient as you speak from the heart.',
    },
    {
      cardIndex: 4,
      stageCue: '[STAND TALL & RAISE GLASS HIGH]',
      content: 'Closing toast: wishes for future happiness, health, and raising glasses together.',
      timingEstimate: '2:45 - 3:30',
      keyTip: 'Finish on a confident, loud, celebratory cheer!',
    },
  ];
}

// Controller Endpoints
export async function generateSpeech(req, res) {
  try {
    const { speechType, tone = 'balanced', length = 'medium', answers, apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!answers || !answers.recipientName) {
      return res.status(400).json({ error: 'Recipient name and context are required.' });
    }

    let speechText = '';
    let provider = 'offline_engine';

    if (apiKey) {
      const prompt = buildSpeechGenerationPrompt({ speechType, tone, length, answers });
      try {
        if (apiKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
          speechText = await callGemini(prompt, apiKey);
          provider = 'gemini-2.5-flash';
        } else {
          speechText = await callOpenAI(prompt, apiKey);
          provider = 'gpt-4o-mini';
        }
      } catch (llmErr) {
        console.warn('Live LLM call failed, falling back to smart local generator:', llmErr.message);
        speechText = generateSmartSpeechLocal({ speechType, tone, length, answers });
        provider = 'offline_fallback';
      }
    } else {
      speechText = generateSmartSpeechLocal({ speechType, tone, length, answers });
    }

    // Generate cue cards
    const cueCards = generateLocalCueCards(speechText);
    const wordCount = speechText.trim().split(/\s+/).length;
    const estimatedMinutes = Math.round((wordCount / 130) * 10) / 10;

    res.json({
      success: true,
      provider,
      speech: speechText,
      cueCards,
      wordCount,
      estimatedMinutes,
    });
  } catch (error) {
    console.error('generateSpeech error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function adjustTone(req, res) {
  try {
    const { existingContent, newTone, speechType = 'best_man', answers = {}, apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!existingContent || !newTone) {
      return res.status(400).json({ error: 'existingContent and newTone are required.' });
    }

    let updatedSpeech = '';
    let provider = 'offline_engine';

    if (apiKey) {
      const prompt = buildToneAdjustmentPrompt({ existingContent, newTone, speechType, answers });
      try {
        if (apiKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
          updatedSpeech = await callGemini(prompt, apiKey);
          provider = 'gemini-2.5-flash';
        } else {
          updatedSpeech = await callOpenAI(prompt, apiKey);
          provider = 'gpt-4o-mini';
        }
      } catch (err) {
        console.warn('Tone adjustment via live LLM failed, using smart local rewrite:', err.message);
        updatedSpeech = generateSmartSpeechLocal({ speechType, tone: newTone, length: 'medium', answers });
        provider = 'offline_fallback';
      }
    } else {
      updatedSpeech = generateSmartSpeechLocal({ speechType, tone: newTone, length: 'medium', answers });
    }

    const cueCards = generateLocalCueCards(updatedSpeech);
    const wordCount = updatedSpeech.trim().split(/\s+/).length;
    const estimatedMinutes = Math.round((wordCount / 130) * 10) / 10;

    res.json({
      success: true,
      provider,
      speech: updatedSpeech,
      cueCards,
      wordCount,
      estimatedMinutes,
    });
  } catch (error) {
    console.error('adjustTone error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function adjustLength(req, res) {
  try {
    const { existingContent, targetLength, speechType = 'best_man', apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!existingContent || !targetLength) {
      return res.status(400).json({ error: 'existingContent and targetLength are required.' });
    }

    let adjustedSpeech = '';
    let provider = 'offline_engine';

    if (apiKey) {
      const prompt = buildLengthAdjustmentPrompt({ existingContent, targetLength, speechType });
      try {
        if (apiKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
          adjustedSpeech = await callGemini(prompt, apiKey);
          provider = 'gemini-2.5-flash';
        } else {
          adjustedSpeech = await callOpenAI(prompt, apiKey);
          provider = 'gpt-4o-mini';
        }
      } catch (err) {
        adjustedSpeech = trimOrExpandText(existingContent, targetLength);
        provider = 'offline_fallback';
      }
    } else {
      adjustedSpeech = trimOrExpandText(existingContent, targetLength);
    }

    const cueCards = generateLocalCueCards(adjustedSpeech);
    const wordCount = adjustedSpeech.trim().split(/\s+/).length;
    const estimatedMinutes = Math.round((wordCount / 130) * 10) / 10;

    res.json({
      success: true,
      provider,
      speech: adjustedSpeech,
      cueCards,
      wordCount,
      estimatedMinutes,
    });
  } catch (error) {
    console.error('adjustLength error:', error);
    res.status(500).json({ error: error.message });
  }
}

function trimOrExpandText(text, targetLength) {
  const paragraphs = text.split('\n\n');
  if (targetLength === 'short') {
    // Keep intro, best story, and conclusion toast
    if (paragraphs.length > 3) {
      return [paragraphs[0], paragraphs[1], paragraphs[paragraphs.length - 1]].join('\n\n');
    }
  } else if (targetLength === 'long') {
    // Expand with an additional heartfelt reflection
    return text + '\n\n' + 'Looking into the future, remember that the true measure of our lives is found in the everyday grace we grant one another. May every morning greet you with renewed purpose and joy.';
  }
  return text;
}

export async function generateCueCards(req, res) {
  try {
    const { speechContent, speechType = 'speech' } = req.body;
    if (!speechContent) {
      return res.status(400).json({ error: 'speechContent is required' });
    }

    const cards = generateLocalCueCards(speechContent);
    res.json({ success: true, cueCards: cards });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function refineSection(req, res) {
  try {
    const { selectedText, instruction, apiKey: clientKey } = req.body;
    const apiKey = clientKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!selectedText || !instruction) {
      return res.status(400).json({ error: 'selectedText and instruction are required.' });
    }

    let refinedText = selectedText;
    if (apiKey) {
      const prompt = `You are a speech coach. Rewrite this selected excerpt from a speech according to the instruction: "${instruction}". Keep it natural and conversational. Return ONLY the rewritten excerpt.\n\nEXCERPT:\n"""${selectedText}"""`;
      try {
        if (apiKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
          refinedText = await callGemini(prompt, apiKey);
        } else {
          refinedText = await callOpenAI(prompt, apiKey);
        }
      } catch (err) {
        console.warn('Refinement fallback:', err.message);
      }
    } else {
      // Local quick polish
      if (instruction.includes('funny')) {
        refinedText = selectedText + ' (And believe me, nobody in their right mind saw that coming!)';
      } else if (instruction.includes('emotional')) {
        refinedText = selectedText + ' That moment showed me the boundless depth of their kindness.';
      }
    }

    res.json({ success: true, refinedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
