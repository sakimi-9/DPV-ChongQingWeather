// 图表数据通用类型定义
export interface ProcessedChartDataset {
    datasetKey: string;
    sourceFile: string;
    payloadType: "object" | "array" | string;
    itemCount: number;
    updatedAt: string;
    payload: unknown;
}

// 批量查询响应类型
export interface BatchChartResponse {
    success: boolean;
    data: {
        items: Record<string, ProcessedChartDataset>;
        hitCount: number;
        requestCount: number;
    };
}

// 单个图表响应类型
export interface SingleChartResponse {
    success: boolean;
    data: ProcessedChartDataset;
}

// 年度趋势 payload
export interface YearlyTrendsPayload {
    xAxis: string[];
    series: {
        avg_temp: Array<number | null>;
        rainfall: Array<number | null>;
        humidity: Array<number | null>;
        pressure: Array<number | null>;
    };
}

// 空气质量月度 payload
export interface AirQualityMonthlyPayload {
    xAxis: number[];
    series: {
        good_days: number[];
        moderate_days: number[];
        exceed_days: number[];
        good_rate: number[];
    };
}

// 事件标签 payload
export interface ForecastEventTagsPayload {
    items: Array<{
        tag: string;
        count: number;
    }>;
}

// 年度极值 payload
export interface YearlyExtremesPayload {
    items: Array<{
        metric: string;
        max_year: number;
        max_value: number;
        min_year: number;
        min_value: number;
    }>;
}

// 相关性矩阵 payload
export interface CorrelationMatrixPayload {
    metrics: string[];
    matrix: number[][];
}

// 空气质量时间序列 payload
export interface AirQualityTimelinePayload {
    xAxis: string[];
    series: {
        good_days: number[];
        moderate_days: number[];
        exceed_days: number[];
        good_days_cum: number[];
        moderate_days_cum: number[];
        exceed_days_cum: number[];
    };
}

// 空气质量质量摘要 payload
export interface AirQualityQualityPayload {
    rows: number;
    invalid_month_rows: number;
    total_gt_31_rows: number;
    missing_exceed_rows: number;
}

// 延伸期预报时间线 payload
export interface ForecastTimelinePayload {
    xAxis: string[];
    series: {
        temp_min: number[];
        temp_max: number[];
        temp_avg: number[];
        rain_min_mm: number[];
        rain_max_mm: number[];
        rain_avg_mm: number[];
    };
}

// 网格指标统计 payload
export interface GridMetricStatsPayload {
    items: Array<{
        metric: string;
        count: number;
        mean: number;
        min: number;
        max: number;
        std: number;
    }>;
}

// 网格指标趋势 payload
export interface GridMetricTrendsPayload {
    xAxis: string[];
    series: Record<string, number[]>;
}

// 网格站点概览 payload
export interface GridStationOverviewPayload {
    items: Array<{
        sp_id: number;
        records: number;
    }>;
}
