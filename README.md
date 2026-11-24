# dsh-workbench modules

工作台的**模块源码仓**：一个模块一个独立包，独立版本，构建产物发布到 [`dsh-workbench-market`](https://github.com/novaeth/dsh-workbench-market)。

产品本体（外壳、前端组件库、模块工具、最小示例）在 [`dsh-workbench`](https://github.com/novaeth/dsh-workbench)；这里只放模块。

## 为什么单独一个仓

- **版本独立**：产品仓库的自动检查 `check-release-packages` 要求 `packages/*` 的版本等于 core 的版本。模块要独立发版，放进产品仓就得跟着 core 一起发。
- **自动检查成本**：产品仓库的每条自动检查都会对 `packages/*` 全量运行构建、类型检查、测试、架构检查与模块检查；模块放进去会让每次提交与每次发布都变慢。
- **分工**：产品仓库是产品，[`dsh-workbench-market`](https://github.com/novaeth/dsh-workbench-market) 是分发（构建产物 + `market.json`），这里是源码。

## 模块

| 模块 | 角色 | 状态 |
|---|---|---|
| [`modules/creator-daily`](modules/creator-daily) | 内容创作者：今日选题、笔记数据与草稿 | 0.1.0 只有模块卡片；数据源与审批在 0.2.0 接入 |

## 开发

```bash
pnpm install
pnpm -r build       # 生成 dist/host.js 与 client.js
pnpm -r check       # 模块检查项（15 条）
pnpm -r typecheck
pnpm -r test
```

每个模块的清单在 `package.json` 的 `dsh.workbench`（apiVersion 3）；模块作者文档在各模块的 `DEVELOPING.md`。

## 发布

模块工具带发布流程：`dsh-wb-module release` 通过自动检查后，把构建产物与索引写入模块市场仓库。
本仓库只放源码与 CHANGELOG，不提交 `dist/` 与 `client.js`。

## 兼容性

`peerDependencies` 的 `@dsh-workbench/core` 下限与本仓 `devDependencies` 保持一致：模块只对验证过的那版工作台承诺。

## License

MIT
