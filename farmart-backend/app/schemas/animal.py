from pydantic import BaseModel

class AnimalCreate(BaseModel):
    name: str
    type: str
    breed: str
    age: int
    price: float


class AnimalResponse(AnimalCreate):
    id: str
    available: bool

    class Config:
        from_attributes = True
