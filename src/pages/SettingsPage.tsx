/**
 * Dark Theme Settings Page - App Configuration
 */

interface SettingsPageProps {
  agentRunning?: boolean;
  onStartAgent?: () => void;
  onStopAgent?: () => void;
}

export function SettingsPage({ agentRunning = false, onStartAgent, onStopAgent }: SettingsPageProps = {}) {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="subtitle">Manage your Chief of Staff preferences</p>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h2 className="section-title">General</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Auto-refresh</h3>
              <p>Automatically refresh data every 30 seconds</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Desktop notifications</h3>
              <p>Show browser notifications for important updates</p>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Appearance</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Theme</h3>
              <p>Choose your interface theme</p>
            </div>
            <select className="setting-select">
              <option>Light</option>
              <option selected>Dark</option>
              <option>Auto</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">AI Assistant</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Autonomous Agent</h3>
              <p>AI continuously monitors your workspace and generates proactive suggestions</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={agentRunning}
                onChange={(e) => {
                  if (e.target.checked) {
                    onStartAgent?.();
                  } else {
                    onStopAgent?.();
                  }
                }}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Proactive suggestions</h3>
              <p>Let AI suggest tasks and optimizations</p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Daily brief time</h3>
              <p>When to generate your daily executive brief</p>
            </div>
            <input type="time" className="setting-input" defaultValue="08:00" />
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Privacy & Security</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Two-factor authentication</h3>
              <p>Add an extra layer of security</p>
            </div>
            <button className="setup-btn">Setup</button>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page {
          max-width: 900px;
          margin: 0 auto;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .settings-header h1 {
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

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-section {
          background: #0a0a0a;
          border-radius: 12px;
          border: 1px solid #1a1a1a;
          padding: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 20px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #1a1a1a;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info h3 {
          font-size: 15px;
          font-weight: 600;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .setting-info p {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .toggle {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 28px;
        }

        .toggle input {
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
          background-color: #1a1a1a;
          transition: .3s;
          border-radius: 28px;
          border: 1px solid #2a2a2a;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 3px;
          background-color: rgba(236, 228, 183, 0.3);
          transition: .3s;
          border-radius: 50%;
        }

        .toggle input:checked + .toggle-slider {
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          border-color: transparent;
        }

        .toggle input:checked + .toggle-slider:before {
          transform: translateX(20px);
          background-color: #020202;
        }

        .setting-select,
        .setting-input {
          padding: 8px 12px;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          font-size: 14px;
          color: #ECE4B7;
          background: #141414;
          outline: none;
        }

        .setting-select:focus,
        .setting-input:focus {
          border-color: #00A7E1;
        }

        .setup-btn {
          padding: 8px 20px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .setup-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 167, 225, 0.3);
        }
      `}</style>
    </div>
  );
}
