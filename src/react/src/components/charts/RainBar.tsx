import type { YearlyTrendsPayload } from "../../types/chart";

// 年度降水柱状图配置
export function rainBarOption(payload?: YearlyTrendsPayload) {
    const years = payload?.xAxis ?? [];
    const rain = payload?.series?.rainfall ?? [];
    const start = Math.max(years.length - 12, 0);

    return {
        tooltip: { trigger: "axis" },
        grid: { left: 44, right: 24, top: 32, bottom: 52 },
        xAxis: {
            type: "category",
            data: years.slice(start),
            axisLabel: { color: "#8db5f3", interval: 0, rotate: 30 },
            axisLine: { lineStyle: { color: "#2b4a7b" } },
        },
        yAxis: {
            type: "value",
            axisLabel: { color: "#8db5f3" },
            splitLine: { lineStyle: { color: "rgba(90, 130, 190, 0.2)" } },
        },
        series: [
            {
                name: "降水量",
                type: "bar",
                barWidth: 18,
                data: rain.slice(start),
                itemStyle: {
                    borderRadius: [4, 4, 0, 0],
                },
            },
        ],
        color: ["#5f95ff"],
    };
}
