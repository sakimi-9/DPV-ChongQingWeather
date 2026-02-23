import type { ForecastEventTagsPayload } from "../../types/chart";

// 天气事件饼图配置
export function eventTagPieOption(payload?: ForecastEventTagsPayload) {
    const data = (payload?.items ?? []).map((item) => ({
        name: item.tag,
        value: item.count,
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
                radius: ["35%", "65%"],
                itemStyle: {
                    borderColor: "#07182f",
                    borderWidth: 2,
                },
                label: { color: "#d5e9ff" },
                data,
            },
        ],
        color: ["#5ca9ff", "#57d0ff", "#4ddfa8", "#9f8cff", "#5c80ff", "#5ee2ff"],
    };
}
