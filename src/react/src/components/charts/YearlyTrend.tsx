import type { YearlyTrendsPayload } from "../../types/chart";

// 年度气象趋势面积图配置
export function yearlyTrendOption(payload?: YearlyTrendsPayload) {
    return {
        tooltip: { trigger: "axis" },
        legend: {
            top: 8,
            textStyle: { color: "#9fc2ff" },
            data: ["平均气温", "湿度"],
        },
        grid: { left: 44, right: 24, top: 52, bottom: 56 },
        xAxis: {
            type: "category",
            data: payload?.xAxis ?? [],
            axisLabel: { color: "#8db5f3", interval: 2 },
            axisLine: { lineStyle: { color: "#2b4a7b" } },
        },
        yAxis: {
            type: "value",
            axisLabel: { color: "#8db5f3" },
            splitLine: { lineStyle: { color: "rgba(90, 130, 190, 0.2)" } },
        },
        series: [
            {
                name: "平均气温",
                type: "line",
                smooth: true,
                areaStyle: { opacity: 0.2 },
                data: payload?.series?.avg_temp ?? [],
            },
            {
                name: "湿度",
                type: "line",
                smooth: true,
                areaStyle: { opacity: 0.2 },
                data: payload?.series?.humidity ?? [],
            },
        ],
        color: ["#63abff", "#59dfcf"],
    };
}
