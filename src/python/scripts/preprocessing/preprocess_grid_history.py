"""大气网格化监测历史数据预处理。"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from common import RAW_DATA_DIR, PreprocessResult, load_json_records, to_numeric_series


FILE_GLOB = "大气网格化监测历史数据信息(*).json"
DATASET_WIDE = "grid_history_wide"
DATASET_LONG = "grid_history_long"


def _clean_single_grid_file(file_path: Path) -> pd.DataFrame:
    """清洗单个网格历史文件。"""
    records = load_json_records(file_path)
    df = pd.DataFrame(records)
    if df.empty:
        return df

    # 字段名统一去空格
    df.columns = [str(col).strip() for col in df.columns]

    # 时间字段统一解析
    if "recv_time" in df.columns:
        df["timestamp"] = pd.to_datetime(
            df["recv_time"],
            format="%a %b %d %H:%M:%S CST %Y",
            errors="coerce",
        )
    else:
        df["timestamp"] = pd.NaT

    # 数值字段自动转换
    for col in df.columns:
        if col in {"recv_time", "timestamp"}:
            continue
        df[col] = to_numeric_series(df[col])

    # 增加来源文件标识，便于追踪
    df["source_file"] = file_path.name

    # 丢弃时间和站点都缺失的明显脏行
    if "sp_id" in df.columns:
        df = df[df["timestamp"].notna() | df["sp_id"].notna()].copy()

    # 排序，后续图表按时间展示更稳定
    sort_cols = [col for col in ["sp_id", "timestamp", "id"] if col in df.columns]
    if sort_cols:
        df = df.sort_values(by=sort_cols, kind="stable")

    return df.reset_index(drop=True)


def _to_long_format(df: pd.DataFrame) -> pd.DataFrame:
    """将宽表转换为长表，便于图表组件复用。"""
    if df.empty:
        return df

    id_candidates = ["source_file", "timestamp", "recv_time", "sp_id", "id"]
    id_vars = [col for col in id_candidates if col in df.columns]

    value_vars = [
        col
        for col in df.columns
        if col not in set(id_vars)
        and pd.api.types.is_numeric_dtype(df[col])
        and col not in {"id", "sp_id"}
    ]

    if not value_vars:
        return pd.DataFrame(columns=id_vars + ["metric", "value"])

    long_df = df.melt(
        id_vars=id_vars,
        value_vars=value_vars,
        var_name="metric",
        value_name="value",
    )
    long_df = long_df[long_df["value"].notna()].copy()
    return long_df.reset_index(drop=True)


def preprocess_grid_history() -> (
    tuple[pd.DataFrame, pd.DataFrame, PreprocessResult, PreprocessResult]
):
    """清洗并合并网格历史数据，输出宽表与长表。"""
    raw_files = sorted(RAW_DATA_DIR.glob(FILE_GLOB))
    frames: list[pd.DataFrame] = []
    total_rows_in = 0

    for file_path in raw_files:
        records = load_json_records(file_path)
        total_rows_in += len(records)
        cleaned = _clean_single_grid_file(file_path)
        if not cleaned.empty:
            frames.append(cleaned)

    if not frames:
        empty = pd.DataFrame()
        return (
            empty,
            empty,
            PreprocessResult(DATASET_WIDE, total_rows_in, 0, ""),
            PreprocessResult(DATASET_LONG, total_rows_in, 0, ""),
        )

    wide_df = pd.concat(frames, ignore_index=True)
    long_df = _to_long_format(wide_df)

    wide_result = PreprocessResult(
        dataset=DATASET_WIDE,
        rows_in=total_rows_in,
        rows_out=len(wide_df),
        json_path="",
    )
    long_result = PreprocessResult(
        dataset=DATASET_LONG,
        rows_in=total_rows_in,
        rows_out=len(long_df),
        json_path="",
    )
    return wide_df, long_df, wide_result, long_result
