import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export interface DetectionHistoryEntry {
  id: number;
  container_number: string;
  confidence: number;
  verified: boolean;
  detected_at: string;
}

const API_URL = "http://127.0.0.1:8000";

export function useDetectionHistory() {
  const [history, setHistory] = useState<DetectionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<DetectionHistoryEntry[]>(`${API_URL}/detect/history`);
      console.info("GET /detect/history response", response.data);
      setHistory(response.data);
      console.info("Detection history React state update", response.data);
    } catch (error) {
      console.error("GET /detect/history failed", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, fetchHistory };
}
