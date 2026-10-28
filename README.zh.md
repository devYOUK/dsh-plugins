# dsh-plugins

[English](README.md) | 中文

面向 DSH（DeepSeek Harness）Web UI 的本地插件。`packages/` 下每个目录都是一个独立的 DSH bundle：装进 profile 就能在应用里用，源码也可以当作自己写插件的参考。

## 插件一览

| 插件 | 包名 | 作用 |
|---|---|---|
| 对话内搜索 / In-conversation Search | `@local/dsh-chat-search` | `Ctrl+F` 在会话正文里搜索：高亮、历史、毛玻璃搜索条，可选折叠过程搜索 |
| Git 分支速览 / Git Branch Glance | `@local/dsh-git-branch-pill` | 输入框状态行里的分支与改动统计 pill |

两个插件都面向当前 DSH Web 客户端，依赖宿主提供的 slot 与服务（`conversation.composer.dock`、`plugins.row.config`、`ctx.configForms`），DSH 大版本升级后可能需要小幅适配。

## 对话内搜索（chat-search）

`Ctrl+F`，或会话头部的搜索图标，会在会话上方打开浮动搜索条。

- 命中全部高亮，`Enter` / `Shift+Enter` 前后跳转。
- 开关：区分大小写（`Aa`）、全词（`W`）、正则（`.*`）、过程（包含一轮里写在工具步骤之间的过程说明；折叠的过程行也会搜索，并在命中时自动展开）。
- 搜索用户轮次、最终回答和过程说明（可见或折叠）；思考（`reasoning`）与工具输出永远不参与。
- 最近查询存在 `localStorage`。
- 搜索条外观可配置：插件 → 对话内搜索 → 配置。

| 配置项 | 字段 | 作用 |
|---|---|---|
| `transparencyPercent` | 透明度（%） | 0 = 完全不透明，100 = 完全透明 |
| `blurPx` | 毛玻璃模糊（px） | 搜索条 `backdrop-filter: blur()` 的半径 |
| `highlightPercent` | 命中高亮强度（%） | 命中矩形的 alpha |

## Git 分支速览（git-branch-pill）

输入框状态行里、内置活动 pill 与用量 pill 左侧的小 pill，显示当前分支。

- 点击弹出浮层：分支、新增（`+n`）、删除（`−n`）、未跟踪文件数。
- detached HEAD 显示短 SHA；非 git 仓库显示 `?`，悬停给出原因。
- 每 8 秒刷新一次，打开浮层时也刷新。没有配置项。

## 安装

### 前置

- 已安装 DSH 桌面版或 `dsh` CLI，并有一个 profile；示例用 `desktop`。
- 本仓库已克隆到本地。下文的 `<repo>` 指克隆路径，例如 `C:\Workspace\dsh-plugins`。

### 从插件页安装（推荐）

1. 侧栏打开 **插件**。
2. 点 **添加插件**，展开箭头菜单，选择 **安装第三方插件**。
3. 填入某个包目录的绝对路径，例如 `<repo>\packages\chat-search`，点 **安装**。
4. 安装完成后点 **立即启用**。
5. 需要分支 pill 的话，对 `<repo>\packages\git-branch-pill` 重复以上步骤。

插件页会替你完成安装、选中 bundle 和 profile 重组。

### 从命令行安装

```powershell
dsh plugin --profile desktop add <repo>\packages\chat-search
dsh plugin --profile desktop add <repo>\packages\git-branch-pill
```

`dsh plugin add` 只改 profile 清单，所以装完要重启 DSH（或触发一次 profile 重组），然后在插件页确认两个 bundle 及其行都已打开。

### 验证

- 插件页里 **对话内搜索** 与 **Git 分支速览** 显示为已安装、已启用。
- `Ctrl+F` 能打开搜索条，输入关键词有高亮，配置页显示三个字段。
- 输入框状态行出现分支 pill，点击能弹出浮层。

## 卸载

在插件页打开对应 bundle，点 **卸载**。或用命令行：

```powershell
dsh plugin --profile desktop remove @local/dsh-chat-search
dsh plugin --profile desktop remove @local/dsh-git-branch-pill
```

之后重启 DSH。配置写在 profile patch（`.dsh/profiles/<profile>/cordis.patch.yml`）里，不在包内，所以卸载不会删掉它；想要干净的状态，手动删掉 `- id: chat-search` 那一段。

## 配置存放位置

- 配置：上面的 profile patch，`- id: chat-search` 段。
- 搜索历史：`localStorage` 的 `dsh-chat-search:history`（按浏览器，最多 20 条）。

## License

MIT，见 [LICENSE](LICENSE)。
