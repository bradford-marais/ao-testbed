#!/usr/bin/env node

import { generateCalendar } from './calendar.js';
import { analyzeVoice } from './voice-analyzer.js';
import { scoreHook } from './hook-scorer.js';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      args[key] = argv[i + 1] ?? true;
      i++;
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node src/cli.js <command> [options]

Commands:
  calendar  Generate a weekly content calendar
  voice     Analyze brand voice from text or file
  hook      Score the effectiveness of a content hook

Options:
  --help    Show this help message

Examples:
  node src/cli.js calendar --niche "fitness" --pillars "nutrition,training,mindset"
  node src/cli.js voice --file sample.txt
  node src/cli.js voice --text "your text here"
  node src/cli.js hook --text "Stop doing this if you want to grow"
`);
}

function die(message) {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

const [, , command, ...rest] = process.argv;

if (!command || command === '--help') {
  printHelp();
  process.exit(0);
}

const args = parseArgs(rest);

if (args.help) {
  printHelp();
  process.exit(0);
}

try {
  let result;

  if (command === 'calendar') {
    if (!args.niche) die('--niche is required');
    if (!args.pillars) die('--pillars is required');
    const pillars = String(args.pillars).split(',').map(p => p.trim());
    result = generateCalendar({ niche: args.niche, pillars });
  } else if (command === 'voice') {
    if (!args.text && !args.file) die('--text or --file is required');
    result = analyzeVoice({ text: args.text, file: args.file });
  } else if (command === 'hook') {
    if (!args.text) die('--text is required');
    result = scoreHook({ text: args.text });
  } else {
    die(`Unknown command: ${command}`);
  }

  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  die(err.message);
}
