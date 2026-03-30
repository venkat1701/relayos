/**
 * Dark Theme Dashboard Layout
 * Modern SaaS design with no emojis, gradients using color palette
 */

import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { WorkspaceSelector } from "../components/WorkspaceSelector";

interface User {
  full_name: string;
  email: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
  organizationId?: string;
  token?: string;
  activeWorkspaceId?: string | null;
  onWorkspaceSelect?: (id: string | null) => void;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description?: string;
}

const navItems: NavItem[] = [
  { id: "command", label: "Command Center", path: "/command", icon: "▦", description: "Operational intelligence" },
  { id: "inbox", label: "Inbox", path: "/inbox", icon: "✉", description: "Email threads and messages" },
  { id: "calendar", label: "Calendar", path: "/calendar", icon: "◐", description: "Meetings and events" },
  { id: "tasks", label: "Tasks", path: "/tasks", icon: "✓", description: "Task management and triage" },
  { id: "commitments", label: "Commitments", path: "/commitments", icon: "⇄", description: "Promises and follow-through" },
  { id: "goals", label: "Goals", path: "/goals", icon: "◎", description: "OKRs and objectives" },
  { id: "decisions", label: "Decisions", path: "/decisions", icon: "⚖", description: "Decision ledger" },
  { id: "documents", label: "Documents", path: "/documents", icon: "◫", description: "Docs and Sheets" },
  { id: "weekly", label: "Weekly Plan", path: "/weekly", icon: "◧", description: "Calendar optimization" },
  { id: "chat", label: "AI Agent", path: "/chat", icon: "◉", description: "Conversational agent" },
  { id: "drafts", label: "Email Drafts", path: "/drafts", icon: "✎", description: "Review & approve" },
  { id: "agent-studio", label: "Agent Studio", path: "/agent-studio", icon: "⚙", description: "Customize the agent" },
  { id: "whatsapp", label: "WhatsApp", path: "/whatsapp", icon: "W", description: "Messages & contacts" },
  { id: "workspaces", label: "Workspaces", path: "/workspaces", icon: "⊞", description: "Context isolation" },
  { id: "actions", label: "Agent Log", path: "/agent-actions", icon: "⊙", description: "Audit trail" },
  { id: "timeline", label: "Timeline", path: "/timeline", icon: "◷", description: "Activity feed" },
];

