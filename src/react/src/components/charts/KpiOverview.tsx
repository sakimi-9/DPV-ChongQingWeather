// 核心指标概览图表：用于放大弹层中展示 KPI 聚合结果
export function kpiOverviewOption(payload: {
    years: number;
    avgTemp: number;
    maxRain: number;
    metrics: number;
}) {
    const categories = ["年度样本", "平均气温(℃)", "最大降水(mm)", "相关指标"];
    const values = [payload.years, payload.avgTemp, payload.maxRain, payload.metrics];

    return {
        backgroundColor: "transparent",
        grid: {
            left: 56,
            right: 28,
            top: 56,
            bottom: 70,
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            // 自定义提示格式：对平均气温保留两位小数
            formatter: (params: any) => {
                if (!Array.isArray(params)) return '';
                const parts = params.map((p: any) => {
                    const name = p.axisValue;
                    let val = p.data;
                    if (p.dataIndex === 1 && typeof val === 'number') {
                        val = val.toFixed(2);
                    }
                    return `${p.seriesName}\n${name}: ${val}`;
                });
                return parts.join('\n');
            },
        },
        xAxis: {
            type: "category",
            data: categories,
            axisLine: { lineStyle: { color: "rgba(120, 174, 255, 0.7)" } },
            axisLabel: { color: "#cbe3ff" },
        },
        yAxis: {
            type: "value",
            name: "数值",
            nameTextStyle: { color: "#ffffff" },
            splitLine: { lineStyle: { color: "rgba(72, 124, 194, 0.25)" } },
            axisLine: { lineStyle: { color: "rgba(120, 174, 255, 0.7)" } },
            axisLabel: { color: "#a8ccff" },
        },
        series: [
            {
                name: "核心指标",
                type: "bar",
                data: values,
                itemStyle: {
                    color: "#53b8ff",
                    borderRadius: [6, 6, 0, 0],
                },
                label: {
                    show: true,
                    position: "top",
                    color: "#d9ecff",
                    // 对平均气温（索引1）格式化为两位小数
                    formatter: (params: any) => {
                        const idx = params.dataIndex;
                        const v = params.data;
                        if (idx === 1 && typeof v === 'number') return v.toFixed(2);
                        return v;
                    },
                },
            },
        ],
    };
}
