# dsh-plugins

English | [中文](README.zh.md)

Local DSH plugin workspace. Every directory under `packages/` is an independent
DSH bundle: a Host half (`index.js`), a Client half (`client.js`), and a
`cordis.patch.yml` that inserts the plugin row.

## Layout

```
dsh-plugins/
  package.json            # private workspace root, no dsh fields
  pnpm-workspace.yaml
  AGENTS.md               # agent rules: read docs/ before changing behavior
  docs/                   # specs (SDD): docs/specs/<NNNN>-<slug>/{spec,plan,tasks}.md
  scripts/                # check.mjs, spec-check.mjs, spec-new.mjs
  packages/
    git-branch-pill/      # branch pill in the composer status row (in use)
    chat-search/          # Ctrl+F search over the transcript, with a config page
    hello-decoration/     # minimal "Hello DSH" sample, kept as a template
```

## Docs and specs (SDD)

Behavior is specified before it is implemented. Each feature has a directory
under `docs/specs/<NNNN>-<slug>/` with `spec.md` (problem, goals, observable
behavior, acceptance), `plan.md` (approach, contracts, verification) and
`tasks.md` (checkboxes). [`docs/BOARD.md`](docs/BOARD.md) is the status board,
grouped into draft / approved / implementing / done / superseded columns;
`docs/specs/README.md` is the id-ordered index. Both are generated from the
frontmatter of each `spec.md`.

```powershell
npm run spec:new -- <slug> "<title>"   # scaffold 000N-<slug> from the template
npm run spec:check                     # structure, frontmatter, sections, task state, generated docs
npm run spec:index                     # rebuild docs/BOARD.md and docs/specs/README.md
```

`spec:check` fails on missing files or sections, an unknown `status`, an id
that disagrees with the directory, a `packages:` entry that does not exist, a
`done` spec with unchecked tasks, or a stale board/index. Read
[`docs/README.md`](docs/README.md) for the lifecycle and the rules for when a
new spec is required.

## git-branch-pill（显示名：Git 分支速览 / Git Branch Glance）

Adds a small pill to the left of the composer status row — the line that shows
`13 轮 150 步`, `缓存命中 99%`, and the context meter.

* Slot: `conversation.composer.dock`, `order: -1`; the built-in activity pill is
  `order: 0` and the usage pill `order: 1`, so this one sits left of both.
* Clicking it opens a popover styled after the built-in 会话统计 dialog
  (`stat-dialog.module.css`): branch, insertions, deletions, untracked count.
* Data comes from the Host half over the raw Remote transport:
  `POST /api/gitPill/stats` with `{ args: { request: { sessionId } } }`.

| Field | Source |
|---|---|
| branch | `git symbolic-ref --short -q HEAD`, falling back to `rev-parse --short HEAD` when detached |
| insertions / deletions | `git diff HEAD --numstat` (`diff` + `diff --cached` before the first commit) |
| untracked | `git status --porcelain -uall`, counting `?? ` entries |

`-uall` matters: without it git collapses an untracked directory into one row, so
`packages/` counts as 1 instead of its real file count. Ignored files never
appear in `?? ` — git only reports them under `--ignored` (`!! `).

The workspace root is resolved on the Host from the live session
(`sessions.get(id).header.cwd`), then `git rev-parse --show-toplevel` finds the
repository root, so a session opened in a subdirectory still works.

### Host half

`index.js` default-exports a `TypertRemoteService` subclass registered under the
`gitPill` namespace. TypeScript decorators are not available in plain JS, so the
Remote marker is written directly:

```js
Object.defineProperty(GitPillService.prototype, '@deepseek-ai/dsh-typert-protocol/remote-methods', {
  configurable: true,
  value: Object.freeze({ version: 1, methods: Object.freeze([
    Object.freeze({ method: 'stats', invocation: Object.freeze({ kind: 'direct' }) }),
  ]) }),
});
```

The Gateway dispatches it in source mode (no generated descriptor needed).

### Client half

