// src/components/CameraCapture.tsx
import Webcam from "react-webcam";
import type { RefObject } from "react";

interface Props {
  webcamRef: RefObject<Webcam | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onUserMedia: () => void;
  onUserMediaError: (error: string | DOMException) => void;
  hasActiveBox: boolean;
  box: { x: number; y: number; width: number; height: number } | null;
  containerNumber: string | null;
  confidence: number | null;
  cameraId: string;
  systemStatus: string;
}

function CameraCapture({
  webcamRef,
  canvasRef,
  onUserMedia,
  onUserMediaError,
  hasActiveBox,
  box,
  containerNumber,
  confidence,
  cameraId,
  systemStatus,
}: Props) {
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

      {box && (
        <div
          className="box-overlay"
          style={{
            left: `${box.x}px`,
            top: `${box.y}px`,
            width: `${box.width}px`,
            height: `${box.height}px`,
          }}
        >
          <div className="box-label">
            <span>{containerNumber ?? "Container"}</span>
            <strong>{confidence !== null ? `${(confidence * 100).toFixed(1)}%` : "-"}</strong>
          </div>
        </div>
      )}

      <div className="video-ui-overlay">
        <div className="video-status-row">
          <span className="video-chip">{cameraId}</span>
          <span className={`video-chip ${systemStatus === "Active" ? "chip-online" : "chip-offline"}`}>
            {systemStatus}
          </span>
        </div>
      </div>

      {!hasActiveBox && <div className="empty-overlay">Scanning terminal feed for container lock</div>}
    </div>
  );
}

export default CameraCapture;
