#!/usr/bin/env node
/**
 * Validate docs/specs against the SDD layout, and keep the index in sync.
 *
 *   npm run spec:check   validate every spec; fail when the index is stale
 *   npm run spec:index   rewrite docs/specs/README.md, then validate
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const specsDir = join(root, 'docs', 'specs');
const indexFile = join(specsDir, 'README.md');
const rewritesIndex = process.argv.includes('--index');

const DIR_RE = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES = new Set(['draft', 'approved', 'implementing', 'done', 'superseded']);
const REQUIRED_SECTIONS = {
  'spec.md': ['## 背景与问题', '## 目标', '## 非目标', '## 行为与验收', '## 影响面与风险'],
  'plan.md': ['## 方案', '## 接口与数据', '## 测试与验证'],
  'tasks.md': ['## 任务'],
};
const INDEX_HEADER = [
  '# 规格索引',
  '',
  '<!-- 由 `npm run spec:index` 生成；请改 spec，不要手改这张表。 -->',
  '',
  '看板：[docs/BOARD.md](../BOARD.md)',
  '',
  '| # | 规格 | 状态 | 任务 | 更新 |',
  '|---|---|---|---|---|',
];
const BOARD_COLUMNS = [
  { status: 'draft', title: '草稿' },
  { status: 'approved', title: '待实现' },
  { status: 'implementing', title: '实现中' },
  { status: 'done', title: '已完成' },
  { status: 'superseded', title: '已作废' },
];
const boardFile = join(root, 'docs', 'BOARD.md');

/** Read one `key: value` YAML frontmatter block; values are strings or string arrays. */
function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (match === null) return null;
  const fields = {};
  for (const raw of match[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) continue;
    const at = line.indexOf(':');
    if (at <= 0) return null;
    fields[line.slice(0, at).trim()] = parseScalar(line.slice(at + 1).trim());
  }
  return { fields, body: text.slice(match[0].length) };
}

