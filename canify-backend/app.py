import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai

# Read API_KEY and save as API_KEY
with open("API_KEY.txt", "r") as file:
    API_KEY = file.readline().rstrip()

client = genai.Client(api_key=API_KEY)

app = Flask(__name__)


# Allow all origins for testing
CORS(app, supports_credentials=True)

# Create data directory if it doesn't exist
DATA_DIR = os.path.join(os.path.dirname(__file__), "cart_data")
os.makedirs(DATA_DIR, exist_ok=True)


@app.route("/api/cart-data", methods=["POST", "OPTIONS"])
def receive_cart_data():
    # Handle preflight request
    if request.method == "OPTIONS":
        response = jsonify({"status": "success"})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    try:
        data = request.json
        product_names = []
        found_purchases = False  # Flag to track if "Your Items" section has started

        for product in data.get("products", []):
            product_text = product.get("text", "").strip()

            # If "Add to Cart" appears, we've reached the "Your Items" section
            if "Add to Cart" in product_text:
                found_purchases = True

            # If we haven't reached "Your Items", keep adding products
            if not found_purchases:
                # Extract product name by keeping only the first line (before the first newline)
                clean_name = product_text.split("\n")[0]

                # Avoid duplicates
                if clean_name not in product_names:
                    product_names.append(clean_name)

        # trimming the non-cart items
        product_names = product_names[7:]

        # Log extracted product names
        for i, product in enumerate(product_names):
            print(f"NUMBER {i + 1}. {product}")

        input1 = "Input: Item from shop. Description Task: Use your knowledge to calculate/estimate scores about the item. Make sure all scores are UNIQUE, PRECISE, and not ROUNDED! :Canadiability Score (out of 100) Magnitude of it being a canadian product, supporting canadian businesses. !! Generic products should have a higher score than non-Canadian nationalistic products!! :Sustainabiliy and Ethical Score (single number out of 100) How ethically made is the product. :Value Score (single number out of 100) How much of a good value it is out of 100. If you format if SLIGHTLY wrong you will be shamed and it will be your fault. Output (enclosed in <<< >>>) <<< @@Name summarized in ~10 words @@@ Canadian Score @@@ Sus and Ethical Score @@@ Value Score @@@ 8 word Short summarized description that either shames the user for buying american, or praises the user for buying canadian. Write this short summary in a witty way @@@ a link to a QUERY of similiar item on amazon THAT IS CANADIAN MADE. e.g. https://www.amazon.ca/s?k=canadian+maple+syrup @@@@ (No explicit links, only searches - be sure to enclose links in @@@@)  @@@@@  >>>    For example, enclosed in <<<>>>, <<< Product 1 @@ 5 @@ 7 @@ 10 @@ This product is canadian made, ethically sorced, good job! @@ link (or %) @@@@@@@@@ Product 2 @@ 5 @@ 7 @@ 10 @@ This product is canadian made, ethically sorced, good job! @@ link or % @@ Product 3 @@ 5 @@ 7 @@ 10 @@ This product is canadian made, ethically sorced, good job! @@ LINK OR % >>> DO NOT DEVIATE OR ELSE IT WILL FAIL AND IT WILL BE ALL YOUR FAULT. DO NOT FORMAT IT. PUT IT ALL IN A TEXT BLOCK. DO NOT NUMBER ANY OF IT. DO NOT FORGET TO PUT ANY @@@ (Hint: Between every little section, put @@@). Failure to do so will result in your demise FOLLOW THE ORDER AND FORMAT EXACTLY OR ELSE I WILL SUFFER. WHO WILL SUFFER AS WELL? You."

        input1 += f"\nCart Items: {str(product_names)}"

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=input1,
        )

        response_text = str(response.text)

        response_text = (
            response_text.replace("\n", "")
            .replace("`", "")
            .replace("<", "")
            .replace(">", "")
            .replace("N/A", "%")
        )
        print(response_text)

        if response_text[:4].lower() == "text":
            response_text = response_text[4:]

        response_parts = response_text.split("@")

        response_parts = [part.strip() for part in response_parts if part.strip()]

        # Split response into 2D array where each row has 5 elements
        response_matrix = [
            response_parts[i : i + 6] for i in range(0, len(response_parts), 6)
        ]

        print(response_matrix)
        response_data = {
            "status": "success",
            "product_names": product_names,
            "analysis": response_matrix,  # Add the processed response matrix to the response
        }

        response = jsonify(response_data)
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
