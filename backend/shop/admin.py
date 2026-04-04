from .enums import AccountRole
from .user import Account, User

class Admin(User):
    def __init__(self, firstName: str, lastName: str, email: str, username: str, password: str):
        super(
            firstName=firstName,
            lastName=lastName,
            email=email,
            role=AccountRole.ADMIN, 
            account=Account(email=email, password=password)
        )
    
    def update_sales_history():
        pass

    def updateInventory():
        pass

    def updateUserAccounts():
        pass