# 开发与维护

面向维护者；用户文档见 [根 README](../README.md)，需求方法见 [Spec-to-Delivery](spec-workflow.md)，规格索引见 [spec/](spec/README.md)。

## 目录结构

```
packages/<name>/   index.js（Host）、client.js（Client）、cordis.patch.yml、locale/、icon.svg
docs/spec/         每份需求一个 spec-NNNN-<slug>/ 七件套
docs/reference/    带时效的宿主契约与本地环境事实
docs/decisions/    ADR
docs/plugins/      已交付插件的实现说明
docs/_templates/   需求模板
scripts/           check.mjs
.agents/skills/    项目内 S2D 脚本副本
AGENTS.md          本仓库的 agent 规则
```

## 需求与文档

- 新需求按 [spec-workflow.md](spec-workflow.md) 分诊 S/M/L，从 `_templates/spec/` 复制。
- 索引由 `gen_spec_index.py` 生成，不手写看板。
- reference 超过 `review_interval_days` 未核对即过期。

```powershell
npm run docs:index    # 重建 docs/spec/README.md 的索引块
npm run docs:check    # 结构、front matter、reference 时效、ADR、链接
npm run check         # 各插件入口的语法检查
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
- [工作区右键菜单（workspace-menu）](plugins/workspace-menu.md)

要新写插件，复制任一 `packages/<name>` 目录再改名；结构见上面的目录说明。提交前跑 `npm run check` 与 `npm run docs:check`。
