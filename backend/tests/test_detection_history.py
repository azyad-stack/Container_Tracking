from app.routers import detection
from app.schemas.detection import DetectionHistoryRead


def test_detection_history_schema_accepts_expected_fields():
    item = DetectionHistoryRead(
        id=1,
        container_number="MSKU1234567",
        confidence=0.96,
        verified=True,
        detected_at="2026-08-04T12:00:00",
    )

    assert item.container_number == "MSKU1234567"
    assert item.confidence == 0.96
    assert item.verified is True


def test_detection_router_exposes_history_endpoint():
    paths = {route.path for route in detection.router.routes}
    assert "/detect/history" in paths
