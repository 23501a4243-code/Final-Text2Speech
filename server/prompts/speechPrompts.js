export function buildSpeechGenerationPrompt({ speechType, tone, length, answers }) {
  const wordCountGuide = {
    short: '300 to 400 words (approx 2.5 to 3 minutes spoken)',
    medium: '500 to 650 words (approx 4 to 5 minutes spoken)',
    long: '800 to 950 words (approx 7 to 8 minutes spoken)',
  }[length] || '500 to 650 words';

  const toneInstruction = {
    funny: `Tone: Funny, witty, and playfully teasing.
- Use sharp observational humor, gentle roasts, and self-deprecating wit.
- Insert comedic pauses and natural setups with punchlines.
- Keep humor affectionate and appropriate for all generations in the audience (no vulgarity or mean-spirited jokes).
- Include brief moments of genuine warmth before a clever, humorous closing toast.`,
    heartfelt: `Tone: Deeply heartfelt, poignant, and sincere.
- Focus on emotional truth, vulnerability, gratitude, and unconditional affection.
- Bring out genuine tears of joy and touching reflections.
- Highlight the beauty of the relationship, personal growth, and lasting impact.
- Close with a profound, inspiring blessing or toast.`,
    formal: `Tone: Dignified, eloquent, and polished.
- Use poised, sophisticated vocabulary and clear rhetorical structure.
- Emphasize respect, leadership, timeless values, and ceremonial decorum.
- Keep anecdotes polished and meaningful to the entire assembly.
- Conclude with a graceful, memorable toast.`,
    balanced: `Tone: The Golden Ratio - 50% witty & lighthearted + 50% heartfelt sincerity.
- Hook the room early with a smile and a warm, relatable anecdote.
- Transition seamlessly into sincere admiration, emotional connection, and tribute.
- Balance humor with heartfelt depth so the audience laughs, nods in agreement, and feels touched.
- Conclude with a rousing, warm toast.`,
  }[tone] || 'Balanced humor and warmth';

  return `You are a world-class professional speechwriter and speech coach. Write a deeply personalized, authentic, and memorable speech for a ${speechType.replace(/_/g, ' ')}.

TARGET LENGTH: Exactly ${wordCountGuide}
DESIRED TONE: ${toneInstruction}

DETAILS PROVIDED BY THE SPEAKER:
- Recipient/Subject: ${answers.recipientName}
- Speaker Role/Relationship: ${answers.speakerRole || answers.relationship} (Known for: ${answers.yearsKnown || 'many years'})
- Key Stories & Anecdotes:
${answers.storiesAnecdotes}
- Qualities Admired:
${answers.admiredQualities}
- Quirks & Inside Jokes:
${answers.quirksInsideJokes || 'None specified'}
- Closing Toast / Wishes:
${answers.wishesClosingThought}
${answers.audienceContext ? `- Audience & Setting Context: ${answers.audienceContext}` : ''}

WRITING RULES:
1. Speak in the first person ("I", "we"). Make the voice sound natural to speak aloud—use contractions, conversational rhythm, short and long sentence variety.
2. DO NOT use generic clichés like "Webster's dictionary defines love as..." or "May the road rise to meet you".
3. Weave the specific anecdotes and quirks into engaging stories rather than listing them like bullet points.
4. If it's a wedding speech, remember to acknowledge the spouse warmly and include them in the final blessing.
5. Format the speech in clean, natural paragraphs. Do NOT include stage directions in brackets in the speech text itself (save those for cue cards).
6. Return ONLY the spoken speech text, ready to be read from the podium.`;
}

export function buildToneAdjustmentPrompt({ existingContent, newTone, speechType, answers }) {
  const toneInstruction = {
    funny: 'Rewrite with higher wit, comedic timing, playful roasts, and self-deprecation. Make the audience laugh out loud while keeping the core affection intact.',
    heartfelt: 'Rewrite with deeper emotional vulnerability, tearful gratitude, and heartfelt tenderness. Emphasize the warmth of the soul and the significance of love/legacy.',
    formal: 'Rewrite with dignified, eloquent rhetoric, refined diction, and ceremonial poise. Make it sound sophisticated and deeply respectful.',
    balanced: 'Rewrite to achieve the perfect harmony: sharp, engaging humor in the first half, transitioning into heartfelt, tear-jerking sincerity in the second half.',
  }[newTone] || 'Balanced tone';

  return `You are an expert speech doctor. A speaker has drafted a ${speechType.replace(/_/g, ' ')} speech, but wants to shift the tone to: ${newTone.toUpperCase()}.

NEW TONE DIRECTIVE:
${toneInstruction}

CRITICAL RULES:
1. Retain ALL specific personal facts, names, memories, and inside stories from the original text (${answers?.recipientName || 'the recipient'}).
2. Adjust the sentence cadence, word choice, transitions, and mood to embody the ${newTone} tone.
3. Keep the total length approximately consistent with the original text.
4. Output ONLY the updated speech text.

ORIGINAL SPEECH TO REWRITE:
"""
${existingContent}
"""`;
}

export function buildLengthAdjustmentPrompt({ existingContent, targetLength, speechType }) {
  const wordTargets = {
    short: '300 to 400 words (crisp, punchy, ~2.5 to 3 minutes)',
    medium: '500 to 650 words (standard balanced toast, ~4 to 5 minutes)',
    long: '800 to 950 words (epic keynote tribute, ~7 to 8 minutes)',
  }[targetLength] || '500 to 650 words';

  return `You are an expert speech editor. Adjust the length of the following speech to: ${wordTargets}.

RULES:
1. If shortening: Trim fluff, tighten sentences, and focus on the punchiest moments and closing toast. Do not lose the core emotional heart.
2. If lengthening: Expand the storytelling with richer sensory details, deeper reflections on character, and a more expansive closing tribute.
3. Keep the original speaker voice, tone, and specific names/facts.
4. Return ONLY the adjusted speech text.

ORIGINAL SPEECH:
"""
${existingContent}
"""`;
}

export function buildCueCardsPrompt({ speechContent, speechType }) {
  return `You are an expert speech delivery coach. Break down the following speech into 4 to 6 sequential stage cue cards formatted for a speaker standing at a podium.

For each card, provide:
1. cardIndex (number 1 to N)
2. stageCue: A bracketed physical delivery instruction (e.g. "[PAUSE FOR LAUGHTER - 2s]", "[MAKE EYE CONTACT WITH GROOM]", "[SLOW DOWN & LOWER VOICE]", "[RAISE GLASS HIGH]")
3. content: A concise, easy-to-read summary or key talking points of what to say on this card (formatted in 2-4 bullet points or short spoken sentences)
4. timingEstimate: Spoken time range (e.g. "0:00 - 0:45")
5. keyTip: A 1-sentence delivery tip for that specific moment

Return a strict JSON array of objects with the exact keys:
[
  {
    "cardIndex": 1,
    "stageCue": "[...]",
    "content": "...",
    "timingEstimate": "0:00 - 0:45",
    "keyTip": "..."
  }
]

SPEECH TEXT:
"""
${speechContent}
"""`;
}
