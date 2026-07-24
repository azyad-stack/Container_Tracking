
// src/App.tsx
import { useEffect, useState } from "react";
import { getContainers, createContainer, updateContainer, deleteContainer } from "./api/containerApi";
import type { Container } from "./types/container";
import ContainerForm from "./components/ContainerForm";
import DetectionPage from "./pages/DetectionPage";

type Tab = "containers" | "detection";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("detection");
  const [containers, setContainers] = useState<Container[]>([]);

  function refresh() {
    getContainers().then(setContainers);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(data: { container_number: string; status: string; location: string | null }) {
    await createContainer(data);
    refresh();
  }

  async function handleDelete(id: number) {
    await deleteContainer(id);
    refresh();
  }

  async function handleAdvance(container: Container) {
    const next =
      container.status === "in_yard" ? "on_truck" :
      container.status === "on_truck" ? "on_ship" : "in_yard";
    await updateContainer(container.id, { status: next });
    refresh();
  }

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>Container Tracker</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("detection")}
          style={{ fontWeight: activeTab === "detection" ? "bold" : "normal", marginRight: "0.5rem" }}
        >
          Live Detection
        </button>
        <button
          onClick={() => setActiveTab("containers")}
          style={{ fontWeight: activeTab === "containers" ? "bold" : "normal" }}
        >
          Containers
        </button>
      </div>

      {activeTab === "detection" && <DetectionPage />}

      {activeTab === "containers" && (
        <div>
          <ContainerForm onSubmit={handleCreate} />
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th>ID</th><th>Number</th><th>Status</th><th>Location</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.container_number}</td>
                  <td>{c.status}</td>
                  <td>{c.location ?? "-"}</td>
                  <td>
                    <button onClick={() => handleAdvance(c)}>Advance status</button>
                    <button onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;