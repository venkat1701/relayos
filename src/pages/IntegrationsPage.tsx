/**
 * Integrations Page - OAuth Connections + Composio External Tools
 */

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { API_ROUTES } from "../lib/contract";

interface Integration {
  id: string;
  provider: string;
  provider_email?: string;
  provider_account_id?: string;
  status: string;
  last_sync_at?: string;
  metadata?: {
    email?: string;
    services?: string[];
    enabled_services?: string[];
    [key: string]: unknown;
  };
}

interface IntegrationsPageProps {
  integrations: Integration[];
  onConnect?: (provider: string) => void;
  onDisconnect?: (integrationId: string) => void;
  onSync?: (integrationId: string) => void;
}

const GOOGLE_SERVICES = [
  { id: "gmail", label: "Gmail", description: "Email sync and send" },
  { id: "calendar", label: "Calendar", description: "Events and scheduling" },
  { id: "drive", label: "Drive", description: "File changes and content" },
  { id: "docs", label: "Docs", description: "Document access" },
  { id: "sheets", label: "Sheets", description: "Spreadsheet access" },
  { id: "meet", label: "Meet", description: "Meeting links" },
];

export function IntegrationsPage({ integrations, onConnect, onDisconnect, onSync }: IntegrationsPageProps) {
  const availableIntegrations = [
    { id: "google", name: "Google Workspace", icon: "fi fi-brands-google", description: "Gmail, Calendar, Drive, Docs, Sheets" },
  ];

  const getIntegrationStatus = (providerId: string) => {
    return integrations.find(i => i.provider.toLowerCase().includes(providerId));
  };

  return (
    <div className="integrations-page">
      <div className="integrations-header">
        <div>
          <h1>Integrations</h1>
          <p className="subtitle">Connect your tools and services</p>
        </div>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div className="connected-section">
          <h2 className="section-title">Connected</h2>
          <div className="integrations-grid stagger-in">
            {integrations.map((integration) => (
              <ConnectedIntegrationCard
                key={integration.id}
                integration={integration}
                onSync={onSync}
                onDisconnect={onDisconnect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div className="available-section">
        <h2 className="section-title">Available Integrations</h2>
        <div className="integrations-grid">
          {availableIntegrations.map((integration) => {
            const connected = getIntegrationStatus(integration.id);
            if (connected) return null;

            return (
              <div key={integration.id} className="integration-card">
                <div className="integration-header">
                  <div className="integration-icon"><i className={integration.icon} /></div>
                  <div className="integration-info">
                    <h3>{integration.name}</h3>
                    <p className="integration-description">{integration.description}</p>
                  </div>
                </div>
                <button
                  className="connect-btn"
                  onClick={() => onConnect?.(integration.id)}
                  type="button"
                >
                  Connect
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composio External Integrations */}
      <ComposioSection />

      <style>{`
        .integrations-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .integrations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .integrations-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .subtitle {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .connected-section,
        .available-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 20px;
        }

        .integrations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .integration-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
        }

        .integration-card:hover {
          border-color: #2a2a2a;
          box-shadow: 0 4px 12px rgba(0, 167, 225, 0.1);
        }

        .integration-card.connected {
          border-color: rgba(0, 167, 225, 0.3);
          background: rgba(0, 167, 225, 0.05);
        }

        .integration-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .integration-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          color: #020202;
          flex-shrink: 0;
          line-height: 1;
        }

        .integration-card.connected .integration-icon {
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
        }

        .integration-info {
          flex: 1;
        }

        .integration-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .integration-description,
        .integration-email {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.connected {
          background: rgba(0, 167, 225, 0.2);
          color: #00A7E1;
        }

        .integration-meta {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.4);
          margin-bottom: 16px;
        }

        .integration-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.secondary {
          background: #141414;
          color: rgba(236, 228, 183, 0.8);
          border: 1px solid #1a1a1a;
        }

        .action-btn.secondary:hover {
          background: #1a1a1a;
          color: #ECE4B7;
        }

        .action-btn.danger {
          background: rgba(204, 41, 54, 0.2);
          color: #CC2936;
          border: 1px solid #CC2936;
        }

        .action-btn.danger:hover {
          background: rgba(204, 41, 54, 0.3);
        }

        .connect-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .connect-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 167, 225, 0.3);
        }

        .services-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(236, 228, 183, 0.1);
        }

        .services-title {
          font-size: 13px;
          font-weight: 600;
          color: rgba(236, 228, 183, 0.6);
          margin: 0 0 12px;
        }

        .services-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .service-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
        }

        .service-label {
          display: flex;
          flex-direction: column;
        }

        .service-name {
          font-size: 13px;
          font-weight: 500;
          color: #ECE4B7;
        }

        .service-desc {
          font-size: 11px;
          color: rgba(236, 228, 183, 0.4);
        }

        .toggle-switch {
          position: relative;
          width: 40px;
          height: 22px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #2a2a2a;
          border-radius: 22px;
          transition: 0.2s;
        }

        .toggle-slider:before {
          content: "";
          position: absolute;
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: #888;
          border-radius: 50%;
          transition: 0.2s;
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: rgba(0, 167, 225, 0.4);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(18px);
          background-color: #00A7E1;
        }

        .toggle-switch input:disabled + .toggle-slider {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}


function ConnectedIntegrationCard({
  integration,
  onSync,
  onDisconnect,
}: {
  integration: Integration;
  onSync?: (id: string) => void;
  onDisconnect?: (id: string) => void;
}) {
  const token = localStorage.getItem("relayos_access_token");
  const meta = integration.metadata || {};
  const enabledServices: string[] = meta.enabled_services || GOOGLE_SERVICES.map(s => s.id);
  const [localEnabled, setLocalEnabled] = useState<string[]>(enabledServices);
  const [saving, setSaving] = useState(false);

  // Keep local state in sync when the parent re-fetches integrations.
  useEffect(() => {
    setLocalEnabled(enabledServices);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(enabledServices)]);

  const handleToggle = useCallback(async (serviceId: string, checked: boolean) => {
    setLocalEnabled(prev => {
      const next = checked
        ? [...prev, serviceId]
        : prev.filter(s => s !== serviceId);

      // Fire the PATCH in the background; revert on failure.
      (async () => {
        setSaving(true);
        try {
          await apiRequest(
            API_ROUTES.integrations.updateServices(integration.id),
            { method: "PATCH", token: token || "", body: { enabled_services: next } },
          );
        } catch (e) {
          console.error("Failed to update services:", e);
          setLocalEnabled(prev); // revert to value before this toggle
        }
        setSaving(false);
      })();

      return next;
    });
  }, [integration.id, token]);

  return (
    <div className="integration-card connected">
      <div className="integration-header">
        <div className="integration-icon">
          <i className={integration.provider === "google" ? "fi fi-brands-google" : integration.provider === "slack" ? "fi fi-brands-slack" : "fi fi-rr-chain"} />
        </div>
        <div className="integration-info">
          <h3 style={{ textTransform: "capitalize" }}>{integration.provider}</h3>
          {(integration.provider_email || meta.email) && (
            <p className="integration-email">{integration.provider_email || meta.email}</p>
          )}
        </div>
        <span className="status-badge connected">Connected</span>
      </div>
      <div className="integration-meta">
        {integration.last_sync_at && (
          <span className="last-sync">
            Last synced: {new Date(integration.last_sync_at).toLocaleString()}
          </span>
        )}
      </div>

      {/* Service toggles for Google */}
      {integration.provider === "google" && (
        <div className="services-section">
          <p className="services-title">Enabled Services</p>
          <div className="services-list">
            {GOOGLE_SERVICES.map(svc => (
              <div key={svc.id} className="service-row">
                <div className="service-label">
                  <span className="service-name">{svc.label}</span>
                  <span className="service-desc">{svc.description}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={localEnabled.includes(svc.id)}
                    disabled={saving}
                    onChange={e => handleToggle(svc.id, e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="integration-actions">
        <button
          className="action-btn secondary"
          onClick={() => onSync?.(integration.id)}
          type="button"
        >
          Sync Now
        </button>
        <button
          className="action-btn danger"
          onClick={() => onDisconnect?.(integration.id)}
          type="button"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}


interface ComposioToolkit {
  slug: string;
  name: string;
  connected: boolean;
  connection_id: string | null;
}

const TOOLKIT_META: Record<string, { icon: string; tools: number; desc: string }> = {
  slack: { icon: "fi fi-brands-slack", tools: 151, desc: "Messages, channels, threads, reactions, files, canvases" },
  notion: { icon: "fi fi-rr-book-open-reader", tools: 48, desc: "Pages, databases, content blocks, queries, properties" },
  fireflies: { icon: "fi fi-rr-circle-microphone", tools: 20, desc: "Transcripts, summaries, AskFred AI, meeting bites" },
  googledocs: { icon: "fi fi-rr-document", tools: 35, desc: "Advanced editing, markdown, headers/footers, PDF export" },
  whatsapp: { icon: "fi fi-brands-whatsapp", tools: 15, desc: "Send messages, read conversations, manage contacts" },
};

function ComposioSection() {
  const [toolkits, setToolkits] = useState<ComposioToolkit[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("relayos_access_token");

  const loadToolkits = useCallback(async () => {
    try {
      const data = await apiRequest<{ toolkits: ComposioToolkit[] }>(
        API_ROUTES.composio.toolkits, { token: token || "" }
      );
      setToolkits(Array.isArray(data.toolkits) ? data.toolkits : []);
    } catch (e) {
      console.error("Failed to load Composio toolkits:", e);
    }
    setLoading(false);
  }, [token]);

  // On mount: reset session first (clears stale cache), then load fresh status.
  // Also detect OAuth callback redirect and reload.
  useEffect(() => {
    (async () => {
      try {
        await apiRequest(API_ROUTES.composio.resetSession, { method: "POST", token: token || "" });
      } catch (_) { /* ignore */ }
      await loadToolkits();
    })();
  }, [loadToolkits]);

  async function connectToolkit(slug: string) {
    setConnecting(slug);
    try {
      const data = await apiRequest<{ redirect_url?: string; error?: string }>(
        API_ROUTES.composio.connect,
        { method: "POST", token: token || "", body: { toolkit: slug, callback_url: window.location.href } },
      );
      if (data.redirect_url) {
        // Redirect in the same window so the callback comes back here.
        window.location.href = data.redirect_url;
        return; // page will navigate away
      } else if (data.error) {
        setConnecting("error:" + data.error);
        setTimeout(() => setConnecting(null), 3000);
      }
    } catch (e) {
      console.error("Connect failed:", e);
    }
    setConnecting(null);
  }

  async function disconnectToolkit(slug: string) {
    if (!confirm(`Disconnect ${slug}? The AI agent will lose access to this integration.`)) return;
    setDisconnecting(slug);
    try {
      await apiRequest(API_ROUTES.composio.disconnect, {
        method: "POST", token: token || "", body: { toolkit: slug },
      });
      // Reload toolkit status after disconnect.
      await loadToolkits();
    } catch (e) {
      console.error("Disconnect failed:", e);
    }
    setDisconnecting(null);
  }

  if (loading) return (
    <div className="available-section">
      <h2 className="section-title">External Integrations via Composio</h2>
      <p style={{ color: "rgba(236,228,183,0.5)", fontSize: 13, marginBottom: 16 }}>
        The AI agent autonomously discovers and uses tools from these platforms. Connect them to enable full access.
      </p>
      <div className="integrations-grid">
        {Object.entries(TOOLKIT_META).map(([slug, meta]) => (
          <div key={slug} className="skeleton-integration-card">
            <div className="skeleton-integration-header">
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton skeleton-line w50" />
                <div className="skeleton skeleton-line w80" />
              </div>
              <div className="skeleton" style={{ width: 90, height: 24, borderRadius: 12 }} />
            </div>
            <div className="skeleton skeleton-line w40" />
            <div className="skeleton" style={{ height: 42, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );

  // Always show all known toolkits; merge fetched status with TOOLKIT_META keys.
  const allSlugs = new Set([...Object.keys(TOOLKIT_META), ...toolkits.map(t => t.slug)]);
  const mergedToolkits: ComposioToolkit[] = [...allSlugs].map(slug => {
    const fetched = toolkits.find(t => t.slug === slug);
    return fetched || { slug, name: slug, connected: false, connection_id: null };
  });

  return (
    <div className="available-section">
      <h2 className="section-title">External Integrations via Composio</h2>
      <p style={{ color: "rgba(236,228,183,0.5)", fontSize: 13, marginBottom: 16 }}>
        The AI agent autonomously discovers and uses tools from these platforms. Connect them to enable full access.
      </p>
      <div className="integrations-grid stagger-in">
        {mergedToolkits.map(tk => {
          const meta = TOOLKIT_META[tk.slug] || { icon: "??", tools: 0, desc: "" };
          return (
            <div key={tk.slug} className={`integration-card ${tk.connected ? "connected" : ""}`}>
              <div className="integration-header">
                <div className="integration-icon"><i className={meta.icon} /></div>
                <div className="integration-info">
                  <h3>{tk.name || tk.slug}</h3>
                  <p className="integration-description">{meta.desc}</p>
                </div>
                <span className={`status-badge ${tk.connected ? "connected" : ""}`}>
                  {tk.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
              <div className="integration-meta">
                <span className="last-sync">{meta.tools} tools available</span>
              </div>
              {tk.connected ? (
                <button
                  className="action-btn danger"
                  onClick={() => disconnectToolkit(tk.slug)}
                  disabled={disconnecting === tk.slug}
                  type="button"
                  style={{ width: "100%" }}
                >
                  {disconnecting === tk.slug ? "Disconnecting..." : "Disconnect"}
                </button>
              ) : (
                <button
                  className="connect-btn"
                  onClick={() => connectToolkit(tk.slug)}
                  disabled={connecting === tk.slug}
                  type="button"
                >
                  {connecting === tk.slug ? "Connecting..." : "Connect"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
