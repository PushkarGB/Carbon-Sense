from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import numpy as np

def predict_projection(history):
    if len(history) < 2:
        return {"error": "Not enough data"}

    # Extract dates and values
    dates = [r["date"] for r in history]
    values = [r["total_emission"] for r in history]

    # Convert to numeric (0,1,2,...)
    X = np.array(range(len(values))).reshape(-1, 1)
    y = np.array(values)

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict next 7 days
    future_X = np.array(range(len(values), len(values)+7)).reshape(-1, 1)
    predictions = model.predict(future_X)

    # Generate future dates
    last_date = datetime.strptime(dates[-1], "%Y-%m-%d")

    projection = []
    for i, pred in enumerate(predictions, 1):
        next_date = (last_date + timedelta(days=i)).strftime("%Y-%m-%d")

        projection.append({
            "date": next_date,
            "value": round(float(pred), 2)
        })

    # Format history
    history_data = [
        {"date": d, "value": v} for d, v in zip(dates, values)
    ]

    return {
        "history": history_data,
        "projection": projection
    }