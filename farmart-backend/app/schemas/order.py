from pydantic import BaseModel
from typing import List

class OrderItemCreate(BaseModel):
    animal_id: str
    quantity: int = 1

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    animal_id: str
    quantity: int
    price: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_price: float
    status: str
    paid: bool
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
