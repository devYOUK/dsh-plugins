# dsh-plugins

[English](README.md) | 中文

本地 DSH 插件工作区。`packages/` 下每个目录都是一个独立的 DSH bundle：Host 半侧（`index.js`）、Client 半侧（`client.js`），以及负责插入插件行的 `cordis.patch.yml`。

## 目录结构

```
dsh-plugins/
  package.json            # 私有工作区根，不含 dsh 字段
  pnpm-workspace.yaml
  AGENTS.md               # agent 规则：改行为前先读 docs/
  docs/                   # 规格（SDD）：docs/specs/<NNNN>-<slug>/{spec,plan,tasks}.md
  scripts/                # check.mjs、spec-check.mjs、spec-new.mjs
  packages/
    git-branch-pill/      # 输入框状态行里的分支 pill（在用）
    chat-search/          # 会话内 Ctrl+F 搜索，带配置页
    hello-decoration/     # 最小 "Hello DSH" 示例，留作模板
```

## 文档与规格（SDD）

行为先写规格、再写实现。每个功能在 `docs/specs/<NNNN>-<slug>/` 下有一份目录，包含 `spec.md`（问题、目标、可观察行为、验收）、`plan.md`（方案、契约、验证）和 `tasks.md`（勾选项）。[`docs/BOARD.md`](docs/BOARD.md) 是按 draft / approved / implementing / done / superseded 分列的看板；`docs/specs/README.md` 是按编号排列的索引。两者都由各 `spec.md` 的 frontmatter 生成。

```powershell
npm run spec:new -- <slug> "<标题>"    # 从模板生成 000N-<slug>
npm run spec:check                     # 校验结构、frontmatter、章节、任务状态、生成物是否最新
npm run spec:index                     # 重建 docs/BOARD.md 与 docs/specs/README.md
```

`spec:check` 会在这些情况失败：缺文件或章节、`status` 非法、编号与目录不一致、`packages:` 指向不存在的路径、`done` 的规格还有未勾任务、看板或索引过期。生命周期与“什么时候需要新规格”见 [`docs/README.md`](docs/README.md)。

## git-branch-pill（显示名：Git 分支速览 / Git Branch Glance）

在输入框状态行（显示 `13 轮 150 步`、`缓存命中 99%` 和上下文计量的那一行）左侧加一个小 pill。

* Slot：`conversation.composer.dock`，`order: -1`；内置活动 pill 是 `order: 0`、用量 pill 是 `order: 1`，所以这个在最左。
* 点击弹出浮层，样式参照内置的会话统计对话框（`stat-dialog.module.css`）：分支、新增、删除、未跟踪数。
* 数据由 Host 半侧通过原生 Remote 传输提供：`POST /api/gitPill/stats`，请求体 `{ args: { request: { sessionId } } }`。

| 字段 | 来源 |
|---|---|
| 分支 | `git symbolic-ref --short -q HEAD`，detached 时回退到 `rev-parse --short HEAD` |
| 新增 / 删除 | `git diff HEAD --numstat`（首次提交前用 `diff` + `diff --cached`） |
| 未跟踪 | `git status --porcelain -uall`，统计 `?? ` 行 |

`-uall` 很关键：不加它时 git 会把整个未跟踪目录折叠成一行，`packages/` 只算 1 而不是真实文件数。被忽略的文件不会出现在 `?? ` 里——git 只在 `--ignored` 下用 `!! ` 报告。

工作目录在 Host 上从活动会话取（`sessions.get(id).header.cwd`），再用 `git rev-parse --show-toplevel` 找到仓库根，所以在子目录里开的会话也能正常工作。

### Host 半侧

`index.js` 默认导出一个 `TypertRemoteService` 子类，注册在 `gitPill` 命名空间下。纯 JS 没有 TypeScript 装饰器，因此 Remote 标记直接写在原型上：

```js
Object.defineProperty(GitPillService.prototype, '@deepseek-ai/dsh-typert-protocol/remote-methods', {
  configurable: true,
  value: Object.freeze({ version: 1, methods: Object.freeze([
    Object.freeze({ method: 'stats', invocation: Object.freeze({ kind: 'direct' }) }),
  ]) }),
});
```

Gateway 在 source 模式下直接分发，不需要生成的描述文件。

### Client 半侧

客户端直接调用传输层——`connection.rpc.call(channel, endpoint, payload, signal)`：

