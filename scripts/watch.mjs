#!/usr/bin/env node
/**
 * Watch for source changes and rerun `pnpm build` on a debounce so the
 * Vetra Studio bundle stays current. Vite picks up the freshly written
 * dist/browser/*.js files via its file-watching, so a hard reload of the
 * studio tab loads the new editor code.
 *
 * Usage:  pnpm vetra:watch
 */
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const WATCH_DIRS = [
  'editors',
  'document-models',
  'subgraphs',
  'processors',
  'index.ts',
  'main.tsx',
  'powerhouse.manifest.json',
  'powerhouse.config.json',
];
const IGNORE = /(\bgen\b|\bnode_modules\b|\bdist\b|\.d\.ts$|\.d\.ts\.map$)/;
const DEBOUNCE_MS = 600;

let timer = null;
let runningProc = null;
let queued = false;

function runBuild() {
  if (runningProc) {
    queued = true;
    return;
  }
  console.log(`\n🔨 ${new Date().toLocaleTimeString()} — rebuilding…`);
  runningProc = spawn('pnpm', ['build'], {
    stdio: 'inherit',
    cwd: ROOT,
    shell: false,
  });
  runningProc.on('close', (code) => {
    runningProc = null;
    if (code !== 0) {
      console.log(`\n❌ build failed (exit ${code}). Watching for next change…`);
    } else {
      console.log(
        `✅ ${new Date().toLocaleTimeString()} — bundle updated. Hard-reload Vetra Studio (http://localhost:3001) to pick it up.`,
      );
    }
    if (queued) {
      queued = false;
      runBuild();
    }
  });
}

function schedule(reason) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    console.log(`📝 change: ${reason}`);
    runBuild();
  }, DEBOUNCE_MS);
}

function attach(target) {
  try {
    watch(join(ROOT, target), { recursive: true, persistent: true }, (event, filename) => {
      if (!filename) return;
      const path = `${target}/${filename}`;
      if (IGNORE.test(path)) return;
      if (!/\.(ts|tsx|js|jsx|graphql|gql|json|css)$/.test(filename)) return;
      schedule(path);
    });
    console.log(`👀 watching ${target}/`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`(skipping ${target} — not present)`);
    } else {
      throw err;
    }
  }
}

console.log(`🚀 Watching defi-united-package for changes…`);
for (const dir of WATCH_DIRS) attach(dir);

// One initial build so the bundle is current right away.
runBuild();

process.on('SIGINT', () => {
  console.log('\n👋 Stopping watcher.');
  if (runningProc) runningProc.kill('SIGINT');
  process.exit(0);
});
