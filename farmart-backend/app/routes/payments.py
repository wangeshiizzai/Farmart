from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/pay/{order_id}")
def pay_order(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "USER":
        raise HTTPException(status_code=403, detail="Only users can pay for orders")

    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.paid:
        raise HTTPException(status_code=400, detail="Order already paid")

    # Simulate payment logic
    order.paid = True
    db.commit()
    db.refresh(order)

    return {"message": "Payment successful", "order_id": order.id, "total_paid": order.total_price}

@router.get("/status/{order_id}")
def payment_status(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Farmer can see payment status of orders for their animals
    if current_user.role == "FARMER":
        if not any(item.animal.farmer_id == current_user.id for item in order.items):
            raise HTTPException(status_code=403, detail="Not your order")
    
    # User can also check their own orders
    elif current_user.role == "USER":
        if order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your order")

    return {"order_id": order.id, "paid": order.paid, "status": order.status}

