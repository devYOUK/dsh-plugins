---
id: spec-0002
updated: 2026-11-13
---

# 上线

## 上线增量

- 「过程」开启时折叠过程正文参与搜索，命中自动展开。
- 删除 `searchFoldedProcess` 配置字段与配置页开关。

## 验证

- 配置页只剩三个字段。
- 折叠一个含关键词的过程分组，搜索能命中并自动展开。

## 回滚

- 关掉「过程」开关即回到 0001 的折叠排除行为。
- 需要彻底回退时卸载/关闭 `@local/dsh-chat-search`。
- 旧配置里的 `searchFoldedProcess` 已从 profile patch 清理。

## 发布与部署

- 版本：0.1.0，本地 profile 链接安装。
- 部署事实见 `docs/deploy/`。
