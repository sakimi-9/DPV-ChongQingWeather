"""空气优良天数数据预处理。"""

from __future__ import annotations

from datetime import datetime

import pandas as pd

from common import (
    RAW_DATA_DIR,
    PreprocessResult,
    load_json_records,
    parse_chinese_date_text,
    parse_excel_serial_date,
    to_numeric_series,
)


RAW_FILE = "空气优良天数(1).json"
DATASET_NAME = "air_quality_good_days"


def _parse_period(value: object) -> tuple[str, datetime | None, int | None]:
    """解析 yf 字段（可能是月份、Excel 日期序列或中文日期）。"""
    if value is None:
        return "unknown", None, None

    raw = str(value).strip()
    if not raw:
        return "unknown", None, None

    # 1~12 视为月份
    if raw.isdigit():
        number = int(raw)
        if 1 <= number <= 12:
            return "month", None, number

        excel_date = parse_excel_serial_date(number)
        if excel_date:
            return "date", excel_date, excel_date.month

    # 中文日期文本
    parsed_date = parse_chinese_date_text(raw)
    if parsed_date:
        return "date", parsed_date, parsed_date.month

    return "unknown", None, None


def preprocess_air_quality_days() -> tuple[pd.DataFrame, PreprocessResult]:
    """清洗空气优良天数数据。"""
    file_path = RAW_DATA_DIR / RAW_FILE
    records = load_json_records(file_path)
    rows_in = len(records)

    df = pd.DataFrame(records)
    if df.empty:
        return df, PreprocessResult(DATASET_NAME, 0, 0, "")

    # 原始周期字段保留，避免信息丢失
    df["yf_raw"] = df.get("yf", "")

    # 分解并规范周期字段
    parsed = df["yf_raw"].apply(_parse_period)
    df["period_type"] = parsed.map(lambda item: item[0])
    df["period_date"] = parsed.map(lambda item: item[1])
    df["month"] = parsed.map(lambda item: item[2]).astype("Int64")
    df["year"] = df["period_date"].dt.year.astype("Int64")

    # 核心统计字段转数值；缺失超标天数按 0 处理
    for column in ["youdetianshu", "liangdetianshu", "chaobiaotianshu"]:
        if column in df.columns:
            df[column] = to_numeric_series(df[column])

    if "chaobiaotianshu" in df.columns:
        df["chaobiaotianshu"] = df["chaobiaotianshu"].fillna(0)

    # 衍生：总天数与异常标记（仅用于数据质量排查）
    df["total_days"] = (
        df.get("youdetianshu", 0)
        + df.get("liangdetianshu", 0)
        + df.get("chaobiaotianshu", 0)
    )
    df["is_total_gt_31"] = df["total_days"] > 31

    # 排序策略：有日期优先按日期；月份记录其次
    df = df.sort_values(by=["period_date", "month", "yf_raw"], kind="stable")

    # 去重策略：同一原始周期保留最后一条
    df = df.drop_duplicates(subset=["yf_raw"], keep="last")

    preferred_columns = [
        "yf_raw",
        "period_type",
        "period_date",
        "year",
        "month",
        "youdetianshu",
        "liangdetianshu",
        "chaobiaotianshu",
        "total_days",
        "is_total_gt_31",
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
