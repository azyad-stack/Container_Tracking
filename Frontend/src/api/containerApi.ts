// src/api/containerApi.ts
import axios from "axios";
const API_URL = "http://127.0.0.1:8000";

export async function detectContainerId(imageBlob: Blob): Promise<{
  detected: boolean;
  container_number: string | null;
  confidence: number | null;
  verified: boolean;
  committed?: string | null;
  box?: { x1: number; y1: number; x2: number; y2: number } | null;
  image_width: number;
  image_height: number;
}> {

  const formData = new FormData();
  formData.append("file", imageBlob, "capture.jpeg");

  const response = await axios.post(`${API_URL}/detect/container-id`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
