import type { AirQualityQualityPayload } from "../../types/chart";

// 空气质量质量摘要柱图配置
export function airQualityQualityBarOption(payload?: AirQualityQualityPayload) {
    const labels = ["总行数", "无效月份", "累计超31", "缺失超标"];
    const values = [
        payload?.rows ?? 0,
        payload?.invalid_month_rows ?? 0,
        payload?.total_gt_31_rows ?? 0,
        payload?.missing_exceed_rows ?? 0,
    ];

    return {
        tooltip: { trigger: "axis" },
        grid: { left: 44, right: 22, top: 26, bottom: 40 },
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
                type: "bar",
                data: values,
                barWidth: 26,
                itemStyle: { borderRadius: [4, 4, 0, 0] },
            },
        ],
        color: ["#5fa5ff"],
    };
}
