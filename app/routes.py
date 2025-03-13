import json
import os
import logging
from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO
from dotenv import load_dotenv
from app.trading_bot import TradingBot

# Load environment variables
load_dotenv()

# Flask app setup
from app import app, socketio

# Logging setup
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

# Constants
USER_CONFIG_DIR = "user_configs"
AVAILABLE_BOTS = [
    {"name": "Simple Trade Bot", "type": "simple", "symbol": "ETHUSDT"},
    {"name": "DCA Bot", "type": "dca", "symbol": "BTCUSDT"}
]

# Ensure user config directory exists
os.makedirs(USER_CONFIG_DIR, exist_ok=True)

# ✅ User Authentication Routes
@app.before_request
def auto_login():
    if "user_id" not in session and os.getenv("FLASK_ENV") == "development":
        session["user_id"] = "default_user"

@app.route('/login', methods=['POST'])
def login():
    session["user_id"] = request.json.get("username", "default_user")
    return jsonify({"message": "Logged in"})

@app.route('/logout', methods=['POST'])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"})

# ✅ Bot Management Routes
def get_user_config():
    user_id = session.get("user_id", "default_user")
    user_file = os.path.join(USER_CONFIG_DIR, f"{user_id}.json")
    if os.path.exists(user_file):
        with open(user_file, "r") as f:
            return json.load(f)
    return {"bots": []}

def save_user_config(config):
    user_id = session.get("user_id", "default_user")
    user_file = os.path.join(USER_CONFIG_DIR, f"{user_id}.json")
    with open(user_file, "w") as f:
        json.dump(config, f, indent=4)

@app.route('/available_bots', methods=['GET'])
def available_bots():
    return jsonify(AVAILABLE_BOTS)

@app.route('/user_bots', methods=['GET'])
def user_bots():
    return jsonify(get_user_config()["bots"])

@app.route('/add_bot', methods=['POST'])
def add_bot():
    data = request.json
    bot_type = data.get('type')
    take_profit = data.get('take_profit')
    stop_loss = data.get('stop_loss')
    
    matching_bot = next((bot for bot in AVAILABLE_BOTS if bot["type"] == bot_type), None)
    if not matching_bot:
        return jsonify({"error": "Invalid bot type"}), 400
    
    user_config = get_user_config()
    user_config["bots"].append({
        "name": matching_bot["name"],
        "type": matching_bot["type"],
        "symbol": matching_bot["symbol"],
        "enabled": False,
        "take_profit": take_profit,
        "stop_loss": stop_loss
    })
    save_user_config(user_config)
    socketio.emit('update')
    return jsonify({"message": "Bot added successfully"})

@app.route('/place_order', methods=['POST'])
def place_order():
    data = request.json
    logging.debug(f"Received order request: {data}")
    
    symbol = data.get('symbol')
    side = data.get('side')
    order_type = data.get('order_type')
    quantity = float(data.get('quantity'))
    price = float(data.get('price')) if order_type == "Limit" else None
    
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400
    
    bot = TradingBot(symbol)
    result = bot.place_order(side, order_type, quantity, price)
    socketio.emit('update')
    return jsonify({"message": result})

@app.route('/delete_bot', methods=['POST'])
def delete_bot():
    data = request.json
    bot_name = data.get("name")
    user_config = get_user_config()
    user_config["bots"] = [bot for bot in user_config["bots"] if bot["name"] != bot_name]
    save_user_config(user_config)
    socketio.emit('update')
    return jsonify({"message": "Bot deleted successfully"})

@app.route('/bot_overview_data', methods=['GET'])
def bot_overview_data():
    user_config = get_user_config()
    total_bots = len(user_config["bots"])
    enabled_bots = sum(1 for bot in user_config["bots"] if bot.get("enabled", False))
    simple_bots = sum(1 for bot in user_config["bots"] if bot["type"] == "simple")
    dca_bots = sum(1 for bot in user_config["bots"] if bot["type"] == "dca")

    bot_status = []
    for bot in user_config["bots"]:
        instance = TradingBot(bot["symbol"])
        bot_status.append({
            "name": bot["name"],
            "enabled": bot["enabled"],
            "open_orders": len(instance.get_open_orders()),
            "open_positions": len(instance.get_open_positions()),
            "take_profit": bot.get("take_profit", "-"),
            "stop_loss": bot.get("stop_loss", "-")
        })

    return jsonify({
        "total_bots": total_bots,
        "enabled_bots": enabled_bots,
        "simple_bots": simple_bots,
        "dca_bots": dca_bots,
        "bots": bot_status
    })

@app.route('/status', methods=['GET'])
def status():
    bot = TradingBot("ETHUSDT")
    symbols = bot.get_symbols()
    return jsonify({"symbols": symbols})

# ✅ Flask Routes for UI
@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/bot_overview')
def bot_overview():
    return render_template('bot_overview.html')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
