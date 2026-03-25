import { describe, it } from 'node:test';
import assert from 'node:assert';
import { scoreHook } from './hook-scorer.js';

describe('scoreHook', () => {
  describe('return structure', () => {
    it('returns score, breakdown, suggestions, and category', () => {
      const result = scoreHook('This is a test hook');
      assert.ok(typeof result.score === 'number', 'score should be a number');
      assert.ok(typeof result.breakdown === 'object', 'breakdown should be an object');
      assert.ok(Array.isArray(result.suggestions), 'suggestions should be an array');
      assert.ok(typeof result.category === 'string', 'category should be a string');
    });

    it('score is between 0 and 100', () => {
      const result = scoreHook('A basic hook with no special features');
      assert.ok(result.score >= 0 && result.score <= 100, `score ${result.score} should be 0-100`);
    });

    it('breakdown has four dimensions each 0-25', () => {
      const result = scoreHook('Some hook text here');
      const { curiosityGap, patternInterrupt, specificity, emotionalTrigger } = result.breakdown;
      for (const [key, val] of Object.entries({ curiosityGap, patternInterrupt, specificity, emotionalTrigger })) {
        assert.ok(val >= 0 && val <= 25, `${key} value ${val} should be 0-25`);
      }
    });

    it('suggestions has 1 to 3 items', () => {
      const result = scoreHook('A hook with room for improvement');
      assert.ok(result.suggestions.length >= 1 && result.suggestions.length <= 3,
        `suggestions length ${result.suggestions.length} should be 1-3`);
    });

    it('score equals sum of breakdown dimensions', () => {
      const result = scoreHook('Why do successful people wake up at 5am?');
      const sum = result.breakdown.curiosityGap + result.breakdown.patternInterrupt +
        result.breakdown.specificity + result.breakdown.emotionalTrigger;
      assert.strictEqual(result.score, sum);
    });
  });

  describe('curiosity gap scoring', () => {
    it('scores higher for question hooks', () => {
      const withQuestion = scoreHook('Why do most people fail at building habits?');
      const withoutQuestion = scoreHook('Most people fail at building habits');
      assert.ok(withQuestion.breakdown.curiosityGap > withoutQuestion.breakdown.curiosityGap,
        'question hooks should score higher on curiosity gap');
    });

    it('scores higher for hooks with "secret"', () => {
      const withSecret = scoreHook('The secret to doubling your income');
      const withoutSecret = scoreHook('A way to double your income');
      assert.ok(withSecret.breakdown.curiosityGap > withoutSecret.breakdown.curiosityGap,
        'hooks with "secret" should score higher on curiosity gap');
    });

    it('scores higher for hooks with "nobody talks about"', () => {
      const result = scoreHook('The productivity hack nobody talks about');
      assert.ok(result.breakdown.curiosityGap >= 15, 'nobody talks about should yield high curiosity gap');
    });

    it('scores higher for hooks with ellipsis', () => {
      const withEllipsis = scoreHook('I tried this for 30 days...');
      const withoutEllipsis = scoreHook('I tried this for 30 days');
      assert.ok(withEllipsis.breakdown.curiosityGap > withoutEllipsis.breakdown.curiosityGap,
        'ellipsis hooks should score higher on curiosity gap');
    });
  });

  describe('pattern interrupt scoring', () => {
    it('scores higher for contrarian takes', () => {
      const contrarian = scoreHook('Stop doing morning routines — they are ruining your productivity');
      assert.ok(contrarian.breakdown.patternInterrupt >= 15, 'contrarian take should score high on pattern interrupt');
    });

    it('scores higher for "stop doing X" hooks', () => {
      const stopDoing = scoreHook('Stop doing more work to earn more money');
      const noStop = scoreHook('Do more work to earn more money');
      assert.ok(stopDoing.breakdown.patternInterrupt > noStop.breakdown.patternInterrupt,
        '"stop doing" hooks should score higher on pattern interrupt');
    });

    it('scores higher for hooks with unexpected or counter-intuitive framing', () => {
      const unexpected = scoreHook('The worst advice I ever got made me a millionaire');
      assert.ok(unexpected.breakdown.patternInterrupt >= 10, 'unexpected framing should score on pattern interrupt');
    });
  });

  describe('specificity scoring', () => {
    it('scores higher for hooks with numbers', () => {
      const withNumber = scoreHook('I grew my audience by 10,000 followers in 30 days');
      const withoutNumber = scoreHook('I grew my audience by many followers quickly');
      assert.ok(withNumber.breakdown.specificity > withoutNumber.breakdown.specificity,
        'hooks with numbers should score higher on specificity');
    });

    it('scores higher for hooks with percentages', () => {
      const withPercent = scoreHook('How I increased revenue by 47% in one quarter');
      assert.ok(withPercent.breakdown.specificity >= 10, 'percentage hooks should score high on specificity');
    });

    it('scores higher for hooks with timeframes', () => {
      const withTimeframe = scoreHook('What I learned in 90 days of daily writing');
      assert.ok(withTimeframe.breakdown.specificity >= 10, 'timeframe hooks should score on specificity');
    });
  });

  describe('emotional trigger scoring', () => {
    it('scores higher for hooks with personal pronouns', () => {
      const withPronoun = scoreHook('I made every mistake you could make in your first year');
      const withoutPronoun = scoreHook('Making every mistake in the first year');
      assert.ok(withPronoun.breakdown.emotionalTrigger > withoutPronoun.breakdown.emotionalTrigger,
        'personal pronouns should increase emotional trigger score');
    });

    it('scores higher for hooks with power words', () => {
      const withPowerWords = scoreHook('The brutal truth about why you will never be rich');
      assert.ok(withPowerWords.breakdown.emotionalTrigger >= 10, 'power words should score high on emotional trigger');
    });

    it('scores higher for hooks with urgency words', () => {
      const withUrgency = scoreHook('You need to stop this immediately before it is too late');
      assert.ok(withUrgency.breakdown.emotionalTrigger >= 10, 'urgency words should score high on emotional trigger');
    });
  });

  describe('category detection', () => {
    it('categorizes question hooks as "question"', () => {
      const result = scoreHook('Why do most people give up on their goals?');
      assert.strictEqual(result.category, 'question');
    });

    it('categorizes hooks with curiosity phrases as "curiosity"', () => {
      const result = scoreHook('The secret nobody talks about when building a business');
      assert.strictEqual(result.category, 'curiosity');
    });

    it('categorizes contrarian hooks as "contrarian"', () => {
      const result = scoreHook('Stop trying to be productive — it is destroying your creativity');
      assert.strictEqual(result.category, 'contrarian');
    });

    it('categorizes bold claim hooks as "bold-claim"', () => {
      const result = scoreHook('I made 1 million dollars in 6 months with one simple strategy');
      assert.strictEqual(result.category, 'bold-claim');
    });

    it('categorizes story hooks as "story"', () => {
      const result = scoreHook('The day I lost everything changed my life forever');
      assert.strictEqual(result.category, 'story');
    });
  });

  describe('suggestions', () => {
    it('suggests adding a number for low-specificity hooks', () => {
      const result = scoreHook('A simple trick to improve your writing');
      const hasSuggestion = result.suggestions.some(s => /number|specific|statistic/i.test(s));
      assert.ok(hasSuggestion, 'should suggest adding specificity when score is low');
    });

    it('suggests adding curiosity for flat declarative hooks', () => {
      const result = scoreHook('Writing improves your thinking skills');
      const hasSuggestion = result.suggestions.some(s => /question|curiosity|gap/i.test(s));
      assert.ok(hasSuggestion, 'should suggest adding a curiosity gap for flat hooks');
    });

    it('all suggestions are non-empty strings', () => {
      const result = scoreHook('Consistency is the key to success');
      result.suggestions.forEach((s, i) => {
        assert.ok(typeof s === 'string' && s.length > 0, `suggestion ${i} should be a non-empty string`);
      });
    });
  });
});
