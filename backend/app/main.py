# app/main.py
from fastapi import FastAPI
from .database.database import Base, engine
from .routers import container, truck, ship,detection
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)  # creates tables if they don't exist

app = FastAPI(title="Container Tracker")
app.include_router(detection.router)
app.include_router(container.router)
app.include_router(truck.router)
app.include_router(ship.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)