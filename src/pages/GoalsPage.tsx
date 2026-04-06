import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import { SearchBar } from '../components/SearchBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { GoalResponse } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
  workspaceId?: string | null;
}

type SortKey = 'date' | 'progress' | 'status';

export default function GoalsPage({ organizationId, token, workspaceId }: Props) {
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', goal_type: 'objective', target_value: '', unit: '', calendar_hours_needed: 0 });

  useEffect(() => { loadGoals(); }, [organizationId]);

  async function loadGoals() {
    setLoading(true);
    const data = await apiRequest<GoalResponse[]>(API_ROUTES.goals.list + `?organization_id=${organizationId}`, { token });
    setGoals(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function createGoal() {
    await apiRequest(API_ROUTES.goals.create, { method: 'POST', token, body: { organization_id: organizationId, ...form } });
    setForm({ title: '', description: '', goal_type: 'objective', target_value: '', unit: '', calendar_hours_needed: 0 });
    setShowCreate(false);
    loadGoals();
  }

  async function updateProgress(id: string, progress: number) {
    await apiRequest(API_ROUTES.goals.update(id), { method: 'PATCH', token, body: { progress } });
    loadGoals();
  }

  const filtered = useMemo(() => {
    let items = goals;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(g => g.title.toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q));
    }
    items = [...items].sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
    return items;
  }, [goals, search, sortBy]);

  const statusColors: Record<string, string> = { active: '#00A7E1', achieved: '#4ade80', at_risk: '#f0a030', missed: '#CC2936', deferred: '#888' };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .g-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; margin-bottom: 12px; transition: all 0.2s; cursor: pointer; overflow: hidden; }
        .g-card:hover { border-color: #333; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .g-card.expanded { border-color: #DEC0F140; }
        .g-card-header { padding: 16px 20px; }
        .g-card-body { padding: 0 20px 16px; border-top: 1px solid #111; }
        .g-progress-bar { background: #1a1a1a; border-radius: 6px; height: 10px; margin: 10px 0 6px; overflow: hidden; }
        .g-progress-fill { height: 100%; border-radius: 6px; transition: width 0.3s; }
        .g-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .g-btn { padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; }
        .g-input { background: #141414; border: 1px solid #333; border-radius: 8px; padding: 10px 14px; color: #ECE4B7; font-size: 14px; width: 100%; margin-bottom: 12px; outline: none; }
        .g-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .g-sort { padding: 8px 12px; border-radius: 8px; border: 1px solid #1a1a1a; background: #0a0a0a; color: #ECE4B7; font-size: 13px; cursor: pointer; outline: none; }
        .expand-chevron { transition: transform 0.2s; display: inline-block; color: #888; font-size: 12px; margin-right: 8px; }
        .expand-chevron.open { transform: rotate(90deg); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#ECE4B7', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Goals & OKRs</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Track objectives, measure progress, align calendar time</p>
        </div>
        <button className="g-btn" style={{ background: '#DEC0F1', color: '#020202' }} onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showCreate && (
        <div className="g-card" style={{ borderColor: '#DEC0F140', cursor: 'default' }}>
          <div className="g-card-header">
            <input className="g-input" placeholder="Goal title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className="g-input" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <select className="g-input" value={form.goal_type} onChange={e => setForm({ ...form, goal_type: e.target.value })}>
                <option value="objective">Objective</option>
                <option value="key_result">Key Result</option>
                <option value="target">Target</option>
                <option value="milestone">Milestone</option>
              </select>
              <input className="g-input" placeholder="Target value" value={form.target_value} onChange={e => setForm({ ...form, target_value: e.target.value })} />
              <input className="g-input" placeholder="Unit (%, $, etc)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <button className="g-btn" style={{ background: '#DEC0F1', color: '#020202' }} onClick={createGoal} disabled={!form.title}>Create Goal</button>
          </div>
        </div>
      )}

      <div className="g-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search goals..." />
        <select className="g-sort" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
          <option value="date">Newest first</option>
          <option value="progress">Progress</option>
          <option value="status">Status</option>
        </select>
      </div>

      {loading ? (
        <div className="skeleton-page-list">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 12 }} />
                <div className="skeleton skeleton-line w50" style={{ marginBottom: 0 }} />
              </div>
              <div className="skeleton" style={{ height: 10, borderRadius: 6 }} />
              <div className="skeleton skeleton-line w40" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="fade-in" style={{ color: '#888', textAlign: 'center', padding: 60 }}>
          {search ? `No goals match "${search}"` : 'No goals yet. Create your first objective to start tracking.'}
        </div>
      ) : (
        <div className="stagger-in">{filtered.map(g => {
          const isExpanded = expandedId === g.id;
          const color = statusColors[g.status] || '#888';
          const calendarPct = g.calendar_hours_needed > 0 ? Math.min(100, (g.calendar_hours_allocated / g.calendar_hours_needed) * 100) : (g.calendar_hours_allocated > 0 ? 100 : 0);

          return (
            <div key={g.id} className={`g-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="g-card-header" onClick={() => setExpandedId(isExpanded ? null : g.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`expand-chevron ${isExpanded ? 'open' : ''}`}>&#9654;</span>
                    <span className="g-badge" style={{ background: `${color}20`, color }}>{g.status}</span>
                    <span className="g-badge" style={{ background: '#1a1a1a', color: '#888' }}>{g.goal_type}</span>
                  </div>
                  {g.due_at && <span style={{ color: '#888', fontSize: 12 }}>Due: {new Date(g.due_at).toLocaleDateString()}</span>}
                </div>
                <h3 style={{ color: '#ECE4B7', fontSize: 18, fontWeight: 600, margin: '10px 0 4px' }}>{g.title}</h3>
                <div className="g-progress-bar">
                  <div className="g-progress-fill" style={{
                    width: `${g.progress}%`,
                    background: g.progress >= 80 ? '#4ade80' : g.progress >= 50 ? '#00A7E1' : g.progress >= 25 ? '#f0a030' : '#CC2936',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#ECE4B7', fontSize: 14, fontWeight: 600 }}>{g.progress}%</span>
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                    {[25, 50, 75, 100].map(v => (
                      <button key={v} onClick={() => updateProgress(g.id, v)} style={{
                        padding: '3px 10px', borderRadius: 4, border: '1px solid #333',
                        background: g.progress >= v ? '#141414' : 'transparent',
                        color: '#888', fontSize: 11, cursor: 'pointer',
                      }}>{v}%</button>
                    ))}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="g-card-body">
                  {g.description && <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{g.description}</p>}
                  {g.target_value && (
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>
                      Target: {g.target_value}{g.unit ? ` ${g.unit}` : ''}{g.current_value ? ` | Current: ${g.current_value}` : ''}
                    </div>
                  )}
                  {g.calendar_hours_needed > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span style={{ color: '#888', fontSize: 11 }}>Calendar:</span>
                      <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${calendarPct}%`, height: '100%', borderRadius: 3, background: calendarPct >= 80 ? '#4ade80' : calendarPct >= 50 ? '#f0a030' : '#CC2936' }} />
                      </div>
                      <span style={{ color: '#888', fontSize: 11 }}>{g.calendar_hours_allocated}h / {g.calendar_hours_needed}h</span>
                    </div>
                  )}
                  <div style={{ color: '#888', fontSize: 12, marginTop: 10 }}>
                    Created: {new Date(g.created_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          );
        })}</div>
      )}
    </div>
  );
}
