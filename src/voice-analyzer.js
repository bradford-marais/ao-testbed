// Voice analyzer
// Analyzes text to identify brand voice characteristics

import { readFileSync } from 'node:fs';

export function analyzeVoice({ text, file }) {
  if (!text && !file) throw new Error('either text or file is required');

  const content = text ?? readFileSync(file, 'utf8');

  const words = content.trim().split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    tone: avgWordsPerSentence < 12 ? 'punchy' : avgWordsPerSentence < 20 ? 'conversational' : 'detailed',
    sample: content.slice(0, 100),
  };
}
