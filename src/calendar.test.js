import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateCalendar } from './calendar.js';

const config = {
  niche: 'fitness',
  pillars: ['strength training', 'nutrition', 'recovery', 'mindset'],
};

describe('generateCalendar', () => {
  it('returns an array of objects with the correct shape', () => {
    const calendar = generateCalendar(config);
    assert.ok(Array.isArray(calendar));
    assert.strictEqual(calendar.length, 30);

    for (const entry of calendar) {
      assert.ok('day' in entry, 'entry has day');
      assert.ok('pillar' in entry, 'entry has pillar');
      assert.ok('topic' in entry, 'entry has topic');
      assert.ok('format' in entry, 'entry has format');
      assert.ok('hook' in entry, 'entry has hook');
    }
  });

  it('day numbers go from 1 to days', () => {
    const calendar = generateCalendar({ ...config, days: 7 });
    const days = calendar.map((e) => e.day);
    assert.deepStrictEqual(days, [1, 2, 3, 4, 5, 6, 7]);
  });

  it('defaults to 30 days when days is not provided', () => {
    const calendar = generateCalendar(config);
    assert.strictEqual(calendar.length, 30);
  });

  it('respects custom days count', () => {
    const calendar = generateCalendar({ ...config, days: 14 });
    assert.strictEqual(calendar.length, 14);
  });

  it('rotates through pillars evenly', () => {
    const pillars = ['a', 'b', 'c'];
    const calendar = generateCalendar({ niche: 'test', pillars, days: 9 });
    const used = calendar.map((e) => e.pillar);
    // Each pillar should appear exactly 3 times across 9 days
    for (const pillar of pillars) {
      const count = used.filter((p) => p === pillar).length;
      assert.strictEqual(count, 3, `pillar "${pillar}" should appear 3 times`);
    }
  });

  it('each pillar is one of the configured pillars', () => {
    const calendar = generateCalendar(config);
    for (const entry of calendar) {
      assert.ok(config.pillars.includes(entry.pillar), `unknown pillar: ${entry.pillar}`);
    }
  });

  it('each format is one of the valid formats', () => {
    const validFormats = ['reel', 'carousel', 'story', 'youtube'];
    const calendar = generateCalendar(config);
    for (const entry of calendar) {
      assert.ok(validFormats.includes(entry.format), `unknown format: ${entry.format}`);
    }
  });

  it('format distribution is approximately 60% reels, 20% carousels, 10% stories, 10% youtube', () => {
    // Use a larger sample size for stable distribution
    const calendar = generateCalendar({ ...config, days: 100 });
    const counts = { reel: 0, carousel: 0, story: 0, youtube: 0 };
    for (const entry of calendar) counts[entry.format]++;

    // Allow ±5% tolerance
    assert.ok(counts.reel >= 55 && counts.reel <= 65, `reels: ${counts.reel}`);
    assert.ok(counts.carousel >= 15 && counts.carousel <= 25, `carousels: ${counts.carousel}`);
    assert.ok(counts.story >= 5 && counts.story <= 15, `stories: ${counts.story}`);
    assert.ok(counts.youtube >= 5 && counts.youtube <= 15, `youtube: ${counts.youtube}`);
  });

  it('topic is a non-empty string', () => {
    const calendar = generateCalendar(config);
    for (const entry of calendar) {
      assert.ok(typeof entry.topic === 'string' && entry.topic.length > 0, 'topic must be a non-empty string');
    }
  });

  it('hook is a non-empty string', () => {
    const calendar = generateCalendar(config);
    for (const entry of calendar) {
      assert.ok(typeof entry.hook === 'string' && entry.hook.length > 0, 'hook must be a non-empty string');
    }
  });
});
