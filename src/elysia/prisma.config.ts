import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma CLI 配置：统一从 .env 读取数据库连接
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});