export function DashboardLayout({ children, user, onLogout, organizationId, token, activeWorkspaceId, onWorkspaceSelect }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon noise">CS</div>
            {!sidebarCollapsed && <span className="logo-text">Chief of Staff</span>}
          </div>
          <button
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>

        {organizationId && token && onWorkspaceSelect && (
          <WorkspaceSelector
            organizationId={organizationId}
            token={token}
            activeWorkspaceId={activeWorkspaceId || null}
            onSelect={onWorkspaceSelect}
            collapsed={sidebarCollapsed}
          />
        )}

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${isActivePath(item.path) ? "active" : ""}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && (
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  {item.description && <span className="nav-description">{item.description}</span>}
                </div>
              )}
              {isActivePath(item.path) && <span className="active-indicator" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer" />
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">
              {navItems.find((item) => isActivePath(item.path))?.label || "Dashboard"}
            </h1>
          </div>

          <div className="header-right">
            {/* Search */}
            <div className="search-box">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search tasks, emails, meetings..."
                className="search-input"
              />
            </div>

            {/* Notifications */}
            <button className="icon-button" title="Notifications" type="button" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C8.34315 2 7 3.34315 7 5V5.5C7 8 5 9.5 4 10.5C3.5 11 3 11.5 3 12.5C3 13.3284 3.67157 14 4.5 14H15.5C16.3284 14 17 13.3284 17 12.5C17 11.5 16.5 11 16 10.5C15 9.5 13 8 13 5.5V5C13 3.34315 11.6569 2 10 2Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 14C8 15.1046 8.89543 16 10 16C11.1046 16 12 15.1046 12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* User Menu */}
            <div className="user-menu-container">
              <button
                className="user-avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                type="button"
              >
                <div className="user-avatar">
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="user-name">{user?.full_name || "User"}</span>
                <svg className="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <p className="user-full-name">{user?.full_name}</p>
                      <p className="user-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => navigate("/settings")} type="button">
                    Settings
                  </button>
                  <button className="dropdown-item" onClick={() => navigate("/profile")} type="button">
                    Profile
                  </button>
                  <button className="dropdown-item" onClick={() => navigate("/integrations")} type="button">
                    Integrations
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={onLogout} type="button">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">{children}</main>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: #020202;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: #0a0a0a;
          color: #ECE4B7;
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
          position: relative;
          z-index: 100;
          border-right: 1px solid #1a1a1a;
        }

        .sidebar.collapsed {
          width: 80px;
        }

        .sidebar-header {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1a1a1a;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          white-space: nowrap;
          color: #ECE4B7;
        }

        .collapse-btn {
          background: rgba(236, 228, 183, 0.1);
          border: none;
          color: #ECE4B7;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-size: 18px;
        }

        .collapse-btn:hover {
          background: rgba(236, 228, 183, 0.2);
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 4px;
          border-radius: 8px;
          color: rgba(236, 228, 183, 0.6);
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(236, 228, 183, 0.05);
          color: #ECE4B7;
        }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(0, 167, 225, 0.15) 0%, rgba(222, 192, 241, 0.1) 100%);
          color: #ECE4B7;
        }

        .nav-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .nav-label {
          font-weight: 500;
          font-size: 14px;
        }

        .nav-description {
          font-size: 11px;
          color: rgba(236, 228, 183, 0.4);
        }

        .active-indicator {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: linear-gradient(180deg, #00A7E1 0%, #DEC0F1 100%);
          border-radius: 3px 0 0 3px;
        }

        /* Sidebar Footer */
        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid #1a1a1a;
        }

        .upgrade-card {
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
        }

        .upgrade-icon {
          font-size: 32px;
          margin-bottom: 8px;
          color: #020202;
        }

        .upgrade-text {
          font-weight: 600;
          font-size: 14px;
          margin: 0 0 4px;
          color: #020202;
        }

        .upgrade-subtext {
          font-size: 12px;
          color: rgba(2, 2, 2, 0.7);
          margin: 0 0 12px;
        }

        .upgrade-btn {
          width: 100%;
          padding: 8px;
          background: #020202;
          color: #ECE4B7;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .upgrade-btn:hover {
          transform: translateY(-1px);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Top Header */
        .top-header {
          height: 72px;
          background: #0a0a0a;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Search Box */
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #141414;
          padding: 8px 16px;
          border-radius: 8px;
          width: 320px;
          border: 1px solid #1a1a1a;
        }

        .search-box:focus-within {
          border-color: #00A7E1;
        }

        .search-icon {
          color: rgba(236, 228, 183, 0.4);
        }

        .search-input {
          border: none;
          background: transparent;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #ECE4B7;
        }

        .search-input::placeholder {
          color: rgba(236, 228, 183, 0.3);
        }

        /* Icon Button */
        .icon-button {
          position: relative;
          width: 40px;
          height: 40px;
          background: #141414;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: rgba(236, 228, 183, 0.6);
        }

        .icon-button:hover {
          background: #1a1a1a;
          color: #ECE4B7;
          border-color: #2a2a2a;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #CC2936 0%, #DEC0F1 100%);
          color: #020202;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          border: 2px solid #0a0a0a;
        }

        /* User Menu */
        .user-menu-container {
          position: relative;
        }

        .user-avatar-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #141414;
          border: 1px solid #1a1a1a;
          padding: 6px 12px 6px 6px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-avatar-btn:hover {
          background: #1a1a1a;
          border-color: #2a2a2a;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .user-name {
          font-weight: 500;
          font-size: 14px;
          color: #ECE4B7;
        }

        .chevron {
          color: rgba(236, 228, 183, 0.4);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
          min-width: 240px;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 16px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-full-name {
          font-weight: 600;
          font-size: 14px;
          color: #ECE4B7;
          margin: 0;
        }

        .user-email {
          font-size: 12px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .dropdown-divider {
          height: 1px;
          background: #1a1a1a;
          margin: 8px 0;
        }

        .dropdown-item {
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: rgba(236, 228, 183, 0.7);
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: #141414;
          color: #ECE4B7;
        }

        .dropdown-item.danger {
          color: #CC2936;
        }

        .dropdown-item.danger:hover {
          background: rgba(204, 41, 54, 0.1);
        }

        .dropdown-item:first-of-type {
          border-radius: 12px 12px 0 0;
        }

        .dropdown-item:last-of-type {
          border-radius: 0 0 12px 12px;
        }

        /* Page Content */
        .page-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          background: #020202;
        }

        /* Scrollbar Styling */
        .sidebar-nav::-webkit-scrollbar,
        .page-content::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(236, 228, 183, 0.1);
          border-radius: 3px;
        }

        .page-content::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        .page-content::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #00A7E1 0%, #DEC0F1 100%);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
