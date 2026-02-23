"""空气优良天数：图表最终数据二次处理。"""

from __future__ import annotations

import pandas as pd

from common import ProcessResult, load_cleaned_json, save_processed_json, to_numeric


def process_air_quality_charts() -> list[ProcessResult]:
    """生成空气优良天数相关图表最终数据。"""
    df = load_cleaned_json("air_quality_good_days")
    if df.empty:
        return []

    # 关键字段转数值
    df = to_numeric(
        df,
        [
            "month",
            "year",
            "youdetianshu",
            "liangdetianshu",
            "chaobiaotianshu",
            "total_days",
        ],
    )
    df["period_date"] = pd.to_datetime(df.get("period_date"), errors="coerce")

    results: list[ProcessResult] = []

    # 1) 月度堆叠柱数据：按 month 聚合
    month_df = (
        df[df["month"].between(1, 12, inclusive="both")].copy()
        if "month" in df.columns
        else pd.DataFrame()
    )
    if not month_df.empty:
        month_group = (
            month_df.groupby("month", as_index=False)[
                ["youdetianshu", "liangdetianshu", "chaobiaotianshu"]
            ]
            .sum(min_count=1)
            .fillna(0)
            .sort_values(by=["month"], kind="stable")
        )
        month_group["total_days"] = (
            month_group["youdetianshu"]
            + month_group["liangdetianshu"]
            + month_group["chaobiaotianshu"]
        )
        month_group["good_rate"] = (
            month_group["youdetianshu"] / month_group["total_days"]
        ).replace([pd.NA, float("inf")], 0)

        payload = {
            "xAxis": month_group["month"].astype(int).tolist(),
            "series": {
                "good_days": month_group["youdetianshu"].round(2).tolist(),
                "moderate_days": month_group["liangdetianshu"].round(2).tolist(),
                "exceed_days": month_group["chaobiaotianshu"].round(2).tolist(),
                "good_rate": month_group["good_rate"].round(4).tolist(),
            },
        }
        results.append(
            save_processed_json(
                dataset_name="chart_air_quality_monthly",
                payload=payload,
                rows_in=len(df),
                rows_out=len(month_group),
            )
        )

    # 2) 时间序列与累计曲线：按日期聚合
    date_df = df[df["period_date"].notna()].copy()
    if not date_df.empty:
        date_group = (
            date_df.groupby(date_df["period_date"].dt.date, as_index=False)[
                ["youdetianshu", "liangdetianshu", "chaobiaotianshu"]
            ]
            .sum(min_count=1)
            .fillna(0)
        )
        date_group = date_group.rename(columns={"period_date": "date"})
        date_group = date_group.sort_values(by=["date"], kind="stable")
        date_group["good_days_cum"] = date_group["youdetianshu"].cumsum()
        date_group["moderate_days_cum"] = date_group["liangdetianshu"].cumsum()
        date_group["exceed_days_cum"] = date_group["chaobiaotianshu"].cumsum()

        payload = {
            "xAxis": [str(d) for d in date_group["date"].tolist()],
            "series": {
                "good_days": date_group["youdetianshu"].round(2).tolist(),
                "moderate_days": date_group["liangdetianshu"].round(2).tolist(),
                "exceed_days": date_group["chaobiaotianshu"].round(2).tolist(),
                "good_days_cum": date_group["good_days_cum"].round(2).tolist(),
                "moderate_days_cum": date_group["moderate_days_cum"].round(2).tolist(),
                "exceed_days_cum": date_group["exceed_days_cum"].round(2).tolist(),
            },
        }
        results.append(
            save_processed_json(
                dataset_name="chart_air_quality_timeline",
                payload=payload,
                rows_in=len(df),
                rows_out=len(date_group),
            )
        )

    # 3) 数据质量概览：用于异常提示面板
    quality = {
        "rows": int(len(df)),
        "invalid_month_rows": (
            int((~df["month"].between(1, 12, inclusive="both")).sum())
            if "month" in df.columns
            else 0
        ),
        "total_gt_31_rows": int(
            (df.get("total_days", pd.Series(dtype=float)) > 31).sum()
        ),
        "missing_exceed_rows": int(
            df.get("chaobiaotianshu", pd.Series(dtype=float)).isna().sum()
        ),
    }
    results.append(
        save_processed_json(
            dataset_name="chart_air_quality_quality",
            payload=quality,
            rows_in=len(df),
            rows_out=1,
        )
    )

    return results
