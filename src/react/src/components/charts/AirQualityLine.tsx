import type { AirQualityMonthlyPayload } from "../../types/chart";

// 空气质量趋势折线图配置
export function airQualityLineOption(payload?: AirQualityMonthlyPayload) {
    return {
        tooltip: { trigger: "axis" },
        legend: {
            top: 8,
            textStyle: { color: "#9fc2ff" },
            data: ["优", "良", "超标"],
        },
        grid: { left: 42, right: 24, top: 54, bottom: 56 },
        xAxis: {
            type: "category",
            data: payload?.xAxis ?? [],
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
                name: "优",
                type: "line",
                smooth: true,
                data: payload?.series?.good_days ?? [],
            },
            {
                name: "良",
                type: "line",
                smooth: true,
                data: payload?.series?.moderate_days ?? [],
            },
            {
                name: "超标",
                type: "line",
                smooth: true,
                data: payload?.series?.exceed_days ?? [],
            },
        ],
        color: ["#5ca9ff", "#65dbff", "#4ad6a4"],
    };
}
