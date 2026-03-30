/**
 * Integrations Page - OAuth Connections + Composio External Tools
 */

import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { API_ROUTES } from "../lib/contract";

interface Integration {
  id: string;
  provider: string;
  provider_email?: string;
  status: string;
  last_sync_at?: string;
}

interface IntegrationsPageProps {
  integrations: Integration[];
  onConnect?: (provider: string) => void;
  onDisconnect?: (integrationId: string) => void;
  onSync?: (integrationId: string) => void;
}

export function IntegrationsPage({ integrations, onConnect, onDisconnect, onSync }: IntegrationsPageProps) {
  const availableIntegrations = [
    { id: "google", name: "Google Workspace", icon: "GO", description: "Gmail, Calendar, Drive, Docs, Sheets" },
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
          <div className="integrations-grid">
            {integrations.map((integration) => (
              <div key={integration.id} className="integration-card connected">
                <div className="integration-header">
                  <div className="integration-icon">
                    {integration.provider === "google" ? "GO" : integration.provider === "slack" ? "SL" : "IN"}
                  </div>
                  <div className="integration-info">
                    <h3>{integration.provider}</h3>
                    {integration.provider_email && (
                      <p className="integration-email">{integration.provider_email}</p>
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
                  <div className="integration-icon">{integration.icon}</div>
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
          font-size: 16px;
          font-weight: 700;
          color: #020202;
          flex-shrink: 0;
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
      `}</style>
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
  slack: { icon: "SL", tools: 151, desc: "Messages, channels, threads, reactions, files, canvases" },
  notion: { icon: "NO", tools: 48, desc: "Pages, databases, content blocks, queries, properties" },
  fireflies: { icon: "FF", tools: 20, desc: "Transcripts, summaries, AskFred AI, meeting bites" },
  googledocs: { icon: "GD", tools: 35, desc: "Advanced editing, markdown, headers/footers, PDF export" },
  whatsapp: { icon: "WA", tools: 15, desc: "Send messages, read conversations, manage contacts" },
};

function ComposioSection() {
  const [toolkits, setToolkits] = useState<ComposioToolkit[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("chief_of_staff_access_token");

  useEffect(() => { loadToolkits(); }, []);

  async function loadToolkits() {
    try {
      const data = await apiRequest<{ toolkits: ComposioToolkit[] }>(
        API_ROUTES.composio.toolkits, { token: token || "" }
      );
      setToolkits(Array.isArray(data.toolkits) ? data.toolkits : []);
    } catch (e) {
      console.error("Failed to load Composio toolkits:", e);
    }
    setLoading(false);
  }

  async function connectToolkit(slug: string) {
    setConnecting(slug);
    try {
      const data = await apiRequest<{ redirect_url?: string; error?: string }>(
        API_ROUTES.composio.connect,
        { method: "POST", token: token || "", body: { toolkit: slug, callback_url: window.location.href } },
      );
      if (data.redirect_url) {
        window.open(data.redirect_url, "_blank");
      } else if (data.error) {
        setConnecting("error:" + data.error);
        setTimeout(() => setConnecting(null), 3000);
      }
    } catch (e) {
      console.error("Connect failed:", e);
    }
    setConnecting(null);
  }

  if (loading) return <div style={{ color: "#888", padding: 20 }}>Loading external integrations...</div>;

  return (
    <div className="available-section">
      <h2 className="section-title">External Integrations via Composio</h2>
      <p style={{ color: "rgba(236,228,183,0.5)", fontSize: 13, marginBottom: 16 }}>
        The AI agent autonomously discovers and uses tools from these platforms. Connect them to enable full access.
      </p>
      <div className="integrations-grid">
        {(toolkits.length > 0 ? toolkits : Object.keys(TOOLKIT_META).map(slug => ({ slug, name: slug, connected: false, connection_id: null }))).map(tk => {
          const meta = TOOLKIT_META[tk.slug] || { icon: "??", tools: 0, desc: "" };
          return (
            <div key={tk.slug} className={`integration-card ${tk.connected ? "connected" : ""}`}>
              <div className="integration-header">
                <div className="integration-icon">{meta.icon}</div>
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
              {!tk.connected && (
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
