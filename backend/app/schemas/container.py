# app/schemas/container.py
from pydantic import BaseModel

class ContainerBase(BaseModel):
    container_number: str
    status: str = "in_yard"
    location: str | None = None

class ContainerCreate(ContainerBase):
    pass


class ContainerUpdate(BaseModel):
    container_number: str | None = None
    status: str | None = None
    location: str | None=None
# the response schemas 
class ContainerOut(ContainerBase):
    id: int
    class Config:
        from_attributes = True  # That from_attributes = True line is the other piece: it tells Pydantic "you're allowed to build this schema by reading attributes off a SQLAlchemy object
        #Response schemas decouple my internal database structure from my public API contract — I can change the database without automatically changing what clients see, and vice versa