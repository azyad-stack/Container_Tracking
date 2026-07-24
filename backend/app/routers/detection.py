from fastapi import APIRouter, UploadFile, File
from ..services.detection_service import detect_container_id

router = APIRouter(prefix="/detect", tags=["detection"])

@router.post("/")
async def detect_container_id_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()

    result = detect_container_id(image_bytes)
    return result


@router.post("/container-id")
async def detect_container_id_live_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()

    result = detect_container_id(image_bytes)
    return result