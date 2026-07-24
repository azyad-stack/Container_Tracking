// src/api/containerApi.ts
import axios from "axios";
import type { Container } from "../types/container";

const API_URL = "http://localhost:8000";

export async function getContainers(): Promise<Container[]> {
  const response = await axios.get(`${API_URL}/containers/`);
  return response.data;
}

export async function getContainerByNumber(containerNumber: string): Promise<Container> {
  const response = await axios.get(`${API_URL}/containers/`, { params: { search: containerNumber } });
  return response.data[0];
}

export async function createContainer(data: Omit<Container, "id">): Promise<Container> {
  const response = await axios.post(`${API_URL}/containers/`, data);
  return response.data;
}

export async function updateContainer(id: number, data: Partial<Container>): Promise<Container> {
  const response = await axios.put(`${API_URL}/containers/${id}`, data);
  return response.data;
}

export async function deleteContainer(id: number): Promise<void> {
  await axios.delete(`${API_URL}/containers/${id}`);
}

export async function detectContainer(file: File): Promise<{ detected: boolean; container_number?: string; confidence?: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${API_URL}/detect/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function detectContainerId(imageBlob: Blob): Promise<{
  detected: boolean;
  container_number: string | null;
  confidence: number | null;
  verified: boolean;
  box?: { x1: number; y1: number; x2: number; y2: number } | null;
}> {
  const formData = new FormData();
  formData.append("file", imageBlob, "capture.jpg");

  const response = await axios.post(`${API_URL}/detect/container-id`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}