# DPV-CQW 二次处理脚本说明

## 目录说明
- `run_processing.py`：总入口，串行执行全部二次处理并生成报告。
- `process_beibei_charts.py`：北碚年度气象图表数据生成。
- `process_air_quality_charts.py`：空气优良天数图表数据生成。
- `process_extended_forecast_charts.py`：延伸期预报图表数据生成。
- `process_grid_history_charts.py`：网格历史图表数据生成。
- `common.py`：公共路径、读写工具。

## 输入与输出
- 输入目录：`src/python/data_cleaned`
- 输出目录：`src/python/data_processed`
- 报告文件：`src/python/data_processed/processing_report.json`

## 运行方式
在项目根目录执行：

```powershell
python scripts/processing/run_processing.py
```

## 结果用途
- `data_processed` 为前端 ECharts 渲染的最终数据源。
- `processing_report.json` 可用于后端导库与联调核对。
