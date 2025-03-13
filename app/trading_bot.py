import json
import os
import logging
from pybit.unified_trading import HTTP
from app.config import API_KEY, API_SECRET

class TradingBot:
    def __init__(self, symbol, base_order_size=0.001, safety_order_size=0.001, dca_levels=3, price_deviation=1.5, take_profit=2.0, stop_loss=5.0, max_safety_orders=2, trailing_tp=False):
        self.symbol = symbol
        self.base_order_size = base_order_size
        self.safety_order_size = safety_order_size
        self.dca_levels = dca_levels
        self.price_deviation = price_deviation / 100  # Convert % to decimal
        self.take_profit = take_profit / 100
        self.stop_loss = stop_loss / 100
        self.max_safety_orders = max_safety_orders
        self.trailing_tp = trailing_tp
        self.session = HTTP(
            testnet=True,
            api_key=API_KEY,
            api_secret=API_SECRET
        )
        self.orders = []  # Track placed orders

    def place_order(self, side, order_type, quantity, price=None):
        if not self.symbol:
            return "Please select a symbol first."

        order_params = {
            "category": "spot",
            "symbol": self.symbol,
            "side": side,
            "orderType": order_type,
            "qty": str(quantity),
            "timeInForce": "GTC"
        }

        if order_type == "Limit" and price:
            order_params["price"] = str(price)

        logging.debug(f"Placing order with params: {order_params}")

        try:
            response = self.session.place_order(**order_params)
            logging.debug(f"Order response: {response}")
            self.orders.append(response)
            return f"Order placed: {response}"
        except Exception as e:
            logging.error(f"Error placing order: {str(e)}")
            return f"Error placing order: {str(e)}"

    def execute_dca_strategy(self, initial_price):
        """Executes DCA buy orders at predefined levels."""
        if not self.symbol:
            return "Symbol not selected."

        try:
            for i in range(self.dca_levels):
                dca_price = initial_price * (1 - (self.price_deviation * (i + 1)))
                size = self.base_order_size if i == 0 else self.safety_order_size

                response = self.place_order("Buy", "Limit", size, dca_price)
                logging.debug(f"DCA Order {i+1}: {response}")
                
                if len(self.orders) >= self.max_safety_orders:
                    logging.debug("Max safety orders reached, stopping DCA execution.")
                    break
            return "DCA strategy executed."
        except Exception as e:
            logging.error(f"Error executing DCA strategy: {str(e)}")
            return f"Error executing DCA strategy: {str(e)}"

    def check_take_profit_stop_loss(self, entry_price, current_price):
        """Monitors price levels and triggers TP or SL exits."""
        tp_price = entry_price * (1 + self.take_profit)
        sl_price = entry_price * (1 - self.stop_loss)

        if current_price >= tp_price:
            return self.place_order("Sell", "Market", self.base_order_size)
        elif current_price <= sl_price:
            return self.place_order("Sell", "Market", self.base_order_size)
        return "No TP/SL triggered."

    def get_open_orders(self):
        try:
            response = self.session.get_open_orders(category="spot", symbol=self.symbol)
            return response.get('result', {}).get('list', [])
        except Exception:
            return []

    def get_open_positions(self):
        try:
            response = self.session.get_positions(category="spot", symbol=self.symbol)
            return response.get('result', {}).get('list', [])
        except Exception:
            return []

    def cancel_order(self, order_id):
        try:
            response = self.session.cancel_order(category="spot", orderId=order_id)
            return f"Order Canceled: {response}"
        except Exception as e:
            return f"Error canceling order: {str(e)}"
    
    def get_symbols(self):
        try:
            response = self.session.get_instruments_info(category="spot")
            return [item["symbol"] for item in response.get("result", {}).get("list", [])]
        except Exception as e:
            logging.error(f"Error fetching symbols: {str(e)}")
            return []
