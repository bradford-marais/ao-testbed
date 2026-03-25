import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync, unlinkSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, 'cli.js');

function runCLI(args, env = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

describe('CLI argument parsing', () => {
  describe('help', () => {
    it('shows help when called with no arguments', () => {
      const result = runCLI([]);
      assert.match(result.stdout, /Usage:/);
      assert.match(result.stdout, /calendar/);
      assert.match(result.stdout, /voice/);
      assert.match(result.stdout, /hook/);
      assert.strictEqual(result.status, 0);
    });

    it('shows help when called with --help', () => {
      const result = runCLI(['--help']);
      assert.match(result.stdout, /Usage:/);
      assert.strictEqual(result.status, 0);
    });
  });

  describe('calendar command', () => {
    it('generates a calendar with --niche and --pillars', () => {
      const result = runCLI(['calendar', '--niche', 'fitness', '--pillars', 'nutrition,training,mindset']);
      assert.strictEqual(result.status, 0, result.stderr);
      const output = JSON.parse(result.stdout);
      assert.ok(Array.isArray(output), 'output should be an array of calendar entries');
      assert.ok(output.length > 0);
      assert.ok(typeof output[0].pillar === 'string');
      assert.ok(typeof output[0].topic === 'string');
      assert.ok(typeof output[0].format === 'string');
    });

    it('outputs valid JSON', () => {
      const result = runCLI(['calendar', '--niche', 'fitness', '--pillars', 'nutrition,training']);
      assert.strictEqual(result.status, 0);
      assert.doesNotThrow(() => JSON.parse(result.stdout));
    });

    it('pretty-prints JSON (indented)', () => {
      const result = runCLI(['calendar', '--niche', 'fitness', '--pillars', 'nutrition']);
      assert.strictEqual(result.status, 0);
      assert.match(result.stdout, /\n  /);
    });

    it('shows error when --niche is missing', () => {
      const result = runCLI(['calendar', '--pillars', 'nutrition']);
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /--niche/);
    });

    it('shows error when --pillars is missing', () => {
      const result = runCLI(['calendar', '--niche', 'fitness']);
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /--pillars/);
    });
  });

  describe('voice command', () => {
    it('analyzes voice from --text', () => {
      const result = runCLI(['voice', '--text', 'Stop doing this. Start growing fast.']);
      assert.strictEqual(result.status, 0, result.stderr);
      const output = JSON.parse(result.stdout);
      assert.ok(typeof output.wordCount === 'number');
      assert.ok(typeof output.tone === 'string');
    });

    it('analyzes voice from --file', () => {
      const tmpFile = join(__dirname, '_test_sample.txt');
      writeFileSync(tmpFile, 'Never stop learning. Growth requires daily effort.');
      try {
        const result = runCLI(['voice', '--file', tmpFile]);
        assert.strictEqual(result.status, 0, result.stderr);
        const output = JSON.parse(result.stdout);
        assert.ok(typeof output.wordCount === 'number');
      } finally {
        unlinkSync(tmpFile);
      }
    });

    it('shows error when neither --text nor --file is provided', () => {
      const result = runCLI(['voice']);
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /--text|--file/);
    });
  });

  describe('hook command', () => {
    it('scores a hook with --text', () => {
      const result = runCLI(['hook', '--text', 'Stop doing this if you want to grow']);
      assert.strictEqual(result.status, 0, result.stderr);
      const output = JSON.parse(result.stdout);
      assert.ok(typeof output.score === 'number');
      assert.ok(typeof output.category === 'string');
    });

    it('shows error when --text is missing', () => {
      const result = runCLI(['hook']);
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /--text/);
    });
  });

  describe('unknown command', () => {
    it('shows error for unknown command', () => {
      const result = runCLI(['unknowncmd']);
      assert.notStrictEqual(result.status, 0);
      assert.match(result.stderr, /Unknown command/i);
    });
  });
});
