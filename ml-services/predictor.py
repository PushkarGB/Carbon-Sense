import joblib
import numpy as np

# Load model
model = joblib.load("carbon_model.pkl")

def predict_carbon(data):   
    features = np.array([[
        data["distance_km"],
        data["vehicle_type"],
        data["ac_hours"],
        data["diet_type"],
        data["recycling"]
    ]])

    prediction = model.predict(features)

    return prediction[0]