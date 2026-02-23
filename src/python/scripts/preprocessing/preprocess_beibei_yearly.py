"""北碚区主要年份气象基本情况预处理。"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from common import RAW_DATA_DIR, PreprocessResult, load_json_records, to_numeric_series


RAW_FILE = "北碚区主要年份气象基本情况信息(1).json"
DATASET_NAME = "beibei_yearly_weather"


def preprocess_beibei_yearly() -> tuple[pd.DataFrame, PreprocessResult]:
    """清洗北碚年度气象数据。"""
    file_path = RAW_DATA_DIR / RAW_FILE
    records = load_json_records(file_path)
    rows_in = len(records)

    df = pd.DataFrame(records)
    if df.empty:
        return df, PreprocessResult(DATASET_NAME, 0, 0, "")

    # 关键字段统一转为数值，便于后续分析绘图
    numeric_columns = [
        "xh",
        "nf",
        "jsl",
        "pjfs",
        "pjqw",
        "wsq",
        "pjqy",
        "pjxdsd",
        "rzss",
    ]
    for column in numeric_columns:
        if column in df.columns:
            df[column] = to_numeric_series(df[column])

    # 年份、序号使用整数，空值保持为缺失
    for column in ["xh", "nf", "wsq", "pjxdsd"]:
        if column in df.columns:
            df[column] = df[column].astype("Int64")

    # 清理缺少年份的记录，并按年份去重排序
    if "nf" in df.columns:
        df = df[df["nf"].notna()].copy()
        df = df.sort_values(by=["nf", "xh"], kind="stable")
        df = df.drop_duplicates(subset=["nf"], keep="last")

    # 统一增加区县标识，后续支持多区合并
    df["district"] = "北碚区"

    # 重排列顺序，优先放图表常用字段
    preferred_columns = [
        "district",
        "nf",
        "pjqw",
        "jsl",
        "pjxdsd",
        "pjqy",
        "pjfs",
        "rzss",
        "wsq",
        "xh",
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
