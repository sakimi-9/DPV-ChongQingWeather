import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import "./App.css";
import { fetchDashboardDatasets } from "./api/charts";
import { ChartModal, type ExpandableChart } from "./components/ChartModal";
import { Panel } from "./components/Panel";
import { CHART_ANALYSIS_ORDER, getChartAnalysisText } from "./components/chartAnalysis";
import { airQualityLineOption } from "./components/charts/AirQualityLine";
import { airQualityQualityBarOption } from "./components/charts/AirQualityQualityBar";
import { airQualityTimelineOption } from "./components/charts/AirQualityTimeline";
import { correlationHeatmapOption } from "./components/charts/CorrelationHeatmap";
import { eventTagPieOption } from "./components/charts/EventTagPie";
import { extremesDonutOption } from "./components/charts/ExtremesDonut";
import { forecastTimelineOption } from "./components/charts/ForecastTimeline";
import { gridMetricStatsOption } from "./components/charts/GridMetricStats";
import { gridMetricTrendsOption } from "./components/charts/GridMetricTrends";
import { gridStationOverviewOption } from "./components/charts/GridStationOverview";
import { kpiOverviewOption } from "./components/charts/KpiOverview";
import { rainBarOption } from "./components/charts/RainBar";
import { yearlyTrendOption } from "./components/charts/YearlyTrend";
import { exportChartsAsZip } from "./utils/exportChartsZip";
import type {
    AirQualityMonthlyPayload,
    AirQualityQualityPayload,
    AirQualityTimelinePayload,
    CorrelationMatrixPayload,
    ForecastEventTagsPayload,
    ForecastTimelinePayload,
    GridMetricStatsPayload,
    GridMetricTrendsPayload,
    GridStationOverviewPayload,
    ProcessedChartDataset,
    YearlyExtremesPayload,
    YearlyTrendsPayload,
} from "./types/chart";

