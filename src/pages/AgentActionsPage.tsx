import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import { SearchBar } from '../components/SearchBar';
import type { AgentActionResponse } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
  workspaceId?: string | null;
}

export default function AgentActionsPage({ organizationId, token, workspaceId }: Props) {
  const [actions, setActions] = useState<AgentActionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => { loadActions(); const i = setInterval(loadActions, 15000); return () => clearInterval(i); }, [organizationId]);

  async function loadActions() {
    try {
      const data = await apiRequest<AgentActionResponse[]>(API_ROUTES.intelligence.agentActions + `?organization_id=${organizationId}&limit=100`, { token });
      setActions(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function approve(id: string) {
    await apiRequest(API_ROUTES.intelligence.agentActionApprove(id), { method: 'POST', token });
    loadActions();
  }
  async function reject(id: string) {
    await apiRequest(API_ROUTES.intelligence.agentActionReject(id), { method: 'POST', token });
    loadActions();
  }

  const filtered = useMemo(() => {
    let items = actions;
    if (filterStatus !== 'all') items = items.filter(a => a.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(a => a.title.toLowerCase().includes(q) || a.action_type.toLowerCase().includes(q));
    }
    return items;
  }, [actions, search, filterStatus]);

  const statusColors: Record<string, string> = {
    proposed: '#DEC0F1', approved: '#00A7E1', executed: '#4ade80', rejected: '#CC2936', failed: '#CC2936', reverted: '#f0a030',
  };

  const pending = filtered.filter(a => a.status === 'proposed');
  const history = filtered.filter(a => a.status !== 'proposed');

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .aa-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; margin-bottom: 8px; transition: all 0.2s; overflow: hidden; cursor: pointer; }
        .aa-card:hover { border-color: #333; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .aa-card.expanded { border-color: #DEC0F130; }
        .aa-card-header { padding: 14px 20px; }
        .aa-card-body { padding: 0 20px 14px; border-top: 1px solid #111; }
        .aa-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .aa-btn { padding: 6px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; }
        .aa-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .aa-filter { padding: 8px 12px; border-radius: 8px; border: 1px solid #1a1a1a; background: #0a0a0a; color: #ECE4B7; font-size: 13px; cursor: pointer; outline: none; }
        .aa-section-title { color: #ECE4B7; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .aa-evidence-chip { padding: 2px 8px; background: #141414; border-radius: 4px; font-size: 11px; color: #888; }
        .expand-chevron { transition: transform 0.2s; display: inline-block; color: #888; font-size: 12px; margin-right: 6px; }
        .expand-chevron.open { transform: rotate(90deg); }
      `}</style>

      <h1 style={{ color: '#ECE4B7', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Agent Actions</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Full audit trail of every autonomous action</p>

      <div className="aa-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search actions..." />
        <select className="aa-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="proposed">Proposed</option>
          <option value="approved">Approved</option>
          <option value="executed">Executed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div>{[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 80 }} />)}</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="aa-section-title">
                <span style={{ background: '#DEC0F120', color: '#DEC0F1', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>{pending.length}</span>
                Awaiting Approval
              </div>
              {pending.map(a => {
                const isExpanded = expandedId === a.id;
                return (
                  <div key={a.id} className={`aa-card ${isExpanded ? 'expanded' : ''}`} style={{ borderColor: '#DEC0F130' }}>
                    <div className="aa-card-header" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <span className={`expand-chevron ${isExpanded ? 'open' : ''}`}>&#9654;</span>
                            <span className="aa-badge" style={{ background: '#DEC0F120', color: '#DEC0F1' }}>proposed</span>
                            <span style={{ color: '#888', fontSize: 12 }}>{a.action_type}</span>
                            <span style={{ color: '#888', fontSize: 12 }}>confidence: {Math.round(a.confidence * 100)}%</span>
                          </div>
                          <div style={{ color: '#ECE4B7', fontSize: 15, fontWeight: 500 }}>{a.title}</div>
                          {a.description && <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>{a.description}</div>}
                        </div>
                        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button className="aa-btn" style={{ background: '#4ade8030', color: '#4ade80' }} onClick={() => approve(a.id)}>Approve</button>
                          <button className="aa-btn" style={{ background: '#CC293630', color: '#CC2936' }} onClick={() => reject(a.id)}>Reject</button>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="aa-card-body">
                        {a.source_evidence.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                            <span style={{ color: '#888', fontSize: 11 }}>Evidence:</span>
                            {a.source_evidence.map((e: any, i) => (
                              <span key={i} className="aa-evidence-chip">{e.type}: {e.title || e.id}</span>
                            ))}
                          </div>
                        )}
                        <div style={{ color: '#888', fontSize: 12 }}>Mode: {a.autonomy_mode} | {a.requires_approval ? 'Requires approval' : 'Auto-approved'}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="aa-section-title">Action History</div>
          {history.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>
              {search || filterStatus !== 'all' ? 'No matching actions.' : 'No actions recorded yet.'}
            </div>
          ) : (
            history.map(a => {
              const isExpanded = expandedId === a.id;
              const color = statusColors[a.status] || '#888';
              return (
                <div key={a.id} className={`aa-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="aa-card-header" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`expand-chevron ${isExpanded ? 'open' : ''}`}>&#9654;</span>
                        <span className="aa-badge" style={{ background: `${color}20`, color }}>{a.status}</span>
                        <span style={{ color: '#ECE4B7', fontSize: 14 }}>{a.title}</span>
                        <span style={{ color: '#888', fontSize: 12 }}>{a.action_type}</span>
                      </div>
                      <span style={{ color: '#888', fontSize: 12 }}>
                        {a.executed_at ? new Date(a.executed_at).toLocaleString() : new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="aa-card-body">
                      {a.description && <div style={{ color: '#aaa', fontSize: 13, marginBottom: 8 }}>{a.description}</div>}
                      <div style={{ color: '#888', fontSize: 12 }}>
                        Mode: {a.autonomy_mode} | Confidence: {Math.round(a.confidence * 100)}% | {a.requires_approval ? 'Required approval' : 'Auto-approved'}
                      </div>
                      {a.approved_at && <div style={{ color: '#888', fontSize: 12 }}>Approved: {new Date(a.approved_at).toLocaleString()}</div>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
