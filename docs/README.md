# 文档

本目录是项目的规格与事实来源。方法见 [`spec-workflow.md`](spec-workflow.md)，规则与索引见 [`spec/README.md`](spec/README.md)。

## 目录

| 路径 | 作用 |
|---|---|
| `spec-workflow.md` | Spec-to-Delivery 方法：分诊、七件套、G1–G6、回写规则 |
| `spec/` | 每份需求一个 `spec-NNNN-<slug>/` 目录，索引由脚本生成 |
| `reference/` | 带时效的稳定事实（宿主契约、环境、命令） |
| `decisions/` | ADR：编号、状态、取代关系 |
| `plugins/` | 已交付插件的实现说明（面向维护者） |
| `development.md` | 目录结构、热更新、插件实现入口 |
| `_templates/` | 模板，只在根级维护一份 |

发布记录放 `release/<version>.md`，环境事实放 `deploy/`；两者故意不写进 spec。

## 当前状态

- 已迁移 4 份规格（0001–0004），均为 S 级，状态 `released`，见 [`spec/README.md`](spec/README.md)。
- 这些规格是交付后补录的；G5 已于 2026-11-13 由用户明确认可「全部 spec 验收通过」，G2 仍为补录记录。新需求按 `spec-workflow.md` 的门禁从 G1 开始。
- 已知未实机验证的项记录在各 spec 的 `05-acceptance.md`。
