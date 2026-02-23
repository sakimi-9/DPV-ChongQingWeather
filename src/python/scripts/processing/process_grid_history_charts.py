"""网格历史数据：图表最终数据二次处理。"""

from __future__ import annotations

import pandas as pd

from common import ProcessResult, load_cleaned_json, save_processed_json


def process_grid_history_charts() -> list[ProcessResult]:
    """生成网格历史相关图表最终数据。"""
    wide_df = load_cleaned_json("grid_history_wide")
    long_df = load_cleaned_json("grid_history_long")
    if wide_df.empty and long_df.empty:
        return []

    results: list[ProcessResult] = []

    # 优先使用长表，图表复用性更高
    if not long_df.empty:
        if "timestamp" in long_df.columns:
            long_df["timestamp"] = pd.to_datetime(long_df["timestamp"], errors="coerce")
        if "value" in long_df.columns:
            long_df["value"] = pd.to_numeric(long_df["value"], errors="coerce")

        # 1) 指标统计：用于箱线图、排行图
        # 使用显式命名聚合，避免 pandas 不同版本返回多重列名导致的列数不匹配
        stats_df = (
            long_df.dropna(subset=["metric", "value"])
            .groupby("metric", as_index=False)
            .agg(
                count=("value", "count"),
                mean=("value", "mean"),
                min=("value", "min"),
                max=("value", "max"),
                std=("value", "std"),
            )
        )
        stats_payload = {
            "items": [
                {
                    "metric": str(row["metric"]),
                    "count": int(row["count"]),
                    "mean": round(float(row["mean"]), 4),
                    "min": round(float(row["min"]), 4),
                    "max": round(float(row["max"]), 4),
                    "std": (
                        round(float(row["std"]), 4) if pd.notna(row["std"]) else None
                    ),
                }
                for _, row in stats_df.iterrows()
            ]
        }
        results.append(
            save_processed_json(
                dataset_name="chart_grid_metric_stats",
                payload=stats_payload,
                rows_in=len(long_df),
                rows_out=len(stats_payload["items"]),
            )
        )

        # 2) 指标时序（Top5 指标）
        if "timestamp" in long_df.columns and long_df["timestamp"].notna().any():
            metric_counts = (
                long_df.dropna(subset=["metric"])
                .groupby("metric")
                .size()
                .sort_values(ascending=False)
            )
            top_metrics = metric_counts.head(5).index.tolist()

            trend_df = long_df[
                long_df["metric"].isin(top_metrics)
                & long_df["timestamp"].notna()
                & long_df["value"].notna()
            ].copy()
            trend_df["date"] = trend_df["timestamp"].dt.date
            trend_group = (
                trend_df.groupby(["date", "metric"], as_index=False)["value"]
                .mean()
                .sort_values(by=["date", "metric"], kind="stable")
            )

            x_axis = sorted({str(d) for d in trend_group["date"].tolist()})
            series = {}
            for metric in top_metrics:
                metric_part = trend_group[trend_group["metric"] == metric]
                mapper = {
                    str(row["date"]): round(float(row["value"]), 4)
                    for _, row in metric_part.iterrows()
                }
                series[str(metric)] = [mapper.get(day) for day in x_axis]

            trend_payload = {"xAxis": x_axis, "series": series}
            results.append(
                save_processed_json(
                    dataset_name="chart_grid_metric_trends",
                    payload=trend_payload,
                    rows_in=len(long_df),
                    rows_out=len(x_axis),
                )
            )

    # 3) 站点概览（若存在 sp_id）
    if not wide_df.empty and "sp_id" in wide_df.columns:
        station_df = wide_df.copy()
        station_df["sp_id"] = pd.to_numeric(station_df["sp_id"], errors="coerce")
        station_df = station_df[station_df["sp_id"].notna()]

        if not station_df.empty:
            items = (
                station_df.groupby("sp_id", as_index=False)
                .size()
                .rename(columns={"size": "records"})
                .sort_values(by=["records"], ascending=False)
                .head(20)
            )
            payload = {
                "items": [
                    {"sp_id": int(row["sp_id"]), "records": int(row["records"])}
                    for _, row in items.iterrows()
                ]
            }
            results.append(
                save_processed_json(
                    dataset_name="chart_grid_station_overview",
                    payload=payload,
                    rows_in=len(wide_df),
                    rows_out=len(payload["items"]),
                )
            )

    return results
