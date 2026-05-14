from flask import Flask, jsonify, request
from model import predict, load_model

app = Flask(__name__)

# Load (or train) model at startup
load_model()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "ml-service"})


@app.route('/predict', methods=['POST'])
def predict_category():
    body = request.get_json(silent=True)
    if not body or not body.get('description'):
        return jsonify({"error": "description is required"}), 400

    category, confidence = predict(body['description'])
    return jsonify({"category": category, "confidence": confidence})


if __name__ == '__main__':
    app.run(port=5001, debug=False)
