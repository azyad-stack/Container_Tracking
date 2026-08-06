# app/services/stabilizer.py
from collections import deque, Counter
from ..utils.container_validation import validate_container_number

class DetectionStabilizer:
    def __init__(self, window=5, min_frames=3, cooldown_frames=5):
        self.buffer = deque(maxlen=window)
        self.min_frames = min_frames
        self.cooldown_frames = cooldown_frames
        self.last_committed = None
        self.cooldown = 0

    def push(self, container_id: str, confidence: float):
        if self.cooldown > 0:
            self.cooldown -= 1
            return None
        if confidence < 0.80 or not container_id:
            return None

        self.buffer.append(container_id)

        # Only compare readings of the correct length (11 chars for a container ID)
        same_length = [c for c in self.buffer if len(c) == 11]
        if len(same_length) < self.min_frames:
            return None

        # Vote per character position across the last min_frames readings
        recent = same_length[-self.min_frames:]
        voted = "".join(
            Counter(chars).most_common(1)[0][0]
            for chars in zip(*recent)
        )

        if validate_container_number(voted) and voted != self.last_committed:
            self.last_committed = voted
            self.cooldown = self.cooldown_frames
            self.buffer.clear()
            return voted
        return None

# One shared instance for the app's single camera feed
stabilizer = DetectionStabilizer()