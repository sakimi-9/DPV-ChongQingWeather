import { http } from "./http";
import type { BatchChartResponse, ProcessedChartDataset } from "../types/chart";

// 固定需要渲染的大屏数据集列表
export const DASHBOARD_DATASETS = [
    "chart_yearly_trends",
    "chart_air_quality_monthly",
    "chart_air_quality_quality",
    "chart_air_quality_timeline",
    "chart_forecast_event_tags",
    "chart_forecast_timeline",
    "chart_yearly_extremes",
    "chart_correlation_matrix",
    "chart_grid_metric_stats",
    "chart_grid_metric_trends",
    "chart_grid_station_overview",
] as const;

// 批量查询图表数据
export async function fetchDashboardDatasets(): Promise<
    Record<string, ProcessedChartDataset>
> {
    const { data } = await http.post<BatchChartResponse>(
        "/api/charts/datasets/query",
        {
            datasetKeys: [...DASHBOARD_DATASETS],
        }
    );

    if (!data.success) {
        throw new Error("图表数据加载失败");
    }

    return data.data.items;
}
