// src/api/containerApi.ts
import axios from "axios";
import type { Container } from "../types/container";

const API_URL = "http://localhost:8000";

export async function getContainers(): Promise<Container[]> {
  const response = await axios.get(`${API_URL}/containers/`);
  return response.data;
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