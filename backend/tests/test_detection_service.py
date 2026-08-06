import importlib
from unittest.mock import patch

import cv2
import numpy as np
import torch


class FakeResults:
    def __init__(self, detections):
        self.xyxy = [detections]


class FakeOCRReader:
    def __init__(self, texts):
        self.texts = texts

    def readtext(self, _img):
        return [(None, text, None) for text in self.texts]


def make_test_image_bytes() -> bytes:
    image = np.zeros((120, 160, 3), dtype=np.uint8)
    _, encoded = cv2.imencode(".jpg", image)
    return encoded.tobytes()


def load_detection_service_with_fake_ocr(texts):
    with patch("torch.hub.load", return_value=object()):
        module = importlib.import_module("app.services.detection_service")
        module = importlib.reload(module)
        module.yolo_model = lambda _img: FakeResults(torch.tensor([[100, 100, 200, 200, 0.95, 0]], dtype=torch.float32))
        module.ocr_reader = FakeOCRReader(texts)
        return module


def test_detects_container_id_from_ocr_text_with_context():
    detection_service = load_detection_service_with_fake_ocr(["Container ABCU1234567"])

    result = detection_service.detect_container_id(make_test_image_bytes(), db=None)

    assert result["detected"] is True
    assert result["container_number"] == "ABCU1234567"
    assert result["verified"] is True
