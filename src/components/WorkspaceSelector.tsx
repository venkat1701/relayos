import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { API_ROUTES } from "../lib/contract";
import type { WorkspaceResponse } from "../lib/types";

interface Props {
  organizationId: string;
  token: string;
  activeWorkspaceId: string | null;
  onSelect: (workspaceId: string | null) => void;
  collapsed?: boolean;
}

export function WorkspaceSelector({ organizationId, token, activeWorkspaceId, onSelect, collapsed }: Props) {
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => { loadWorkspaces(); }, [organizationId]);

  async function loadWorkspaces() {
    try {
      const data = await apiRequest<WorkspaceResponse[]>(
        API_ROUTES.workspaces.list + `?organization_id=${organizationId}`, { token },
      );
      setWorkspaces(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }

  async function createWorkspace() {
    if (!newName.trim()) return;
    try {
      await apiRequest(API_ROUTES.workspaces.create, {
        method: "POST", token,
        body: { organization_id: organizationId, name: newName.trim(), description: newDesc.trim() || null },
      });
      setNewName(""); setNewDesc(""); setShowCreate(false);
      await loadWorkspaces();
    } catch (e) { console.error(e); }
  }

  const active = workspaces.find(w => w.id === activeWorkspaceId);

  if (collapsed) {
    return (
      <button onClick={() => setOpen(!open)} style={{
        width: 40, height: 40, borderRadius: 8, border: "1px solid #1a1a1a",
        background: activeWorkspaceId ? "rgba(0,167,225,0.15)" : "#0a0a0a",
        color: "#ECE4B7", fontSize: 14, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }} title={active?.name || "All workspaces"}>
        {active?.name?.[0]?.toUpperCase() || "A"}
      </button>
    );
  }

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Workspace</span>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          background: "none", border: "none", color: "#00A7E1", fontSize: 16, cursor: "pointer", padding: 0,
        }}>+</button>
      </div>

      <select
        value={activeWorkspaceId || ""}
        onChange={e => onSelect(e.target.value || null)}
        style={{
          width: "100%", padding: "8px 10px", borderRadius: 8,
          border: "1px solid #1a1a1a", background: "#0a0a0a", color: "#ECE4B7",
          fontSize: 13, cursor: "pointer", outline: "none",
        }}
      >
        <option value="">All (no filter)</option>
        {workspaces.map(w => (
          <option key={w.id} value={w.id}>{w.name}{w.is_default ? " (default)" : ""}</option>
        ))}
      </select>

      {showCreate && (
        <div style={{ marginTop: 8 }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Workspace name"
            style={{
              width: "100%", padding: "6px 10px", borderRadius: 6,
              border: "1px solid #333", background: "#0b0b0b", color: "#ECE4B7",
              fontSize: 12, marginBottom: 4, outline: "none",
            }}
          />
          <input
            value={newDesc} onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            style={{
              width: "100%", padding: "6px 10px", borderRadius: 6,
              border: "1px solid #333", background: "#0b0b0b", color: "#ECE4B7",
              fontSize: 12, marginBottom: 6, outline: "none",
            }}
          />
          <button onClick={createWorkspace} style={{
            width: "100%", padding: "6px", borderRadius: 6, border: "none",
            background: "#00A7E1", color: "#020202", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Create</button>
        </div>
      )}
    </div>
  );
}
