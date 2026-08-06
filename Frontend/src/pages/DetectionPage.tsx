// src/pages/DetectionPage.tsx
import { useCamera } from "../hooks/useCamera";
import { useContainerDetection } from "../hooks/useContainerDetection";
import { useDetectionHistory } from "../hooks/useDetectionHistory";
import CameraCapture from "../components/CameraCapture";
import DetectionSummaryPanel from "../components/DetectionSummaryPanel";
import DetectionHistory from "../components/DetectionHistory";
function DetectionPage() {
  const {
    webcamRef,
    status: cameraStatus,
    errorMessage: cameraError,
    handleUserMedia,
    handleUserMediaError,
    captureFrame,
  } = useCamera();

  const { history, isLoading, fetchHistory } = useDetectionHistory();
  const { canvasRef, lastResult, isDetecting, errorMessage: detectionError } =
    useContainerDetection(captureFrame, cameraStatus === "active", fetchHistory);

  return (
    <div className="detection-page">
      <section className="detection-content">
        <div className="live-visualization">
          <div className="monitoring-panel">
            <div className="monitoring-panel-header">
              <div>
                <p className="section-label">Live camera</p>
                <h2>Gate A · Terminal 04</h2>
              </div>
              <div className="monitoring-meta">
                <div className={`monitoring-pill ${cameraStatus === "active" ? "is-active" : ""}`}>
                  {cameraStatus === "active" ? "Camera active" : "Camera unavailable"}
                </div>
              </div>
            </div>

            <CameraCapture
              webcamRef={webcamRef}
              canvasRef={canvasRef}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              hasActiveBox={!!lastResult?.box}
              box={lastResult?.box ?? null}
              containerNumber={lastResult?.containerNumber ?? null}
              confidence={lastResult?.confidence ?? null}
              cameraId="Gate A - Terminal 04"
              systemStatus={cameraStatus === "active" ? "Active" : "Offline"}
            />
          </div>

          <div className="side-stack">
            <DetectionSummaryPanel
              containerNumber={lastResult?.containerNumber ?? null}
              confidence={lastResult?.confidence ?? null}
              verified={lastResult?.verified ?? false}
              detectedAt={lastResult?.detectedAt ?? null}
              isDetecting={isDetecting}
              cameraStatus={cameraStatus}
              location="Gate A · Terminal 04"
              errorMessage={detectionError || cameraError}
            />
          </div>
        </div>
      </section>

      <section className="terminal-statistics">
        <div className="tracking-header">
          <div>
            <p className="section-label">Detection history</p>
            <h2>Recent detections</h2>
          </div>
        </div>
        <DetectionHistory history={history} isLoading={isLoading} />
      </section>
    </div>
  );
}

export default DetectionPage;
