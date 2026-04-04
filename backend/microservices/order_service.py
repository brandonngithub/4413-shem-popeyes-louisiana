from shop.customer import Customer
from shop.order import Order
from shop.order_line_item import OrderLineItem
from shop.shopping_cart import ShoppingCart

from microservices.inventory_service import InventoryService


class OrderService:
    def __init__(self, inventory_service: InventoryService):
        self.inventory_service = inventory_service

    def create_order(self, customer: Customer, cart: ShoppingCart) -> Order:
        order_items = [
            OrderLineItem(
                cart_item.get_product().get_id(),
                cart_item.get_product().get_name(),
                cart_item.get_quantity(),
                cart_item.get_product().get_price()
            )
            for cart_item in cart.get_items().values()
        ]

        self.inventory_service.update_stock_for_order(order_items)

        return Order(customer, order_items, customer.get_shipping_address(), cart.calculate_total())