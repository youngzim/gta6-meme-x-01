// gta6-meme-x-01 — "Post a GTA 6 meme on X" (make.fun bounty).
//
// The entry is the X post itself; this program is the delivery plumbing.
// It reads POST.json from the bot directory (the repository root when the
// grader runs it), and copies it into the output directory, where the
// gate reads the post's address from. Nothing else is written: the run is
// deterministic, touches no network and reads no clock.
//
// Local run, the way the grader runs it:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const postPath = join(botDir, 'POST.json');

// Read and check the address before copying: POST.json must be a JSON
// object whose "url" names a post on X, https://x.com/<handle>/status/<id>.
// Failing here, with the reason printed, beats failing silently at the gate.
let postUrl: string;
try {
  const parsed = JSON.parse(readFileSync(postPath, 'utf8')) as { url?: unknown };
  if (typeof parsed.url !== 'string') throw new Error('POST.json holds no "url" string');
  postUrl = parsed.url;
} catch (err) {
  console.error(`POST.json could not be read from ${postPath}: ${(err as Error).message}`);
  process.exit(1);
}
if (!/^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+$/.test(postUrl)) {
  console.error(`POST.json does not name an X post: ${postUrl}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
try {
  copyFileSync(postPath, join(outputDir, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${botDir}: ${(err as Error).message}`);
  process.exit(1);
}
