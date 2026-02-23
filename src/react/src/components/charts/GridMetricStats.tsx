import type { GridMetricStatsPayload } from "../../types/chart";

// 网格指标统计图配置
export function gridMetricStatsOption(payload?: GridMetricStatsPayload) {
    const items = payload?.items ?? [];
    const labels = items.map((item) => item.metric);
    const meanValues = items.map((item) => item.mean);
    const maxValues = items.map((item) => item.max);

    return {
        tooltip: { trigger: "axis" },
        legend: {
            top: 8,
            textStyle: { color: "#9fc2ff" },
            data: ["均值", "最大值"],
        },
        grid: { left: 42, right: 24, top: 52, bottom: 54 },
        xAxis: {
            type: "category",
            data: labels,
            axisLabel: { color: "#8db5f3" },
            axisLine: { lineStyle: { color: "#2b4a7b" } },
        },
        yAxis: {
            type: "value",
            axisLabel: { color: "#8db5f3" },
            splitLine: { lineStyle: { color: "rgba(90, 130, 190, 0.2)" } },
        },
        series: [
            {
                name: "均值",
                type: "bar",
                barWidth: 18,
                data: meanValues,
            },
            {
                name: "最大值",
                type: "line",
                smooth: true,
                data: maxValues,
            },
        ],
        color: ["#57c8ff", "#5e8dff"],
    };
}