The client calls the transport directly — `connection.rpc.call(channel, endpoint,
payload, signal)`:

```js
const rpc = ctx.get('connection').rpc;
const result = await rpc.call('/api', 'gitPill/stats', { args: { request: { sessionId } } });
```

Pass the rpc object as `this`, never as the channel argument; `rpc.call(rpc, '/api', ...)`
sends the request to `[object Object]/api`.

Plugin-level services must be declared in `inject`: `['slots', 'connection', 'remote',
'remote.workspaceFiles']`. The `remote` parent and its `remote.<namespace>` services are
separate keys, and a missing key leaves the plugin pending forever instead of failing.

## chat-search（显示名：对话内搜索 / In-conversation Search）

`Ctrl+F` opens a floating search bar over the transcript: every hit is
highlighted, `Enter`/`Shift+Enter` step between them, and the options row
toggles case, whole-word, regex matching and the 过程 scope. Recent queries
stay in `localStorage`.

Search scope follows the transcript DOM. Assistant text is rendered as
`assistant-step` flow items (`data-chat-flow-kind`), split into
`data-chat-group-part="response"` for what the model writes and `"reasoning"`
for the folded 思考 stream; there is no `assistant` kind, so the older
`kind === 'assistant'` test only ever matched the compact folded answer
(`data-turn-process-answer`). User and steering turns, the final answer and
visible response text are always searched; `reasoning` and tool-call nodes
never are.

Interim narration — the paragraphs a turn writes between tool steps — carries
`data-turn-process-member` and therefore follows the **过程** toggle (on by
default). A folded process hides its rows with `hidden="until-found"` and
listens for `beforematch`, the host's own reveal hook: with the 折叠过程正文
setting on, those rows are collected too and a hit dispatches `beforematch`,
waits for `hidden`/`data-chat-motion` to clear, then measures and scrolls. With
the setting off, folded prose stays out of the results. Unfolding a process
still re-runs the search through the observer's `hidden` attribute filter.

The row has a configure page at 插件 → 对话内搜索 → 配置:

| Key | Field | Effect |
|---|---|---|
| `transparencyPercent` | 透明度（%） | 0 = solid background, 100 = fully see-through |
| `blurPx` | 毛玻璃模糊（px） | radius of the bar's `backdrop-filter: blur()` |
| `highlightPercent` | 命中高亮强度（%） | alpha of the hit rectangles |
| `searchFoldedProcess` | 折叠过程正文 | include folded process rows and auto-expand them on navigation (default off) |

Every Host field is `.volatile()`: the settings service only serves entries
whose form has a volatile field and only volatile paths accept writes, so a
plain field would leave the page with nothing to edit.

The client registers the page in `plugins.row.config` keyed by
`@local/dsh-chat-search#chat-search`. It keeps a staged draft, saves through
`ctx.configForms.get('chat-search').mutate(ops, revision)` — the same shared
form the search bar subscribes to — so a save restyles an already open bar.
Fields render with the host's settings-form markup and tokens copied from
`ui-primitives`; do not import that package from a plugin.

## Hot updates

| Change | Effect |
|---|---|
| `client.js` | swapped by the Client HMR receiver within ~1s, no reload |
| `index.js` | applied at the next profile recomposition; add a line or comment to `.dsh/profiles/<name>/cordis.patch.yml` to trigger one — an mtime-only touch does not fire the Windows watcher |
| new/removed package | same: a profile recomposition, not `dsh plugin add` alone |

`dsh plugin add` only edits the profile `package.json` bundle list, which is not what
the HMR profile watch reacts to.

## Add a plugin

```powershell
mkdir packages\my-plugin
# copy packages\hello-decoration as the starting point, then rename
```

## Install / uninstall (per profile)

```powershell
dsh plugin --profile desktop add C:\Workspace\dsh-plugins\packages\git-branch-pill
dsh plugin --profile desktop remove @local/dsh-git-branch-pill
```

Host packages such as `@deepseek-ai/dsh-typert-protocol` resolve from the DSH
installation; declare them as peerDependencies and never bundle them.
