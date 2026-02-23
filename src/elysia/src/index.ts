import { Elysia } from "elysia";
import { chartsRoutes } from "./routes/charts";

//设置全局 CORS跨域，允许来自 http://localhost:5173 的请求，并支持常见的 HTTP 方法和头部，
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const app = new Elysia()
  // 全局简单 CORS 中间件：使用 onRequest 正确设置响应头（修复 plugin 签名问题）
  .onRequest(({ set }) => {
    // 将 CORS 头合并到当前响应头中
    set.headers = Object.assign({}, (set.headers as Record<string, string> | undefined) || {}, CORS_HEADERS) as any;
  })
  // 处理预检请求（OPTIONS）返回 204
  .options("/*", ({ set }) => {
    set.status = 204;
    set.headers = CORS_HEADERS as any;
    return "";
  })
  // 健康检查
  .get("/", () => "DPV-CQW Elysia API is running")
  .get("/health", () => ({ success: true, service: "dpv-cqw-elysia" }))
  // 图表数据路由
  .use(chartsRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