```js
const rpc = ctx.get('connection').rpc;
const result = await rpc.call('/api', 'gitPill/stats', { args: { request: { sessionId } } });
```

rpc 对象要作为 `this` 传入，绝不能当成 channel 参数；`rpc.call(rpc, '/api', ...)` 会把请求发到 `[object Object]/api`。

插件级服务必须写进 `inject`：`['slots', 'connection', 'remote', 'remote.workspaceFiles']`。`remote` 父键和它的 `remote.<namespace>` 子键是两个独立条目，漏写会让插件一直停在 pending，而不是报错。

## chat-search（显示名：对话内搜索 / In-conversation Search）

`Ctrl+F` 在会话上方打开浮动搜索条：命中全部高亮，`Enter`/`Shift+Enter` 前后跳转，选项行可切换区分大小写、全词、正则和「过程」范围。最近查询存在 `localStorage`。

搜索范围跟随会话 DOM。助手文本渲染为 `assistant-step` 流项（`data-chat-flow-kind`），按 `data-chat-group-part="response"`（模型写出的内容）和 `"reasoning"`（折叠的思考流）拆分；不存在 `assistant` 这个 kind，所以旧的 `kind === 'assistant'` 判断只能命中折叠态的 compact answer（`data-turn-process-answer`）。用户与 steering 轮次、最终回答和可见的 response 文本始终参与搜索；`reasoning` 与 tool-call 节点永远排除。

过程说明——一轮里写在工具步骤之间的段落——带 `data-turn-process-member`，因此跟随 **过程** 开关（默认开）。折叠的过程用 `hidden="until-found"` 隐藏这些行，并监听 `beforematch`（宿主自己的揭示入口）：打开配置里的「折叠过程正文」后，这些行也会被收集，命中时派发 `beforematch`，等 `hidden`/`data-chat-motion` 清空后再测量滚动。关掉配置时，折叠正文不进入结果。手动展开过程仍会通过观察器的 `hidden` 属性监听重新触发搜索。

该行在 插件 → 对话内搜索 → 配置 有配置页：

| 键 | 字段 | 作用 |
|---|---|---|
| `transparencyPercent` | 透明度（%） | 0 = 完全不透明，100 = 完全透明 |
| `blurPx` | 毛玻璃模糊（px） | 搜索条 `backdrop-filter: blur()` 的半径 |
| `highlightPercent` | 命中高亮强度（%） | 命中矩形的 alpha |
| `searchFoldedProcess` | 折叠过程正文 | 把折叠的过程行纳入搜索，并在定位时自动展开（默认关） |

Host 的每个字段都是 `.volatile()`：设置服务只服务带 volatile 字段的条目，也只有 volatile 路径接受写入；普通字段会让整页没有可编辑项。

客户端把配置页注册在 `plugins.row.config`，键为 `@local/dsh-chat-search#chat-search`。它维护暂存草稿，通过 `ctx.configForms.get('chat-search').mutate(ops, revision)` 保存——和搜索条订阅的是同一份共享表单，所以保存后已经打开的搜索条会立即换样式。字段的标记与 token 抄自 `ui-primitives`，但不要从插件里 import 那个包。

## 热更新

| 改动 | 效果 |
|---|---|
| `client.js` | Client HMR 接收器约 1 秒内换掉，无需刷新 |
| `index.js` | 下一次 profile 重组时生效；往 `.dsh/profiles/<name>/cordis.patch.yml` 写一行内容或注释即可触发——只改 mtime 不会触发 Windows 的文件监听 |
| 新增/移除包 | 同上：需要一次 profile 重组，光跑 `dsh plugin add` 不够 |

`dsh plugin add` 只改 profile 的 `package.json` bundle 列表，而 HMR 的 profile 监听不盯这个。

## 新增插件

```powershell
mkdir packages\my-plugin
# 复制 packages\hello-decoration 作为起点，然后改名
```

## 安装 / 卸载（按 profile）

```powershell
dsh plugin --profile desktop add C:\Workspace\dsh-plugins\packages\git-branch-pill
dsh plugin --profile desktop remove @local/dsh-git-branch-pill
```

`@deepseek-ai/dsh-typert-protocol` 这类宿主包从 DSH 安装目录解析；把它们声明成 peerDependencies，永远不要打包进来。
