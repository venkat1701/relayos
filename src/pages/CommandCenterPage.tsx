import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import { ContextQuestions } from '../components/ContextQuestions';
import type { CrisisAssessment, CommitmentResponse, GoalResponse, RiskResponse, MeetingPrepResponse } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
  workspaceId?: string | null;
}

export default function CommandCenterPage({ organizationId, token, workspaceId }: Props) {
  const [crisis, setCrisis] = useState<CrisisAssessment | null>(null);
  const [commitmentSummary, setCommitmentSummary] = useState<any>(null);
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [risks, setRisks] = useState<RiskResponse[]>([]);
  const [upcomingPreps, setUpcomingPreps] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [organizationId]);

  async function loadData() {
    try {
      const [crisisRes, commRes, goalsRes, risksRes, prepsRes, actionsRes] = await Promise.all([
        apiRequest<CrisisAssessment>(API_ROUTES.intelligence.crisisAssess + `?organization_id=${organizationId}`, { token }).catch(() => null),
        apiRequest<any>(API_ROUTES.commitments.summary + `?organization_id=${organizationId}`, { token }).catch(() => null),
        apiRequest<GoalResponse[]>(API_ROUTES.goals.list + `?organization_id=${organizationId}&status=active`, { token }).catch(() => null),
        apiRequest<RiskResponse[]>(API_ROUTES.intelligence.risks + `?organization_id=${organizationId}`, { token }).catch(() => null),
        apiRequest<any[]>(API_ROUTES.intelligence.meetingPrepUpcoming + `?organization_id=${organizationId}`, { token }).catch(() => null),
        apiRequest<any[]>(API_ROUTES.intelligence.agentActionsPending + `?organization_id=${organizationId}`, { token }).catch(() => null),
      ]);
      if (crisisRes) setCrisis(crisisRes);
      if (commRes) setCommitmentSummary(commRes);
      setGoals(Array.isArray(goalsRes) ? goalsRes : []);
      setRisks(Array.isArray(risksRes) ? risksRes : []);
      setUpcomingPreps(Array.isArray(prepsRes) ? prepsRes : []);
      setPendingActions(Array.isArray(actionsRes) ? actionsRes : []);
    } catch (e) {
      console.error('Command center load failed:', e);
      setError('Failed to load operational data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function approveAction(actionId: string) {
    await apiRequest(API_ROUTES.intelligence.agentActionApprove(actionId), { method: 'POST', token });
    loadData();
  }

  async function rejectAction(actionId: string) {
    await apiRequest(API_ROUTES.intelligence.agentActionReject(actionId), { method: 'POST', token });
    loadData();
  }

  const crisisColor = crisis?.level === 'critical' ? '#CC2936' : crisis?.level === 'elevated' ? '#f0a030' : crisis?.level === 'watch' ? '#f0d060' : '#4ade80';
  const crisisIcon = crisis?.level === 'critical' ? '!!' : crisis?.level === 'elevated' ? '!' : crisis?.level === 'watch' ? '~' : '';

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <style>{`
        .cc-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .cc-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; }
        .cc-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .cc-card-title { color: #ECE4B7; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .cc-stat { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
        .cc-label { color: #888; font-size: 13px; }
        .cc-full { grid-column: 1 / -1; }
        .cc-two { grid-column: span 2; }
        .cc-item { padding: 12px 0; border-bottom: 1px solid #141414; display: flex; justify-content: space-between; align-items: center; }
        .cc-item:last-child { border-bottom: none; }
        .cc-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .cc-action-btn { padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; margin-left: 8px; }
        .crisis-banner { border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px; }
        .signal-item { padding: 8px 12px; margin: 4px 0; background: #141414; border-radius: 8px; font-size: 13px; color: #ECE4B7; }
      `}</style>

      <h1 style={{ color: '#ECE4B7', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Command Center</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Real-time operational intelligence</p>

      {error && (
        <div style={{ background: '#CC293615', border: '1px solid #CC293640', borderRadius: 10, padding: '12px 20px', marginBottom: 20, color: '#CC2936', fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="cc-grid" style={{ marginBottom: 24 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="cc-card">
              <div className="skeleton skeleton-line w40" style={{ height: 12, marginBottom: 16 }} />
              <div className="skeleton skeleton-line w60" style={{ height: 32, marginBottom: 8 }} />
              <div className="skeleton skeleton-line w50" style={{ height: 12 }} />
            </div>
          ))}
        </div>
      )}

      {/* Crisis Banner */}
      {!loading && crisis && crisis.level !== 'normal' && (
        <div className="crisis-banner" style={{ background: `${crisisColor}15`, border: `1px solid ${crisisColor}40` }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: crisisColor }}>{crisisIcon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: crisisColor, fontWeight: 700, fontSize: 16, textTransform: 'uppercase', marginBottom: 4 }}>
              {crisis.level} — Score {crisis.score}/100
            </div>
            <div style={{ color: '#ECE4B7', fontSize: 14 }}>{crisis.summary}</div>
            {(crisis.recommended_actions || []).slice(0, 2).map((a, i) => (
              <div key={i} style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
                {a.priority === 'immediate' ? '>> ' : '> '}{a.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context Questions from Agent */}
      {!loading && <ContextQuestions organizationId={organizationId} token={token} workspaceId={workspaceId} />}

      {/* Main Grid */}
      {!loading && <div className="cc-grid fade-in">
        {/* Commitments */}
        <div className="cc-card">
          <div className="cc-card-header">
            <span className="cc-card-title">Commitments</span>
          </div>
          <div className="cc-stat" style={{ color: (commitmentSummary?.overdue_commitments?.length || 0) > 0 ? '#CC2936' : '#4ade80' }}>
            {commitmentSummary?.overdue_commitments?.length || 0}
          </div>
          <div className="cc-label">Overdue</div>
          <div style={{ marginTop: 12 }}>
            <span style={{ color: '#f0a030', fontSize: 20, fontWeight: 700 }}>{commitmentSummary?.due_soon?.length || 0}</span>
            <span className="cc-label" style={{ marginLeft: 8 }}>Due in 48h</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ color: '#00A7E1', fontSize: 20, fontWeight: 700 }}>{commitmentSummary?.waiting_on_others?.length || 0}</span>
            <span className="cc-label" style={{ marginLeft: 8 }}>Waiting on others</span>
          </div>
        </div>

        {/* Goals */}
        <div className="cc-card">
          <div className="cc-card-header">
            <span className="cc-card-title">Active Goals</span>
          </div>
          <div className="cc-stat" style={{ color: '#DEC0F1' }}>{goals.length}</div>
          <div className="cc-label">Objectives tracked</div>
          {goals.slice(0, 3).map(g => (
            <div key={g.id} style={{ marginTop: 10 }}>
              <div style={{ color: '#ECE4B7', fontSize: 13 }}>{g.title}</div>
              <div style={{ background: '#1a1a1a', borderRadius: 4, height: 6, marginTop: 4 }}>
                <div style={{
                  width: `${g.progress}%`, height: '100%', borderRadius: 4,
                  background: g.progress >= 70 ? '#4ade80' : g.progress >= 40 ? '#f0a030' : '#CC2936',
                }} />
              </div>
              <div className="cc-label">{g.progress}%{g.due_at ? ` — due ${new Date(g.due_at).toLocaleDateString()}` : ''}</div>
            </div>
          ))}
        </div>

        {/* Risks */}
        <div className="cc-card">
          <div className="cc-card-header">
            <span className="cc-card-title">Open Risks</span>
          </div>
          <div className="cc-stat" style={{ color: risks.filter(r => r.severity === 'critical').length > 0 ? '#CC2936' : '#f0a030' }}>
            {risks.length}
          </div>
          <div className="cc-label">Active risks</div>
          {risks.slice(0, 4).map(r => (
            <div key={r.id} className="cc-item" style={{ padding: '8px 0' }}>
              <span style={{ color: '#ECE4B7', fontSize: 13 }}>{r.title}</span>
              <span className="cc-badge" style={{
                background: r.severity === 'critical' ? '#CC293620' : r.severity === 'high' ? '#f0a03020' : '#1a1a1a',
                color: r.severity === 'critical' ? '#CC2936' : r.severity === 'high' ? '#f0a030' : '#888',
              }}>
                {r.severity}
              </span>
            </div>
          ))}
        </div>

        {/* Pending Agent Actions */}
        {pendingActions.length > 0 && (
          <div className="cc-card cc-full">
            <div className="cc-card-header">
              <span className="cc-card-title">Agent Proposals — Awaiting Your Approval</span>
              <span className="cc-badge" style={{ background: '#DEC0F120', color: '#DEC0F1' }}>
                {pendingActions.length} pending
              </span>
            </div>
            {pendingActions.map((a: any) => (
              <div key={a.id} className="cc-item">
                <div>
                  <div style={{ color: '#ECE4B7', fontSize: 14, fontWeight: 500 }}>{a.title}</div>
                  <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                    {a.action_type} — confidence: {Math.round((a.confidence || 0.8) * 100)}%
                  </div>
                </div>
                <div>
                  <button className="cc-action-btn" style={{ background: '#4ade8020', color: '#4ade80' }}
                    onClick={() => approveAction(a.id)}>Approve</button>
                  <button className="cc-action-btn" style={{ background: '#CC293620', color: '#CC2936' }}
                    onClick={() => rejectAction(a.id)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Meetings Needing Prep */}
        <div className="cc-card cc-two">
          <div className="cc-card-header">
            <span className="cc-card-title">Meetings Needing Prep</span>
          </div>
          {upcomingPreps.length === 0 && <div className="cc-label">All meetings are prepped or no upcoming meetings.</div>}
          {upcomingPreps.map((m: any) => (
            <div key={m.id} className="cc-item">
              <div>
                <div style={{ color: '#ECE4B7', fontSize: 14 }}>{m.title}</div>
                <div className="cc-label">
                  {m.start_time ? new Date(m.start_time).toLocaleString() : 'No time set'}
                  {' — '}{m.attendees || 0} attendees
                </div>
              </div>
              <div>
                {m.has_prep
                  ? <span className="cc-badge" style={{ background: '#4ade8020', color: '#4ade80' }}>Prepped</span>
                  : <span className="cc-badge" style={{ background: '#f0a03020', color: '#f0a030' }}>Needs Prep</span>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Crisis Signals */}
        {crisis && (crisis.signals || []).length > 0 && (
          <div className="cc-card">
            <div className="cc-card-header">
              <span className="cc-card-title">Signal Board</span>
            </div>
            {(crisis.signals || []).slice(0, 6).map((s, i) => (
              <div key={i} className="signal-item">
                <span style={{ color: s.severity >= 25 ? '#CC2936' : s.severity >= 15 ? '#f0a030' : '#888', fontWeight: 600 }}>
                  [{s.severity}]
                </span>{' '}
                {s.title}
              </div>
            ))}
          </div>
        )}

        {/* Overdue Commitments Detail */}
        {commitmentSummary?.overdue_commitments?.length > 0 && (
          <div className="cc-card cc-full">
            <div className="cc-card-header">
              <span className="cc-card-title">Overdue Commitments</span>
            </div>
            {(commitmentSummary?.overdue_commitments || []).map((c: any) => (
              <div key={c.id} className="cc-item">
                <div>
                  <div style={{ color: '#ECE4B7', fontSize: 14 }}>{c.title}</div>
                  <div className="cc-label">{c.type} — owner: {c.owner || 'unassigned'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#CC2936', fontWeight: 600, fontSize: 14 }}>
                    {c.days_overdue}d overdue
                  </div>
                  <div className="cc-label">{c.due_at ? new Date(c.due_at).toLocaleDateString() : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>}
    </div>
  );
}
