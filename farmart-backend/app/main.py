from fastapi import FastAPI
from app.routes import auth, animals, orders, cart, payments
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Farmart API")

app.include_router(auth.router)
app.include_router(animals.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(payments.router)

@app.get("/")
def root():
    return {"status": "Farmart backend running"}
