from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database import models
from ..schemas.ship import ShipBase,ShipCreate,Shipout,ShipUpdate


router = APIRouter(prefix="/ships", tags=["ships"])


@router.get("/", response_model=list[Shipout])
def get_ships(seach: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Ship)
    if seach:
        query = query.filter(models.Ship.Ship_number.ilike(f"%{seach}"))
    return query.all()

@router.get("/{ship_id}", response_model=Shipout)

def get_ship(ship_id: int, db: Session = Depends(get_db)):
    ship = db.query(models.Ship).filter(models.Ship.id == ship_id)
    if not ship:
        HTTPException(status_code=404, detail="Ship Not found")
    return ship


@router.post("/", response_model=Shipout, status_code=201)
def create_ship(payload: ShipCreate, db: Session=Depends(get_db)):
    ship = models.Ship(**payload.model_dump())
    db.add(ship)
    db.commit()
    db.refresh(ship)
    return ship

@router.put("/{ship_id}", response_model=Shipout)
def update_ship(ship_id: int,payload: ShipUpdate,db: Session=Depends(get_db)):
    ship = db.query(models.Ship).filter(models.Ship.id==ship_id).first()

    if not ship:
        raise HTTPException(status_code=404, detail="ship not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ship, field, value)
    db.commit()
    db.refresh(ship)
    return ship
    

@router.delete("/{ship_id}", status_code=204)
def delete_container(ship_id: int, db: Session = Depends(get_db)):
    ship = db.query(models.Ship).filter(models.Ship.id == ship_id).first()
    if not ship:
        raise HTTPException(status_code=404, detail="ship not found")
    db.delete(ship)
    db.commit()