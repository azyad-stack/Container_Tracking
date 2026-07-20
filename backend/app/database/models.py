from sqlalchemy import Column, Integer, String
from .database import Base



class Container(Base):
    __tablename__ = "containers"
    id = Column(Integer, primary_key=True, index=True)
    container_number = Column(String, unique=True, index=True)
    status = Column(String, default="in_yard")  # in_yard, on_truck, on_ship
    location = Column(String, nullable=True)

class Truck(Base):
    __tablename__ = "trucks"
    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String, unique=True, index=True)
    driver_name = Column(String, nullable=True)
    status = Column(String, default="available")  # available, on_delivery

class Ship(Base):
    __tablename__ = "ships"
    id = Column(Integer, primary_key=True, index=True)
    Ship_number = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    status = Column(String, default="at_sea")  # at_sea, docked