function parseScalar(value) {
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    if (inner === '') return [];
    return inner
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter((item) => item !== '');
  }
  return value.replace(/^['"]|['"]$/g, '');
}

function hasSection(text, heading) {
  return text.split(/\r?\n/).some((line) => line.trim() === heading);
}

function taskStats(text) {
  const items = [...text.matchAll(/^\s*- \[([ xX])\]\s+\S/gm)];
  return { total: items.length, done: items.filter((match) => match[1] !== ' ').length };
}

function cell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function renderIndex(entries) {
  const rows = entries.map((entry) => `| ${entry.id} | [${cell(entry.title)}](${entry.dir}/spec.md) | ${entry.status} | ${entry.done}/${entry.total} | ${entry.updated} |`);
  return [...INDEX_HEADER, ...rows, ''].join('\n');
}

/** The kanban projection: one section per status, newest cards first. */
function renderBoard(entries) {
  const groups = BOARD_COLUMNS.map((column) => ({
    ...column,
    cards: entries.filter((entry) => entry.status === column.status),
  }));
  const other = entries.filter((entry) => !BOARD_COLUMNS.some((column) => column.status === entry.status));
  const lines = [
    '# 规格看板',
    '',
    '<!-- 由 `npm run spec:index` 生成；状态取自各 spec.md 的 frontmatter，改规格而不是改这里。 -->',
    '',
    '索引：[specs/README.md](specs/README.md)',
    '',
    `| ${groups.map((group) => `${group.title}（${group.status}）`).join(' | ')} |`,
    `|${groups.map(() => '---').join('|')}|`,
    `| ${groups.map((group) => String(group.cards.length)).join(' | ')} |`,
    '',
  ];
  const newestFirst = (a, b) => b.updated.localeCompare(a.updated) || a.id.localeCompare(b.id);
  for (const group of groups) {
    const cards = [...group.cards].sort(newestFirst);
    lines.push(`## ${group.title} · ${group.status}（${cards.length}）`, '');
    if (cards.length === 0) lines.push('_暂无_');
    else for (const card of cards) lines.push(`- [${card.id} ${cell(card.title)}](specs/${card.dir}/spec.md) · \`${card.done}/${card.total}\` · ${card.updated}`);
    lines.push('');
  }
  if (other.length > 0) {
    lines.push(`## 未知状态（${other.length}）`, '');
    for (const card of other) lines.push(`- [${card.id} ${cell(card.title)}](specs/${card.dir}/spec.md) · \`${card.done}/${card.total}\` · ${card.status}`);
    lines.push('');
  }
  return lines.join('\n').trimEnd() + '\n';
}

function normalize(text) {
  return text.replace(/\r\n/g, '\n').trimEnd();
}

const specs = existsSync(specsDir)
  ? readdirSync(specsDir)
      .sort()
      .filter((name) => !name.startsWith('_') && !name.startsWith('.'))
      .filter((name) => statSync(join(specsDir, name)).isDirectory())
  : [];

if (specs.length === 0) {
  console.error(`no specs found under ${specsDir}`);
  process.exit(1);
}

const indexEntries = [];
let failed = 0;

for (const dir of specs) {
  const problems = [];
  const dirPath = join(specsDir, dir);
  const match = DIR_RE.exec(dir);
  const dirId = match === null ? '' : match[1];
  if (match === null) problems.push('directory name must look like 0001-kebab-slug');

  let specTitle = dir;
  let specStatus = '?';
  let specUpdated = '-';
  let done = 0;
  let total = 0;

  for (const [file, sections] of Object.entries(REQUIRED_SECTIONS)) {
    const filePath = join(dirPath, file);
    if (!existsSync(filePath)) {
      problems.push(`${file}: missing`);
      continue;
    }
    const text = readFileSync(filePath, 'utf8');
    const parsed = parseFrontmatter(text);
    if (parsed === null) {
      problems.push(`${file}: missing or invalid frontmatter`);
      continue;
    }
    const fields = parsed.fields;

    if (typeof fields.id !== 'string' || !/^\d{4}$/.test(fields.id)) problems.push(`${file}: frontmatter id must be a four-digit string`);
    else if (dirId !== '' && fields.id !== dirId) problems.push(`${file}: frontmatter id ${fields.id} does not match directory ${dirId}`);

    for (const heading of sections) {
      if (!hasSection(parsed.body, heading)) problems.push(`${file}: missing section "${heading}"`);
    }

    if (file === 'tasks.md') {
      const stats = taskStats(parsed.body);
      done = stats.done;
      total = stats.total;
      if (stats.total === 0) problems.push('tasks.md: needs at least one "- [ ]" task');
    }

    if (file !== 'spec.md') continue;

    if (typeof fields.title !== 'string' || fields.title.trim() === '') problems.push('spec.md: frontmatter title is required');
    else specTitle = fields.title.trim();

    if (typeof fields.status !== 'string' || !STATUSES.has(fields.status)) problems.push(`spec.md: status must be one of ${[...STATUSES].join(', ')}`);
    else specStatus = fields.status;

    if (typeof fields.created !== 'string' || !DATE_RE.test(fields.created)) problems.push('spec.md: created must be YYYY-MM-DD');
    if (typeof fields.updated !== 'string' || !DATE_RE.test(fields.updated)) problems.push('spec.md: updated must be YYYY-MM-DD');
    else specUpdated = fields.updated;

    const packages = fields.packages === undefined ? [] : fields.packages;
    if (!Array.isArray(packages)) problems.push('spec.md: packages must be an inline list, e.g. [packages/chat-search]');
    else {
      for (const path of packages) {
        if (!existsSync(join(root, path))) problems.push(`spec.md: packages entry "${path}" does not exist`);
      }
    }
  }

  if (specStatus === 'done' && total > 0 && done < total) {
    problems.push(`spec.md: status is done but tasks.md still has ${total - done} unchecked task(s)`);
  }

  indexEntries.push({
    id: dirId === '' ? '????' : dirId,
    dir,
    title: specTitle,
    status: specStatus,
    updated: specUpdated,
    done,
    total,
  });

  if (problems.length === 0) {
    console.log(`ok   ${dir}  ${specStatus}  ${done}/${total}`);
  } else {
    failed += 1;
    console.error(`FAIL ${dir}`);
    for (const problem of problems) console.error(`     ${problem}`);
  }
}

const generated = [
  { file: indexFile, label: 'docs/specs/README.md', text: renderIndex(indexEntries) },
  { file: boardFile, label: 'docs/BOARD.md', text: renderBoard(indexEntries) },
];

if (rewritesIndex) {
  for (const doc of generated) {
    writeFileSync(doc.file, doc.text);
    console.log(`write ${doc.label}`);
  }
} else {
  for (const doc of generated) {
    if (!existsSync(doc.file) || normalize(readFileSync(doc.file, 'utf8')) !== normalize(doc.text)) {
      failed += 1;
      console.error(`FAIL ${doc.label}`);
      console.error('     generated file is stale; run `npm run spec:index`');
    }
  }
}

if (failed > 0) {
  console.error(`${failed} problem(s) in ${specs.length} spec(s)`);
  process.exit(1);
}
console.log(`${specs.length} spec(s) checked`);
