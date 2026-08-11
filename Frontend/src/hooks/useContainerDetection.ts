// src/hooks/useContainerDetection.ts
import { useEffect, useRef, useState } from "react";
import { detectContainerId } from "../api/containerApi";
import { drawOverlay } from "../utils/drawOverlay";

export function useContainerDetection(
  captureFrame: () => string | null,
  cameraActive: boolean,
  refreshHistory: () => Promise<void>
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!cameraActive) return undefined;

    let cancelled = false;
    let timeoutId: number | undefined;

    const scheduleNext = () => {
      if (cancelled) return;
      timeoutId = window.setTimeout(() => {
        void loop();
      }, 5000);
    };

    const loop = async () => {
      if (cancelled || processingRef.current) return;
      const base64Image = captureFrame();
      if (!base64Image) {
        scheduleNext();
        return;
      }

      processingRef.current = true;
      setIsDetecting(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(base64Image);
        const imageBlob = await response.blob();
        const result = await detectContainerId(imageBlob);
        console.info("Detection API response", result);

        const canvas = canvasRef.current;
        if (canvas && result.image_width && result.image_height) {
          canvas.width = result.image_width;
          canvas.height = result.image_height;
          const ctx = canvas.getContext("2d");
          if (ctx) drawOverlay(ctx, result);
        }

        if (result.detected && result.container_number) {
          const detectedAt = new Date().toISOString();
          setLastResult({
            containerNumber: result.container_number,
            confidence: result.confidence ?? null,
            verified: result.verified ?? false,
            box: result.box ?? null,
            detectedAt,
          });
          console.info("Detection summary React state update", {
            containerNumber: result.container_number,
            confidence: result.confidence ?? null,
            verified: result.verified ?? false,
            detectedAt,
          });
          if (result.committed) {
            await refreshHistory();
            console.info("Detection history refreshed after committed detection", result.committed);
          }
          setErrorMessage(null);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Detection failed", error);
        setErrorMessage("The detection request could not be completed. Please try again in a moment.");
      } finally {
        processingRef.current = false;
        setIsDetecting(false);
        if (!cancelled) {
          scheduleNext();
        }
      }
    };

    void loop();
    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive]);

  return { canvasRef, lastResult, isDetecting, errorMessage };
}
