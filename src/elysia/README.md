# DPV-CQW Elysia 后端说明

## 目录结构
- `prisma/schema.prisma`：Prisma 数据模型（图表数据主表 + 导入日志表）
- `prisma.config.ts`：Prisma CLI 配置（读取 `.env` 中 `DATABASE_URL`）
- `src/scripts/import_processed_data.ts`：导入 `src/python/data_processed` 的 JSON 到 MySQL
- `src/scripts/check_processed_tables.ts`：检查数据库导入结果
- `src/dto/chart.dto.ts`：图表接口 DTO
- `src/routes/charts.ts`：图表数据路由

## 快速开始
```powershell
bun install
bun run prisma:generate
bun run prisma:push
bun run import:processed
bun run check:db
bun run dev
```

## API 路由
- `GET /health`：服务健康检查
- `GET /api/charts/datasets?keyword=&limit=&offset=`：数据集列表
- `GET /api/charts/datasets/:datasetKey`：单个数据集详情
- `POST /api/charts/datasets/query`：批量查询数据集

## 数据来源
- 导入目录：`../python/data_processed`
- 排除文件：`processing_report.json`
- 数据库：`.env` 中 `DATABASE_URL` 指向 `dpv-cqw`
