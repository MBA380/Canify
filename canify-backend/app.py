from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, supports_credentials=True)

GEMINI_SERVICE_URL = "https://dcf81f78eccf2620fcd1afc2787e1d0562e607b7-3000.dstack-prod5.phala.network/api/gemini"  # Update with your gemini.js service URL


@app.route("/api/cart-data", methods=["POST", "OPTIONS"])
def receive_cart_data():
    if request.method == "OPTIONS":
        response = jsonify({"status": "success"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    try:
        data = request.json
        product_names = []
        found_purchases = False

        for product in data.get("products", []):
            product_text = product.get("text", "").strip()
            if "Add to Cart" in product_text:
                found_purchases = True
            if not found_purchases:
                clean_name = product_text.split("\n")[0]
                if clean_name not in product_names:
                    product_names.append(clean_name)

        product_names = product_names[7:]

        # Send to Gemini service
        gemini_response = requests.post(
            GEMINI_SERVICE_URL, json={"product_names": product_names}
        )

        if gemini_response.status_code != 200:
            raise Exception("Gemini service error")

        analysis_data = gemini_response.json()

        response_data = {
            "status": "success",
            "product_names": product_names,
            "analysis": analysis_data.get("analysis", []),
        }

        response = jsonify(response_data)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
