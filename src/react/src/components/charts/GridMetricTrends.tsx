import type { GridMetricTrendsPayload } from "../../types/chart";
import { takeTail } from "./shared";

// 网格指标趋势图配置
export function gridMetricTrendsOption(payload?: GridMetricTrendsPayload) {
    const xAxis = takeTail(payload?.xAxis ?? [], 180);
    const entry = Object.entries(payload?.series ?? {})[0];
    const metricName = entry?.[0] ?? "metric";
    const metricValues = takeTail(entry?.[1] ?? [], 180);

    return {
        tooltip: { trigger: "axis" },
        legend: {
            top: 8,
            textStyle: { color: "#9fc2ff" },
            data: [metricName],
        },
        grid: { left: 44, right: 24, top: 52, bottom: 58 },
        xAxis: {
            type: "category",
            data: xAxis,
            axisLabel: { color: "#8db5f3", interval: 29 },
            axisLine: { lineStyle: { color: "#2b4a7b" } },
        },
        yAxis: {
            type: "value",
            axisLabel: { color: "#8db5f3" },
            splitLine: { lineStyle: { color: "rgba(90, 130, 190, 0.2)" } },
        },
        series: [
            {
                name: metricName,
                type: "line",
                smooth: true,
                showSymbol: false,
                areaStyle: { opacity: 0.12 },
                data: metricValues,
            },
        ],
        color: ["#5de0ff"],
    };
}
