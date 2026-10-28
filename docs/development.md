# 开发与维护

面向维护者；用户文档见 [根 README](../README.md)，规格规则见 [文档与规格驱动开发](README.md)。

## 目录结构

```
packages/<name>/   index.js（Host）、client.js（Client）、cordis.patch.yml、locale/、icon.svg
docs/specs/        每个功能一个目录：spec.md、plan.md、tasks.md
docs/plugins/      已交付插件的实现说明
scripts/           check.mjs、spec-check.mjs、spec-new.mjs
AGENTS.md          本仓库的 agent 规则
```

## 规格驱动开发

本仓库使用 SDD：行为先写进 `docs/specs/<NNNN>-<slug>/` 再实现。生成的看板在 [`BOARD.md`](BOARD.md)，索引在 [`specs/README.md`](specs/README.md)，生命周期与规则见 [`README.md`](README.md)。

```powershell
npm run spec:new -- <slug> "<标题>"    # 从模板生成规格
npm run spec:check                     # 校验规格与生成物
npm run spec:index                     # 重建看板与索引
npm run check                          # 各插件入口的语法检查
```

## 热更新

| 改动 | 效果 |
|---|---|
| `client.js` | Client HMR 接收器约 1 秒内换掉，无需刷新 |
| `index.js` | 下一次 profile 重组时生效；往 `.dsh/profiles/<name>/cordis.patch.yml` 写一行内容或注释即可触发——只改 mtime 不会触发 Windows 的文件监听 |
| 新增/移除包 | 同上：需要一次 profile 重组，光跑 `dsh plugin add` 不够 |

## 插件实现说明

- [对话内搜索（chat-search）](plugins/chat-search.md)
- [Git 分支速览（git-branch-pill）](plugins/git-branch-pill.md)

要新写插件，复制任一 `packages/<name>` 目录再改名；结构见上面的目录说明。提交前跑 `npm run check` 与 `npm run spec:check`。
