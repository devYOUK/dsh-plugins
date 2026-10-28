#!/usr/bin/env node
/**
 * Scaffold a new SDD spec from docs/specs/_template.
 *
 *   npm run spec:new -- <slug> "<标题>"
 *
 * Prints the next steps; the spec starts as `draft` with `packages: []`.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const specsDir = join(root, 'docs', 'specs');
const templateDir = join(specsDir, '_template');

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const slug = args[0];
const title = args.slice(1).join(' ').trim();

if (slug === undefined || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || title === '') {
  console.error('usage: npm run spec:new -- <slug> "<标题>"');
  console.error('  slug 只能是小写字母、数字和连字符，例如 chat-search-scope');
  process.exit(1);
}

if (!existsSync(templateDir)) {
  console.error(`missing template directory: ${templateDir}`);
  process.exit(1);
}

const used = readdirSync(specsDir)
  .filter((name) => statSync(join(specsDir, name)).isDirectory())
  .map((name) => /^(\d{4})-/.exec(name))
  .filter((match) => match !== null)
  .map((match) => Number(match[1]));
const id = String((used.length === 0 ? 0 : Math.max(...used)) + 1).padStart(4, '0');
const dir = `${id}-${slug}`;
const target = join(specsDir, dir);

if (existsSync(target)) {
  console.error(`already exists: docs/specs/${dir}`);
  process.exit(1);
}

const now = new Date();
const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
mkdirSync(target);
for (const file of ['spec.md', 'plan.md', 'tasks.md']) {
  const template = readFileSync(join(templateDir, file), 'utf8');
  const text = template.replaceAll('{{id}}', id).replaceAll('{{title}}', title).replaceAll('{{date}}', date);
  writeFileSync(join(target, file), text);
}

console.log(`created docs/specs/${dir}`);
console.log('');
console.log('next:');
console.log('  1. 填 spec.md 的背景、目标、行为与验收，packages 列表');
console.log('  2. 行为定稿后把 status 改为 approved，再写 plan.md / tasks.md');
console.log('  3. npm run spec:index');
