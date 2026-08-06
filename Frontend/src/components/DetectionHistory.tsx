import { memo, useMemo, useState } from "react";

interface DetectionHistoryEntry {
  id: number;
  container_number: string;
  confidence: number;
  verified: boolean;
  detected_at: string;
}

interface DetectionHistoryProps {
  history: DetectionHistoryEntry[];
  isLoading: boolean;
}

type StatusFilter = "all" | "verified" | "review";

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function DetectionHistory({ history, isLoading }: DetectionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredHistory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return history.filter((entry) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && entry.verified) ||
        (statusFilter === "review" && !entry.verified);
      const matchesQuery =
        !query ||
        entry.container_number.toLowerCase().includes(query) ||
        formatTimestamp(entry.detected_at).toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [history, searchQuery, statusFilter]);

  const handleExport = () => {
    const rows = [
      ["Container ID", "Detected at", "Camera", "Confidence", "Status"],
      ...filteredHistory.map((entry) => [
        entry.container_number,
        formatTimestamp(entry.detected_at),
        "Gate A - Terminal 04",
        `${(entry.confidence * 100).toFixed(1)}%`,
        entry.verified ? "Verified" : "Review",
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "detection-history.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="history-panel">
      <div className="history-header">
        <div>
          <p className="section-label">Tracking registry</p>
          <h3>Container detection events</h3>
        </div>

        <div className="history-actions">
          <input
            className="history-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search container or time"
          />
          <select
            className="history-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Filter detection status"
          >
            <option value="all">All status</option>
            <option value="verified">Verified</option>
            <option value="review">Review</option>
          </select>
          <button className="history-export-btn" onClick={handleExport} type="button">
            Export
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="history-empty">Loading recent terminal detections...</p>
      ) : filteredHistory.length === 0 ? (
        <p className="history-empty">No confirmed detections match your filter.</p>
      ) : (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Container ID</th>
                <th>Detection time</th>
                <th>Camera</th>
                <th>Confidence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.container_number}</strong>
                  </td>
                  <td>{formatTimestamp(entry.detected_at)}</td>
                  <td>Gate A - Terminal 04</td>
                  <td>{(entry.confidence * 100).toFixed(1)}%</td>
                  <td>
                    <span className={entry.verified ? "history-status status-valid" : "history-status status-pending"}>
                      {entry.verified ? "Verified" : "Review"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default memo(DetectionHistory);
