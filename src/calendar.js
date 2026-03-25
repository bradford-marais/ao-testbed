// Format distribution: 60% reels, 20% carousels, 10% stories, 10% youtube
// Repeating 10-slot pattern: 6 reels, 2 carousels, 1 story, 1 youtube
const FORMAT_PATTERN = [
  'reel', 'reel', 'reel', 'reel', 'reel', 'reel',
  'carousel', 'carousel',
  'story',
  'youtube',
];

const TOPIC_TEMPLATES = [
  (pillar) => `The beginner's guide to ${pillar}`,
  (pillar) => `5 mistakes to avoid in ${pillar}`,
  (pillar) => `How to improve your ${pillar} in 30 days`,
  (pillar) => `Why most people fail at ${pillar}`,
  (pillar) => `The truth about ${pillar} no one tells you`,
  (pillar) => `${pillar} habits that changed my life`,
  (pillar) => `Advanced ${pillar} tips for better results`,
];

const HOOK_TEMPLATES = [
  (pillar) => `Stop scrolling — this ${pillar} tip will change everything.`,
  (pillar) => `I wish I knew this about ${pillar} sooner.`,
  (pillar) => `Here's what nobody tells you about ${pillar}...`,
  (pillar) => `The #1 ${pillar} mistake I see people make every day.`,
  (pillar) => `If you're struggling with ${pillar}, watch this.`,
  (pillar) => `This ${pillar} hack saved me weeks of trial and error.`,
  (pillar) => `I tested every ${pillar} method so you don't have to.`,
];

/**
 * @param {{ niche: string, pillars: string[], days?: number }} config
 * @returns {{ day: number, pillar: string, topic: string, format: string, hook: string }[]}
 */
export function generateCalendar({ niche: _niche, pillars, days = 30 }) {
  const calendar = [];

  for (let i = 0; i < days; i++) {
    const pillar = pillars[i % pillars.length];
    const format = FORMAT_PATTERN[i % FORMAT_PATTERN.length];
    const topic = TOPIC_TEMPLATES[i % TOPIC_TEMPLATES.length](pillar);
    const hook = HOOK_TEMPLATES[i % HOOK_TEMPLATES.length](pillar);

    calendar.push({ day: i + 1, pillar, topic, format, hook });
  }

  return calendar;
}
