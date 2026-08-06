interface DetectionSummaryPanelProps {
  containerNumber: string | null;
  confidence: number | null;
  verified: boolean;
  detectedAt: string | null;
  isDetecting: boolean;
  cameraStatus: string;
  location: string;
  errorMessage: string | null;
}

function DetectionSummaryPanel({
  containerNumber,
  confidence,
  verified,
  detectedAt,
  isDetecting,
  cameraStatus,
  location,
  errorMessage,
}: DetectionSummaryPanelProps) {
  const statusLabel =
    cameraStatus === "active"
      ? "Camera ready"
      : cameraStatus === "connecting"
        ? "Connecting to camera"
        : cameraStatus === "error"
          ? "Camera unavailable"
          : "Waiting for camera";

  const resultStatus = containerNumber ? (verified ? "Verified" : "Pending review") : "Awaiting live detection";

  return (
    <section className="summary-panel">
      <div className="summary-header">
        <div>
          <p className="summary-kicker">Live Detection Status</p>
          <p className="summary-subtitle">{statusLabel}</p>
        </div>
        <span className={`status-pill ${verified ? "status-valid" : "status-pending"}`}>
          {resultStatus}
        </span>
      </div>

      <div className="summary-grid">
        <div className="summary-row">
          <span>Container</span>
          <strong>{containerNumber ?? "-"}</strong>
        </div>
        <div className="summary-row">
          <span>Validation</span>
          <strong>{containerNumber ? (verified ? "Verified" : "Pending review") : "Awaiting detection"}</strong>
        </div>
        <div className="summary-row">
          <span>Confidence</span>
          <strong>{confidence !== null ? `${(confidence * 100).toFixed(1)}%` : "-"}</strong>
        </div>
        <div className="summary-row">
          <span>Last updated</span>
          <strong>{detectedAt ? new Date(detectedAt).toLocaleString() : "-"}</strong>
        </div>
        <div className="summary-row">
          <span>Location</span>
          <strong>{location}</strong>
        </div>
      </div>

      {errorMessage ? <p className="summary-error">{errorMessage}</p> : null}
      {isDetecting ? <p className="summary-note">Scanning active feed for terminal containers...</p> : null}
    </section>
  );
}

export default DetectionSummaryPanel;
