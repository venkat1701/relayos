import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import { SearchBar } from '../components/SearchBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { WorkspaceResponse } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
  onWorkspaceSelect?: (id: string | null) => void;
}

export default function WorkspacesPage({ organizationId, token, onWorkspaceSelect }: Props) {
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', context_rules_text: '' });
  const [editForm, setEditForm] = useState<{ name: string; description: string; context_rules_text: string } | null>(null);

  useEffect(() => { loadWorkspaces(); }, [organizationId]);

  async function loadWorkspaces() {
    setLoading(true);
    try {
      const data = await apiRequest<WorkspaceResponse[]>(API_ROUTES.workspaces.list + `?organization_id=${organizationId}`, { token });
      setWorkspaces(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function createWorkspace() {
    if (!form.name.trim()) return;
    let rules = {};
    try { if (form.context_rules_text.trim()) rules = JSON.parse(form.context_rules_text); } catch {}
    await apiRequest(API_ROUTES.workspaces.create, {
      method: 'POST', token,
      body: { organization_id: organizationId, name: form.name, description: form.description || null, context_rules: rules },
    });
    setForm({ name: '', description: '', context_rules_text: '' });
    setShowCreate(false);
    loadWorkspaces();
  }

  async function updateWorkspace(id: string) {
    if (!editForm) return;
    let rules = {};
    try { if (editForm.context_rules_text.trim()) rules = JSON.parse(editForm.context_rules_text); } catch {}
    await apiRequest(API_ROUTES.workspaces.update(id), {
      method: 'PATCH', token,
      body: { name: editForm.name, description: editForm.description || null, context_rules: rules },
    });
    setEditForm(null);
    loadWorkspaces();
  }

  async function deleteWorkspace(id: string) {
    await apiRequest(API_ROUTES.workspaces.delete(id), { method: 'DELETE', token });
    setDeleteId(null);
    if (selectedId === id) setSelectedId(null);
    loadWorkspaces();
  }

  const selected = workspaces.find(w => w.id === selectedId);

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <style>{`
        .ws-grid { display: grid; grid-template-columns: 380px 1fr; gap: 24px; min-height: 500px; }
        .ws-list { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden; }
        .ws-item { padding: 16px 20px; border-bottom: 1px solid #111; cursor: pointer; transition: all 0.2s; }
        .ws-item:hover { background: #111; }
        .ws-item.active { background: #111; border-left: 3px solid #00A7E1; }
        .ws-item:last-child { border-bottom: none; }
        .ws-detail { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 14px; padding: 24px; }
        .ws-field { margin-bottom: 16px; }
        .ws-label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .ws-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #333; background: #0b0b0b; color: #ECE4B7; font-size: 14px; outline: none; }
        .ws-input:focus { border-color: #00A7E1; }
        .ws-textarea { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #333; background: #0b0b0b; color: #ECE4B7; font-size: 13px; outline: none; min-height: 80px; font-family: inherit; resize: vertical; }
        .ws-btn { padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .ws-section { background: #141414; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
        .ws-section-title { color: #ECE4B7; font-size: 13px; font-weight: 600; margin-bottom: 10px; }
        .ws-chip { display: inline-block; padding: 4px 12px; background: #1a1a1a; border-radius: 20px; font-size: 12px; color: #aaa; margin: 2px 4px 2px 0; }
        .ws-empty { display: flex; align-items: center; justify-content: center; height: 400px; color: #888; font-size: 14px; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#ECE4B7', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Workspaces</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Organize your work into context-isolated spaces. Each workspace scopes what the AI agent sees.</p>
        </div>
        <button className="ws-btn" style={{ background: '#00A7E1', color: '#020202' }} onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ New Workspace'}
        </button>
      </div>

      {showCreate && (
        <div style={{ background: '#0a0a0a', border: '1px solid #00A7E140', borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div className="ws-field">
            <div className="ws-label">Name</div>
            <input className="ws-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Product Launch Q2" />
          </div>
          <div className="ws-field">
            <div className="ws-label">Description — what this workspace is about</div>
            <textarea className="ws-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the purpose, goals, and scope of this workspace. The AI agent uses this to filter relevant context." />
          </div>
          <div className="ws-field">
            <div className="ws-label">Context rules (JSON, optional)</div>
            <textarea className="ws-textarea" style={{ fontFamily: 'monospace', fontSize: 12 }} value={form.context_rules_text} onChange={e => setForm({ ...form, context_rules_text: e.target.value })} placeholder='{"focus_topics": ["launch", "marketing"], "exclude_topics": ["hiring"]}' />
          </div>
          <button className="ws-btn" style={{ background: '#00A7E1', color: '#020202' }} onClick={createWorkspace} disabled={!form.name.trim()}>Create Workspace</button>
        </div>
      )}

      {loading ? (
        <div>{[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 100 }} />)}</div>
      ) : workspaces.length === 0 && !showCreate ? (
        <div className="ws-empty">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>&#9634;</div>
            <div style={{ fontSize: 16, color: '#ECE4B7', marginBottom: 8 }}>No workspaces yet</div>
            <div>Create a workspace to isolate context for different projects, initiatives, or teams.</div>
          </div>
        </div>
      ) : (
        <div className="ws-grid">
          <div className="ws-list">
            {workspaces.map(w => (
              <div key={w.id} className={`ws-item ${selectedId === w.id ? 'active' : ''}`} onClick={() => { setSelectedId(w.id); setEditForm(null); }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#ECE4B7', fontSize: 15, fontWeight: 600 }}>{w.name}</div>
                  {w.is_default && <span style={{ fontSize: 10, color: '#00A7E1', background: '#00A7E115', padding: '2px 8px', borderRadius: 10 }}>default</span>}
                </div>
                {w.description && <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>{w.description.slice(0, 80)}{w.description.length > 80 ? '...' : ''}</div>}
                <div style={{ color: '#666', fontSize: 11, marginTop: 6 }}>
                  {w.linked_project_ids.length} projects | {w.linked_document_ids.length} docs | Created {new Date(w.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          <div className="ws-detail">
            {!selected ? (
              <div className="ws-empty">Select a workspace to view and edit its context</div>
            ) : editForm ? (
              <>
                <div className="ws-field">
                  <div className="ws-label">Name</div>
                  <input className="ws-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="ws-field">
                  <div className="ws-label">Description</div>
                  <textarea className="ws-textarea" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="ws-field">
                  <div className="ws-label">Context rules (JSON)</div>
                  <textarea className="ws-textarea" style={{ fontFamily: 'monospace', fontSize: 12 }} value={editForm.context_rules_text} onChange={e => setEditForm({ ...editForm, context_rules_text: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="ws-btn" style={{ background: '#00A7E1', color: '#020202' }} onClick={() => updateWorkspace(selected.id)}>Save Changes</button>
                  <button className="ws-btn" style={{ background: 'transparent', border: '1px solid #333', color: '#ECE4B7' }} onClick={() => setEditForm(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ color: '#ECE4B7', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{selected.name}</h2>
                    {selected.description && <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.5 }}>{selected.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="ws-btn" style={{ background: '#141414', color: '#ECE4B7', border: '1px solid #333' }} onClick={() => setEditForm({
                      name: selected.name, description: selected.description || '',
                      context_rules_text: JSON.stringify(selected.context_rules, null, 2),
                    })}>Edit</button>
                    <button className="ws-btn" style={{ background: '#141414', color: '#00A7E1', border: '1px solid #00A7E140' }} onClick={() => onWorkspaceSelect?.(selected.id)}>
                      Activate
                    </button>
                    <button className="ws-btn" style={{ background: '#141414', color: '#CC2936', border: '1px solid #CC293640' }} onClick={() => setDeleteId(selected.id)}>Delete</button>
                  </div>
                </div>

                <div className="ws-section">
                  <div className="ws-section-title">Context Rules</div>
                  {Object.keys(selected.context_rules).length === 0 ? (
                    <div style={{ color: '#666', fontSize: 13 }}>No rules set. Click Edit to add focus topics, exclusions, or custom instructions.</div>
                  ) : (
                    <pre style={{ color: '#aaa', fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{JSON.stringify(selected.context_rules, null, 2)}</pre>
                  )}
                </div>

                <div className="ws-section">
                  <div className="ws-section-title">Linked Projects</div>
                  {selected.linked_project_ids.length === 0 ? (
                    <div style={{ color: '#666', fontSize: 13 }}>No projects linked yet.</div>
                  ) : (
                    selected.linked_project_ids.map((id, i) => <span key={i} className="ws-chip">{id}</span>)
                  )}
                </div>

                <div className="ws-section">
                  <div className="ws-section-title">Linked Documents</div>
                  {selected.linked_document_ids.length === 0 ? (
                    <div style={{ color: '#666', fontSize: 13 }}>No documents linked yet.</div>
                  ) : (
                    selected.linked_document_ids.map((id, i) => <span key={i} className="ws-chip">{id}</span>)
                  )}
                </div>

                <div className="ws-section">
                  <div className="ws-section-title">Linked Folders</div>
                  {selected.linked_folder_paths.length === 0 ? (
                    <div style={{ color: '#666', fontSize: 13 }}>No folders linked yet.</div>
                  ) : (
                    selected.linked_folder_paths.map((p, i) => <span key={i} className="ws-chip">{p}</span>)
                  )}
                </div>

                <div style={{ color: '#666', fontSize: 12, marginTop: 16 }}>
                  Created: {new Date(selected.created_at).toLocaleString()} | ID: {selected.id}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Workspace"
          message="This will remove the workspace and unlink all associated context. Items will not be deleted but will lose workspace scoping."
          confirmLabel="Delete"
          danger
          onConfirm={() => deleteWorkspace(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
