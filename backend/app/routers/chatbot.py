# app/routers/chatbot.py
import re
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from ..database.database import get_db
from ..database import models

router = APIRouter(prefix="/chat", tags=["chatbot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    q = req.message.lower().strip()
    id_match = re.search(r"\b[A-Z]{4}\d{7}\b", req.message.upper())

    if id_match:
        cid = id_match.group()
        container = db.query(models.Container).filter(models.Container.container_number == cid).first()
        if not container:
            return {"reply": f"No record found for {cid}."}
        return {"reply": f"{cid} — status: {container.status}, location: {container.location or 'unknown'}."}

    if any(w in q for w in ["how many", "total", "count"]):
        total = db.query(func.count(models.Container.id)).scalar()
        return {"reply": f"There are {total} containers currently tracked."}

    if any(w in q for w in ["recent", "latest", "last"]):
        recent = db.query(models.Container).order_by(models.Container.id.desc()).limit(3).all()
        if not recent:
            return {"reply": "No containers recorded yet."}
        lines = [f"{c.container_number} ({c.status})" for c in recent]
        return {"reply": "Most recent: " + ", ".join(lines)}

    if any(w in q for w in ["in yard", "on truck", "on ship"]):
        for status_key in ["in_yard", "on_truck", "on_ship"]:
            if status_key.replace("_", " ") in q:
                count = db.query(func.count(models.Container.id)).filter(models.Container.status == status_key).scalar()
                return {"reply": f"{count} containers are currently '{status_key.replace('_', ' ')}'."}

    return {"reply": "I can answer questions about a specific container ID (e.g. 'MSCU1234567'), the total count, recent containers, or containers by status."}