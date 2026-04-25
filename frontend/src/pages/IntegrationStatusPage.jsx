import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { getIntegrationStatus, refreshIntegrationStatus } from "../services/api.js";
import { formatDateTime } from "../utils/format.js";

export default function IntegrationStatusPage() {
  const [liveMode, setLiveMode] = useState(false);
  const [statusData, setStatusData] = useState({
    lastSyncTime: null,
    integrations: [],
    liveConfigured: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadStatus() {
    try {
      setError("");
      const data = await getIntegrationStatus();
      setStatusData(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");
      await refreshIntegrationStatus(liveMode);
      await loadStatus();
    } catch (requestError) {
      setRefreshing(false);
      setError(requestError.message);
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Integration Status"
        title="Provider health and sync visibility"
        description="Track which integrations are configured for live mode, when they last synced, and refresh caches on demand."
        action={
          <div className="header-actions">
            <label className="toggle-pill">
              <input
                type="checkbox"
                checked={liveMode}
                onChange={(event) => setLiveMode(event.target.checked)}
              />
              <span>Live Data Mode</span>
            </label>
            <button className="primary-button inline-button" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "Refresh now"}
            </button>
          </div>
        }
      />

      <div className="stats-grid">
        <article className="card stat-card">
          <span>Google Trends</span>
          <strong>{statusData.liveConfigured.googleTrends ? "Live ready" : "Package fallback"}</strong>
          <p>Official API path configurable, package fallback available</p>
        </article>
        <article className="card stat-card">
          <span>YouTube</span>
          <strong>{statusData.liveConfigured.youtube ? "Live ready" : "Mock fallback"}</strong>
          <p>YouTube Data API powers social demand when configured</p>
        </article>
        <article className="card stat-card">
          <span>Google Shopping</span>
          <strong>{statusData.liveConfigured.shopping ? "Live ready" : "Mock fallback"}</strong>
          <p>SerpApi shopping results power price and review data</p>
        </article>
        <article className="card stat-card">
          <span>Last sync time</span>
          <strong>{formatDateTime(statusData.lastSyncTime)}</strong>
          <p>Latest successful refresh across providers</p>
        </article>
      </div>

      {loading ? <div className="card">Loading integration status...</div> : null}
      {error ? <div className="card error-card">{error}</div> : null}

      {!loading ? (
        <div className="integration-grid">
          {statusData.integrations.map((integration) => (
            <article key={integration.sourceKey} className="card integration-card">
              <div className="integration-card-header">
                <div>
                  <p className="eyebrow">Source</p>
                  <h3>{integration.sourceName}</h3>
                </div>
                <span className={`status-pill ${integration.status}`}>{integration.status}</span>
              </div>
              <p className="muted">{integration.message}</p>
              <div className="integration-metrics">
                <div>
                  <span>Provider</span>
                  <strong>{integration.providerType}</strong>
                </div>
                <div>
                  <span>Config</span>
                  <strong>{integration.configurationState}</strong>
                </div>
                <div>
                  <span>Last sync</span>
                  <strong>{formatDateTime(integration.lastSyncAt)}</strong>
                </div>
                <div>
                  <span>Items processed</span>
                  <strong>{integration.itemsProcessed}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
