from flask import Flask
from flask_socketio import SocketIO
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "fallback_default")

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins=["https://yourdomain.com"])

# Import routes after initializing app & socketio
from app import routes
