import React, { useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import { SearchBar } from '../components/SearchBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { DecisionResponse } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
  workspaceId?: string | null;
}

type SortKey = 'date' | 'status' | 'execution';

export default function DecisionsPage({ organizationId, token, workspaceId }: Props) {
  const [decisions, setDecisions] = useState<DecisionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', rationale: '', impact: '', status: 'decided' });

  useEffect(() => { loadDecisions(); }, [organizationId]);

  async function loadDecisions() {
    setLoading(true);
    const data = await apiRequest<DecisionResponse[]>(API_ROUTES.intelligence.decisions + `?organization_id=${organizationId}`, { token });
    setDecisions(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function createDecision() {
    await apiRequest(API_ROUTES.intelligence.decisions, { method: 'POST', token, body: { organization_id: organizationId, ...form } });
    setForm({ title: '', description: '', rationale: '', impact: '', status: 'decided' });
    setShowCreate(false);
    loadDecisions();
  }

  const filtered = useMemo(() => {
    let items = decisions;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(d => d.title.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q) || (d.rationale || '').toLowerCase().includes(q));
    }
    items = [...items].sort((a, b) => {
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'execution') return a.execution_status.localeCompare(b.execution_status);
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
    return items;
  }, [decisions, search, sortBy]);

  const statusColors: Record<string, string> = { pending: '#f0a030', decided: '#4ade80', revisited: '#00A7E1', reversed: '#CC2936', deferred: '#888' };
  const execColors: Record<string, string> = { not_started: '#888', in_progress: '#00A7E1', executed: '#4ade80', stalled: '#CC2936' };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .d-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; margin-bottom: 10px; transition: all 0.2s; cursor: pointer; overflow: hidden; }
        .d-card:hover { border-color: #333; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .d-card.expanded { border-color: #00A7E140; }
        .d-card-header { padding: 16px 20px; }
        .d-card-body { padding: 0 20px 16px; border-top: 1px solid #111; }
        .d-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .d-section { margin-top: 10px; padding: 10px 14px; background: #141414; border-radius: 8px; }
        .d-section-label { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .d-input { background: #141414; border: 1px solid #333; border-radius: 8px; padding: 10px 14px; color: #ECE4B7; font-size: 14px; width: 100%; margin-bottom: 10px; outline: none; }
        .d-btn { padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; }
        .d-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .d-sort { padding: 8px 12px; border-radius: 8px; border: 1px solid #1a1a1a; background: #0a0a0a; color: #ECE4B7; font-size: 13px; cursor: pointer; outline: none; }
        .expand-chevron { transition: transform 0.2s; display: inline-block; color: #888; font-size: 12px; margin-right: 8px; }
        .expand-chevron.open { transform: rotate(90deg); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#ECE4B7', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Decision Ledger</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Every decision tracked with rationale, impact, and execution status</p>
        </div>
        <button className="d-btn" style={{ background: '#00A7E1', color: '#020202' }} onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ Record Decision'}
        </button>
      </div>

      {showCreate && (
        <div className="d-card" style={{ borderColor: '#00A7E140', cursor: 'default' }}>
          <div className="d-card-header">
            <input className="d-input" placeholder="Decision title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className="d-input" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input className="d-input" placeholder="Rationale — why was this decided?" value={form.rationale} onChange={e => setForm({ ...form, rationale: e.target.value })} />
            <input className="d-input" placeholder="Impact — what changes as a result?" value={form.impact} onChange={e => setForm({ ...form, impact: e.target.value })} />
            <button className="d-btn" style={{ background: '#00A7E1', color: '#020202' }} onClick={createDecision} disabled={!form.title}>Record</button>
          </div>
        </div>
      )}

      <div className="d-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search decisions..." />
        <select className="d-sort" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
          <option value="date">Newest first</option>
          <option value="status">Status</option>
          <option value="execution">Execution status</option>
        </select>
      </div>

      {loading ? (
        <div className="skeleton-page-list">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton-list-item">
              <div className="skeleton-text">
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 12 }} />
                  <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 12 }} />
                </div>
                <div className="skeleton skeleton-line w70" />
              </div>
              <div className="skeleton skeleton-line" style={{ width: 80, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 60 }}>
          {search ? `No decisions match "${search}"` : 'No decisions recorded yet. The agent extracts these from meetings and docs automatically.'}
        </div>
      ) : (
        filtered.map(d => {
          const isExpanded = expandedId === d.id;
          return (
            <div key={d.id} className={`d-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="d-card-header" onClick={() => setExpandedId(isExpanded ? null : d.id)}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`expand-chevron ${isExpanded ? 'open' : ''}`}>&#9654;</span>
                  <span className="d-badge" style={{ background: `${statusColors[d.status] || '#888'}20`, color: statusColors[d.status] || '#888' }}>{d.status}</span>
                  <span className="d-badge" style={{ background: `${execColors[d.execution_status] || '#888'}20`, color: execColors[d.execution_status] || '#888' }}>exec: {d.execution_status}</span>
                  {d.source_type && <span className="d-badge" style={{ background: '#1a1a1a', color: '#888' }}>from {d.source_type}</span>}
                  <span style={{ color: '#888', fontSize: 12, marginLeft: 'auto' }}>
                    {d.decided_at ? new Date(d.decided_at).toLocaleDateString() : new Date(d.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 style={{ color: '#ECE4B7', fontSize: 16, fontWeight: 600 }}>{d.title}</h3>
                {d.description && !isExpanded && <p style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>{d.description.slice(0, 120)}{d.description.length > 120 ? '...' : ''}</p>}
              </div>

              {isExpanded && (
                <div className="d-card-body">
                  {d.description && (
                    <div style={{ color: '#ECE4B7', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
                      <Markdown>{d.description}</Markdown>
                    </div>
                  )}
                  {d.rationale && (
                    <div className="d-section">
                      <div className="d-section-label">Rationale</div>
                      <div style={{ color: '#ECE4B7', fontSize: 13 }}><Markdown>{d.rationale}</Markdown></div>
                    </div>
                  )}
                  {d.impact && (
                    <div className="d-section">
                      <div className="d-section-label">Impact</div>
                      <div style={{ color: '#ECE4B7', fontSize: 13 }}><Markdown>{d.impact}</Markdown></div>
                    </div>
                  )}
                  {d.review_date && (
                    <div style={{ color: '#f0a030', fontSize: 12, marginTop: 10 }}>
                      Review scheduled: {new Date(d.review_date).toLocaleDateString()}
                    </div>
                  )}
                  <div style={{ color: '#888', fontSize: 12, marginTop: 10 }}>
                    Confidence: {Math.round(d.confidence * 100)}% | Created: {new Date(d.created_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
