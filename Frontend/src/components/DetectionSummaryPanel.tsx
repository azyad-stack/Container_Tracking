interface DetectionSummaryPanelProps {
  containerNumber: string | null;
  confidence: number | null;
  verified: boolean;
  detectedAt: string | null;
  isDetecting: boolean;
  cameraStatus: string;
  errorMessage: string | null;
}

function DetectionSummaryPanel({
  containerNumber,
  confidence,
  verified,
  detectedAt,
  isDetecting,
  cameraStatus,
  errorMessage,
}: DetectionSummaryPanelProps) {
  const statusLabel = cameraStatus === "active"
    ? "Camera ready"
    : cameraStatus === "connecting"
      ? "Connecting to camera"
      : cameraStatus === "error"
        ? "Camera unavailable"
        : "Waiting for camera";

  return (
    <div className="summary-panel">
      <div className="summary-header">
        <div>
          <p className="summary-kicker">Detection result</p>
          <h2>{containerNumber ?? "Waiting for detection"}</h2>
        </div>
        <div className={`status-pill ${verified ? "status-valid" : "status-pending"}`}>
          {verified ? "Valid" : containerNumber ? "Pending validation" : "No result"}
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Validation</span>
          <strong>{containerNumber ? (verified ? "Valid" : "Invalid") : "Pending"}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Confidence</span>
          <strong>{confidence !== null ? `${Math.round(confidence * 100)}%` : "—"}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Updated</span>
          <strong>{detectedAt ?? "—"}</strong>
        </div>
        <div className="summary-card">
          <span className="summary-label">Camera</span>
          <strong>{statusLabel}</strong>
        </div>
      </div>

      {errorMessage ? <p className="summary-error">{errorMessage}</p> : null}
      {isDetecting ? <p className="summary-note">Scanning the latest frame…</p> : null}
    </div>
  );
}

export default DetectionSummaryPanel;
