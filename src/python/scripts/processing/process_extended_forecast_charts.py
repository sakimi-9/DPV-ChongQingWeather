"""延伸期预报：图表最终数据二次处理。"""

from __future__ import annotations

import re
import pandas as pd

from common import ProcessResult, load_cleaned_json, save_processed_json, to_numeric


WEATHER_TAGS = ["小雨", "中雨", "大雨", "暴雨", "降温", "高温", "雨夹雪", "小雪"]


def process_extended_forecast_charts() -> list[ProcessResult]:
    """生成延伸期预报相关图表最终数据。"""
    df = load_cleaned_json("extended_forecast")
    if df.empty:
        return []

    df = to_numeric(
        df, ["forecast_id", "temp_min", "temp_max", "rain_min_mm", "rain_max_mm"]
    )
    df["publish_date"] = pd.to_datetime(df.get("publish_date"), errors="coerce")
    df = df.sort_values(by=["publish_date", "forecast_id"], kind="stable")

    results: list[ProcessResult] = []

    # 1) 发布-预报时序：适合折线/区间图
    timeline_df = df.copy()
    timeline_df["temp_avg"] = (timeline_df["temp_min"] + timeline_df["temp_max"]) / 2
    timeline_df["rain_avg"] = (
        timeline_df["rain_min_mm"] + timeline_df["rain_max_mm"]
    ) / 2

    timeline_payload = {
        "xAxis": [
            d.date().isoformat() if pd.notna(d) else ""
            for d in timeline_df["publish_date"].tolist()
        ],
        "series": {
            "temp_min": timeline_df["temp_min"]
            .round(3)
            .where(pd.notna(timeline_df["temp_min"]), None)
            .tolist(),
            "temp_max": timeline_df["temp_max"]
            .round(3)
            .where(pd.notna(timeline_df["temp_max"]), None)
            .tolist(),
            "temp_avg": timeline_df["temp_avg"]
            .round(3)
            .where(pd.notna(timeline_df["temp_avg"]), None)
            .tolist(),
            "rain_min_mm": timeline_df["rain_min_mm"]
            .round(3)
            .where(pd.notna(timeline_df["rain_min_mm"]), None)
            .tolist(),
            "rain_max_mm": timeline_df["rain_max_mm"]
            .round(3)
            .where(pd.notna(timeline_df["rain_max_mm"]), None)
            .tolist(),
            "rain_avg_mm": timeline_df["rain_avg"]
            .round(3)
            .where(pd.notna(timeline_df["rain_avg"]), None)
            .tolist(),
        },
    }
    results.append(
        save_processed_json(
            dataset_name="chart_forecast_timeline",
            payload=timeline_payload,
            rows_in=len(df),
            rows_out=len(timeline_df),
        )
    )

    # 2) 过程标签统计：适合柱状图/词云
    text_series = df.get("tqqs", "").fillna("") + " " + df.get("zytqgc", "").fillna("")
    tag_items = []
    for tag in WEATHER_TAGS:
        count = int(text_series.str.count(re.escape(tag)).sum())
        tag_items.append({"tag": tag, "count": count})

    results.append(
        save_processed_json(
            dataset_name="chart_forecast_event_tags",
            payload={"items": tag_items},
            rows_in=len(df),
            rows_out=len(tag_items),
        )
    )

    return results
