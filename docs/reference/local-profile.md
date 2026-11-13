---
owner: "@sutpc"
last_verified: 2026-11-13
review_interval_days: 90
source:
  - "dsh plugin --profile desktop add <path>"
  - "C:/Users/sutpc/.dsh/profiles/desktop/package.json"
  - "C:/Users/sutpc/.dsh/profiles/desktop/cordis.patch.yml"
---

# 本地 profile 与安装事实

## Profile

- 名称：`desktop`（`$env:DSH_PROFILE`）。
- 目录：`C:/Users/sutpc/.dsh/profiles/desktop`。
- 本仓库的包通过 pnpm `link:` 指到 `C:/Workspace/dsh-plugins/packages/<name>`。

## 安装与卸载

```powershell
dsh plugin --profile desktop add C:\Workspace\dsh-plugins\packages\<name>
dsh plugin --profile desktop remove @local/<包名>
```

也可以走插件页：**添加插件 → 安装第三方插件 → 绝对路径 → 安装 → 立即启用**。

## 配置与存储

- 插件设置写在 `cordis.patch.yml` 的 `- id: <rowId>` 段。
- 浏览器本地数据：
  - `dsh-chat-search:history`：搜索历史。
  - `dsh-workspace-menu:favorites`：收藏的工作区 id。
- 浏览器来源隔离：DSH 以不同端口启动时，localStorage 不共享。

## 校验

```powershell
npm run check
npm run docs:check
```
