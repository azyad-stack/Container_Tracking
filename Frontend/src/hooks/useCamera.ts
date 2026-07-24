// src/hooks/useCamera.ts
import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

export function useCamera() {
  const webcamRef = useRef<Webcam>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "error">("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUserMedia = useCallback(() => {
    setStatus("active");
    setErrorMessage(null);
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    console.error("Camera access failed", error);
    setStatus("error");
    setErrorMessage("Camera access was denied or is unavailable. Please allow camera access and refresh the page.");
  }, []);

  // Grabs the current frame as a base64 JPEG — no manual canvas needed for this part
  const captureFrame = useCallback((): string | null => {
    return webcamRef.current?.getScreenshot() ?? null;
  }, []);

  return { webcamRef, status, errorMessage, handleUserMedia, handleUserMediaError, captureFrame };
}