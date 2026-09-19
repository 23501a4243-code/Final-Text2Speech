import { describe, it, expect } from 'vitest';
import { analyzeSpeech } from '../src/services/deliveryAnalyzer';
import { SpeechType, SpeechTone } from '../src/types/speech';

describe('DeliveryAnalyzer Service', () => {
  const sampleSpeech = `Good evening everyone! For those who don't know me, I have the distinct privilege of speaking today on behalf of Dave.
First of all, look around this gorgeous room. Everyone looks magnificent! Dave, you look like a lottery winner who can't believe his luck.
We survived that crazy college road trip radiator disaster with nothing but duct tape and sheer hope. That spreadsheet of his saved our lives!
Beneath all the jokes, Dave's integrity, loyalty, and generous heart are unmatched. He has been a true brother to me through every season of life.
Ladies and gentlemen, please raise your glasses high. To Dave and Sarah: may your journey be filled with love and laughter. Cheers!`;

  it('calculates word count and estimated reading minutes accurately', () => {
    const analysis = analyzeSpeech(sampleSpeech, 'best_man', 'balanced');
    
    expect(analysis.wordCount).toBeGreaterThan(50);
    expect(analysis.readingMinutes).toBe(Math.round((analysis.wordCount / 135) * 10) / 10);
    expect(analysis.targetWpm).toBe(135);
  });

  it('computes sentiment percentages for humor, emotion, and formality', () => {
    const analysis = analyzeSpeech(sampleSpeech, 'best_man', 'funny');
    
    expect(analysis.toneDistribution).toBeDefined();
    expect(analysis.toneDistribution.humor).toBeGreaterThanOrEqual(15);
    expect(analysis.toneDistribution.emotion).toBeGreaterThanOrEqual(20);
    expect(analysis.toneDistribution.formality).toBeGreaterThanOrEqual(10);
  });

  it('generates emotional arc segments covering all four speech phases', () => {
    const analysis = analyzeSpeech(sampleSpeech, 'best_man', 'balanced');

    expect(analysis.emotionalArc).toHaveLength(4);
    expect(analysis.emotionalArc[0].section).toBe('Opening Hook & Icebreaker');
    expect(analysis.emotionalArc[0].sentiment).toBe('humorous');
    expect(analysis.emotionalArc[1].section).toBe('Personal Story & Anecdote');
    expect(analysis.emotionalArc[2].section).toBe('Deep Reflection & Character');
    expect(analysis.emotionalArc[3].section).toBe('The Grand Toast / Blessing');
  });

  it('bounds pacing scores between 78 and 96', () => {
    const shortText = 'Short speech with few words.';
    const shortAnalysis = analyzeSpeech(shortText, 'best_man', 'balanced');
    expect(shortAnalysis.pacingScore).toBeGreaterThanOrEqual(78);
    expect(shortAnalysis.pacingScore).toBeLessThanOrEqual(96);

    const longAnalysis = analyzeSpeech(sampleSpeech, 'best_man', 'balanced');
    expect(longAnalysis.pacingScore).toBeGreaterThanOrEqual(78);
    expect(longAnalysis.pacingScore).toBeLessThanOrEqual(96);
  });

  describe('Contextual Coaching Advice', () => {
    it('advises expansion when word count is under 300 words', () => {
      const briefText = 'Hello everyone. Thank you for coming today. Cheers!';
      const analysis = analyzeSpeech(briefText, 'best_man', 'balanced');

      const advice = analysis.coachAdvice.join(' ');
      expect(advice).toContain('under 2.5 mins');
      expect(advice).toContain('expanding your central anecdote');
    });

    it('advises tightening when word count is over 750 words', () => {
      const longText = Array(120).fill('Dave is an extraordinary human being who cares deeply about everyone.').join(' ');
      const analysis = analyzeSpeech(longText, 'best_man', 'balanced');

      const advice = analysis.coachAdvice.join(' ');
      expect(advice).toContain('>6 mins');
      expect(advice).toContain('Audiences at receptions start checking their watches');
    });

    it('identifies the sweet spot when word count is between 400 and 650 words', () => {
      const idealText = Array(45).fill('Dave is loyal, funny, honest, and truly a one of a kind friend.').join(' ');
      const analysis = analyzeSpeech(idealText, 'best_man', 'balanced');

      const advice = analysis.coachAdvice.join(' ');
      expect(advice).toContain('Ideal length!');
      expect(advice).toContain('sweet spot');
    });

    it('includes wedding-specific eye contact and pause tips for best_man and maid_of_honor', () => {
      const analysisBM = analyzeSpeech(sampleSpeech, 'best_man', 'funny');
      expect(analysisBM.coachAdvice.some(a => a.includes('bride and groom'))).toBe(true);
      expect(analysisBM.coachAdvice.some(a => a.includes('Pause for at least 2 full seconds'))).toBe(true);

      const analysisMOH = analyzeSpeech(sampleSpeech, 'maid_of_honor', 'heartfelt');
      expect(analysisMOH.coachAdvice.some(a => a.includes('bride and groom'))).toBe(true);
    });

    it('includes human-relationship focus advice for retirement speeches', () => {
      const analysis = analyzeSpeech(sampleSpeech, 'retirement', 'formal');
      expect(analysis.coachAdvice.some(a => a.includes('human relationships you built'))).toBe(true);
    });

    it('includes compassionate silence guidance for eulogies', () => {
      const analysis = analyzeSpeech(sampleSpeech, 'eulogy', 'heartfelt');
      expect(analysis.coachAdvice.some(a => a.includes('silence in moments of grief conveys love'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string gracefully without throwing', () => {
      const analysis = analyzeSpeech('', 'best_man', 'balanced');
      expect(analysis.wordCount).toBe(0);
      expect(analysis.readingMinutes).toBe(0);
      expect(analysis.pacingScore).toBeGreaterThanOrEqual(78);
    });

    it('handles single-word speeches without zero-division errors', () => {
      const analysis = analyzeSpeech('Congratulations!', 'anniversary', 'balanced');
      expect(analysis.wordCount).toBe(1);
      expect(analysis.readingMinutes).toBe(0);
      expect(analysis.toneDistribution.humor).toBeGreaterThanOrEqual(15);
    });
  });
});
