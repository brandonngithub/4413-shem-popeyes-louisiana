from .address import Address
from .enums import AccountRole
from .order_observer import OrderObserver
from .shopping_cart import ShoppingCart
from .user import Account, User


class Customer(User, OrderObserver):
    def __init__(self, firstName: str, lastName: str, email: str, username: str, password: str, address: Address):
        super(
            firstName=firstName, 
            lastName=lastName, 
            email=email, 
            role=AccountRole.Customer, 
            account=Account(email=email, password=password)
        )
        self.shipping_address = address
        self.shopping_cart = ShoppingCart()
    
    def get_cart(self) -> ShoppingCart:
        return self.shopping_cart

    def get_shipping_address(self) -> Address:
        return self.shipping_address

    def update(self, order) -> None:
        pass