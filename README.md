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
| 工作区右键菜单 / Workspace Context Menu | `@local/dsh-workspace-menu` | Right-click a workspace row: open it in Explorer, or rename it |

All three target the current DSH Web client. They rely on host slots and
services (`conversation.composer.dock`, `plugins.row.config`, `shell.overlay`,
`ctx.configForms`), so a major DSH upgrade may need small adjustments.

## In-conversation Search (chat-search)

`Ctrl+F` — or the search icon in the session header — opens a floating search
bar over the transcript.

- Highlights every hit, `Enter` / `Shift+Enter` step forward and back.
- Toggles: case-sensitive (`Aa`), whole word (`W`), regex (`.*`), and 过程
  (include the narration a turn writes between tool steps; folded process rows
  are searched too and auto-expanded when matched).
- Searches user turns, the final answer and process narration (visible or
  folded); thinking (`reasoning`) and tool output never match.
- Recent queries stay in `localStorage`.
- The bar's look is configurable: 插件 → 对话内搜索 → 配置.

| Setting | Field | Effect |
|---|---|---|
| `transparencyPercent` | 透明度（%） | 0 = solid background, 100 = fully see-through |
| `blurPx` | 毛玻璃模糊（px） | radius of the bar's `backdrop-filter: blur()` |
| `highlightPercent` | 命中高亮强度（%） | alpha of the hit rectangles |

## Git Branch Glance (git-branch-pill)

A small pill left of the built-in activity and usage pills in the composer
status row, showing the current branch.

- Click it for a popover: branch, insertions (`+n`), deletions (`−n`), and the
  number of untracked files.
- Detached HEAD shows the short SHA; a non-repository workspace shows the
  error code (`not-a-git-repo`) in red, with the full reason on hover.
- Refreshes every 8 seconds and when the popover opens. No configuration.

## Workspace Context Menu (workspace-menu)

Right-click a workspace row in the sidebar:

- **Open in File Explorer** — opens the workspace directory through the host's
  native opener.
- **Rename** — opens a small dialog prefilled with the current title and saves
  through the workspace service.

The menu closes on an outside click, `Esc`, scrolling or window blur. It only
reacts to workspace rows; right-clicking anywhere else keeps the app's own menu.

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
5. Repeat for `<repo>\packages\git-branch-pill` and
   `<repo>\packages\workspace-menu` if you want the branch pill and the
   workspace context menu.

The page installs, selects the bundle and recomposes the profile for you.

### From the CLI

```powershell
dsh plugin --profile desktop add <repo>\packages\chat-search
dsh plugin --profile desktop add <repo>\packages\git-branch-pill
dsh plugin --profile desktop add <repo>\packages\workspace-menu
```

`dsh plugin add` only edits the profile manifest, so restart DSH afterwards (or
trigger a profile recomposition) and confirm all bundles — and their rows —
are switched on in the Plugins page.

### Verify

- The Plugins page lists **对话内搜索**, **Git 分支速览** and **工作区右键菜单**
  as installed and enabled.
- `Ctrl+F` opens the search bar, typing highlights matches, and the 配置 page
  shows three fields.
- The composer status row shows the branch pill; clicking it opens the popover.
- Right-clicking a workspace row opens the two-item menu.

## Uninstall

From the Plugins page: open the bundle and choose **卸载**. Or from the CLI:

```powershell
dsh plugin --profile desktop remove @local/dsh-chat-search
dsh plugin --profile desktop remove @local/dsh-git-branch-pill
dsh plugin --profile desktop remove @local/dsh-workspace-menu
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
