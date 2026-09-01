from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "ml" / "models" / "scamshield_model.pkl"

class MLService:
    def __init__(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f'ML model not found at: {MODEL_PATH}'
            )

        self.model = joblib.load(MODEL_PATH)

    def predict(self, message: str) -> dict:
        prediction = self.model.predict([message])[0]
        probabilities = self.model.predict_proba([message])[0]

        class_probabilities = dict(
            zip(self.model.classes_, probabilities)
        )

        confidence = float(max(probabilities))

        return {
            "risk_level": prediction,
            "confidence": confidence,
            "probabilities": {
                label: float(probability)
                for label, probability in class_probabilities.items()
            },
        }

ml_service = MLService()