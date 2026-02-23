import type { YearlyExtremesPayload } from "../../types/chart";
import { toMetricLabel } from "./shared";

// 极值环形图配置
export function extremesDonutOption(payload?: YearlyExtremesPayload) {
    const data = (payload?.items ?? []).map((item) => ({
        name: toMetricLabel(item.metric),
        value: Math.abs(item.max_value - item.min_value),
    }));

    return {
        tooltip: { trigger: "item" },
        legend: {
            bottom: 8,
            textStyle: { color: "#9fc2ff" },
        },
        series: [
            {
                type: "pie",
                center: ["50%", "42%"],
                radius: ["42%", "68%"],
                label: { color: "#cde6ff" },
                data,
            },
        ],
        color: ["#5ca9ff", "#4fd6a8", "#7db5ff", "#66e0ff"],
    };
}
