from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..database import models

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessageRead(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

    class Config:
        from_attributes = True


@router.get("/history", response_model=List[ChatMessageRead])
def get_history(db: Session = Depends(get_db), limit: int = 50):
    messages = (
        db.query(models.ChatMessage)
        .order_by(models.ChatMessage.created_at.asc())
        .limit(limit)
        .all()
    )
    return messages
