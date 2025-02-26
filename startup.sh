python3 -m venv venv
source venv/bin/activate
pip install flask flask_cors
pip freeze > requirements.txt
pip install -r requirements.txt
pip install google-genai
python3 canify-backend/app.py
