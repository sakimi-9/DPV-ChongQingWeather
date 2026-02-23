import axios from "axios";

// API 基础实例：默认连接 Elysia 本地服务
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:3000",
    timeout: 15000,
});

// 扩展 Axios 配置：用于记录请求耗时和日志追踪 ID
declare module "axios" {
    interface InternalAxiosRequestConfig {
        metadata?: {
            startAt: number;
            requestId: string;
        };
    }
}

// 结构化输出请求体：便于在浏览器控制台排查请求参数
http.interceptors.request.use((config) => {
    const requestId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    config.metadata = {
        startAt: Date.now(),
        requestId,
    };

    console.info("[API][REQUEST]", {
        requestId,
        method: (config.method ?? "GET").toUpperCase(),
        url: `${config.baseURL ?? ""}${config.url ?? ""}`,
        params: config.params ?? null,
        body: config.data ?? null,
    });

    return config;
});

// 结构化输出响应体：包含状态码、耗时和响应数据
http.interceptors.response.use(
    (response) => {
        const startAt = response.config.metadata?.startAt ?? Date.now();
        const requestId = response.config.metadata?.requestId ?? "unknown";

        console.info("[API][RESPONSE]", {
            requestId,
            status: response.status,
            durationMs: Date.now() - startAt,
            method: (response.config.method ?? "GET").toUpperCase(),
            url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
            body: response.data ?? null,
        });

        return response;
    },
    (error) => {
        const startAt = error?.config?.metadata?.startAt ?? Date.now();
        const requestId = error?.config?.metadata?.requestId ?? "unknown";

        console.error("[API][ERROR]", {
            requestId,
            status: error?.response?.status ?? 0,
            durationMs: Date.now() - startAt,
            method: (error?.config?.method ?? "GET").toUpperCase(),
            url: `${error?.config?.baseURL ?? ""}${error?.config?.url ?? ""}`,
            requestBody: error?.config?.data ?? null,
            responseBody: error?.response?.data ?? null,
            message: error?.message ?? "请求失败",
        });

        const message =
            error?.response?.data?.message ?? error?.message ?? "请求失败";
        return Promise.reject(new Error(message));
    }
);
