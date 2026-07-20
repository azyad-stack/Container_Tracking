from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database import models
from ..schemas.truck import TruckBase,TruckCreate,Truckout,TruckUpdate

router = APIRouter(prefix="/trucks", tags=["trucks"])


@router.get("/", response_model=list[Truckout])
def get_trucks(search: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Truck)
    if search:
        query = query.filter(models.Truck.plate_number.ilike(f"%{search}"))
    return query.all()

@router.get("/{truck_plate_number}", response_model=Truckout)

def get_truck(platenumber: int, db: Session = Depends(get_db)):
    truck = db.query(models.Truck).filter(models.Truck.plate_number == platenumber)
    if not truck:
        HTTPException(status_code=404, detail="Truck Not found")
    return truck


@router.post("/", response_model=Truckout, status_code=201)
def create_truck(payload: TruckCreate, db: Session=Depends(get_db)):
    truck = models.Truck(**payload.model_dump())
    db.add(truck)
    db.commit()
    db.refresh(truck)
    return truck

@router.put("/{truck_plate_number}", response_model=Truckout)
def update_truck(plate_number: int,payload: Truckout,db: Session=Depends(get_db)):
    truck = db.query(models.Truck).filter(models.Truck.plate_number==plate_number).first()

    if not truck:
        raise HTTPException(status_code=404, detail="truck not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(truck, field, value)
    db.commit()
    db.refresh(truck)
    return truck
    

@router.delete("/{truck_plate_number}", status_code=204)
def delete_truck(plate_number: int, db: Session = Depends(get_db)):
    truck = db.query(models.Truck).filter(models.Truck.plate_number == plate_number).first()
    if not plate_number:
        raise HTTPException(status_code=404, detail="ship not found")
    db.delete(plate_number)
    db.commit()