import { describe, it } from 'node:test';
import assert from 'node:assert';
import { analyzeVoice } from './voice-analyzer.js';

const SAMPLE_DIRECT = `
We build software. We ship fast. We cut the fluff and get to the point.
Our tools are powerful. They work. No excuses. No delays. Just results.
We win by executing better than everyone else. Speed matters. Focus matters.
Stop overthinking. Start doing. Our team moves fast and fixes things quickly.
Every decision we make is driven by impact. We measure, we act, we improve.
This is how we operate. This is how we win. Direct action beats endless debate.
Results speak louder than words. We deliver every single time without fail.
Bold moves win markets. Slow teams lose. We execute and dominate by design.
Build fast. Ship often. Fix issues quickly. That is how great products emerge.
Strong focus beats distraction every time. Winners know this truth well.
`;

const SAMPLE_CONVERSATIONAL = `
Hey, so you might be wondering how this all works. Let me walk you through it.
I think you'll find this pretty interesting once you get the hang of it.
We've all been there, right? You start something new and it feels overwhelming.
But I promise you, if you stick with it, things start to click. I know they did for me.
You just have to take it one step at a time. Don't worry if you make mistakes.
Actually, mistakes are kind of great because that's how you learn. I learned that way.
So let's just dive in together and see what happens. Sound good to you? Great.
I'm excited to show you what this can do. You're going to love it, I think.
Honestly, I was skeptical at first too. But then I tried it and wow, I changed my mind.
You'll see what I mean once you get started. Just trust the process, okay? It works.
`;

describe('analyzeVoice', () => {
  describe('edge cases', () => {
    it('returns null for empty string', () => {
      const result = analyzeVoice('');
      assert.strictEqual(result, null);
    });

    it('returns null for very short text (under 100 words)', () => {
      const result = analyzeVoice('This is a short text with very few words.');
      assert.strictEqual(result, null);
    });

    it('returns null for non-string input', () => {
      assert.strictEqual(analyzeVoice(null), null);
      assert.strictEqual(analyzeVoice(undefined), null);
      assert.strictEqual(analyzeVoice(42), null);
    });
  });

  describe('return shape', () => {
    it('returns an object with all required fields', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(result, 'should return a result');
      assert.ok(typeof result.tone === 'string', 'tone should be a string');
      assert.ok(typeof result.avgSentenceLength === 'number', 'avgSentenceLength should be a number');
      assert.ok(typeof result.vocabularyLevel === 'string', 'vocabularyLevel should be a string');
      assert.ok(typeof result.personalPronouns === 'object', 'personalPronouns should be an object');
      assert.ok(Array.isArray(result.powerWords), 'powerWords should be an array');
      assert.ok(typeof result.readabilityScore === 'number', 'readabilityScore should be a number');
      assert.ok(typeof result.summary === 'string', 'summary should be a string');
    });
  });

  describe('tone detection', () => {
    it('detects direct tone for short punchy sentences', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.strictEqual(result.tone, 'direct');
    });

    it('detects conversational tone for personal friendly text', () => {
      const result = analyzeVoice(SAMPLE_CONVERSATIONAL);
      assert.strictEqual(result.tone, 'conversational');
    });
  });

  describe('avgSentenceLength', () => {
    it('calculates average words per sentence', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(result.avgSentenceLength > 0, 'should be positive');
      assert.ok(result.avgSentenceLength < 50, 'should be reasonable');
    });

    it('is a finite number', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(Number.isFinite(result.avgSentenceLength));
    });
  });

  describe('vocabularyLevel', () => {
    it('returns one of: simple, moderate, advanced', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(
        ['simple', 'moderate', 'advanced'].includes(result.vocabularyLevel),
        `expected simple/moderate/advanced, got ${result.vocabularyLevel}`
      );
    });
  });

  describe('personalPronouns', () => {
    it('counts I, you, and we pronouns', () => {
      const result = analyzeVoice(SAMPLE_CONVERSATIONAL);
      assert.ok(typeof result.personalPronouns.I === 'number');
      assert.ok(typeof result.personalPronouns.you === 'number');
      assert.ok(typeof result.personalPronouns.we === 'number');
    });

    it('counts we pronouns in direct sample', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(result.personalPronouns.we > 0, 'should count "we" occurrences');
    });

    it('counts I and you pronouns in conversational sample', () => {
      const result = analyzeVoice(SAMPLE_CONVERSATIONAL);
      assert.ok(result.personalPronouns.I > 0, 'should count "I" occurrences');
      assert.ok(result.personalPronouns.you > 0, 'should count "you" occurrences');
    });
  });

  describe('powerWords', () => {
    it('returns an array of strings', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(Array.isArray(result.powerWords));
      result.powerWords.forEach(w => assert.ok(typeof w === 'string'));
    });

    it('finds power words in sample text', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(result.powerWords.length > 0, 'should find at least one power word');
    });
  });

  describe('readabilityScore', () => {
    it('returns a number between 0 and 100', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(result.readabilityScore >= 0, 'should be >= 0');
      assert.ok(result.readabilityScore <= 100, 'should be <= 100');
    });

    it('simple short-sentence text scores higher than complex text', () => {
      const simple = analyzeVoice(SAMPLE_DIRECT);
      const COMPLEX = `
        The implementation of sophisticated algorithmic methodologies necessitates comprehensive understanding
        of multifaceted computational paradigms wherein practitioners must demonstrate proficiency in
        navigating extraordinarily complex interdependencies between constituent architectural components.
        Furthermore, organizational synchronization of heterogeneous distributed infrastructure requires
        substantial expertise in orchestrating sophisticated deployment pipelines while simultaneously
        maintaining rigorous compliance with established governance frameworks and institutional protocols.
        Practitioners engaged in these endeavors must possess exceptional analytical capabilities enabling
        them to synthesize disparate informational streams into coherent actionable intelligence. Comprehensive
        documentation of architectural decisions facilitates organizational knowledge transfer and institutional
        memory, thereby ensuring continuity of operations across multidisciplinary stakeholder constituencies.
        Sophisticated practitioners leverage interdisciplinary methodologies to systematically deconstruct
        extraordinarily complex organizational challenges into comprehensible constituent components.
      `;
      const complex = analyzeVoice(COMPLEX);
      assert.ok(simple.readabilityScore >= complex.readabilityScore,
        `simple (${simple.readabilityScore}) should score >= complex (${complex.readabilityScore})`);
    });
  });

  describe('summary', () => {
    it('returns a non-empty string', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(result.summary.length > 0);
    });

    it('mentions the detected tone in the summary', () => {
      const result = analyzeVoice(SAMPLE_DIRECT);
      assert.ok(
        result.summary.toLowerCase().includes(result.tone),
        `summary should mention tone "${result.tone}"`
      );
    });
  });
});
