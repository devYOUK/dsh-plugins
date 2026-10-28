# git-branch-pill 实现说明

面向维护者；用户文档见根目录 README。行为规格见 [`../specs/0003-git-branch-pill/spec.md`](../specs/0003-git-branch-pill/spec.md)。

## 插槽

- `conversation.composer.dock`，`order: -1`。
- 内置活动 pill 是 `order: 0`、用量 pill 是 `order: 1`，所以本 pill 位于两者左侧。
- 组件在拿到第一份数据前返回 `null`，避免闪现；失败时显示 `?`，悬停提示错误码。

## 数据来源

| 字段 | 来源 |
|---|---|
| 分支 | `git symbolic-ref --short -q HEAD`，detached 时回退 `rev-parse --short HEAD` |
| 新增 / 删除 | `git diff HEAD --numstat`（首次提交前用 `diff` + `diff --cached`） |
| 未跟踪 | `git status --porcelain -uall`，统计 `?? ` 行 |

`-uall` 很关键：不加时 git 会把整个未跟踪目录折叠成一行，`packages/` 只算 1 而不是真实文件数。被忽略的文件不会出现在 `?? ` 里——git 只在 `--ignored` 下用 `!! ` 报告。

工作目录在 Host 上从活动会话取（`sessions.get(id).header.cwd`，取不到时遍历 `sessions.list()`），再用 `git rev-parse --show-toplevel` 找到仓库根，所以在子目录里开的会话也能工作。

## Host 半侧

`index.js` 默认导出一个 `TypertRemoteService` 子类，注册在 `gitPill` 命名空间。纯 JS 没有 TypeScript 装饰器，因此 Remote 标记直接写在原型上：

```js
Object.defineProperty(GitPillService.prototype, '@deepseek-ai/dsh-typert-protocol/remote-methods', {
  configurable: true,
  value: Object.freeze({ version: 1, methods: Object.freeze([
    Object.freeze({ method: 'stats', invocation: Object.freeze({ kind: 'direct' }) }),
  ]) }),
});
```

Gateway 在 source 模式下直接分发，不需要生成的描述文件。每个 git 命令 5 秒超时、8MB 输出上限、`GIT_TERMINAL_PROMPT=0`、`LC_ALL=C`；失败返回 `{ ok: false, error: { code } }`，错误码为 `session-required` / `cwd-unavailable` / `not-a-git-repo` / `git-error`。

## Client 半侧

客户端直接调用传输层——`connection.rpc.call(channel, endpoint, payload, signal)`：

```js
const rpc = ctx.get('connection').rpc;
const result = await rpc.call('/api', 'gitPill/stats', { args: { request: { sessionId } } });
```

rpc 对象要作为 `this` 传入，绝不能当成 channel 参数；`rpc.call(rpc, '/api', ...)` 会把请求发到 `[object Object]/api`。

插件级服务必须写进 `inject`：`['slots', 'connection', 'remote', 'remote.workspaceFiles']`。`remote` 父键和它的 `remote.<namespace>` 子键是两个独立条目，漏写会让插件一直停在 pending，而不是报错。

Remote 失败时客户端回退读 `.git/HEAD`（处理 `gitdir:` 指向的 worktree），只显示分支，面板带错误行。

## 刷新与交互

- 挂载时、每 8 秒、以及打开面板时各取一次数据。
- 面板用按钮的 `getBoundingClientRect()` 定位，`position: fixed`，不参与输入框布局。
- 外部 `pointerdown` 或 `Escape` 关闭；卸载时清理定时器与监听。
