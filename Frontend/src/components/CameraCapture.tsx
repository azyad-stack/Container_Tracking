// src/components/CameraCapture.tsx
import Webcam from "react-webcam";
import type { RefObject } from "react";

interface Props {
  webcamRef: RefObject<Webcam>;
  canvasRef: RefObject<HTMLCanvasElement>;
  onUserMedia: () => void;
  onUserMediaError: (error: string | DOMException) => void;
  hasActiveBox: boolean;
}

function CameraCapture({ webcamRef, canvasRef, onUserMedia, onUserMediaError, hasActiveBox }: Props) {
  return (
    <div className="video-shell">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "user" }}
        onUserMedia={onUserMedia}
        onUserMediaError={onUserMediaError}
        className="video-feed"
      />
      <canvas ref={canvasRef} className="video-overlay" />
      {!hasActiveBox && <div className="empty-overlay">Waiting for a readable container number</div>}
    </div>
  );
}

export default CameraCapture;