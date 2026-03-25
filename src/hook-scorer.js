// Hook scorer
// Scores the effectiveness of a content hook

export function scoreHook({ text }) {
  if (!text) throw new Error('text is required');

  const scores = {
    curiosity: /\b(why|how|what|secret|truth|mistake|warning|stop|never|always)\b/i.test(text) ? 1 : 0,
    specificity: /\d/.test(text) ? 1 : 0,
    urgency: /\b(now|today|immediately|fast|quick|instantly)\b/i.test(text) ? 1 : 0,
    negativeFrame: /\b(stop|never|don't|avoid|mistake|wrong|fail)\b/i.test(text) ? 1 : 0,
    brevity: text.split(/\s+/).length <= 12 ? 1 : 0,
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    text,
    scores,
    total,
    maxScore: Object.keys(scores).length,
    rating: total >= 4 ? 'excellent' : total >= 3 ? 'good' : total >= 2 ? 'fair' : 'weak',
  };
}
