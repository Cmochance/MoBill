# 分类管理功能

## 目标

- 移除“账单提醒”菜单项。
- 将“分类管理”从禁用入口改为可用功能。
- 分类管理页支持添加新支出分类，用户可填写分类名称，并从预设图标或上传图片中选择图标。
- 上传图片需要内置处理：不做非对称拉伸；统一处理为标准正方形 PNG；通过等比缩放和居中裁剪获得标准比例，并尽可能保留图片内容。
- 将项目中已有但未使用的图标补入运行时预设。

## 当前状态

- 2026-04-28：已完成。分类管理入口已启用，账单提醒入口已移除，新增分类支持预设图标和上传图标。

## 计划清单

1. [x] 补齐运行时预设图标资源，并建立分类图标预设列表。
2. [x] 新增上传图片处理模块，按标准比例处理自定义图标。
3. [x] 新增分类管理页面，支持预设选择、上传处理、名称输入和保存分类。
4. [x] 接入“我的”页菜单，移除账单提醒。
5. [x] 运行类型检查、重点 lint、构建并刷新本地静态预览。

## 执行记录

- 已将 `docs/assets/topic-2-2.png`、`docs/assets/topic-2-5.png` 补入 `public/`，并新增 `src/lib/category-icons.ts` 作为分类图标预设列表。
- 已新增 `src/lib/image-processing.ts`，上传图片会被等比裁剪为 256x256 PNG，避免非对称拉伸导致变形。
- 已新增 `src/components/profile/CategoryManagerView.tsx`，展示当前分类并支持新建分类、预设图标选择和上传图标。
- 已在 `ProfileView` 中启用“分类管理”入口，并移除“账单提醒”菜单项。
- 已更新 `agent/technical-notes.md`，记录分类管理、图标预设和上传图片处理规则。

## 验证结果

- `npm run typecheck` 通过。
- `npx eslint src/lib/category-icons.ts src/lib/image-processing.ts src/components/profile/CategoryManagerView.tsx src/components/ProfileView.tsx src/lib/data.ts src/components/add-expense/CategorySelector.tsx` 通过，保留既有 `<img>` 性能警告。
- `npm run build` 通过，并刷新静态输出。
- `git diff --check` 通过。
- `curl -I http://127.0.0.1:3000/` 返回 200。

## 剩余工作

- 无。
