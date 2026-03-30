import React, { useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import { SearchBar } from '../components/SearchBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { CommitmentResponse } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
  workspaceId?: string | null;
}

type Tab = 'all' | 'overdue' | 'waiting' | 'mine';
type SortKey = 'date' | 'due' | 'type' | 'status';

export default function CommitmentsPage({ organizationId, token, workspaceId }: Props) {
  const [commitments, setCommitments] = useState<CommitmentResponse[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [nudging, setNudging] = useState<string | null>(null);
  const [nudgeResult, setNudgeResult] = useState<any>(null);

  useEffect(() => { loadCommitments(); }, [organizationId, tab]);

  async function loadCommitments() {
    setLoading(true);
    try {
      let url = API_ROUTES.commitments.list + `?organization_id=${organizationId}&limit=200`;
      if (tab === 'overdue') url = API_ROUTES.commitments.overdue + `?organization_id=${organizationId}`;
      else if (tab === 'waiting') url = API_ROUTES.commitments.waiting + `?organization_id=${organizationId}`;
      else if (tab === 'mine') url += '&status=open';
      const data = await apiRequest<CommitmentResponse[]>(url, { token });
      setCommitments(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let items = commitments;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.owner_email || '').toLowerCase().includes(q) ||
        (c.counterparty_email || '').toLowerCase().includes(q)
      );
    }
    items = [...items].sort((a, b) => {
      if (sortBy === 'due') return (a.due_at || 'z').localeCompare(b.due_at || 'z');
      if (sortBy === 'type') return a.commitment_type.localeCompare(b.commitment_type);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
    return items;
  }, [commitments, search, sortBy]);

  async function nudge(id: string) {
    setNudging(id);
    try {
      const result = await apiRequest<any>(API_ROUTES.commitments.nudge(id), { method: 'POST', token });
      if (result?.target_email) {
        setNudgeResult(result);
        setTimeout(() => setNudgeResult(null), 5000);
      }
    } catch (e) { console.error(e); }
    setNudging(null);
  }

  async function markComplete(id: string) {
    await apiRequest(API_ROUTES.commitments.update(id), { method: 'PATCH', token, body: { status: 'completed' } });
    loadCommitments();
  }

  async function deleteCommitment(id: string) {
    await apiRequest(API_ROUTES.commitments.update(id), { method: 'PATCH', token, body: { status: 'deleted' } });
    setDeleteId(null);
    loadCommitments();
  }

  const typeColors: Record<string, string> = {
    promise_made: '#DEC0F1', promise_received: '#00A7E1', action_item: '#f0a030', deliverable: '#4ade80', follow_up: '#ECE4B7',
  };
  const statusColors: Record<string, string> = {
    open: '#888', in_progress: '#00A7E1', completed: '#4ade80', overdue: '#CC2936', broken: '#CC2936', deferred: '#f0d060',
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .cm-tabs { display: flex; gap: 4px; background: #0a0a0a; border-radius: 10px; padding: 4px; border: 1px solid #1a1a1a; }
        .cm-tab { padding: 10px 20px; border-radius: 8px; border: none; background: transparent; color: #888; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        .cm-tab.active { background: #141414; color: #ECE4B7; }
        .cm-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; margin-bottom: 8px; transition: all 0.2s; cursor: pointer; overflow: hidden; }
        .cm-card:hover { border-color: #333; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .cm-card.expanded { border-color: #00A7E140; }
        .cm-card-header { padding: 16px 20px; }
        .cm-card-body { padding: 0 20px 16px; border-top: 1px solid #111; }
        .cm-row { display: flex; justify-content: space-between; align-items: center; }
        .cm-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .cm-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid #333; background: transparent; color: #ECE4B7; cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .cm-btn:hover { background: #1a1a1a; }
        .cm-btn.danger { border-color: #CC2936; color: #CC2936; }
        .cm-btn.success { border-color: #4ade80; color: #4ade80; }
        .cm-btn.nudge { border-color: #f0a030; color: #f0a030; }
        .cm-evidence { background: #141414; border-left: 3px solid #333; padding: 10px 14px; margin-top: 10px; font-size: 13px; color: #aaa; font-style: italic; border-radius: 0 8px 8px 0; }
        .cm-meta { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
        .cm-meta-item { color: #888; font-size: 12px; }
        .cm-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .cm-sort { padding: 8px 12px; border-radius: 8px; border: 1px solid #1a1a1a; background: #0a0a0a; color: #ECE4B7; font-size: 13px; cursor: pointer; outline: none; }
        .nudge-toast { position: fixed; bottom: 24px; right: 24px; background: #0a0a0a; border: 1px solid #4ade80; border-radius: 12px; padding: 16px 24px; color: #ECE4B7; z-index: 1000; max-width: 400px; }
        .expand-chevron { transition: transform 0.2s; display: inline-block; color: #888; font-size: 12px; }
        .expand-chevron.open { transform: rotate(90deg); }
      `}</style>

      <h1 style={{ color: '#ECE4B7', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Commitments</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Track promises made, received, and action items</p>

      <div className="cm-toolbar">
        <div className="cm-tabs">
          {(['all', 'overdue', 'waiting', 'mine'] as Tab[]).map(t => (
            <button key={t} className={`cm-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t === 'overdue' ? 'Overdue' : t === 'waiting' ? 'Waiting on Others' : 'My Commitments'}
            </button>
          ))}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search commitments..." />
        <select className="cm-sort" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
          <option value="date">Newest first</option>
          <option value="due">Due date</option>
          <option value="type">Type</option>
          <option value="status">Status</option>
        </select>
      </div>

      {loading ? (
        <div>{[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 90 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 60 }}>
          {search ? `No commitments match "${search}"` : 'No commitments found. The agent will extract these from your emails, meetings, and docs.'}
        </div>
      ) : (
        filtered.map(c => {
          const isOverdue = c.due_at && new Date(c.due_at) < new Date() && !['completed', 'broken', 'deleted'].includes(c.status);
          const daysOverdue = c.due_at ? Math.floor((Date.now() - new Date(c.due_at).getTime()) / 86400000) : 0;
          const isExpanded = expandedId === c.id;

          return (
            <div key={c.id} className={`cm-card ${isExpanded ? 'expanded' : ''}`} style={isOverdue ? { borderColor: '#CC293640' } : undefined}>
              <div className="cm-card-header" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                <div className="cm-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span className={`expand-chevron ${isExpanded ? 'open' : ''}`}>&#9654;</span>
                      <span className="cm-badge" style={{ background: `${typeColors[c.commitment_type] || '#888'}20`, color: typeColors[c.commitment_type] || '#888' }}>
                        {c.commitment_type.replace('_', ' ')}
                      </span>
                      <span className="cm-badge" style={{ background: `${statusColors[c.status] || '#888'}20`, color: statusColors[c.status] || '#888' }}>
                        {isOverdue ? `${daysOverdue}d overdue` : c.status}
                      </span>
                    </div>
                    <div style={{ color: '#ECE4B7', fontSize: 15, fontWeight: 500 }}>{c.title}</div>
                    <div className="cm-meta">
                      {c.owner_email && <span className="cm-meta-item">Owner: {c.owner_email}</span>}
                      {c.due_at && <span className="cm-meta-item">Due: {new Date(c.due_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                    {c.status !== 'completed' && c.status !== 'deleted' && (
                      <>
                        {isOverdue && (
                          <button className="cm-btn nudge" onClick={() => nudge(c.id)} disabled={nudging === c.id}>
                            {nudging === c.id ? '...' : 'Nudge'}
                          </button>
                        )}
                        <button className="cm-btn success" onClick={() => markComplete(c.id)}>Done</button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="cm-card-body">
                  {c.description && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
                      <div style={{ color: '#ECE4B7', fontSize: 13, lineHeight: 1.6 }}>
                        <Markdown>{c.description}</Markdown>
                      </div>
                    </div>
                  )}
                  {c.evidence_text && (
                    <div className="cm-evidence">"{c.evidence_text}"</div>
                  )}
                  <div className="cm-meta" style={{ marginTop: 12 }}>
                    {c.counterparty_email && <span className="cm-meta-item">Counterparty: {c.counterparty_email}</span>}
                    {c.source_type && <span className="cm-meta-item">Source: {c.source_type}</span>}
                    <span className="cm-meta-item">Confidence: {Math.round(c.confidence * 100)}%</span>
                    {c.remind_count > 0 && <span className="cm-meta-item">Nudged {c.remind_count}x</span>}
                    <span className="cm-meta-item">Created: {new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="cm-btn danger" onClick={() => setDeleteId(c.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Commitment"
          message="Are you sure you want to delete this commitment? This action cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => deleteCommitment(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {nudgeResult && !nudgeResult.error && (
        <div className="nudge-toast">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Nudge Generated</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>To: {nudgeResult.target_email}</div>
          <div style={{ fontSize: 13, marginTop: 8 }}>{nudgeResult.message}</div>
        </div>
      )}
    </div>
  );
}
