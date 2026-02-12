from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.animal import Animal
from app.schemas.animal import AnimalCreate, AnimalResponse
from app.core.dependencies import get_current_user, farmer_only
from app.models.user import User
from typing import List

router = APIRouter(prefix="/animals", tags=["Animals"])


@router.post("/", response_model=AnimalResponse)
def create_animal(
    animal: AnimalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(farmer_only)
):
    new_animal = Animal(
        **animal.dict(),
        farmer_id=current_user.id
    )
    db.add(new_animal)
    db.commit()
    db.refresh(new_animal)
    return new_animal


@router.get("/", response_model=List[AnimalResponse])
def list_animals(
    type: str = None,
    breed: str = None,
    age: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Animal).filter(Animal.available == True)

    if type:
        query = query.filter(Animal.type.ilike(f"%{type}%"))
    if breed:
        query = query.filter(Animal.breed.ilike(f"%{breed}%"))
    if age:
        query = query.filter(Animal.age == age)

    return query.all()


@router.put("/{animal_id}", response_model=AnimalResponse)
def update_animal(
    animal_id: str,
    animal: AnimalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(farmer_only)
):
    db_animal = db.query(Animal).filter(
        Animal.id == animal_id,
        Animal.farmer_id == current_user.id
    ).first()

    if not db_animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    for key, value in animal.dict().items():
        setattr(db_animal, key, value)

    db.commit()
    db.refresh(db_animal)
    return db_animal


@router.delete("/{animal_id}")
def delete_animal(
    animal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(farmer_only)
):
    animal = db.query(Animal).filter(
        Animal.id == animal_id,
        Animal.farmer_id == current_user.id
    ).first()

    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    db.delete(animal)
    db.commit()
    return {"message": "Animal deleted"}
