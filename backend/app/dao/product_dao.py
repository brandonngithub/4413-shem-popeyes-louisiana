from sqlalchemy.orm import Session

from app import models


class ProductDAO:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100):
        return self.db.query(models.Product).offset(skip).limit(limit).all()

    def get(self, product_id: int):
        return self.db.query(models.Product).filter(models.Product.id == product_id).first()

    def create(self, values: dict):
        p = models.Product(**values)
        self.db.add(p)
        self.db.commit()
        self.db.refresh(p)
        return p

    def update(self, product: models.Product, values: dict):
        for key, value in values.items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product: models.Product):
        self.db.delete(product)
        self.db.commit()
