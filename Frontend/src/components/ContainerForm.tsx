// src/components/ContainerForm.tsx
import { useState } from "react";

interface Props {
  onSubmit: (data: { container_number: string; status: string; location: string | null }) => void;
}

function ContainerForm({ onSubmit }: Props) {
  const [containerNumber, setContainerNumber] = useState("");
  const [status, setStatus] = useState("in_yard");
  const [location, setLocation] = useState("");

  function handleSubmit() {
    if (!containerNumber.trim()) return; // basic guard, no empty submissions
    onSubmit({ container_number: containerNumber, status, location: location || null });
    setContainerNumber("");
    setLocation("");
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        placeholder="Container number"
        value={containerNumber}
        onChange={(e) => setContainerNumber(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="in_yard">In Yard</option>
        <option value="on_truck">On Truck</option>
        <option value="on_ship">On Ship</option>
      </select>
      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button onClick={handleSubmit}>Add Container</button>
    </div>
  );
}

export default ContainerForm;