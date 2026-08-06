import logging

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from ..database.database import get_db
from ..database import models
from ..schemas.detection import DetectionHistoryRead
from ..services.detection_service import detect_container_id

router = APIRouter(prefix="/detect", tags=["detection"])
logger = logging.getLogger(__name__)


@router.get("/history", response_model=list[DetectionHistoryRead])
def get_detection_history(db: Session = Depends(get_db)):
    history = (
        db.query(models.DetectionHistory)
        .order_by(models.DetectionHistory.detected_at.desc())
        .limit(50)
        .all()
    )
    logger.info("GET /detect/history response: count=%d ids=%s", len(history), [entry.id for entry in history])
    return history


@router.post("/")
async def detect_container_id_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    image_bytes = await file.read()

    result = detect_container_id(image_bytes, db)
    logger.info("POST /detect response: %s", result)
    return result


@router.post("/container-id")
async def detect_container_id_live_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    image_bytes = await file.read()

    result = await run_in_threadpool(detect_container_id, image_bytes, db)
    logger.info("POST /detect/container-id response: %s", result)
    return result
