from pydantic import BaseModel

class ShipBase(BaseModel):
    ship_number: str
    status: str = "in_yard"
    location: str | None = None

class ShipCreate(ShipBase):
    pass


class ShipUpdate(BaseModel):
    ship_number: str | None = None
    status: str | None = None
    location: str | None=None

class Shipout(ShipBase):
    id: int
    class Config:
        from_attributes = True  # lets Pydantic read SQLAlchemy objects directly