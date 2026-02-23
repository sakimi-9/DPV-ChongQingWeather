"""DPV-CQW 数据预处理总入口脚本。"""

from __future__ import annotations

from dataclasses import asdict
from datetime import datetime
from pathlib import Path
import json

from common import (
    CLEANED_DIR,
    PreprocessResult,
    ensure_output_dirs,
    save_cleaned_dataset,
)
from preprocess_air_quality_days import preprocess_air_quality_days
from preprocess_beibei_yearly import preprocess_beibei_yearly
from preprocess_extended_forecast import preprocess_extended_forecast
from preprocess_grid_history import preprocess_grid_history


def _save_and_fill_result(result: PreprocessResult, dataset_name: str, df):
    """保存数据并回填结果文件路径。"""
    saved = save_cleaned_dataset(df, dataset_name)
    result.json_path = saved.json_path
    result.rows_out = len(df)
    return result


def run_all_preprocessing() -> list[PreprocessResult]:
    """执行全部预处理流程。"""
    ensure_output_dirs()

    results: list[PreprocessResult] = []

    # 1) 北碚年度气象
    beibei_df, beibei_result = preprocess_beibei_yearly()
    results.append(
        _save_and_fill_result(beibei_result, beibei_result.dataset, beibei_df)
    )

    # 2) 空气优良天数
    air_df, air_result = preprocess_air_quality_days()
    results.append(_save_and_fill_result(air_result, air_result.dataset, air_df))

    # 3) 延伸期预报
    forecast_df, forecast_result = preprocess_extended_forecast()
    results.append(
        _save_and_fill_result(forecast_result, forecast_result.dataset, forecast_df)
    )

    # 4) 网格化历史（宽表 + 长表）
    grid_wide_df, grid_long_df, grid_wide_result, grid_long_result = (
        preprocess_grid_history()
    )
    results.append(
        _save_and_fill_result(grid_wide_result, grid_wide_result.dataset, grid_wide_df)
    )
    results.append(
        _save_and_fill_result(grid_long_result, grid_long_result.dataset, grid_long_df)
    )

    return results


def write_report(results: list[PreprocessResult]) -> Path:
    """输出预处理报告，方便后续导库脚本与联调查看。"""
    report_path = CLEANED_DIR / "preprocessing_report.json"
    payload = {
        "project": "DPV-CQW",
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "datasets": [asdict(item) for item in results],
    }

    with report_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return report_path


if __name__ == "__main__":
    preprocess_results = run_all_preprocessing()
    report_file = write_report(preprocess_results)

    print("\n预处理完成，结果如下：")
    for item in preprocess_results:
        print(
            f"- {item.dataset}: 输入 {item.rows_in} 行, 输出 {item.rows_out} 行\n"
            f"  JSON: {item.json_path}"
        )
    print(f"\n报告文件: {report_file}")
