from fastapi import FastAPI
from app.api.routes import auth, animals, orders, payments

app = FastAPI(title="Farmart API")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(animals.router, prefix="/animals", tags=["Animals"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])


@app.get("/")
def root():
    return {"message": "Farmart backend running"}