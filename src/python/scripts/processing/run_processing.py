"""DPV-CQW 二次处理总入口脚本。"""

from __future__ import annotations

from dataclasses import asdict
from datetime import datetime
from pathlib import Path
import json

from common import PROCESSED_DIR, ProcessResult, ensure_processed_dir
from process_air_quality_charts import process_air_quality_charts
from process_beibei_charts import process_beibei_yearly_charts
from process_extended_forecast_charts import process_extended_forecast_charts
from process_grid_history_charts import process_grid_history_charts


def run_all_processing() -> list[ProcessResult]:
    """执行全部二次处理流程。"""
    ensure_processed_dir()

    results: list[ProcessResult] = []
    results.extend(process_beibei_yearly_charts())
    results.extend(process_air_quality_charts())
    results.extend(process_extended_forecast_charts())
    results.extend(process_grid_history_charts())
    return results


def write_report(results: list[ProcessResult]) -> Path:
    """输出二次处理报告，便于前后端联调。"""
    report_path = PROCESSED_DIR / "processing_report.json"
    payload = {
        "project": "DPV-CQW",
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "datasets": [asdict(item) for item in results],
    }

    with report_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return report_path


if __name__ == "__main__":
    processing_results = run_all_processing()
    report_file = write_report(processing_results)

    print("\n二次处理完成，结果如下：")
    for item in processing_results:
        print(
            f"- {item.dataset}: 输入 {item.rows_in} 行, 输出 {item.rows_out} 行\n"
            f"  JSON: {item.json_path}"
        )
    print(f"\n报告文件: {report_file}")
