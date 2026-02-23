import ReactECharts from "echarts-for-react";

export type ExpandableChart = {
    key: string;
    title: string;
    option: Record<string, unknown>;
    analysisText: string;
};

// 图表放大弹层：支持左右切换与关闭
export function ChartModal({
    activeChart,
    onClose,
    onPrev,
    onNext,
}: {
    activeChart: ExpandableChart | null;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}) {
    if (!activeChart) {
        return null;
    }

    return (
        <div className="chart-modal-mask" onClick={onClose}>
            <button
                type="button"
                className="chart-modal-arrow chart-modal-arrow-left"
                onClick={(event) => {
                    event.stopPropagation();
                    onPrev();
                }}
                aria-label="上一张图表"
            >
                ‹
            </button>

            <div className="chart-modal-panel" onClick={(event) => event.stopPropagation()}>
                <div className="chart-modal-header">
                    <h3 className="chart-modal-title">{activeChart.title}</h3>
                    <button
                        type="button"
                        className="chart-modal-close"
                        onClick={onClose}
                        aria-label="关闭放大图表"
                    >
                        ×
                    </button>
                </div>

                {/* 放大内容区：上方图表占比更高，下方文本占比较低 */}
                <div className="chart-modal-content">
                    <div className="chart-modal-chart-wrap">
                        <ReactECharts
                            key={activeChart.key}
                            option={activeChart.option}
                            notMerge
                            lazyUpdate={false}
                            className="chart chart-modal-chart"
                        />
                    </div>

                    {/* 分析文本容器：展示当前图表的数据分析说明 */}
                    <section className="chart-modal-analysis">
                        <h4 className="chart-modal-analysis-title">数据分析</h4>
                        <p className="chart-modal-analysis-text">{activeChart.analysisText}</p>
                    </section>
                </div>
            </div>

            <button
                type="button"
                className="chart-modal-arrow chart-modal-arrow-right"
                onClick={(event) => {
                    event.stopPropagation();
                    onNext();
                }}
                aria-label="下一张图表"
            >
                ›
            </button>
        </div>
    );
}
