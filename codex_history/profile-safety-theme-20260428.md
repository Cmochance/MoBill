# 我的页安全确认与主题设置

## 目标

- 将“清除所有数据”改为两次确认，并在两步中明确警告这是高危且不可恢复的操作。
- 将“主题设置”从禁用入口改为可用功能，提供 5 套符合现有国风视觉的配色方案。
- 主题选择需要持久保存，并在应用启动后自动应用。

## 当前状态

- 2026-04-28：已完成主题设置与清除数据二次确认，并刷新本地静态预览。

## 计划清单

1. [x] 新增主题配置与全局主题应用函数。
2. [x] 在应用启动时读取并应用主题，在“我的”页提供 5 套主题选择。
3. [x] 将“清除所有数据”改为两次确认并强化警告文案。
4. [x] 运行类型检查、重点 lint、构建并刷新本地静态预览。

## 执行记录

- 新增 `src/lib/themes.ts`，提供“墨风、松烟、朱砂、雨瓷、玄青”五套配色和 `applyTheme()`。
- `src/app/page.tsx` 在存储初始化后读取 `settings.themeId` 并应用主题；底部导航与本地冲突弹窗的关键色改为主题变量。
- `src/components/profile/ThemeSettingsView.tsx` 新增主题选择页面；`ProfileView` 的“主题设置”入口已启用，选择后保存到 `settings.themeId` 并立即应用。
- `src/app/globals.css` 增加主题变量和现有常用 Tailwind 任意色/内联色的覆盖规则，减少硬编码配色残留。
- `ProfileView` 的清除数据流程改为两步确认，第二步才执行 `clearAllData()`。
- 已更新 `agent/technical-notes.md`，记录主题配置位置、持久化字段和全局应用方式。

## 验证结果

- `npm run typecheck` 通过。
- `npx eslint src/lib/themes.ts src/app/page.tsx src/components/ProfileView.tsx src/components/profile/ThemeSettingsView.tsx src/components/AddExpenseView.tsx src/components/HomeView.tsx src/components/StatsView.tsx` 通过，仅保留既有 `<img>` 性能警告。
- `npm run build` 通过，静态导出已刷新。
- `git diff --check` 通过。
- `curl -I http://127.0.0.1:3000/` 返回 200。

## 剩余工作

- 无。
