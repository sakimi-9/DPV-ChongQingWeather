import type { ForecastTimelinePayload } from "../../types/chart";
import { normalizeForecastTimeline } from "./shared";

// 预报时间线双轴图配置
export function forecastTimelineOption(payload?: ForecastTimelinePayload) {
    const clean = normalizeForecastTimeline(payload);

    return {
        tooltip: { trigger: "axis" },
        legend: {
            top: 8,
            textStyle: { color: "#9fc2ff" },
            data: ["平均气温", "平均降水(mm)"],
        },
        grid: { left: 44, right: 24, top: 54, bottom: 56 },
        xAxis: {
            type: "category",
            data: clean.xAxis,
            axisLabel: { color: "#8db5f3", rotate: 20 },
            axisLine: { lineStyle: { color: "#2b4a7b" } },
        },
        yAxis: [
            {
                type: "value",
                name: "温度(℃)",
                nameTextStyle: { color: "#ffffff" },
                axisLabel: { color: "#8db5f3" },
                splitLine: { lineStyle: { color: "rgba(90, 130, 190, 0.2)" } },
            },
            {
                type: "value",
                name: "降水(mm)",
                nameTextStyle: { color: "#ffffff" },
                axisLabel: { color: "#8db5f3" },
                splitLine: { show: false },
            },
        ],
        series: [
            {
                name: "平均气温",
                type: "line",
                smooth: true,
                data: clean.temp_avg,
            },
            {
                name: "平均降水(mm)",
                type: "bar",
                yAxisIndex: 1,
                data: clean.rain_avg_mm,
                barWidth: 12,
            },
        ],
        color: ["#59d8ff", "#69b0ff"],
    };
}
