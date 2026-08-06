import logging
import os
import re
import sys
from pathlib import Path

import cv2
import easyocr
import numpy as np
import torch
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..database import models
from ..utils.container_validation import validate_container_number

logger = logging.getLogger(__name__)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
YOLOV5_PATH = PROJECT_ROOT / "yolov5"
MODEL_PATH = PROJECT_ROOT / "app" / "ml" / "best(2).pt"
sys.path.insert(0, str(YOLOV5_PATH))

yolo_model = torch.hub.load(
    str(YOLOV5_PATH),
    "custom",
    path=str(MODEL_PATH),
    source="local",
)
ocr_reader = easyocr.Reader(["en"])


def _debug_image(name: str, image: np.ndarray) -> None:
    debug_dir = os.getenv("DETECTION_DEBUG_DIR")
    if not debug_dir or image.size == 0:
        return

    output_dir = Path(debug_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_dir / name), image)


def _log_response(response: dict) -> dict:
    logger.info("Detection response: %s", response)
    return response


def expand_box(x1, y1, x2, y2, img_width, img_height, pad_ratio=0.35):
    height = y2 - y1
    width = x2 - x1
    new_y1 = max(0, y1 - height * pad_ratio)
    new_y2 = min(img_height, y2 + height * pad_ratio)
    new_x1 = max(0, x1 - width * 0.10)
    new_x2 = min(img_width, x2 + width * 0.10)
    return int(new_x1), int(new_y1), int(new_x2), int(new_y2)


def _normalize_container_candidate(value: str) -> str:
    candidate = value.upper()
    letter_corrections = str.maketrans({"0": "O", "1": "I", "5": "S", "8": "B"})
    digit_corrections = str.maketrans({"O": "0", "Q": "0", "I": "1", "L": "1", "S": "5", "B": "8"})
    return candidate[:4].translate(letter_corrections) + candidate[4:].translate(digit_corrections)


def _extract_container_number(text: str) -> tuple[str | None, bool]:
    if not text:
        return None, False

    normalized = re.sub(r"[^A-Z0-9]+", "", text.upper())
    for start in range(0, len(normalized) - 10):
        candidate = _normalize_container_candidate(normalized[start : start + 11])
        if re.fullmatch(r"[A-Z]{4}\d{7}", candidate):
            return candidate, validate_container_number(candidate)

    return None, False


