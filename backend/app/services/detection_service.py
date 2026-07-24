import cv2
import numpy as np
from ultralytics import YOLO
import easyocr
from ..utils.container_validation import validate_container_number


yolo_model = YOLO("app/ml/best.pt")
ocr_reader = easyocr.Reader(["en"])

def expand_box(x1, y1, x2, y2, img_width, img_height, pad_ratio=0.6):
    height = y2 - y1
    width = x2 - x1
    new_y2 = min(img_height, y2 + height * pad_ratio)
    new_x1 = max(0, x1 - width * 0.05)
    new_x2 = min(img_width, x2 + width * 0.05)
    return int(new_x1), int(y1), int(new_x2), int(new_y2)

def detect_container_id(image_bytes: bytes) -> dict:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    img_height, img_width = img.shape[:2]

    results = yolo_model(img)
    boxes = results[0].boxes

    candidates = []
    for box in boxes:
        conf = float(box.conf[0])
        x1, y1, x2, y2 = expand_box(*box.xyxy[0].tolist(), img_width, img_height)
        cropped = img[y1:y2, x1:x2]
        ocr_result = ocr_reader.readtext(cropped)
        text = "".join([entry[1] for entry in ocr_result]).upper().replace(" ", "")
        candidates.append({
            "text": text,
            "confidence": conf,
            "valid": validate_container_number(text),
            "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
        })

    # Prefer a checksum-valid result; fall back to highest-confidence detection if none validate
    valid_candidates = [c for c in candidates if c["valid"]]
    if valid_candidates:
        best = max(valid_candidates, key=lambda c: c["confidence"])
        return {
            "detected": True,
            "container_number": best["text"],
            "confidence": round(best["confidence"], 3),
            "verified": best["valid"],
            "box": best["box"],
            "image_width": img_width,
            "image_height": img_height,
        }
    elif candidates:
        best = max(candidates, key=lambda c: c["confidence"])
        return {
            "detected": True,
            "container_number": best["text"],
            "confidence": round(best["confidence"], 3),
            "verified": False,
            "box": best["box"],
        }
    else:
        return {"detected": False, "container_number": None, "confidence": None, "verified": False}