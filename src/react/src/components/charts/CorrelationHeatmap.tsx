import type { CorrelationMatrixPayload } from "../../types/chart";
import { toMetricLabel } from "./shared";

// 相关性矩阵热力图配置
export function correlationHeatmapOption(payload?: CorrelationMatrixPayload) {
    const metrics = payload?.metrics ?? [];
    const metricLabels = metrics.map((metric) => toMetricLabel(metric));
    const matrix = payload?.matrix ?? [];
    const points: Array<[number, number, number]> = [];

    matrix.forEach((row, yIndex) => {
        row.forEach((value, xIndex) => {
            points.push([xIndex, yIndex, value]);
        });
    });

    return {
        tooltip: { position: "top" },
        grid: { left: 86, right: 24, top: 12, bottom: 98 },
        xAxis: {
            type: "category",
            data: metricLabels,
            splitArea: { show: true },
            axisLabel: { color: "#9ac2ff", rotate: 25 },
        },
        yAxis: {
            type: "category",
            data: metricLabels,
            splitArea: { show: true },
            axisLabel: { color: "#9ac2ff" },
        },
        visualMap: {
            min: -1,
            max: 1,
            calculable: true,
            orient: "horizontal",
            left: "center",
            bottom: 2,
            textStyle: { color: "#9ac2ff" },
            inRange: {
                color: ["#18345f", "#245293", "#2f8cff", "#63bdff"],
            },
        },
        series: [
            {
                type: "heatmap",
                data: points,
                label: { show: false },
            },
        ],
    };
}
