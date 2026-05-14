import os
import joblib
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from data.training_data import TRAINING_DATA

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')


def train_model():
    descriptions = [d for d, _ in TRAINING_DATA]
    labels = [c for _, c in TRAINING_DATA]

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5), lowercase=True)),
        ('clf', LogisticRegression(max_iter=1000, random_state=42)),
    ])
    pipeline.fit(descriptions, labels)
    joblib.dump(pipeline, MODEL_PATH)
    return pipeline


def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return train_model()


_model = None


def predict(description):
    global _model
    if _model is None:
        _model = load_model()
    proba = _model.predict_proba([description])[0]
    idx = proba.argmax()
    category = _model.classes_[idx]
    confidence = round(float(proba[idx]), 4)
    return category, confidence
