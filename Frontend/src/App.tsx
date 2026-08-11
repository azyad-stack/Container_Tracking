
// src/App.tsx
import DetectionPage from "./pages/DetectionPage";

function App() {
  return (
    <div className="app-shell">
      <header className="dashboard-header">
        <div className="dashboard-branding">
          <div className="brand-mark">
            <span>MM</span>
          </div>
          <div>
            <p className="dashboard-label">Marsa Maroc</p>
            <h1>Container Tracking</h1>
          </div>
        </div>

        <div className="dashboard-meta">
          <span className="status-chip online">Live monitoring</span>
          <span className="header-location">Gate B · TC3</span>
        </div>
      </header>

      <main className="page-main">
        <DetectionPage />
      </main>
    </div>
  );
}

export default App;
