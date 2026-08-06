# app/main.py
from fastapi import FastAPI
from .database.database import Base, engine
from .routers import chat, chatbot, container, detection
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)  # creates tables if they don't exist

app = FastAPI(title="Container Tracker")
app.include_router(detection.router)
app.include_router(container.router)
app.include_router(chatbot.router)
app.include_router(chat.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
