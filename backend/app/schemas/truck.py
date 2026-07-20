from pydantic import BaseModel

class TruckBase(BaseModel):
    plate_number: str
    status: str = "in_yard"
    location: str | None = None

class TruckCreate(TruckBase):
    pass


class TruckUpdate(BaseModel):
    plate_number: str | None = None
    status: str | None = None
    location: str | None=None

class Truckout(TruckBase):
    id: int
    class Config:
        from_attributes = True  # lets Pydantic read SQLAlchemy objects directly