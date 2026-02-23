"""DPV-CQW 数据预处理公共工具。"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
import json
import re
from typing import Any

import pandas as pd


# 目录定义：统一从 src/python 根目录推导
PY_ROOT_DIR = Path(__file__).resolve().parents[2]
RAW_DATA_DIR = PY_ROOT_DIR / "data"
CLEANED_DIR = PY_ROOT_DIR / "data_cleaned"


@dataclass
class PreprocessResult:
    """单个数据集预处理结果。"""

    dataset: str
    rows_in: int
    rows_out: int
    json_path: str


def ensure_output_dirs() -> None:
    """确保输出目录存在。"""
    CLEANED_DIR.mkdir(parents=True, exist_ok=True)


def _is_header_row(row: dict[str, Any]) -> bool:
    """识别“字段中文名：xxx”这类说明行。"""
    if not row:
        return False
    values = [str(v) for v in row.values() if v is not None]
    if not values:
        return False
    return all(v.startswith("字段中文名") for v in values)


def load_json_records(file_path: Path) -> list[dict[str, Any]]:
    """读取 JSON 数组并剔除首行字段说明。"""
    with file_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        return []

    records = [r for r in data if isinstance(r, dict)]
    if records and _is_header_row(records[0]):
        records = records[1:]
    return records


def to_numeric_series(series: pd.Series) -> pd.Series:
    """将字符串数值安全转换为数字。"""
    return pd.to_numeric(series, errors="coerce")


def parse_excel_serial_date(value: Any) -> datetime | None:
    """解析 Excel 序列日期（1900 系统）。"""
    try:
        serial = int(str(value).strip())
    except Exception:
        return None

    # 仅接受常见的 Excel 日期序列区间
    if serial < 20000 or serial > 90000:
        return None

    base = datetime(1899, 12, 30)
    return base + timedelta(days=serial)


def parse_chinese_date_text(text: Any) -> datetime | None:
    """从中文日期文本中提取第一个可解析日期。"""
    if text is None:
        return None

    raw = str(text).strip()
    if not raw:
        return None

    # 常见格式：2025年12月1日 / 2025.3.7 / 2024-11-15
    patterns = [
        r"(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日",
        r"(\d{4})[./-](\d{1,2})[./-](\d{1,2})",
    ]

    for pattern in patterns:
        match = re.search(pattern, raw)
        if not match:
            continue
        year, month, day = [int(match.group(i)) for i in range(1, 4)]
        try:
            return datetime(year, month, day)
        except Exception:
            return None

    # 兜底：交给 pandas 尝试
    parsed = pd.to_datetime(raw, errors="coerce")
    if pd.isna(parsed):
        return None
    return parsed.to_pydatetime()


def save_cleaned_dataset(df: pd.DataFrame, dataset_name: str) -> PreprocessResult:
    """保存清洗结果到 JSON（清洗后数据目录）。"""
    ensure_output_dirs()

    # 仅输出 JSON，避免不必要的格式转换
    json_path = CLEANED_DIR / f"{dataset_name}.json"

    df.to_json(json_path, orient="records", force_ascii=False, date_format="iso")

    return PreprocessResult(
        dataset=dataset_name,
        rows_in=0,
        rows_out=int(len(df)),
        json_path=str(json_path),
    )
