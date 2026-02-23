"""DPV-CQW 二次处理公共工具。"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import json
from typing import Any

import pandas as pd


# 目录定义：统一从 src/python 根目录推导
PY_ROOT_DIR = Path(__file__).resolve().parents[2]
CLEANED_DIR = PY_ROOT_DIR / "data_cleaned"
PROCESSED_DIR = PY_ROOT_DIR / "data_processed"


@dataclass
class ProcessResult:
    """单个二次处理结果。"""

    dataset: str
    rows_in: int
    rows_out: int
    json_path: str


def ensure_processed_dir() -> None:
    """确保最终数据输出目录存在。"""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def load_cleaned_json(dataset_name: str) -> pd.DataFrame:
    """读取清洗后的 JSON 数据。"""
    file_path = CLEANED_DIR / f"{dataset_name}.json"
    if not file_path.exists():
        return pd.DataFrame()

    with file_path.open("r", encoding="utf-8") as f:
        raw = json.load(f)

    if not isinstance(raw, list):
        return pd.DataFrame()

    records = [item for item in raw if isinstance(item, dict)]
    return pd.DataFrame(records)


def save_processed_json(
    dataset_name: str, payload: Any, rows_in: int, rows_out: int
) -> ProcessResult:
    """保存图表最终数据为 JSON。"""
    ensure_processed_dir()
    output_path = PROCESSED_DIR / f"{dataset_name}.json"

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, default=_json_default)

    return ProcessResult(
        dataset=dataset_name,
        rows_in=int(rows_in),
        rows_out=int(rows_out),
        json_path=str(output_path),
    )


def _json_default(value: Any) -> Any:
    """处理 datetime / pandas 时间戳序列化。"""
    if isinstance(value, (datetime, pd.Timestamp)):
        return value.isoformat()
    return str(value)


def to_numeric(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    """批量数值化列，避免后续统计报错。"""
    copied = df.copy()
    for col in columns:
        if col in copied.columns:
            copied[col] = pd.to_numeric(copied[col], errors="coerce")
    return copied
