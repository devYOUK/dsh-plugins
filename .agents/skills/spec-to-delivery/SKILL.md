---
name: spec-to-delivery
description: 按 Spec-to-Delivery（S2D，规格到交付）维护 docs：判断 S/M/L、创建/推进 spec、执行 G1–G6 门禁、验收后回写、维护 Reference 时效、区分发布与部署事实。用户要求开 spec、补需求/决策/验收/上线方案、检查 docs 一致性或 reference 是否过期时使用。
whenToUse: 用户提出一个需求需要判断规模并落 spec，或要求检查/更新现有 spec、验收记录、发布方案、部署清单、Reference 时效时。
---

# Spec-to-Delivery 文档工作流

## 先定位

- 项目根：当前 Git 仓库根目录。
- 文档目录：默认 `docs/`；其他项目可用 `--docs` 指定。
- 方法文档：`docs/spec-workflow.md`；以仓库 `AGENTS.md` 指向的为准。
- 规则：`AGENTS.md` 和 `docs/spec/README.md`。

不要凭记忆猜业务规则。spec 与代码冲突时，先停下来问。

## 1. 先分诊 S/M/L

size 不是工时，是治理深度。按下面维度判断：

| 维度 | S | M | L |
|---|---|---|---|
| 行为 | 内部细节，无公开契约 | 单服务内新增行为 | 公开 API/协议/权限/跨系统 |
| 数据 | 无 DB 变化 | 小 DML | DDL、迁移、回填、删数据 |
| 影响 | 1 个模块 | 1 个服务 + 少量消费方 | 多服务/多环境/多团队 |
| 决策 | 无新决策 | 1–2 个局部取舍 | 架构/安全/合规/供应商 |
| 可逆 | 直接 revert | 可回滚/开关 | 数据迁移/不可逆 |
| 验证 | 单测/局部回归 | 集成 + 验收 | E2E + 性能/安全 + 回滚演练 |

任意一条命中就按 L：DDL/迁移、公开契约、认证权限、跨服务、新依赖/基础设施、回滚需数据修复、安全合规、方案高度不确定。

拿不准就往上取。G1 先给 provisional size，G2/G3 有新信息再升级，并在 Gate log 记录原因。

## 2. 开 spec

1. 从 `docs/_templates/spec/` 复制到 `docs/spec/spec-000N-<slug>/`。
2. 改 front matter：`id` 与目录前缀一致，`slug` 与后缀一致，`size` 填 S/M/L，`size_reason` 写清为什么是这个级别，`status: draft`。
3. 六个文件都要有：`README.md`、`01-requirement.md`、`02-plan.md`、`03-decision.md`、`04-task.md`、`05-acceptance.md`、`06-release.md`。
4. 运行 `gen_spec_index.py` 更新 `docs/spec/README.md` 索引；没有脚本时手工加一行。
5. 有 SQL 才建 `sql/`，不要放 `db/<version>/`。

S 可以内容短，但不要为了省事跳过验收；M/L 不要省决策和上线方案。

## 3. 门禁

状态：`draft → G1 → G2 → G3 → G4 → G5 → G6 → released`。

| 级别 | 必须人工批准 | Agent 自检并推进 |
|---|---|---|
| S | G2、G5 | G1、G3、G4、G6 |
| M | G2、G3、G5 | G1、G4、G6 |
| L | G2、G3、G5、G6 | G1、G4 |

- Agent 可以起草、填证据、勾任务，但不能自批人工门禁。
- G1/G4 不由人批，但必须写自检证据；S 的 G3/G6 写 N/A。
- `released` 由对应级别最后一个人工门禁确认（S=G5；M=G5 人工 + G6 自检；L=G6）。
- 每个 Gate 必须在 `README.md` 的 Gate log 里有日期、结论、审批、证据。
- G1 范围、G2 需求、G3 决策、G4 任务、G5 验收、G6 上线。

## 4. 验收后必须回写

跑完测试/真实请求后，同一轮完成：

1. `05-acceptance.md` 补证据和结论；
2. `04-task.md` 勾完成项；
3. `README.md` 更新 `status` 和 Gate log；
4. 行为/决策/配置/部署变了，回写 `01`/`02`/`03`/`06`；
5. 清理过期测试数、已解决的待决问题、旧结论。

未完成不得给最终答复或推进 status。

## 5. Reference 时效

每份 reference 必须有：

```yaml
owner: "@待定"
last_verified: 2026-11-05
review_interval_days: 90
source:
  - "来源"
```

`last_verified` 是人工核对日期，不是文件修改时间。超过间隔未核对就是过期，必须重新验证或标记 archived。

## 6. 发布与部署分开

- `06-release.md`：本 spec 的上线增量、验证、回滚。
- `docs/release/<version>.md`：版本级发布顺序和签字。
- `docs/deploy/`：主机、端口、目录、启动脚本等环境事实。
- 不把生产 IP/路径写进 spec；spec 只链接部署清单。

## 7. 检查脚本

项目级安装（目标仓库 `.agents/skills/spec-to-delivery/`）：

```bash
python .agents/skills/spec-to-delivery/scripts/check_docs.py --root .
python .agents/skills/spec-to-delivery/scripts/check_docs.py --root . --check-links
python .agents/skills/spec-to-delivery/scripts/gen_spec_index.py --root .
python .agents/skills/spec-to-delivery/scripts/gen_spec_index.py --root . --check
```

用户级安装：

```bash
python ~/.agents/skills/spec-to-delivery/scripts/check_docs.py --root .
python ~/.agents/skills/spec-to-delivery/scripts/check_docs.py --root . --check-links
python ~/.agents/skills/spec-to-delivery/scripts/gen_spec_index.py --root .
python ~/.agents/skills/spec-to-delivery/scripts/gen_spec_index.py --root . --check
```

- `check_docs.py` 检查 spec 目录/七件套/front matter/status/size、reference 时效、ADR 编号与取代关系、相对链接。
- `gen_spec_index.py` 从各 spec 的 front matter 生成 `docs/spec/README.md` 的索引块（`<!-- spec-index:start -->` 到 `<!-- spec-index:end -->`），`--check` 只判断是否过期。

移植：

- 项目级：复制到目标仓库的 `.agents/skills/spec-to-delivery/`。
- 用户级：复制到 `~/.agents/skills/spec-to-delivery/`，所有项目可用。
- 文档目录不叫 `docs` 时，加 `--docs <目录>`。

## 8. 不要做

- 不把环境地址/密码/token 写进 spec 或 reference。
- 不复制多套模板到每个子目录；模板只在 `docs/_templates/`。
- 不手工维护看板；用 `gen_spec_index.py` 从 spec 的 front matter 生成。
- 不声称“测试通过”而没有命令输出或请求证据。
- 不为了走流程把一个 S 写成 L，也不为了省事把 L 降成 S。