function App() {
    // 大屏数据状态
    const [datasets, setDatasets] = useState<Record<string, ProcessedChartDataset>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 当前放大查看的图表 key（null 表示关闭放大层）
    const [activeChartKey, setActiveChartKey] = useState<string | null>(null);
    // 导出状态：避免重复点击
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchDashboardDatasets();
                setDatasets(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "加载失败");
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    const yearlyPayload =
        datasets.chart_yearly_trends?.payload as YearlyTrendsPayload | undefined;
    const airQualityMonthly =
        datasets.chart_air_quality_monthly?.payload as AirQualityMonthlyPayload | undefined;
    const airQualityTimeline =
        datasets.chart_air_quality_timeline?.payload as AirQualityTimelinePayload | undefined;
    const airQualityQuality =
        datasets.chart_air_quality_quality?.payload as AirQualityQualityPayload | undefined;
    const eventTags =
        datasets.chart_forecast_event_tags?.payload as ForecastEventTagsPayload | undefined;
    const forecastTimeline =
        datasets.chart_forecast_timeline?.payload as ForecastTimelinePayload | undefined;
    const yearlyExtremes =
        datasets.chart_yearly_extremes?.payload as YearlyExtremesPayload | undefined;
    const correlation =
        datasets.chart_correlation_matrix?.payload as CorrelationMatrixPayload | undefined;
    const gridMetricStats =
        datasets.chart_grid_metric_stats?.payload as GridMetricStatsPayload | undefined;
    const gridMetricTrends =
        datasets.chart_grid_metric_trends?.payload as GridMetricTrendsPayload | undefined;
    const gridStationOverview =
        datasets.chart_grid_station_overview?.payload as GridStationOverviewPayload | undefined;

    // 顶部指标汇总
    const overviewMetrics = useMemo(() => {
        const years = yearlyPayload?.xAxis?.length ?? 0;
        const avgTemp = avg(yearlyPayload?.series?.avg_temp ?? []);
        const maxRain = max(yearlyPayload?.series?.rainfall ?? []);
        const metrics = correlation?.metrics?.length ?? 0;

        return { years, avgTemp, maxRain, metrics };
    }, [yearlyPayload, correlation]);

    // 顶部指标卡片
    const kpiCards = useMemo(() => {
        return [
            { label: "年度样本", value: `${overviewMetrics.years}` },
            { label: "平均气温", value: `${overviewMetrics.avgTemp.toFixed(2)}℃` },
            { label: "最大降水", value: `${overviewMetrics.maxRain.toFixed(1)}mm` },
            { label: "相关指标", value: `${overviewMetrics.metrics}` },
        ];
    }, [overviewMetrics]);

    // 可放大图表清单：按 chartAnalysis 中 1-13 顺序组织，保证切换顺序一致
    const expandableCharts = useMemo<ExpandableChart[]>(
        () => {
            const chartMap: Record<string, ExpandableChart> = {
                event_tags: {
                    key: "event_tags",
                    title: "天气事件占比",
                    option: eventTagPieOption(eventTags),
                    analysisText: getChartAnalysisText("event_tags"),
                },
                yearly_overview: {
                    key: "yearly_overview",
                    title: "核心指标概览",
                    option: kpiOverviewOption(overviewMetrics),
                    analysisText: getChartAnalysisText("yearly_overview"),
                },
                rain_bar: {
                    key: "rain_bar",
                    title: "年度降水对比",
                    option: rainBarOption(yearlyPayload),
                    analysisText: getChartAnalysisText("rain_bar"),
                },
                air_quality_monthly: {
                    key: "air_quality_monthly",
                    title: "空气质量月度趋势",
                    option: airQualityLineOption(airQualityMonthly),
                    analysisText: getChartAnalysisText("air_quality_monthly"),
                },
                yearly_extremes: {
                    key: "yearly_extremes",
                    title: "年度极值分布",
                    option: extremesDonutOption(yearlyExtremes),
                    analysisText: getChartAnalysisText("yearly_extremes"),
                },
                correlation_matrix: {
                    key: "correlation_matrix",
                    title: "相关性热力矩阵",
                    option: correlationHeatmapOption(correlation),
                    analysisText: getChartAnalysisText("correlation_matrix"),
                },
                yearly_trend: {
                    key: "yearly_trend",
                    title: "年度气象趋势",
                    option: yearlyTrendOption(yearlyPayload),
                    analysisText: getChartAnalysisText("yearly_trend"),
                },
                air_quality_quality: {
                    key: "air_quality_quality",
                    title: "空气质量质量摘要",
                    option: airQualityQualityBarOption(airQualityQuality),
                    analysisText: getChartAnalysisText("air_quality_quality"),
                },
                air_quality_timeline: {
                    key: "air_quality_timeline",
                    title: "空气质量时间序列与累计",
                    option: airQualityTimelineOption(airQualityTimeline),
                    analysisText: getChartAnalysisText("air_quality_timeline"),
                },
                forecast_timeline: {
                    key: "forecast_timeline",
                    title: "延伸期预报时间线",
                    option: forecastTimelineOption(forecastTimeline),
                    analysisText: getChartAnalysisText("forecast_timeline"),
                },
                grid_station_overview: {
                    key: "grid_station_overview",
                    title: "网格站点记录概览",
                    option: gridStationOverviewOption(gridStationOverview),
                    analysisText: getChartAnalysisText("grid_station_overview"),
                },
                grid_metric_trends: {
                    key: "grid_metric_trends",
                    title: "网格指标趋势",
                    option: gridMetricTrendsOption(gridMetricTrends),
                    analysisText: getChartAnalysisText("grid_metric_trends"),
                },
                grid_metric_stats: {
                    key: "grid_metric_stats",
                    title: "网格指标统计",
                    option: gridMetricStatsOption(gridMetricStats),
                    analysisText: getChartAnalysisText("grid_metric_stats"),
                },
            };

            return CHART_ANALYSIS_ORDER.map((key) => chartMap[key]).filter(Boolean);
        },
        [
            airQualityMonthly,
            airQualityQuality,
            airQualityTimeline,
            correlation,
            eventTags,
            forecastTimeline,
            gridMetricStats,
            gridMetricTrends,
            gridStationOverview,
            overviewMetrics,
            yearlyExtremes,
            yearlyPayload,
        ]
    );

    // 导出压缩包：每个图表导出为“图表名称.png”，上图下文（分析文本）
    const handleExport = async () => {
        if (exporting || expandableCharts.length === 0) return;

        try {
            setExporting(true);
            await exportChartsAsZip(expandableCharts, "重庆天气数据分析图表导出.zip");
        } catch (err) {
            const message = err instanceof Error ? err.message : "导出失败，请稍后重试";
            window.alert(message);
        } finally {
            setExporting(false);
        }
    };

    const activeChartIndex = expandableCharts.findIndex((item) => item.key === activeChartKey);
    const activeChart = activeChartIndex >= 0 ? expandableCharts[activeChartIndex] : null;

    // 放大层左右切换：循环切换上一张/下一张图
    const switchExpandedChart = (offset: number) => {
        if (!activeChart || expandableCharts.length === 0) return;
        const nextIndex =
            (activeChartIndex + offset + expandableCharts.length) % expandableCharts.length;
        setActiveChartKey(expandableCharts[nextIndex].key);
    };

    if (loading) {
        return <div className="screen-status">数据加载中...</div>;
    }

    if (error) {
        return <div className="screen-status error">数据加载失败：{error},请先打开Mysql数据库服务</div>;
    }

    return (
        <div className="dashboard-screen">
            <header className="screen-header">
                <span className="screen-header-title">重庆天气数据分析可视化大屏</span>
                {/* 导出按钮：导出包含 13 张图的 ZIP 压缩包 */}
                <button
                    type="button"
                    className="screen-export-btn"
                    aria-label="导出"
                    onClick={() => void handleExport()}
                    disabled={exporting}
                >
                    {exporting ? "导出中..." : "导出"}
                </button>
            </header>

            <main className="screen-grid">
                <section className="column left">
                    <Panel title="天气事件占比" onExpand={() => setActiveChartKey("event_tags")}>
                        <ReactECharts option={eventTagPieOption(eventTags)} className="chart chart-md" />
                    </Panel>

                    <Panel title="年度极值分布" onExpand={() => setActiveChartKey("yearly_extremes")}>
                        <ReactECharts
                            option={extremesDonutOption(yearlyExtremes)}
                            className="chart chart-md"
                        />
                    </Panel>

                    <Panel
                        title="空气质量质量摘要"
                        onExpand={() => setActiveChartKey("air_quality_quality")}
                    >
                        <ReactECharts
                            option={airQualityQualityBarOption(airQualityQuality)}
                            className="chart chart-md"
                        />
                    </Panel>

                    <Panel
                        title="网格站点记录概览"
                        onExpand={() => setActiveChartKey("grid_station_overview")}
                    >
                        <ReactECharts
                            option={gridStationOverviewOption(gridStationOverview)}
                            className="chart chart-md"
                        />
                    </Panel>
                </section>

                <section className="column center">
                    <Panel title="核心指标概览" onExpand={() => setActiveChartKey("yearly_overview")}>
                        <div className="kpi-row">
                            {kpiCards.map((card) => (
                                <article key={card.label} className="kpi-card">
                                    <div className="kpi-label">{card.label}</div>
                                    <div className="kpi-value">{card.value}</div>
                                </article>
                            ))}
                        </div>
                    </Panel>

                    <Panel
                        title="空气质量月度趋势"
                        onExpand={() => setActiveChartKey("air_quality_monthly")}
                    >
                        <ReactECharts
                            option={airQualityLineOption(airQualityMonthly)}
                            className="chart chart-lg"
                        />
                    </Panel>

                    <Panel title="年度气象趋势" onExpand={() => setActiveChartKey("yearly_trend")}>
                        <ReactECharts option={yearlyTrendOption(yearlyPayload)} className="chart chart-lg" />
                    </Panel>

                    <Panel
                        title="空气质量时间序列与累计"
                        onExpand={() => setActiveChartKey("air_quality_timeline")}
                    >
                        <ReactECharts
                            option={airQualityTimelineOption(airQualityTimeline)}
                            className="chart chart-xl"
                        />
                    </Panel>

                    <Panel title="网格指标趋势" onExpand={() => setActiveChartKey("grid_metric_trends")}>
                        <ReactECharts
                            option={gridMetricTrendsOption(gridMetricTrends)}
                            className="chart chart-xl"
                        />
                    </Panel>
                </section>

                <section className="column right">
                    <Panel title="年度降水对比" onExpand={() => setActiveChartKey("rain_bar")}>
                        <ReactECharts option={rainBarOption(yearlyPayload)} className="chart chart-md" />
                    </Panel>

                    <Panel
                        title="相关性热力矩阵"
                        onExpand={() => setActiveChartKey("correlation_matrix")}
                    >
                        <ReactECharts
                            option={correlationHeatmapOption(correlation)}
                            className="chart chart-lg"
                        />
                    </Panel>

                    <Panel
                        title="延伸期预报时间线"
                        onExpand={() => setActiveChartKey("forecast_timeline")}
                    >
                        <ReactECharts
                            option={forecastTimelineOption(forecastTimeline)}
                            className="chart chart-lg"
                        />
                    </Panel>

                    <Panel
                        title="网格指标统计"
                        onExpand={() => setActiveChartKey("grid_metric_stats")}
                    >
                        <ReactECharts
                            option={gridMetricStatsOption(gridMetricStats)}
                            className="chart chart-md"
                        />
                    </Panel>
                </section>
            </main>

            <ChartModal
                activeChart={activeChart}
                onClose={() => setActiveChartKey(null)}
                onPrev={() => switchExpandedChart(-1)}
                onNext={() => switchExpandedChart(1)}
            />
        </div>
    );
}

function avg(values: Array<number | null>) {
    const nums = values.filter((item): item is number => typeof item === "number");
    if (nums.length === 0) return 0;
    return nums.reduce((acc, cur) => acc + cur, 0) / nums.length;
}

function max(values: Array<number | null>) {
    const nums = values.filter((item): item is number => typeof item === "number");
    if (nums.length === 0) return 0;
    return Math.max(...nums);
}

export default App;
