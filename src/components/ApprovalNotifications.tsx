/**
 * Approval Notifications Component
 *
 * Displays pending approval requests from the autonomous AI agent.
 * Allows users to approve or reject suggested actions.
 */

import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";
import { API_ROUTES } from "../lib/contract";

export interface Approval {
  id: string;
  type: string;
  title: string;
  description: string;
  action: string;
  action_params: Record<string, any>;
  priority: "high" | "medium" | "low";
  status: string;
  created_at: string;
}

interface ApprovalNotificationsProps {
  organizationId: string;
  token: string;
  onApprovalDecided?: () => void;
  sidebarCollapsed?: boolean;
}

export function ApprovalNotifications({ organizationId, token, onApprovalDecided, sidebarCollapsed = false }: ApprovalNotificationsProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApprovals = async () => {
    try {
      const data = await apiRequest<Approval[]>(
        API_ROUTES.approvals + `?organization_id=${organizationId}&status=pending`,
        { token },
      );
      setApprovals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load approvals:", err);
    }
  };

  useEffect(() => {
    void loadApprovals();
    const interval = setInterval(() => loadApprovals(), 30000);
    return () => clearInterval(interval);
  }, [organizationId, token]);

  const handleDecision = async (approvalId: string, decision: "approve" | "reject") => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(
        API_ROUTES.approvals + `/${approvalId}/decide`,
        { method: "POST", token, body: { decision } },
      );
      await loadApprovals();
      onApprovalDecided?.();
    } catch (err) {
      console.error("Failed to process decision:", err);
      setError("Failed to process decision. Please try again.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  if (approvals.length === 0) {
    return null; // Don't show component if no approvals
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#CC2936";
      case "medium":
        return "#00A7E1";
      case "low":
        return "#ECE4B7";
      default:
        return "#ECE4B7";
    }
  };

  if (minimized) {
    return (
      <div
        className={`approval-fab ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
        onClick={() => setMinimized(false)}
        title={`${approvals.length} AI suggestion(s)`}
      >
        <span className="fab-count">{approvals.length}</span>
        <style>{`
          .approval-fab {
            position: fixed;
            bottom: 24px;
            left: 304px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 16px rgba(0, 167, 225, 0.35);
            transition: left 0.3s ease, transform 0.2s;
            animation: fabIn 0.25s ease-out;
          }
          .approval-fab:hover {
            transform: scale(1.1);
          }
          .approval-fab.sidebar-collapsed {
            left: 104px;
          }
          .fab-count {
            color: #020202;
            font-weight: 800;
            font-size: 16px;
          }
          @keyframes fabIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`approval-notifications ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="approvals-header">
        <div className="header-badge">
          <span className="badge-count">{approvals.length}</span>
          <span className="badge-text">AI Suggestions</span>
        </div>
        <button
          className="minimize-btn"
          onClick={() => { setMinimized(true); setExpandedId(null); }}
          type="button"
          title="Minimize"
        >
          —
        </button>
      </div>

      <div className="approvals-list">
        {approvals.map((approval) => {
          const isExpanded = expandedId === approval.id;

          return (
            <div
              key={approval.id}
              className={`approval-card ${isExpanded ? "expanded" : ""}`}
            >
              <div
                className="approval-summary"
                onClick={() => setExpandedId(isExpanded ? null : approval.id)}
              >
                <div
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(approval.priority) }}
                />
                <div className="approval-content">
                  <h4 className="approval-title">{approval.title}</h4>
                  <p className="approval-time">
                    {new Date(approval.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button className="expand-btn" type="button">
                  {isExpanded ? "▼" : "▶"}
                </button>
              </div>

              {isExpanded && (
                <div className="approval-details">
                  <p className="approval-description">{approval.description}</p>

                  <div className="approval-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleDecision(approval.id, "approve")}
                      disabled={loading}
                      type="button"
                    >
                      {loading ? "..." : "Approve & Execute"}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleDecision(approval.id, "reject")}
                      disabled={loading}
                      type="button"
                    >
                      {loading ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .approval-notifications {
          position: fixed;
          bottom: 24px;
          left: 304px;
          width: 380px;
          max-height: 600px;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 1000;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
          transition: left 0.3s ease;
        }

        .approval-notifications.sidebar-collapsed {
          left: 104px;
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .approvals-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #1a1a1a;
          background: linear-gradient(135deg, rgba(0, 167, 225, 0.1) 0%, rgba(222, 192, 241, 0.1) 100%);
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .badge-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          font-weight: 700;
          font-size: 14px;
        }

        .badge-text {
          font-size: 15px;
          font-weight: 600;
          color: #ECE4B7;
        }

        .minimize-btn {
          background: none;
          border: none;
          color: rgba(236, 228, 183, 0.5);
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
          transition: color 0.2s;
        }

        .minimize-btn:hover {
          color: #ECE4B7;
        }

        .approvals-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .approval-card {
          border-bottom: 1px solid #1a1a1a;
          transition: background 0.2s;
        }

        .approval-card:hover {
          background: rgba(0, 167, 225, 0.03);
        }

        .approval-card.expanded {
          background: rgba(0, 167, 225, 0.05);
        }

        .approval-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          cursor: pointer;
        }

        .priority-indicator {
          width: 4px;
          height: 40px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .approval-content {
          flex: 1;
        }

        .approval-title {
          font-size: 14px;
          font-weight: 600;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .approval-time {
          font-size: 12px;
          color: rgba(236, 228, 183, 0.4);
          margin: 0;
        }

        .expand-btn {
          background: none;
          border: none;
          color: rgba(236, 228, 183, 0.5);
          font-size: 12px;
          cursor: pointer;
          padding: 8px;
          transition: color 0.2s;
        }

        .expand-btn:hover {
          color: #ECE4B7;
        }

        .approval-details {
          padding: 0 16px 16px 32px;
          animation: expandDetails 0.2s ease-out;
        }

        @keyframes expandDetails {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .approval-description {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.7);
          line-height: 1.5;
          margin: 0 0 16px;
        }

        .approval-actions {
          display: flex;
          gap: 12px;
        }

        .approve-btn,
        .reject-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .approve-btn {
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
        }

        .approve-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 167, 225, 0.3);
        }

        .reject-btn {
          background: rgba(204, 41, 54, 0.2);
          color: #CC2936;
          border: 1px solid #CC2936;
        }

        .reject-btn:hover:not(:disabled) {
          background: rgba(204, 41, 54, 0.3);
        }

        .approve-btn:disabled,
        .reject-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
