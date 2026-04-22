from datetime import datetime, timedelta

import numpy as np
from flask import Flask, jsonify, request
from sklearn.linear_model import LinearRegression

MODEL_VERSION = "ml_projection_linear_profile_v1"

app = Flask(__name__)


@app.route("/")
def home():
    return "Carbon Projection ML service is running"


@app.route("/health")
def health():
    return jsonify({"status": "ok", "model_version": MODEL_VERSION})


@app.route("/api/projections/score", methods=["POST"])
def score_projection():
    try:
        data = request.get_json(silent=True) or {}
        history = data.get("history", [])
        profile = data.get("profile", {})
        targets = data.get("targets", {})

        if len(history) < 7:
            return (
                jsonify(
                    {
                        "status": "insufficient_data",
                        "model_version": MODEL_VERSION,
                        "reason": "At least 7 records are required",
                    }
                ),
                200,
            )

        values = [float(r["total_emission"]) for r in history]
        dates = [r["date"] for r in history]

        base = float(
            profile.get("performance_metrics", {}).get(
                "current_avg_emission", values[-1]
            )
        )

        # Train simple trend model on full history.
        X = np.array(range(len(values))).reshape(-1, 1)
        y = np.array(values)
        model = LinearRegression()
        model.fit(X, y)

        raw_slope = float(model.coef_[0])

        reduction_percent = float(
            profile.get("performance_metrics", {}).get("reduction_percent", 0)
        )
        eco_action_score = float(
            profile.get("behavior_profile", {}).get("eco_action_score", 0)
        )
        emission_reduction_tasks = float(
            profile.get("task_stats", {}).get("emission_reduction", 0)
        )

        # Same multipliers used in backend fallback for stable behavior parity.
        reduction_factor = min(max(reduction_percent / 100, 0), 0.6) * 0.25
        eco_factor = min(max(eco_action_score / 10, 0), 0.5) * 0.15
        task_factor = min(max(emission_reduction_tasks / 100, 0), 0.5) * 0.1
        adjusted_slope = raw_slope * (1 - reduction_factor - eco_factor - task_factor)

        next_days = int(targets.get("next_days", 30))
        today = targets.get("today") or dates[-1]
        year_end_date = targets.get("year_end_date")

        today_dt = datetime.strptime(today, "%Y-%m-%d")

        next_30_days = []
        for offset in range(1, next_days + 1):
            date_dt = today_dt + timedelta(days=offset)
            pred = max(0.0, base + adjusted_slope * offset)
            next_30_days.append(
                {
                    "date": date_dt.strftime("%Y-%m-%d"),
                    "predicted_emission": round(float(pred), 2),
                }
            )

        if year_end_date is None:
            year_end_date = f"{today_dt.year}-12-31"
        year_end_dt = datetime.strptime(year_end_date, "%Y-%m-%d")
        days_to_year_end = max(0, (year_end_dt - today_dt).days)
        year_end_pred = max(0.0, base + adjusted_slope * days_to_year_end)

        return jsonify(
            {
                "status": "ready",
                "model_version": MODEL_VERSION,
                "next_30_days": next_30_days,
                "year_end_projection": {
                    "date": year_end_date,
                    "predicted_emission": round(float(year_end_pred), 2),
                },
            }
        )
    except Exception as e:
        return jsonify({"error": str(e), "status": "failed"}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=False)