def _ocr_inputs(img: np.ndarray) -> list[tuple[str, np.ndarray]]:
    grayscale = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    enhanced = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(grayscale)
    resized = cv2.resize(enhanced, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    blurred = cv2.GaussianBlur(resized, (3, 3), 0)
    _, otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    adaptive = cv2.adaptiveThreshold(
        blurred,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        8,
    )
    return [
        ("original", img),
        ("enhanced", blurred),
        ("otsu", otsu),
        ("adaptive", adaptive),
    ]


def _ocr_container_candidates(img: np.ndarray, debug_prefix: str) -> list[tuple[str, str, bool]]:
    for input_name, ocr_input in _ocr_inputs(img):
        _debug_image(f"{debug_prefix}_{input_name}.png", ocr_input)
        ocr_result = ocr_reader.readtext(ocr_input)
        raw_entries = [
            (entry[1], float(entry[2]) if len(entry) > 2 else None)
            for entry in ocr_result
            if len(entry) > 1
        ]
        logger.info("EasyOCR %s output: %s", input_name, raw_entries)

        texts = [text for text, _ in raw_entries]
        candidates = []
        for raw_text in texts + ["".join(texts)]:
            container_number, is_valid = _extract_container_number(raw_text)
            logger.info(
                "OCR candidate input=%s raw=%r extracted=%r valid=%s",
                input_name,
                raw_text,
                container_number,
                is_valid,
            )
            if container_number:
                candidates.append((container_number, raw_text, is_valid))

        if candidates:
            return candidates

    return []


def _response(
    detected: bool,
    container_number: str | None,
    confidence: float | None,
    verified: bool,
    box: dict | None,
    committed: str | None,
    image_width: int,
    image_height: int,
) -> dict:
    return _log_response(
        {
            "detected": detected,
            "container_number": container_number,
            "confidence": confidence,
            "verified": verified,
            "box": box,
            "committed": committed,
            "image_width": image_width,
            "image_height": image_height,
        }
    )


def _save_detection_history(db: Session, container_number: str, confidence: float) -> None:
    history_entry = models.DetectionHistory(
        container_number=container_number,
        confidence=confidence,
        verified=True,
    )
    logger.info(
        "Detection history insert: container_number=%s confidence=%.3f",
        container_number,
        confidence,
    )
    try:
        db.add(history_entry)
        db.commit()
        logger.info("Detection history commit succeeded: container_number=%s", container_number)
        db.refresh(history_entry)
        logger.info(
            "Detection history refresh succeeded: id=%s detected_at=%s",
            history_entry.id,
            history_entry.detected_at,
        )
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Detection history persistence failed; transaction rolled back")
        raise


def detect_container_id(image_bytes: bytes, db: Session | None = None) -> dict:
    logger.info("Detection request received: %d bytes", len(image_bytes))
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None or img.size == 0:
        return _response(False, None, None, False, None, None, 0, 0)

    img_height, img_width = img.shape[:2]
    logger.info("Decoded image dimensions: width=%d height=%d", img_width, img_height)
    _debug_image("original.png", img)

    results = yolo_model(img)
    detections = results.xyxy[0]
    logger.info("YOLO detections: %d", len(detections))

    if len(detections) == 0:
        fallback_candidates = _ocr_container_candidates(img, "fallback")
        if fallback_candidates:
            best_container, _, is_valid = fallback_candidates[0]
            committed = None
            if is_valid and db is not None:
                _save_detection_history(db, best_container, 0.45)
                committed = best_container
            logger.info(
                "Fallback detection result: container_number=%s verified=%s confidence=%.3f committed=%s",
                best_container,
                is_valid,
                0.45,
                committed,
            )
            return _response(
                True,
                best_container,
                0.45,
                is_valid,
                {"x1": 0, "y1": 0, "x2": img_width, "y2": img_height},
                committed,
                img_width,
                img_height,
            )
        return _response(False, None, None, False, None, None, img_width, img_height)

    boxed_image = img.copy()
    candidates = []
    for index, det in enumerate(detections):
        conf = float(det[4])
        raw_box = tuple(round(float(value), 1) for value in det[:4])
        logger.info("YOLO detection %d confidence=%.3f box=%s", index, conf, raw_box)
        if conf < 0.25:
            continue

        x1, y1, x2, y2 = expand_box(*det[:4].tolist(), img_width, img_height)
        cropped = img[y1:y2, x1:x2]
        logger.info(
            "YOLO crop %d expanded_box=(%d, %d, %d, %d) dimensions=%s",
            index,
            x1,
            y1,
            x2,
            y2,
            cropped.shape if cropped.size else None,
        )
        cv2.rectangle(boxed_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        if cropped.size == 0:
            continue

        _debug_image(f"crop_{index}.png", cropped)
        for container_number, _, is_valid in _ocr_container_candidates(cropped, f"crop_{index}"):
            candidates.append(
                {
                    "text": container_number,
                    "confidence": conf,
                    "valid": is_valid,
                    "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                }
            )
    _debug_image("yolo_boxes.png", boxed_image)

    if candidates:
        best = max(candidates, key=lambda candidate: candidate["confidence"])
        committed = None
        if best["valid"] and db is not None:
            _save_detection_history(db, best["text"], round(best["confidence"], 3))
            committed = best["text"]
        elif not best["valid"]:
            logger.info("Detection result is not verified and will not be persisted: %s", best["text"])
        else:
            logger.warning("Verified detection was not persisted because no database session was provided")
        return _response(
            True,
            best["text"],
            round(best["confidence"], 3),
            best["valid"],
            best["box"],
            committed,
            img_width,
            img_height,
        )

    fallback_candidates = _ocr_container_candidates(img, "fallback")
    if fallback_candidates:
        best_container, _, is_valid = fallback_candidates[0]
        committed = None
        if is_valid and db is not None:
            _save_detection_history(db, best_container, 0.45)
            committed = best_container
        logger.info(
            "Fallback detection result: container_number=%s verified=%s confidence=%.3f committed=%s",
            best_container,
            is_valid,
            0.45,
            committed,
        )
        return _response(
            True,
            best_container,
            0.45,
            is_valid,
            {"x1": 0, "y1": 0, "x2": img_width, "y2": img_height},
            committed,
            img_width,
            img_height,
        )

    return _response(False, None, None, False, None, None, img_width, img_height)
