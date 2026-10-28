# dsh-plugins

English | [中文](README.zh.md)

Local plugins for the DSH (DeepSeek Harness) Web UI. Every directory under
`packages/` is a standalone DSH bundle: install it into a profile and it appears
in the app; the source also doubles as a reference for writing your own.

## Plugins

| Plugin | Package | What it does |
|---|---|---|
| 对话内搜索 / In-conversation Search | `@local/dsh-chat-search` | `Ctrl+F` search over the transcript: highlights, history, glass-styled bar, optional folded-process search |
| Git 分支速览 / Git Branch Glance | `@local/dsh-git-branch-pill` | Branch and diff-stat pill in the composer status row |

Both target the current DSH Web client. They rely on host slots and services
(`conversation.composer.dock`, `plugins.row.config`, `ctx.configForms`), so a
major DSH upgrade may need small adjustments.

## In-conversation Search (chat-search)

`Ctrl+F` — or the search icon in the session header — opens a floating search
bar over the transcript.

- Highlights every hit, `Enter` / `Shift+Enter` step forward and back.
- Toggles: case-sensitive (`Aa`), whole word (`W`), regex (`.*`), and 过程
  (include the narration a turn writes between tool steps).
- Searches user turns, the final answer and visible process narration; thinking
  (`reasoning`) and tool output never match.
- Recent queries stay in `localStorage`.
- The bar's look is configurable: 插件 → 对话内搜索 → 配置.

| Setting | Field | Effect |
|---|---|---|
| `transparencyPercent` | 透明度（%） | 0 = solid background, 100 = fully see-through |
| `blurPx` | 毛玻璃模糊（px） | radius of the bar's `backdrop-filter: blur()` |
| `highlightPercent` | 命中高亮强度（%） | alpha of the hit rectangles |
| `searchFoldedProcess` | 折叠过程正文 | include folded process rows and auto-expand them when navigating (default off) |

## Git Branch Glance (git-branch-pill)

A small pill left of the built-in activity and usage pills in the composer
status row, showing the current branch.

- Click it for a popover: branch, insertions (`+n`), deletions (`−n`), and the
  number of untracked files.
- Detached HEAD shows the short SHA; a non-repository workspace shows `?` with
  the reason on hover.
- Refreshes every 8 seconds and when the popover opens. No configuration.

## Install

### Prerequisites

- The DSH desktop app, or the `dsh` CLI, with a profile. The examples use the
  profile `desktop`.
- This repository cloned locally. Below, `<repo>` stands for the clone path,
  for example `C:\Workspace\dsh-plugins`.

### From the Plugins page (recommended)

1. Open **插件** in the sidebar.
2. Click **添加插件**, open the arrow menu, choose **安装第三方插件**.
3. Enter the absolute path of one package directory, for example
   `<repo>\packages\chat-search`, press **安装**.
4. When the install finishes, click **立即启用**.
5. Repeat for `<repo>\packages\git-branch-pill` if you want the branch pill.

The page installs, selects the bundle and recomposes the profile for you.

### From the CLI

```powershell
dsh plugin --profile desktop add <repo>\packages\chat-search
dsh plugin --profile desktop add <repo>\packages\git-branch-pill
```

`dsh plugin add` only edits the profile manifest, so restart DSH afterwards (or
trigger a profile recomposition) and confirm both bundles — and their rows —
are switched on in the Plugins page.

### Verify

- The Plugins page lists **对话内搜索** and **Git 分支速览** as installed and
  enabled.
- `Ctrl+F` opens the search bar, typing highlights matches, and the 配置 page
  shows four fields.
- The composer status row shows the branch pill; clicking it opens the popover.

## Uninstall

From the Plugins page: open the bundle and choose **卸载**. Or from the CLI:

```powershell
dsh plugin --profile desktop remove @local/dsh-chat-search
dsh plugin --profile desktop remove @local/dsh-git-branch-pill
```

Restart DSH afterwards. Settings are persisted in the profile patch
(`.dsh/profiles/<profile>/cordis.patch.yml`), not in the package, so they are
not removed with the plugin; delete the `- id: chat-search` block if you want a
clean slate.

## Where settings live

- Config: the profile patch above, under `- id: chat-search`.
- Search history: `localStorage` key `dsh-chat-search:history` (per browser,
  capped at 20 entries).

## License

MIT — see [LICENSE](LICENSE).
