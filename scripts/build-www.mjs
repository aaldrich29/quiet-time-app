/* Copies the static app into www/ for Capacitor to bundle into the APK.
   The repo root stays the GitHub Pages source, so the web app is unaffected. */
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');

// sw.js is deliberately left out: the native build uses OS alarms, not the
// service worker, and a stale SW cache inside the APK only causes confusion.
const ASSETS = ['index.html', 'manifest.json', 'favicon.png', 'icons'];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const asset of ASSETS) {
  await cp(join(root, asset), join(out, asset), { recursive: true });
}
console.log(`Copied ${ASSETS.length} entries into www/`);
