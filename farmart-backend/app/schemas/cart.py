from pydantic import BaseModel
from typing import List

class CartItemCreate(BaseModel):
    animal_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    animal_id: str
    name: str
    price: float
    quantity: int

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_price: float
