from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.cart import Cart, CartItem
from app.models.animal import Animal
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartResponse, CartItemResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.post("/add", response_model=CartResponse)
def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "USER":
        raise HTTPException(status_code=403, detail="Only users can have a cart")

    # Get or create cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Check if item already in cart
    cart_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.animal_id == item.animal_id).first()
    if cart_item:
        cart_item.quantity += item.quantity
    else:
        animal = db.query(Animal).filter(Animal.id == item.animal_id, Animal.available == True).first()
        if not animal:
            raise HTTPException(status_code=404, detail="Animal not available")
        cart_item = CartItem(cart_id=cart.id, animal_id=item.animal_id, quantity=item.quantity)
        db.add(cart_item)

    db.commit()

    return get_cart_response(cart, db)

@router.get("/", response_model=CartResponse)
def view_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "USER":
        raise HTTPException(status_code=403, detail="Only users can have a cart")

    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        return {"items": [], "total_price": 0}

    return get_cart_response(cart, db)

@router.put("/update", response_model=CartResponse)
def update_cart(item: CartItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.animal_id == item.animal_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if item.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = item.quantity

    db.commit()
    return get_cart_response(cart, db)

def get_cart_response(cart: Cart, db: Session):
    items = []
    total = 0
    for ci in cart.items:
        animal = db.query(Animal).filter(Animal.id == ci.animal_id).first()
        if not animal:
            continue
        total += animal.price * ci.quantity
        items.append(CartItemResponse(
            animal_id=str(animal.id),
            name=animal.name,
            price=animal.price,
            quantity=ci.quantity
        ))
    return CartResponse(items=items, total_price=total)

from app.models.order import Order, OrderItem

@router.post("/checkout", response_model=CartResponse)
def checkout_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or len(cart.items) == 0:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items = []
    total_price = 0
    for ci in cart.items:
        animal = db.query(Animal).filter(Animal.id == ci.animal_id, Animal.available == True).first()
        if not animal:
            raise HTTPException(status_code=404, detail=f"Animal {ci.animal_id} not available")

        total_price += animal.price * ci.quantity
        order_items.append(OrderItem(animal_id=animal.id, quantity=ci.quantity, price=animal.price))

    order = Order(user_id=current_user.id, total_price=total_price, items=order_items)
    db.add(order)

    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()

    return {"items": [], "total_price": 0}
