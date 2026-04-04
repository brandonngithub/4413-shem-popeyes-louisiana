import uuid
from abc import ABC

from .enums import AccountRole

class Account:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password_hash = hash(password)

class User(ABC):
    def __init__(self, firstName: str, lastName: str, email: str, role: AccountRole, account: Account):
        self.id = str(uuid.uuid4())
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.role = role
        self.account = account