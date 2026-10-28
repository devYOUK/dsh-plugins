# dsh-plugins

[English](README.md) | 中文

面向 DSH（DeepSeek Harness）Web UI 的本地插件。`packages/` 下每个目录都是一个独立的 DSH bundle：装进 profile 就能在应用里用，源码也可以当作自己写插件的参考。

## 插件一览

| 插件 | 包名 | 作用 |
|---|---|---|
| 对话内搜索 / In-conversation Search | `@local/dsh-chat-search` | `Ctrl+F` 在会话正文里搜索：高亮、历史、毛玻璃搜索条，可选折叠过程搜索 |
| Git 分支速览 / Git Branch Glance | `@local/dsh-git-branch-pill` | 输入框状态行里的分支与改动统计 pill |
| Hello DSH | `@local/dsh-hello-decoration` | 最小组件示例，留作模板，不建议安装 |

前两个面向当前 DSH Web 客户端，依赖宿主提供的 slot 与服务（`conversation.composer.dock`、`plugins.row.config`、`ctx.configForms`），DSH 大版本升级后可能需要小幅适配。

## 对话内搜索（chat-search）

`Ctrl+F`，或会话头部的搜索图标，会在会话上方打开浮动搜索条。

- 命中全部高亮，`Enter` / `Shift+Enter` 前后跳转。
- 开关：区分大小写（`Aa`）、全词（`W`）、正则（`.*`）、过程（是否包含一轮里写在工具步骤之间的过程说明）。
- 搜索用户轮次、最终回答和可见的过程说明；思考（`reasoning`）与工具输出永远不参与。
- 最近查询存在 `localStorage`。
- 搜索条外观可配置：插件 → 对话内搜索 → 配置。

| 配置项 | 字段 | 作用 |
|---|---|---|
| `transparencyPercent` | 透明度（%） | 0 = 完全不透明，100 = 完全透明 |
| `blurPx` | 毛玻璃模糊（px） | 搜索条 `backdrop-filter: blur()` 的半径 |
| `highlightPercent` | 命中高亮强度（%） | 命中矩形的 alpha |
| `searchFoldedProcess` | 折叠过程正文 | 折叠的过程行也参与搜索，定位时自动展开（默认关） |

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
- `Ctrl+F` 能打开搜索条，输入关键词有高亮，配置页显示四个字段。
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

## 开发

本仓库使用规格驱动开发（SDD）：行为先写进 `docs/specs/<NNNN>-<slug>/` 再实现。生成的看板在 [`docs/BOARD.md`](docs/BOARD.md)，规则与生命周期见 [`docs/README.md`](docs/README.md)。

```powershell
npm run spec:new -- <slug> "<标题>"    # 从模板生成规格
npm run spec:check                     # 校验规格与生成物
npm run spec:index                     # 重建看板与索引
npm run check                          # 各插件入口的语法检查
```

目录：

```
packages/<name>/   index.js（Host）、client.js（Client）、cordis.patch.yml、locale/、icon.svg
docs/specs/        每个功能一个目录：spec.md、plan.md、tasks.md
docs/plugins/      已交付插件的实现说明
scripts/           check.mjs、spec-check.mjs、spec-new.mjs
AGENTS.md          本仓库的 agent 规则
```

迭代时的热更新：

| 改动 | 效果 |
|---|---|
| `client.js` | Client HMR 接收器约 1 秒内换掉，无需刷新 |
| `index.js` | 下一次 profile 重组时生效；往 `.dsh/profiles/<name>/cordis.patch.yml` 写一行内容或注释即可触发——只改 mtime 不会触发 Windows 的文件监听 |
| 新增/移除包 | 同上：需要一次 profile 重组，光跑 `dsh plugin add` 不够 |

深入阅读：[`docs/plugins/chat-search.md`](docs/plugins/chat-search.md)、[`docs/plugins/git-branch-pill.md`](docs/plugins/git-branch-pill.md)。要新写插件，复制 `packages/hello-decoration` 再改名。

## License

MIT，见 [LICENSE](LICENSE)。
