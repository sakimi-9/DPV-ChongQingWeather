"""北碚年度气象：图表最终数据二次处理。"""

from __future__ import annotations

import math
import pandas as pd

from common import ProcessResult, load_cleaned_json, save_processed_json, to_numeric


def process_beibei_yearly_charts() -> list[ProcessResult]:
    """生成北碚年度气象相关图表所需最终数据。"""
    df = load_cleaned_json("beibei_yearly_weather")
    if df.empty:
        return []

    # 关键字段转数值
    df = to_numeric(df, ["nf", "pjqw", "jsl", "pjxdsd", "pjqy", "pjfs", "rzss", "wsq"])
    df = df[df["nf"].notna()].copy() if "nf" in df.columns else df.copy()
    df = df.sort_values(by=["nf"], kind="stable")

    results: list[ProcessResult] = []

    # 1) 年度趋势：温度、降水、湿度、气压
    trend_payload = {
        "xAxis": (
            df["nf"].astype("Int64").astype(str).tolist() if "nf" in df.columns else []
        ),
        "series": {
            "avg_temp": _round_list(df.get("pjqw")),
            "rainfall": _round_list(df.get("jsl")),
            "humidity": _round_list(df.get("pjxdsd")),
            "pressure": _round_list(df.get("pjqy")),
        },
    }
    results.append(
        save_processed_json(
            dataset_name="chart_yearly_trends",
            payload=trend_payload,
            rows_in=len(df),
            rows_out=len(trend_payload["xAxis"]),
        )
    )

    # 2) 相关矩阵：支持热力图
    corr_cols = [
        col
        for col in ["pjqw", "jsl", "pjxdsd", "pjqy", "pjfs", "rzss", "wsq"]
        if col in df.columns
    ]
    corr_df = (
        df[corr_cols].corr(numeric_only=True).fillna(0) if corr_cols else pd.DataFrame()
    )
    matrix_payload = {
        "metrics": corr_df.columns.tolist(),
        "matrix": (
            [[round(float(v), 4) for v in row] for row in corr_df.values.tolist()]
            if not corr_df.empty
            else []
        ),
    }
    results.append(
        save_processed_json(
            dataset_name="chart_correlation_matrix",
            payload=matrix_payload,
            rows_in=len(df),
            rows_out=len(matrix_payload["metrics"]),
        )
    )

    # 3) 极值年份：用于条形图/标签卡片
    extremes = []
    for metric in ["pjqw", "jsl", "rzss", "pjxdsd"]:
        if metric not in df.columns:
            continue
        metric_df = df[["nf", metric]].dropna()
        if metric_df.empty:
            continue
        max_row = metric_df.loc[metric_df[metric].idxmax()]
        min_row = metric_df.loc[metric_df[metric].idxmin()]
        extremes.append(
            {
                "metric": metric,
                "max_year": int(max_row["nf"]),
                "max_value": round(float(max_row[metric]), 3),
                "min_year": int(min_row["nf"]),
                "min_value": round(float(min_row[metric]), 3),
            }
        )

    results.append(
        save_processed_json(
            dataset_name="chart_yearly_extremes",
            payload={"items": extremes},
            rows_in=len(df),
            rows_out=len(extremes),
        )
    )

    return results


def _round_list(series: pd.Series | None) -> list[float | None]:
    """数值序列统一保留 3 位小数。"""
    if series is None:
        return []

    values: list[float | None] = []
    for item in series.tolist():
        if pd.isna(item):
            values.append(None)
            continue
        value = float(item)
        if math.isfinite(value):
            values.append(round(value, 3))
        else:
            values.append(None)
    return values
