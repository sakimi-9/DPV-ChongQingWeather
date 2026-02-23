# DPV-CQW 预处理脚本说明

## 目录说明
- `run_preprocessing.py`：总入口，串行执行全部预处理并生成报告。
- `preprocess_beibei_yearly.py`：北碚区年度气象数据清洗。
- `preprocess_air_quality_days.py`：空气优良天数数据清洗（含 `yf` 混合日期解析）。
- `preprocess_extended_forecast.py`：延伸期预报文本清洗与结构化字段抽取。
- `preprocess_grid_history.py`：网格监测历史数据清洗、合并与长表转换。
- `common.py`：公共路径、读写、日期解析工具。

## 输入与输出
- 输入目录：`src/python/data`
- 输出目录：
  - `src/python/data_cleaned/csv`
  - `src/python/data_cleaned/json`
- 报告文件：`src/python/data_cleaned/preprocessing_report.json`

## 运行方式
在项目根目录执行：

```powershell
python scripts/preprocessing/run_preprocessing.py
```

## 结果用途
- `data_cleaned` 作为后续 `scripts/processing` 二次处理的输入。
- 预处理报告用于核对每个数据集输入/输出行数与产物路径。
