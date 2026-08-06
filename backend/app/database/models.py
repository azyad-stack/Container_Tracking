from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, func
from .database import Base


class Container(Base):
    __tablename__ = "containers"
    id = Column(Integer, primary_key=True, index=True)
    container_number = Column(String, unique=True, index=True)
    status = Column(String, default="in_yard")  # in_yard, on_truck, on_ship
    location = Column(String, nullable=True)


class DetectionHistory(Base):
    __tablename__ = "detection_history"
    id = Column(Integer, primary_key=True, index=True)
    container_number = Column(String, nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    verified = Column(Boolean, default=True, nullable=False)
    detected_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
