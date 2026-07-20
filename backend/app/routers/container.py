# app/routers/container.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database import models
from ..schemas.container import ContainerCreate, ContainerUpdate, ContainerOut

router = APIRouter(prefix="/containers", tags=["containers"])

@router.get("/", response_model=list[ContainerOut])
def get_containers(search: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Container)
    if search:
        query = query.filter(models.Container.container_number.ilike(f"%{search}%"))
    return query.all()

@router.get("/{container_id}", response_model=ContainerOut)
def get_container(container_id: int, db: Session = Depends(get_db)):
    container = db.query(models.Container).filter(models.Container.id == container_id).first()
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")
    return container

@router.post("/", response_model=ContainerOut, status_code=201)
def create_container(payload: ContainerCreate, db: Session = Depends(get_db)):
    container = models.Container(**payload.model_dump())
    db.add(container)
    db.commit()
    db.refresh(container)
    return container

@router.put("/{container_id}", response_model=ContainerOut)
def update_container(container_id: int, payload: ContainerUpdate, db: Session = Depends(get_db)):
    container = db.query(models.Container).filter(models.Container.id == container_id).first()
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(container, field, value)
    db.commit()
    db.refresh(container)
    return container

@router.delete("/{container_id}", status_code=204)
def delete_container(container_id: int, db: Session = Depends(get_db)):
    container = db.query(models.Container).filter(models.Container.id == container_id).first()
    if not container:
        raise HTTPException(status_code=404, detail="Container not found")
    db.delete(container)
    db.commit()