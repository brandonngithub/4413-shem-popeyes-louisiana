import threading
from collections import defaultdict
from typing import Dict, List

from shop.order_line_item import OrderLineItem
from shop.product import Product

from microservices.exceptions import OutOfStockException

class InventoryService:
    def __init__(self):
        self.stock: Dict[str, int] = defaultdict(int)
        self.lock = threading.Lock()

    def add_stock(self, product: Product, quantity: int) -> None:
        with self.lock:
            self.stock[product.get_id()] += quantity

    def update_stock_for_order(self, items: List[OrderLineItem]) -> None:
        with self.lock:
            # First, check if all items are in stock
            for item in items:
                if self.stock[item.get_product_id()] < item.get_quantity():
                    raise OutOfStockException(f"Not enough stock for product ID: {item.get_product_id()}")
            
            # If all checks pass, deduct the stock
            for item in items:
                self.stock[item.get_product_id()] -= item.get_quantity()