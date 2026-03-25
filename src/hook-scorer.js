// Hook scoring algorithm — scores social media hooks across four dimensions

const CURIOSITY_MARKERS = ['secret', 'nobody talks about', 'no one talks about', 'hidden', 'unknown', 'truth about', 'what happens'];
const CONTRARIAN_STARTERS = /^stop\b/i;
const CONTRARIAN_WORDS = ['myth', 'wrong about', 'never should', 'lie about', 'ruining', 'destroying', 'counterintuitive', 'counter-intuitive', 'unpopular opinion', 'contrary to'];
const POWER_WORDS = ['brutal', 'truth', 'fail', 'failed', 'success', 'mistake', 'rich', 'poor', 'dead', 'devastating', 'incredible', 'shocking', 'worst', 'best ever', 'never be'];
const URGENCY_WORDS = ['immediately', 'urgent', 'today', "before it's too late", 'must', 'too late', 'need to stop'];
const BOLD_CLAIM_WORDS = ['million', 'billion', 'thousand'];
const STORY_MARKERS = ['the day', 'when i ', 'i was ', 'i lost', 'changed my life', 'journey', 'story of'];

function scoreCuriosityGap(text) {
  const lower = text.toLowerCase();
  let score = 0;

  if (text.includes('?')) score += 10;
  if (lower.includes('secret')) score += 8;
  if (lower.includes('nobody talks about') || lower.includes('no one talks about')) score += 15;
  if (text.includes('...')) score += 5;
  if (lower.includes('hidden')) score += 5;
  if (lower.includes('unknown')) score += 5;
  if (lower.includes('what happens')) score += 5;
  if (lower.includes('truth about')) score += 5;

  return Math.min(score, 25);
}

function scorePatternInterrupt(text) {
  const lower = text.toLowerCase();
  let score = 0;

  if (CONTRARIAN_STARTERS.test(text)) score += 12;
  if (lower.includes('stop doing')) score += 5;
  if (lower.includes('worst')) score += 10;
  if (lower.includes('ruining')) score += 5;
  if (lower.includes('destroying')) score += 5;
  for (const word of CONTRARIAN_WORDS) {
    if (lower.includes(word) && !['ruining', 'destroying', 'worst'].includes(word)) {
      score += 8;
    }
  }

  return Math.min(score, 25);
}

function scoreSpecificity(text) {
  let score = 0;

  const numbers = text.match(/\d[\d,.]*/g) || [];
  score += Math.min(numbers.length * 8, 16);

  if (/\b(days?|weeks?|months?|years?|hours?|minutes?)\b/i.test(text)) score += 5;
  if (/%/.test(text) || /\bpercent\b/i.test(text)) score += 5;

  return Math.min(score, 25);
}

function scoreEmotionalTrigger(text) {
  const lower = text.toLowerCase();
  let score = 0;

  const pronouns = text.match(/\b(I|you|my|your|we|our|me)\b/g) || [];
  score += Math.min(pronouns.length * 3, 9);

  for (const word of POWER_WORDS) {
    if (lower.includes(word)) score += 5;
  }

  for (const word of URGENCY_WORDS) {
    if (lower.includes(word)) score += 4;
  }

  return Math.min(score, 25);
}

function detectCategory(text) {
  const lower = text.toLowerCase();

  if (text.trim().endsWith('?') || /^(why|how|what|when|who|where|which)\b/i.test(text)) {
    return 'question';
  }
  if (CONTRARIAN_STARTERS.test(text) || CONTRARIAN_WORDS.some(w => lower.includes(w))) {
    return 'contrarian';
  }
  if (CURIOSITY_MARKERS.some(m => lower.includes(m))) {
    return 'curiosity';
  }
  if (BOLD_CLAIM_WORDS.some(w => lower.includes(w)) || /\b\d{4,}\b/.test(text) || /%/.test(text)) {
    return 'bold-claim';
  }
  if (STORY_MARKERS.some(m => lower.includes(m))) {
    return 'story';
  }

  return 'bold-claim';
}

function buildSuggestions(breakdown) {
  const { curiosityGap, patternInterrupt, specificity, emotionalTrigger } = breakdown;

  const all = [
    { score: specificity, suggestion: 'Add a specific number or statistic to make your hook more concrete' },
    { score: curiosityGap, suggestion: 'Create a curiosity gap with a question or surprising reveal' },
    { score: emotionalTrigger, suggestion: 'Use personal pronouns (I/you) or power words to increase emotional connection' },
    { score: patternInterrupt, suggestion: 'Challenge conventional wisdom or start with "Stop doing…" to interrupt patterns' },
  ];

  const sorted = all.sort((a, b) => a.score - b.score);
  return sorted.slice(0, 3).map(item => item.suggestion);
}

export function scoreHook(hook) {
  const breakdown = {
    curiosityGap: scoreCuriosityGap(hook),
    patternInterrupt: scorePatternInterrupt(hook),
    specificity: scoreSpecificity(hook),
    emotionalTrigger: scoreEmotionalTrigger(hook),
  };

  const score = breakdown.curiosityGap + breakdown.patternInterrupt +
    breakdown.specificity + breakdown.emotionalTrigger;

  return {
    score,
    breakdown,
    suggestions: buildSuggestions(breakdown),
    category: detectCategory(hook),
  };
}
