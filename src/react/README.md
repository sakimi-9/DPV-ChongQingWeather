# DPV-CQW React 可视化大屏

本目录是 DPV-CQW 项目前端工程，基于 `Vite + React + TypeScript + ECharts`。

## 页面风格
- 数据来源为 Elysia 接口（非前端本地模拟）。

## 交互功能
- 每个图表容器右上角支持放大查看；
- 弹层支持左右切换，顺序与 `src/components/chartAnalysis.ts` 中 1-13 保持一致；
- 弹层下方展示对应图表的“数据分析”文本；
- 顶部“导出”按钮可导出 ZIP，包含 13 张 PNG 图片（上方图表、下方分析文本）。

## 运行步骤

```bash
bun install
bun run dev
```

默认访问：`http://localhost:5173`

## 环境变量
可在项目根创建 `.env`：

```bash
VITE_API_BASE_URL=http://127.0.0.1:3000
```

## 构建命令

```bash
bun run build
bun run dev
```

## 目录说明
- `src/api/http.ts`：Axios 请求实例与统一错误处理
- `src/api/charts.ts`：图表数据请求封装
- `src/types/chart.ts`：图表 DTO 类型定义
- `src/App.tsx`：可视化大屏主页面
