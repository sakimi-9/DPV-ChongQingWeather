import type { AirQualityTimelinePayload } from "../../types/chart";
import { takeTail } from "./shared";

// 空气质量时间序列+累计曲线图配置
export function airQualityTimelineOption(payload?: AirQualityTimelinePayload) {
    const xAxis = takeTail(payload?.xAxis ?? [], 24);
    const goodDays = takeTail(payload?.series?.good_days ?? [], 24);
    const goodCum = takeTail(payload?.series?.good_days_cum ?? [], 24);

    return {
        tooltip: { trigger: "axis" },
        legend: {
            top: 8,
            textStyle: { color: "#9fc2ff" },
            data: ["优天数", "优天数累计"],
        },
        grid: { left: 44, right: 24, top: 54, bottom: 58 },
        xAxis: {
            type: "category",
            data: xAxis,
            axisLabel: { color: "#8db5f3", rotate: 20 },
            axisLine: { lineStyle: { color: "#2b4a7b" } },
        },
        yAxis: [
            {
                type: "value",
                name: "月度",
                nameTextStyle: { color: "#ffffff" },
                axisLabel: { color: "#8db5f3" },
                splitLine: { lineStyle: { color: "rgba(90, 130, 190, 0.2)" } },
            },
            {
                type: "value",
                name: "累计",
                nameTextStyle: { color: "#ffffff" },
                axisLabel: { color: "#8db5f3" },
                splitLine: { show: false },
            },
        ],
        series: [
            {
                name: "优天数",
                type: "bar",
                barWidth: 14,
                data: goodDays,
            },
            {
                name: "优天数累计",
                type: "line",
                yAxisIndex: 1,
                smooth: true,
                data: goodCum,
            },
        ],
        color: ["#5ca9ff", "#57e1ff"],
    };
}
