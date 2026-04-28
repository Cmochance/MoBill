# 本地备份恢复逻辑调整

## 目标

移除旧的云盘同步开关和 24 小时 history 备份规则，改为统一的本机文件镜像机制：

- 保存应用数据时自动写入 `Documents/MoBill/data.json`。
- 应用启动时比较 `Documents/MoBill/data.json` 与应用内数据；一致则忽略，不一致则让用户选择导入文件数据或保留应用数据。
- 覆盖任一侧数据前，先把将被覆盖的一侧保存为 `Documents/MoBill/backup-YYYY-MM-DD-HHmmss.json`。
- 设置页手动备份和恢复复用同一方向性逻辑，不再使用下载或文件选择流程。
- 设置页菜单去掉多余的 `(JSON)` 字样。

## 当前状态

- 2026-04-28：已完成本地备份恢复逻辑调整，并刷新本地静态预览。

## 计划清单

1. [x] 重写 `src/lib/storage.ts` 的外部文件 API，移除云盘同步开关、history 目录和 24 小时规则。
2. [x] 修改 `src/app/page.tsx`，应用启动后在数据不一致时显示全屏确认弹窗，并根据用户选择执行覆盖方向。
3. [x] 修改 `src/components/ProfileView.tsx`，移除云盘同步卡片和文件选择导入，菜单改为“备份数据 / 恢复数据”。
4. [x] 运行类型检查、重点 lint、构建，并刷新本地静态预览。

## 执行记录

- 已完成存储层调整：`Documents/MoBill/data.json` 变为固定本机数据文件；保存数据后自动写入；手动备份、手动恢复和启动冲突处理均会在覆盖前写入 `Documents/MoBill/backup-YYYY-MM-DD-HHmmss.json`。
- 已完成入口页调整：`initStorage()` 返回冲突状态；检测到 `data.json` 与应用内数据不一致时显示全屏弹窗，用户可选择导入文件数据或保留应用数据。
- 已完成我的页调整：移除云盘同步开关和文件选择导入；菜单改为“备份数据”和“恢复数据”；本地备份卡片仅展示固定文件位置和覆盖前备份规则。
- 已更新 `agent/technical-notes.md`，记录当前本机备份恢复规则；旧优化计划也已补充第 3 项规则被新机制取代的说明。

## 验证结果

- `npm run typecheck` 通过。
- `npx eslint src/lib/storage.ts src/app/page.tsx src/components/ProfileView.tsx` 通过，仅保留既有 `<img>` 性能警告。
- `npm run build` 通过，静态导出已刷新。
- `git diff --check` 通过。
- `curl -I http://127.0.0.1:3000/` 返回 200。

## 剩余工作

- 无。
