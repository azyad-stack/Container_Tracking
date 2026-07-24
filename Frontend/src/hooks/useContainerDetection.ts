// src/hooks/useContainerDetection.ts
import { useEffect, useRef, useState } from "react";
import { detectContainerId } from "../api/containerApi";
import { drawOverlay } from "../utils/drawOverlay";

interface DetectionLogEntry {
  containerNumber: string;
  detectedAt: string;
  verified: boolean;
}

export function useContainerDetection(
  captureFrame: () => string | null,
  cameraActive: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [log, setLog] = useState<DetectionLogEntry[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!cameraActive) return undefined;
    const interval = window.setInterval(() => void runDetectionCycle(), 2500);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive]);

  async function runDetectionCycle() {
    const base64Image = captureFrame();
    if (!base64Image) return;

    setIsDetecting(true);

    try {
      const res = await fetch(base64Image);
      const blob = await res.blob();

      const result = await detectContainerId(blob);

      const canvas = canvasRef.current;
      if (canvas && result.image_width && result.image_height) {
        canvas.width = result.image_width;
        canvas.height = result.image_height;
        const ctx = canvas.getContext("2d");
        if (ctx) drawOverlay(ctx, result);
      }

      if (result.detected && result.container_number) {
        const detectedAt = new Date().toLocaleTimeString();
        setLastResult({
          containerNumber: result.container_number,
          confidence: result.confidence ?? null,
          verified: result.verified ?? false,
          box: result.box ?? null,
          detectedAt,
        });
        setErrorMessage(null);
        setLog((prev) => {
          if (prev[0]?.containerNumber === result.container_number) return prev;
          return [
            { containerNumber: result.container_number, detectedAt, verified: result.verified ?? false },
            ...prev,
          ].slice(0, 6);
        });
      }
    } catch (error) {
      console.error("Detection failed", error);
      setErrorMessage("The detection request could not be completed. Please try again in a moment.");
    } finally {
      setIsDetecting(false);
    }
  }

  return { canvasRef, lastResult, log, isDetecting, errorMessage };
}