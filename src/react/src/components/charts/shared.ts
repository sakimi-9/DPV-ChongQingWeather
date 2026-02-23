import type { ForecastTimelinePayload } from "../../types/chart";

// 指标字段中文映射：用于图例、坐标轴与提示文本统一中文展示
const METRIC_NAME_MAP: Record<string, string> = {
    pjqw: "平均气温",
    jsl: "降水量",
    rzss: "日照时数",
    pjxdsd: "平均相对湿度",
    pjqy: "平均气压",
    pjfs: "平均风速",
    wsq: "无霜期",
};

export function toMetricLabel(metric: string): string {
    return METRIC_NAME_MAP[metric] ?? metric;
}

// 按尾部窗口截取序列，避免点位过密
export function takeTail<T>(values: T[], size: number): T[] {
    if (values.length <= size) return values;
    return values.slice(values.length - size);
}

// 预报时间轴清洗：过滤空日期并同步过滤序列
export function normalizeForecastTimeline(payload?: ForecastTimelinePayload) {
    const xAxis = payload?.xAxis ?? [];
    const keepIndexes = xAxis
        .map((label, index) => ({ label: label.trim(), index }))
        .filter((item) => item.label.length > 0);

    const cleanXAxis = keepIndexes.map((item) => item.label);
    const getSeries = (values: number[] | undefined) =>
        keepIndexes.map((item) => values?.[item.index] ?? null);

    return {
        xAxis: cleanXAxis,
        temp_avg: getSeries(payload?.series?.temp_avg),
        rain_avg_mm: getSeries(payload?.series?.rain_avg_mm),
    };
}
