from datetime import datetime

from pydantic import BaseModel


class DetectionHistoryRead(BaseModel):
    id: int
    container_number: str
    confidence: float
    verified: bool
    detected_at: datetime

    class Config:
        from_attributes = True
