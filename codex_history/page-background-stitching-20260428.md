# 页面背景拼接改造

## 目标

- 将五个底部导航页面使用的整张背景图改为三段式拼接。
- 顶部和底部带图案部分保持原样，不直接拉伸。
- 页面高度超出原图时，通过中间空白层重复或扩展，避免底部留白。
- 切出的运行时背景资源放在 `public/`，不直接引用 `docs/assets/`。

## 当前状态

- 2026-04-28：已完成。五个主视图共享的页面背景已改为 top / middle / bottom 三段拼接。

## 计划清单

1. [x] 定位现有背景图、页面背景 CSS 和主页面容器。
2. [x] 从现有背景图切出 top、middle、bottom 运行时资源。
3. [x] 新增页面背景拼接组件或等价全局实现，并接入五个主页面。
4. [x] 运行类型检查、目标 lint、构建和本地预览检查。

## 执行记录

- 当前背景来自 `public/bg.png`，原先由 `body` 使用 `background-repeat: no-repeat` 按宽度显示，移动端高度不足时会在底部露出纯底色。
- 已从 `public/bg.png` 切出 `public/bg_top.png`、`public/bg_middle.png`、`public/bg_bottom.png`。顶部保留山水，底部保留云纹，中段取空白纸纹区域。
- 已新增 `src/components/PageBackground.tsx`，使用和 `CardFrame` 相同的 top / repeat-y middle / bottom 三段结构。
- 已在 `src/app/page.tsx` 的顶层 `main` 中接入 `PageBackground`，五个主视图都会共享该背景。
- 已移除 `src/app/globals.css` 中 `body` 对整张 `bg.png` 的直接引用，避免旧背景和拼接背景叠加。
- 已更新 `agent/technical-notes.md`，记录页面背景三段拼接规则和运行时资源位置。

## 验证结果

- `npm run typecheck` 通过。
- `npx eslint src/app/page.tsx src/app/globals.css src/components/PageBackground.tsx src/components/CardFrame.tsx` 无错误；`globals.css` 因 ESLint 配置不匹配被忽略，`page.tsx` 保留既有 `<img>` 性能警告。
- `npm run build` 通过，静态输出已刷新。
- `git diff --check` 通过。
- `curl -I http://127.0.0.1:3000/` 返回 200。
- `rg` 确认构建产物包含 `bg_top`、`bg_middle`、`bg_bottom`，且源码中已无 `body` 对 `/bg.png` 的直接背景引用。

## 剩余工作

- 无。
