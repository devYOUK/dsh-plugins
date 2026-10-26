#!/usr/bin/env node
/**
 * Syntax-check every plugin entry file in the workspace.
 * Run with `npm run check`; exits non-zero on the first failure.
 */
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const packagesDir = new URL('../packages/', import.meta.url);
const entries = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let failed = 0;
for (const name of entries) {
  for (const file of ['index.js', 'client.js']) {
    const path = new URL(`./${name}/${file}`, packagesDir);
    if (!existsSync(path)) continue;
    const result = spawnSync(process.execPath, ['--check', path.pathname.replace(/^\/([A-Za-z]:)/, '$1')], { encoding: 'utf8' });
    if (result.status === 0) {
      console.log(`ok   ${name}/${file}`);
    } else {
      failed += 1;
      console.error(`FAIL ${name}/${file}`);
      if (result.stderr) console.error(result.stderr.trim());
    }
  }
}

if (failed > 0) {
  console.error(`${failed} file(s) failed`);
  process.exit(1);
}
console.log(`${entries.length} package(s) checked`);
