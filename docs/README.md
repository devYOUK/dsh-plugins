# 文档与规格驱动开发（SDD）

本目录是项目的**规格来源**。功能的行为先写进 `docs/specs/<NNNN>-<slug>/spec.md`，实现方案写 `plan.md`，可勾选的工作项写 `tasks.md`；代码是规格的实现，不是规格本身。

## 目录

| 路径 | 作用 |
|---|---|
| `specs/` | 每个功能一份规格 |
| `specs/_template/` | 新建规格时复制/替换的三份模板 |
| `plugins/` | 已交付插件的实现说明（根目录 README 面向使用者，这里面向维护者） |
| `development.md` | 目录结构、热更新、插件实现说明的入口 |
| `BOARD.md` | 看板：按状态分组的规格清单，由 `npm run spec:index` 生成 |
| `specs/README.md` | 索引：按编号排列的完整表格，同样由 `npm run spec:index` 生成 |

`BOARD.md` 和 `specs/README.md` 都是**投影**：状态只写在各自 `spec.md` 的 frontmatter 里。改状态 = 改 spec，再跑一次 `npm run spec:index`，看板上的卡片就会换列。

## 状态机

```
draft ──► approved ──► implementing ──► done
  │            │              │
  └────────────┴──────────────┴──────► superseded（被新规格取代）
```

- `draft`：还在写，允许改行为描述。
- `approved`：行为已定，代码可以开工；改行为要先回改这里。
- `implementing`：正在做，`tasks.md` 逐条勾。
- `done`：验收通过，任务全部勾完（校验脚本强制）。
- `superseded`：被后来的规格取代，在正文顶部写明取代它的编号。

## 三份文件各写什么

| 文件 | 写什么 | 不写什么 |
|---|---|---|
| `spec.md` | 问题、用户可观察的行为、验收方式、影响面、风险 | 实现细节、任务拆分 |
| `plan.md` | 技术方案、接口/数据契约、测试与验证办法 | 需求复述、进度日记 |
| `tasks.md` | 可勾选、可独立完成的工作项 | 长篇描述 |

## 命名与编号

- 目录：`NNNN-kebab-slug`，四位编号从 `0001` 起，不复用。
- 用 `npm run spec:new -- <slug> "<标题>"` 生成，不要手抄模板。
- 每个 `spec.md` / `plan.md` / `tasks.md` 都带 frontmatter，`id` 必须与目录前四位一致。

## 校验

```powershell
npm run spec:check    # 结构、frontmatter、必填章节、任务进度、生成文件是否最新
npm run spec:index    # 重建 docs/BOARD.md 与 docs/specs/README.md
npm run check         # 各插件的 JS 语法
```

`spec:check` 在以下情况失败：缺文件、frontmatter 缺字段或状态非法、编号与目录不符、`packages:` 指向不存在的路径、必填章节缺失、`status: done` 但还有未勾任务、`BOARD.md` 或 `specs/README.md` 过期。

章节名是固定的（脚本按它匹配）。要换语言或改章节，同步改 `scripts/spec-check.mjs`。

## 什么时候不写新规格

- 错别字、依赖升级、纯样式微调且不改变行为：在现有规格的 `tasks.md` 追加一条即可。
- 只改文档，或改 `docs/` 与 `scripts/spec-*.mjs` 这套文档工具本身：不需要规格。

其余情况——新增或改变用户可见行为、改 slot / Config / 存储格式、跨包改动——一律先写规格。

其余情况——新增或改变用户可见行为、改 slot / Config / 存储格式、跨包改动——一律先写规格。
