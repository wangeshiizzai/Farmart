from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.animal import Animal
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse
from app.core.dependencies import get_current_user, farmer_only

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "USER":
        raise HTTPException(status_code=403, detail="Only users can create orders")

    total_price = 0
    order_items = []

    for item in order_data.items:
        animal = db.query(Animal).filter(Animal.id == item.animal_id, Animal.available == True).first()
        if not animal:
            raise HTTPException(status_code=404, detail=f"Animal {item.animal_id} not available")

        total_price += animal.price * item.quantity
        order_items.append(OrderItem(animal_id=animal.id, quantity=item.quantity, price=animal.price))

    new_order = Order(user_id=current_user.id, total_price=total_price, items=order_items)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/my", response_model=List[OrderResponse])
def get_my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "USER":
        raise HTTPException(status_code=403, detail="Only users can view their orders")
    return db.query(Order).filter(Order.user_id == current_user.id).all()

@router.get("/incoming", response_model=List[OrderResponse])
def get_incoming_orders(db: Session = Depends(get_db), current_user: User = Depends(farmer_only)):
    orders = db.query(Order).join(Order.items).join(Animal).filter(Animal.farmer_id == current_user.id).all()
    return orders

@router.put("/{order_id}/confirm", response_model=OrderResponse)
def confirm_order(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(farmer_only)):
    order = db.query(Order).join(Order.items).join(Animal).filter(
        Order.id == order_id,
        Animal.farmer_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not order.paid:
        raise HTTPException(status_code=400, detail="Cannot confirm unpaid order")

    for item in order.items:
        animal = db.query(Animal).filter(Animal.id == item.animal_id).first()
        if animal:
            animal.available = False
    
    for item in order.items:
        conflicting_orders = db.query(Order).join(Order.items).filter(
            Order.id != order.id,
            Order.status == "PENDING",
            Order.paid == True,
            OrderItem.animal_id == item.animal_id
        ).all()
        for co in conflicting_orders:
            co.status = "REJECTED"

    order.status = "CONFIRMED"
    db.commit()
    db.refresh(order)
    return order


@router.put("/{order_id}/reject", response_model=OrderResponse)
def reject_order(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(farmer_only)):
    order = db.query(Order).join(Order.items).join(Animal).filter(Order.id == order_id, Animal.farmer_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "REJECTED"
    db.commit()
    db.refresh(order)
    return order
