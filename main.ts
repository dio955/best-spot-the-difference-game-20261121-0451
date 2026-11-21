// Twin Harbor — Spot the Difference: the hand-in program (Node 22, stdlib only).
//
// The game itself is the static site in game/ (open game/index.html in any
// browser, no build step, no network). This program's one job is to hand it
// in: copy game/ and screenshots/ into the output directory and write the
// dossier the judge reads, built with the vendored make.fun library so the
// bytes match what the scorer rebuilds.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Empty the output directory's contents without removing the directory
// itself: on the grader's read-only root, deleting /output fails outright.
mkdirSync(outDir, { recursive: true });
for (const name of readdirSync(outDir)) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}

cpSync(join(repoDir, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The grader may mount the repository read-only, which leaves the copies
// read-only too; make everything we just wrote writable again.
function makeWritable(path: string): void {
  const st = statSync(path);
  chmodSync(path, st.isDirectory() ? 0o755 : 0o644);
  if (st.isDirectory()) {
    for (const name of readdirSync(path)) makeWritable(join(path, name));
  }
}
makeWritable(join(outDir, 'game'));
makeWritable(join(outDir, 'screenshots'));

// The dossier, with the scorer's own caps so an oversized entry fails here
// first rather than at the gate.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
