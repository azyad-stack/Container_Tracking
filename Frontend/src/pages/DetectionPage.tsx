// src/pages/DetectionPage.tsx
import { useCamera } from "../hooks/useCamera";
import { useContainerDetection } from "../hooks/useContainerDetection";
import CameraCapture from "../components/CameraCapture";
import DetectionSummaryPanel from "../components/DetectionSummaryPanel";
import DetectionLog from "../components/DetectionLog";

function DetectionPage() {
  const { videoRef, status: cameraStatus, errorMessage: cameraError } = useCamera();
  const { canvasRef, lastResult, log, isDetecting, errorMessage: detectionError } =
    useContainerDetection(videoRef, cameraStatus === "active");

  const errorMessage = cameraError ?? detectionError;

  return (
    <div className="detection-page">
      <div className="detection-hero">
        <p className="section-label">Live container recognition</p>
        <h1>Monitor container codes in real time</h1>
        <p className="section-description">
          The camera feed streams directly from your device and continuously checks each frame for a readable container identifier.
        </p>
      </div>

      <div className="detection-content">
        <CameraCapture
          videoRef={videoRef}
          canvasRef={canvasRef}
          cameraStatus={cameraStatus}
          hasActiveBox={!!lastResult?.box}
        />
        <DetectionSummaryPanel
          containerNumber={lastResult?.containerNumber ?? null}
          confidence={lastResult?.confidence ?? null}
          verified={lastResult?.verified ?? false}
          detectedAt={lastResult?.detectedAt ?? null}
          isDetecting={isDetecting}
          cameraStatus={cameraStatus}
          errorMessage={errorMessage}
        />
      </div>

      <DetectionLog entries={log} />
    </div>
  );
}

export default DetectionPage;