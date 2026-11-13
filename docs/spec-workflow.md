# Spec-to-Delivery 工作流

本仓库用 Spec-to-Delivery（S2D）管理需求：先确认范围与尺寸，再依次过需求、决策、实现、验收、上线门禁；每份 spec 是七个文件组成的目录，状态与证据都写在里面。

方法来源：本机 `~/.agents/skills/spec-to-delivery`，项目内副本在 `.agents/skills/spec-to-delivery/`。

## 1. 分诊 S/M/L

尺寸不是工时，是治理深度：

| 维度 | S | M | L |
|---|---|---|---|
| 行为 | 内部细节，无公开契约 | 单服务内新增行为 | 公开 API / 协议 / 权限 / 跨系统 |
| 数据 | 无 DB 变化 | 小 DML | DDL、迁移、回填、删数据 |
| 影响 | 1 个模块 | 1 个服务 + 少量消费方 | 多服务 / 多环境 / 多团队 |
| 决策 | 无新决策 | 1–2 个局部取舍 | 架构 / 安全 / 合规 / 供应商 |
| 可逆 | 直接 revert | 可回滚 / 开关 | 数据迁移 / 不可逆 |
| 验证 | 单测 / 局部回归 | 集成 + 验收 | E2E + 性能 / 安全 + 回滚演练 |

任一条命中就按 L：DDL / 迁移、公开契约、认证权限、跨服务、新依赖 / 基础设施、回滚需数据修复、安全合规、方案高度不确定。拿不准往上取。

## 2. 开 spec

1. 从 [`_templates/spec/`](_templates/spec/README.md) 复制到 `docs/spec/spec-000N-<slug>/`。
2. 改 `README.md` front matter：`id`（`spec-000N`）、`slug`、`title`、`size`、`size_reason`、`status: draft`、`release`、`owner`。
3. 七件套齐全：`README.md`、`01-requirement.md`、`02-plan.md`、`03-decision.md`、`04-task.md`、`05-acceptance.md`、`06-release.md`。
4. 运行 `npm run docs:index` 更新 [`spec/README.md`](spec/README.md) 的索引块。
5. 有 SQL 才建 `sql/`，不要按数据库版本建目录。

S 可以写得短，但验收不能省；M/L 不能省决策与上线方案。

## 3. 门禁

状态：`draft → G1 → G2 → G3 → G4 → G5 → G6 → released`。

| 级别 | 必须人工批准 | Agent 自检并推进 |
|---|---|---|
| S | G2、G5 | G1、G3、G4、G6 |
| M | G2、G3、G5 | G1、G4、G6 |
| L | G2、G3、G5、G6 | G1、G4 |

- Agent 可以起草、填证据、勾任务，但不能自批人工门禁。
- G1/G4 不由人批，但必须在 `README.md` 的 Gate log 写下日期、结论、证据。
- S 的 G3/G6 写 N/A。
- `released` 由对应级别最后一个人工门禁确认。

**补录说明**：本仓库 0001–0004 是交付后按 S2D 补录的。G5 已于 2026-11-13 由用户明确认可「全部 spec 验收通过」；G2 仍为补录记录。新需求从 G1 开始正常走门禁。

## 4. 验收后回写

同一轮内完成：

1. `05-acceptance.md` 补证据与结论；
2. `04-task.md` 勾完成项；
3. `README.md` 更新 `status` 与 Gate log；
4. 行为 / 决策 / 配置 / 部署变了，回写 01/02/03/06；
5. 清理过期测试数、已解决的待决问题、旧结论。

未完成不得给最终答复或推进 status。

## 5. Reference 时效

`docs/reference/` 下的每份文档必须有：

```yaml
owner: "@sutpc"
last_verified: 2026-11-13
review_interval_days: 90
source:
  - "来源路径或链接"
```

`last_verified` 是人工核对日期，不是文件修改时间。超过间隔未核对就是过期，必须重新验证或标记 archived。

## 6. 发布与部署分开

- `06-release.md`：本 spec 的上线增量、验证、回滚。
- `docs/release/<version>.md`：版本级发布顺序与签字。
- `docs/deploy/`：主机、端口、目录、启动脚本等环境事实。
- 不把生产 IP / 路径 / 凭据写进 spec 或 reference；spec 只链接部署清单。

## 7. 命令

```powershell
npm run docs:index    # 从各 spec 的 front matter 重建 docs/spec/README.md 的索引块
npm run docs:check    # 结构、front matter、reference 时效、ADR、相对链接
npm run check         # 各插件入口的 JS 语法
```

也可以直接调用项目内副本：

```powershell
python .agents/skills/spec-to-delivery/scripts/check_docs.py --root . --check-links
python .agents/skills/spec-to-delivery/scripts/gen_spec_index.py --root .
python .agents/skills/spec-to-delivery/scripts/gen_spec_index.py --root . --check
```
