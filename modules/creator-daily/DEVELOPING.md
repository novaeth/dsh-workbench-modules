# @dsh-workbench/module-creator-daily · 作者文档

终端用户看 [README.md](README.md)；这份讲文件怎么分层、为什么 v0.1 没有数据。

## 分层

| 文件 | 负责 |
|---|---|
| `src/host.ts` | 宿主半侧：把模块的面注册进外壳的 `workbenchUnits` |
| `src/client.tsx` | 浏览器半侧：把卡片注册进外壳，卡片的标题与顺序来自 `package.json` 的 `dsh.workbench` |
| `src/messages.ts` | 卡片文案（zh / en） |
| `scripts/smoke.mjs` | 接线自检：`client.js` 调用了加载器、宿主注册了单元、缺服务时报错 |

## 为什么 v0.1 没有数据

数据来自 opencli 官方适配器，全部需要浏览器登录态。先把「模块能被外壳装配、构建与门禁能过」这件事做对，
再在 v0.2 加 `needs`（`bin: opencli` + `extension: zhihu/weibo/bilibili/xiaohongshu`）与读工具；
否则一上来就写数据，会把装配问题与登录问题混在一起查。
