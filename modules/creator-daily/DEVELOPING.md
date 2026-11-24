# @dsh-workbench/module-creator-daily · 作者文档

终端用户看 [README.md](README.md)；这份讲文件怎么分层、为什么 0.1.0 没有数据。

## 分层

| 文件 | 负责 |
|---|---|
| `src/host.ts` | 宿主半侧：把模块注册进外壳的 `workbenchUnits` |
| `src/client.tsx` | 浏览器半侧：把卡片注册进外壳；标题与顺序来自 `package.json` 的 `dsh.workbench` |
| `src/messages.ts` | 卡片文案（中文 / 英文） |
| `scripts/smoke.mjs` | 装配自检：`client.js` 调用加载器、宿主注册模块、缺少服务时报错 |

## 为什么 0.1.0 没有数据

数据来自浏览器里已登录的会话，读取与登录都依赖平台页面。先把「模块能被外壳装配、构建与自动检查能过」做对，
再在 0.2.0 加数据源声明与读工具；否则装配问题与登录问题会混在一起。

## 自动检查

```bash
pnpm -r build
pnpm -r check
pnpm -r typecheck
```
