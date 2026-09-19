import { describe, it, expect } from 'vitest';
import {
  buildSpeechGenerationPrompt,
  buildToneAdjustmentPrompt,
  buildLengthAdjustmentPrompt,
  buildCueCardsPrompt,
} from '../server/prompts/speechPrompts.js';

describe('Speech Prompt Builders', () => {
  const sampleAnswers = {
    recipientName: 'Dave & Sarah',
    speakerRole: 'Best Man',
    relationship: 'College Roommate',
    yearsKnown: '12 years',
    storiesAnecdotes: 'The radiator disaster on Route 66 saved by a roll of duct tape.',
    admiredQualities: 'Unshakable loyalty, steady character, and contagious laughter.',
    quirksInsideJokes: 'His obsession with color-coded spreadsheets for camping trips.',
    wishesClosingThought: 'May your days be packed with wild laughter and enduring grace.',
    audienceContext: 'Semi-formal winery wedding with 150 guests.',
  };

  describe('buildSpeechGenerationPrompt', () => {
    it('correctly maps target length word count guidelines', () => {
      const shortPrompt = buildSpeechGenerationPrompt({
        speechType: 'best_man',
        tone: 'balanced',
        length: 'short',
        answers: sampleAnswers,
      });
      expect(shortPrompt).toContain('300 to 400 words');

      const mediumPrompt = buildSpeechGenerationPrompt({
        speechType: 'best_man',
        tone: 'balanced',
        length: 'medium',
        answers: sampleAnswers,
      });
      expect(mediumPrompt).toContain('500 to 650 words');

      const longPrompt = buildSpeechGenerationPrompt({
        speechType: 'best_man',
        tone: 'balanced',
        length: 'long',
        answers: sampleAnswers,
      });
      expect(longPrompt).toContain('800 to 950 words');
    });

    it('injects specific tone instructions', () => {
      const funnyPrompt = buildSpeechGenerationPrompt({
        speechType: 'best_man',
        tone: 'funny',
        length: 'medium',
        answers: sampleAnswers,
      });
      expect(funnyPrompt).toContain('sharp observational humor');
      expect(funnyPrompt).toContain('gentle roasts');

      const heartfeltPrompt = buildSpeechGenerationPrompt({
        speechType: 'best_man',
        tone: 'heartfelt',
        length: 'medium',
        answers: sampleAnswers,
      });
      expect(heartfeltPrompt).toContain('emotional truth, vulnerability');

      const formalPrompt = buildSpeechGenerationPrompt({
        speechType: 'retirement',
        tone: 'formal',
        length: 'medium',
        answers: sampleAnswers,
      });
      expect(formalPrompt).toContain('Dignified, eloquent, and polished');

      const balancedPrompt = buildSpeechGenerationPrompt({
        speechType: 'best_man',
        tone: 'balanced',
        length: 'medium',
        answers: sampleAnswers,
      });
      expect(balancedPrompt).toContain('The Golden Ratio - 50% witty & lighthearted + 50% heartfelt sincerity');
    });

    it('interpolates all provided answer details and context into the prompt', () => {
      const prompt = buildSpeechGenerationPrompt({
        speechType: 'best_man',
        tone: 'balanced',
        length: 'medium',
        answers: sampleAnswers,
      });

      expect(prompt).toContain('Dave & Sarah');
      expect(prompt).toContain('radiator disaster on Route 66');
      expect(prompt).toContain('Unshakable loyalty');
      expect(prompt).toContain('color-coded spreadsheets');
      expect(prompt).toContain('Semi-formal winery wedding with 150 guests');
    });

    it('includes essential speechwriting constraints (first-person voice, anti-cliché)', () => {
      const prompt = buildSpeechGenerationPrompt({
        speechType: 'best_man',
        tone: 'balanced',
        length: 'medium',
        answers: sampleAnswers,
      });

      expect(prompt).toContain('Speak in the first person ("I", "we")');
      expect(prompt).toContain('DO NOT use generic clichés');
      expect(prompt).toContain('Return ONLY the spoken speech text');
    });
  });

  describe('buildToneAdjustmentPrompt', () => {
    const existingSpeech = 'Good evening everyone. Dave is my best friend. We had great times in college.';

    it('builds tone rewriting prompt with specific instructions for each tone', () => {
      const funnyAdjustment = buildToneAdjustmentPrompt({
        existingContent: existingSpeech,
        newTone: 'funny',
        speechType: 'best_man',
        answers: sampleAnswers,
      });
      expect(funnyAdjustment).toContain('NEW TONE DIRECTIVE:');
      expect(funnyAdjustment).toContain('higher wit, comedic timing');
      expect(funnyAdjustment).toContain(existingSpeech);

      const heartfeltAdjustment = buildToneAdjustmentPrompt({
        existingContent: existingSpeech,
        newTone: 'heartfelt',
        speechType: 'best_man',
        answers: sampleAnswers,
      });
      expect(heartfeltAdjustment).toContain('deeper emotional vulnerability');
    });

    it('enforces retention of personal facts and memories', () => {
      const prompt = buildToneAdjustmentPrompt({
        existingContent: existingSpeech,
        newTone: 'formal',
        speechType: 'best_man',
        answers: sampleAnswers,
      });

      expect(prompt).toContain('Retain ALL specific personal facts, names, memories');
      expect(prompt).toContain('Dave & Sarah');
    });
  });

  describe('buildLengthAdjustmentPrompt', () => {
    const existingSpeech = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';

    it('creates correct length adjustment targets for short, medium, and long', () => {
      const shortPrompt = buildLengthAdjustmentPrompt({
        existingContent: existingSpeech,
        targetLength: 'short',
        speechType: 'best_man',
      });
      expect(shortPrompt).toContain('300 to 400 words');
      expect(shortPrompt).toContain('Trim fluff, tighten sentences');

      const longPrompt = buildLengthAdjustmentPrompt({
        existingContent: existingSpeech,
        targetLength: 'long',
        speechType: 'best_man',
      });
      expect(longPrompt).toContain('800 to 950 words');
      expect(longPrompt).toContain('Expand the storytelling with richer sensory details');
    });
  });

  describe('buildCueCardsPrompt', () => {
    it('requires structured JSON response with exact cue card keys', () => {
      const prompt = buildCueCardsPrompt({
        speechContent: 'Here is my sample speech.',
        speechType: 'best_man',
      });

      expect(prompt).toContain('Break down the following speech into 4 to 6 sequential stage cue cards');
      expect(prompt).toContain('"cardIndex"');
      expect(prompt).toContain('"stageCue"');
      expect(prompt).toContain('"timingEstimate"');
      expect(prompt).toContain('"keyTip"');
      expect(prompt).toContain('Return a strict JSON array of objects');
    });
  });
});
