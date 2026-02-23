"""延伸期预报气象服务数据预处理。"""

from __future__ import annotations

import re

import pandas as pd

from common import (
    RAW_DATA_DIR,
    PreprocessResult,
    load_json_records,
    parse_chinese_date_text,
)


RAW_FILE = "延伸期预报气象服务(1).json"
DATASET_NAME = "extended_forecast"


def _extract_range(text: str, keyword: str) -> tuple[float | None, float | None]:
    """从描述文本中抽取数值区间（如 24.7～25）。"""
    if not text:
        return None, None

    # 先匹配区间
    range_pattern = rf"{keyword}[^。；;]*?(\d+(?:\.\d+)?)\s*[～~—\-]\s*(\d+(?:\.\d+)?)"
    match = re.search(range_pattern, text)
    if match:
        return float(match.group(1)), float(match.group(2))

    # 再匹配单值
    single_pattern = rf"{keyword}[^。；;]*?(\d+(?:\.\d+)?)"
    single_match = re.search(single_pattern, text)
    if single_match:
        value = float(single_match.group(1))
        return value, value

    return None, None


def preprocess_extended_forecast() -> tuple[pd.DataFrame, PreprocessResult]:
    """清洗延伸期预报文本数据并抽取关键结构化字段。"""
    file_path = RAW_DATA_DIR / RAW_FILE
    records = load_json_records(file_path)
    rows_in = len(records)

    df = pd.DataFrame(records)
    if df.empty:
        return df, PreprocessResult(DATASET_NAME, 0, 0, "")

    # 文本基础清洗
    for col in ["fbsj", "tqqs", "zytqgc"]:
        if col in df.columns:
            df[col] = (
                df[col]
                .fillna("")
                .astype(str)
                .str.replace("\n", " ", regex=False)
                .str.replace(r"\s+", " ", regex=True)
                .str.strip()
            )

    # 发布时间抽取（优先第一日期）
    df["publish_date"] = df.get("fbsj", "").apply(parse_chinese_date_text)

    # 从天气趋势中抽取温度与降水区间
    temp_range = df.get("tqqs", "").apply(lambda x: _extract_range(str(x), "平均气温"))
    rain_range = df.get("tqqs", "").apply(lambda x: _extract_range(str(x), "降水量"))

    df["temp_min"] = temp_range.map(lambda item: item[0])
    df["temp_max"] = temp_range.map(lambda item: item[1])
    df["rain_min_mm"] = rain_range.map(lambda item: item[0])
    df["rain_max_mm"] = rain_range.map(lambda item: item[1])

    # 去掉完全空白记录
    df = df[
        (df.get("tqqs", "") != "")
        | (df.get("zytqgc", "") != "")
        | (df.get("fbsj", "") != "")
    ].copy()

    # 衍生一个稳定主键，便于后续导库
    df = df.reset_index(drop=True)
    df["forecast_id"] = df.index + 1

    # 排序：有发布时间优先按发布时间
    df = df.sort_values(by=["publish_date", "forecast_id"], kind="stable")

    preferred_columns = [
        "forecast_id",
        "publish_date",
        "fbsj",
        "temp_min",
        "temp_max",
        "rain_min_mm",
        "rain_max_mm",
        "tqqs",
        "zytqgc",
    ]
    existing_columns = [col for col in preferred_columns if col in df.columns]
    rest_columns = [col for col in df.columns if col not in existing_columns]
    df = df[existing_columns + rest_columns]

    result = PreprocessResult(
        dataset=DATASET_NAME,
        rows_in=rows_in,
        rows_out=len(df),
        json_path="",
    )
    return df.reset_index(drop=True), result
