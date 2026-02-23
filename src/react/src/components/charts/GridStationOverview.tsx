import type { GridStationOverviewPayload } from "../../types/chart";

// 网格站点记录概览图配置
export function gridStationOverviewOption(payload?: GridStationOverviewPayload) {
    const items = payload?.items ?? [];

    return {
        tooltip: { trigger: "axis" },
        grid: { left: 44, right: 22, top: 26, bottom: 40 },
        xAxis: {
            type: "category",
            data: items.map((item) => String(item.sp_id)),
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
                data: items.map((item) => item.records),
                barWidth: 28,
                itemStyle: {
                    borderRadius: [4, 4, 0, 0],
                },
            },
        ],
        color: ["#65b1ff"],
    };
}
