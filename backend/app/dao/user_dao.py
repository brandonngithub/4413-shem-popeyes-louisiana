from sqlalchemy.orm import Session

from app import models


class UserDAO:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100):
        return self.db.query(models.User).offset(skip).limit(limit).all()

    def get(self, user_id: int):
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def get_by_email(self, email: str):
        return self.db.query(models.User).filter(models.User.email == email).first()

    def create(self, values: dict):
        u = models.User(**values)
        self.db.add(u)
        self.db.commit()
        self.db.refresh(u)
        return u

    def patch(self, user: models.User, patch: dict):
        for key, val in patch.items():
            setattr(user, key, val)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: models.User):
        self.db.delete(user)
        self.db.commit()
