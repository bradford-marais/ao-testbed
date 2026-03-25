// Power words that signal high-impact, persuasive writing
const POWER_WORDS = new Set([
  'win', 'winning', 'powerful', 'power', 'proven', 'guarantee', 'guaranteed',
  'results', 'result', 'impact', 'impacts', 'deliver', 'delivers', 'delivered',
  'execute', 'executes', 'executing', 'execution', 'dominate', 'dominates',
  'master', 'masters', 'ultimate', 'unstoppable', 'breakthrough', 'transform',
  'transforms', 'transforming', 'revolutionize', 'revolutionizes', 'achieve',
  'achieves', 'success', 'succeed', 'succeeds', 'accelerate', 'accelerates',
  'maximize', 'maximizes', 'optimize', 'optimizes', 'crush', 'crushes',
  'epic', 'massive', 'incredible', 'amazing', 'outstanding', 'exceptional',
  'exclusive', 'premium', 'elite', 'expert', 'experts', 'strategy',
  'strategies', 'growth', 'profit', 'profits', 'scale', 'scales',
  'fast', 'faster', 'fastest', 'instant', 'instantly', 'immediately',
  'free', 'proven', 'secret', 'secrets', 'insider', 'bold', 'strong',
  'critical', 'essential', 'vital', 'crucial', 'urgent',
]);

// Words that signal conversational tone (must be clearly informal — avoid generic words)
const CONVERSATIONAL_SIGNALS = new Set([
  'hey', 'actually', 'basically', 'honestly', 'literally', 'totally',
  'pretty', 'kinda', 'gonna', 'wanna', 'gotta', 'sorta',
  'okay', 'ok', 'yep', 'yeah', 'nope', 'nah', 'stuff',
  'awesome', 'cool', 'excited', 'wondering',
]);

// Words associated with authoritative/formal writing
const AUTHORITATIVE_SIGNALS = new Set([
  'therefore', 'furthermore', 'consequently', 'moreover', 'nevertheless',
  'accordingly', 'subsequently', 'notwithstanding', 'heretofore',
  'aforementioned', 'herein', 'wherein', 'pursuant', 'whereby',
  'stipulate', 'stipulates', 'mandate', 'mandates', 'mandate',
  'demonstrates', 'indicates', 'establishes', 'requires', 'necessitates',
  'ensures', 'substantiates', 'corroborates', 'validates', 'delineates',
]);

// Multi-syllable word threshold for vocabulary level
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function tokenizeWords(text) {
  return text.match(/\b[a-zA-Z'-]+\b/g) || [];
}

function tokenizeSentences(text) {
  // Split on sentence-ending punctuation followed by whitespace or end
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && /[a-zA-Z]/.test(s));
  return sentences;
}

/**
 * Analyzes the voice/style of a text sample.
 *
 * @param {string} text - Input text (at least 100 words)
 * @returns {object|null} Voice analysis result, or null for invalid/short input
 */
export function analyzeVoice(text) {
  if (typeof text !== 'string' || text.trim().length === 0) return null;

  const words = tokenizeWords(text);
  if (words.length < 100) return null;

  const sentences = tokenizeSentences(text);
  const sentenceCount = Math.max(sentences.length, 1);

  // --- avgSentenceLength ---
  const avgSentenceLength = Math.round((words.length / sentenceCount) * 10) / 10;

  // --- personalPronouns ---
  const lowerWords = words.map(w => w.toLowerCase());
  const personalPronouns = {
    I: lowerWords.filter(w => w === 'i').length,
    you: lowerWords.filter(w => w === 'you').length,
    we: lowerWords.filter(w => w === 'we').length,
  };

  // --- powerWords ---
  const foundPowerWords = [...new Set(
    lowerWords.filter(w => POWER_WORDS.has(w))
  )];

  // --- vocabularyLevel ---
  const uniqueWords = [...new Set(lowerWords)];
  const avgSyllables =
    uniqueWords.reduce((sum, w) => sum + countSyllables(w), 0) / uniqueWords.length;

  let vocabularyLevel;
  if (avgSyllables < 1.5) {
    vocabularyLevel = 'simple';
  } else if (avgSyllables < 2.0) {
    vocabularyLevel = 'moderate';
  } else {
    vocabularyLevel = 'advanced';
  }

  // --- readabilityScore (Flesch Reading Ease approximation) ---
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const fleschRaw =
    206.835 -
    1.015 * (words.length / sentenceCount) -
    84.6 * (totalSyllables / words.length);
  const readabilityScore = Math.min(100, Math.max(0, Math.round(fleschRaw)));

  // --- tone ---
  const conversationalCount = lowerWords.filter(w => CONVERSATIONAL_SIGNALS.has(w)).length;
  const authoritativeCount = lowerWords.filter(w => AUTHORITATIVE_SIGNALS.has(w)).length;
  // Use I+you ratio (not we) as conversational signal — corporate "we" is direct/assertive
  const iYouRatio = (personalPronouns.I + personalPronouns.you) / words.length;

  let tone;
  if (authoritativeCount >= 3 || (avgSyllables >= 2.0 && avgSentenceLength >= 18)) {
    tone = 'authoritative';
  } else if (
    conversationalCount >= 3 ||
    iYouRatio > 0.05 ||
    (personalPronouns.I > 0 && personalPronouns.you > 0 && conversationalCount >= 1)
  ) {
    tone = 'conversational';
  } else {
    tone = 'direct';
  }

  // --- summary ---
  const pronounTotal = personalPronouns.I + personalPronouns.you + personalPronouns.we;
  const pronounDesc =
    pronounTotal > 0
      ? `Uses ${pronounTotal > 10 ? 'frequent' : 'some'} personal pronouns (I: ${personalPronouns.I}, you: ${personalPronouns.you}, we: ${personalPronouns.we}).`
      : 'Minimal use of personal pronouns.';

  const readDesc =
    readabilityScore >= 70
      ? 'highly readable'
      : readabilityScore >= 50
      ? 'moderately readable'
      : 'dense and complex';

  const summary =
    `The writing has a ${tone} tone with ${vocabularyLevel} vocabulary and an average sentence length of ${avgSentenceLength} words. ` +
    `${pronounDesc} ` +
    `The content is ${readDesc} with a readability score of ${readabilityScore}/100.`;

  return {
    tone,
    avgSentenceLength,
    vocabularyLevel,
    personalPronouns,
    powerWords: foundPowerWords,
    readabilityScore,
    summary,
  };
}
