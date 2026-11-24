# @dsh-workbench/module-creator-daily · 作者文档

终端用户看 [README.md](README.md)；这份讲分层、数据来源与检查。

## 分层

| 文件 | 负责 |
|---|---|
| `src/host.ts` | 注册模块的面：路由、工具、审批与事实失效 |
| `src/host/readers.ts` | 调 opencli 读三个热榜与小红书创作者数据 |
| `src/host/routes.ts` | `creator-daily/overview`：一次返回选题、指标与最近笔记 |
| `src/host/tools.ts` | 三个 agent 工具；写工具只存草稿 |
| `src/host/approval.ts` | 存草稿的审批问句与原因 |
| `src/model/*.ts` | 纯归一与校验（有同名测试） |
| `src/components/CreatorCard.tsx` | 卡片：三块内容与读失败提示 |
| `src/client.tsx` | 注册卡片与审批屏四行 |

## 数据来源

四个站点是 opencli 自带的站点，不单独安装；`package.json` 的 `dsh.workbench.needs` 声明一条 `bin: opencli`（opencli 由适配器提供），站点命令在运行时直接调用：

- `zhihu hot`、`weibo hot`、`bilibili hot`
- `xiaohongshu creator-stats`、`creator-notes`、`publish`

读取走 `extensionCallerOf`，写入走同一条通道；模块自己不保存凭据。

## 检查

```bash
pnpm -r build
pnpm -r check
pnpm -r typecheck
pnpm -r test
```
