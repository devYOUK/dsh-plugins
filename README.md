# dsh-plugins

Local DSH plugin workspace. Every directory under `packages/` is an independent
DSH bundle: a Host half (`index.js`), a Client half (`client.js`), and a
`cordis.patch.yml` that inserts the plugin row.

## Layout

```
dsh-plugins/
  package.json            # private workspace root, no dsh fields
  pnpm-workspace.yaml
  packages/
    git-branch-pill/      # branch pill in the composer status row (in use)
    hello-decoration/     # minimal "Hello DSH" sample, kept as a template
```

## git-branch-pill

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

## Hot updates

| Change | Effect |
|---|---|
| `client.js` | swapped by the Client HMR receiver within ~1s, no reload |
| `index.js` | applied at the next profile recomposition; touch `.dsh/profiles/<name>/cordis.patch.yml` to trigger one, no app restart |
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
