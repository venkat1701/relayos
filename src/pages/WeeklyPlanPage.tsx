import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import type { CalendarAnalysis, WeeklyPlanResponse } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
  workspaceId?: string | null;
}

export default function WeeklyPlanPage({ organizationId, token, workspaceId }: Props) {
  const [plan, setPlan] = useState<WeeklyPlanResponse | null>(null);
  const [analysis, setAnalysis] = useState<CalendarAnalysis | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'opportunities' | 'plan'>('overview');

  useEffect(() => { loadAnalysis(); }, [organizationId]);

  async function loadAnalysis() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const start = monday.toISOString().split('T')[0];
    const end = friday.toISOString().split('T')[0];

    try {
      const [a, o] = await Promise.all([
        apiRequest<CalendarAnalysis>(API_ROUTES.intelligence.calendarAnalysis + `?organization_id=${organizationId}&start=${start}&end=${end}`, { token }).catch(() => null),
        apiRequest<any[]>(API_ROUTES.intelligence.calendarOpportunities + `?organization_id=${organizationId}&start=${start}&end=${end}`, { token }).catch(() => null),
      ]);
      if (a && a.period) setAnalysis(a);
      setOpportunities(Array.isArray(o) ? o : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function generatePlan() {
    setGenerating(true);
    try {
      const result = await apiRequest<WeeklyPlanResponse>(
        API_ROUTES.intelligence.weeklyPlan + `?organization_id=${organizationId}`,
        { method: 'POST', token },
      );
      setPlan(result);
      setTab('plan');
    } catch (e) { console.error(e); }
    setGenerating(false);
  }

  const meetingPct = analysis?.meeting_load_pct || 0;
  const focusMins = analysis?.focus_time_available_minutes || 0;
  const meetingColor = meetingPct > 70 ? '#CC2936' : meetingPct > 50 ? '#f0a030' : '#4ade80';

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .wp-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #0a0a0a; border-radius: 10px; padding: 4px; border: 1px solid #1a1a1a; }
        .wp-tab { padding: 10px 20px; border-radius: 8px; border: none; background: transparent; color: #888; cursor: pointer; font-size: 14px; font-weight: 500; }
        .wp-tab.active { background: #141414; color: #ECE4B7; }
        .wp-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .wp-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; }
        .wp-stat { font-size: 36px; font-weight: 700; }
        .wp-label { color: #888; font-size: 13px; margin-top: 4px; }
        .wp-bar { height: 12px; background: #1a1a1a; border-radius: 6px; overflow: hidden; margin-top: 12px; }
        .wp-opp { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 10px; padding: 16px; margin-bottom: 8px; }
        .wp-opp-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .wp-rec { background: #141414; border-radius: 10px; padding: 14px 18px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
        .wp-btn { padding: 10px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; }
        .wp-type-bar { display: flex; border-radius: 6px; overflow: hidden; height: 24px; margin-bottom: 8px; }
        .wp-type-seg { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #020202; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ color: '#ECE4B7', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Weekly Planning</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Calendar intelligence and time optimization</p>
        </div>
        <button className="wp-btn" style={{ background: '#DEC0F1', color: '#020202' }} onClick={generatePlan} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Next Week Plan'}
        </button>
      </div>

      <div className="wp-tabs">
        {(['overview', 'opportunities', 'plan'] as const).map(t => (
          <button key={t} className={`wp-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? 'This Week' : t === 'opportunities' ? `Opportunities (${opportunities.length})` : 'Weekly Plan'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="wp-grid">
          {[1,2,3].map(i => (
            <div key={i} className="wp-card">
              <div className="skeleton skeleton-line w40" style={{ height: 36, marginBottom: 12 }} />
              <div className="skeleton skeleton-line w60" />
              <div className="skeleton" style={{ height: 12, borderRadius: 6, marginTop: 12 }} />
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'overview' && analysis && (
        <>
          <div className="wp-grid">
            <div className="wp-card">
              <div className="wp-stat" style={{ color: meetingColor }}>{meetingPct}%</div>
              <div className="wp-label">Meeting Load</div>
              <div className="wp-bar">
                <div style={{ width: `${Math.min(meetingPct, 100)}%`, height: '100%', borderRadius: 6, background: meetingColor }} />
              </div>
              <div className="wp-label" style={{ marginTop: 8 }}>
                {Math.round(analysis.total_meeting_minutes / 60)}h meetings / {Math.round(analysis.total_available_minutes / 60)}h available
              </div>
            </div>
            <div className="wp-card">
              <div className="wp-stat" style={{ color: focusMins < 600 ? '#CC2936' : '#4ade80' }}>
                {Math.round(focusMins / 60)}h
              </div>
              <div className="wp-label">Focus Time Available</div>
              <div className="wp-bar">
                <div style={{ width: `${Math.min((focusMins / analysis.total_available_minutes) * 100, 100)}%`, height: '100%', borderRadius: 6, background: focusMins < 600 ? '#CC2936' : '#4ade80' }} />
              </div>
            </div>
            <div className="wp-card">
              <div className="wp-stat" style={{ color: '#00A7E1' }}>{analysis.avg_meetings_per_day}</div>
              <div className="wp-label">Avg Meetings/Day</div>
              <div style={{ color: '#888', fontSize: 13, marginTop: 12 }}>
                Avg {analysis.avg_meeting_minutes_per_day || Math.round(analysis.total_meeting_minutes / Math.max(analysis.period.days, 1))} mins/day
              </div>
            </div>
          </div>

          {/* Time by type */}
          {analysis.by_type && Object.keys(analysis.by_type).length > 0 && (
            <div className="wp-card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: '#ECE4B7', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Time by Meeting Type</h3>
              <div className="wp-type-bar">
                {Object.entries(analysis.by_type).map(([type, mins]) => {
                  const pct = (mins / Math.max(analysis.total_meeting_minutes, 1)) * 100;
                  const colors: Record<string, string> = {
                    sync: '#00A7E1', one_on_one: '#DEC0F1', review: '#4ade80', decision: '#f0a030',
                    external: '#CC2936', hiring: '#f0d060', prep: '#888', general: '#555',
                  };
                  return pct > 3 ? (
                    <div key={type} className="wp-type-seg" style={{ width: `${pct}%`, background: colors[type] || '#555' }}>
                      {pct > 8 ? type : ''}
                    </div>
                  ) : null;
                })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
                {Object.entries(analysis.by_type).sort((a, b) => b[1] - a[1]).map(([type, mins]) => (
                  <div key={type} style={{ color: '#aaa', fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: '#ECE4B7' }}>{type}</span>: {Math.round(mins / 60)}h {mins % 60}m
                  </div>
                ))}
              </div>
            </div>
          )}

          {(analysis.fragmented_days || []).length > 0 && (
            <div className="wp-card">
              <h3 style={{ color: '#f0a030', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Fragmented Days</h3>
              {(analysis.fragmented_days || []).map((d, i) => (
                <div key={i} style={{ color: '#ECE4B7', fontSize: 13, marginBottom: 6 }}>
                  {d.date}: {d.meeting_count} meetings, {Math.round(d.meeting_minutes / 60)}h — <span style={{ color: d.severity === 'high' ? '#CC2936' : '#f0a030' }}>{d.severity} fragmentation</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'opportunities' && (
        <>
          {opportunities.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>No optimization opportunities detected.</div>
          ) : (
            opportunities.map((o, i) => (
              <div key={i} className="wp-opp">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="wp-opp-badge" style={{
                    background: o.impact === 'high' ? '#CC293620' : o.impact === 'medium' ? '#f0a03020' : '#1a1a1a',
                    color: o.impact === 'high' ? '#CC2936' : o.impact === 'medium' ? '#f0a030' : '#888',
                  }}>{o.impact} impact</span>
                  <span style={{ color: '#888', fontSize: 12 }}>{o.type}</span>
                </div>
                <div style={{ color: '#ECE4B7', fontSize: 15, fontWeight: 500 }}>{o.title}</div>
                <div style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>{o.description}</div>
              </div>
            ))
          )}
        </>
      )}

      {tab === 'plan' && (
        <>
          {!plan ? (
            <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>
              Click "Generate Next Week Plan" to create an optimized plan.
            </div>
          ) : (
            <>
              <div className="wp-card" style={{ marginBottom: 16 }}>
                <h3 style={{ color: '#ECE4B7', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Plan Summary</h3>
                <pre style={{ color: '#aaa', fontSize: 13, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{plan.summary}</pre>
              </div>
              {plan.recommendations.length > 0 && (
                <div className="wp-card">
                  <h3 style={{ color: '#ECE4B7', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Recommendations</h3>
                  {plan.recommendations.map((r, i) => (
                    <div key={i} className="wp-rec">
                      <div>
                        <div style={{ color: '#ECE4B7', fontSize: 14 }}>{r.description}</div>
                        <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                          {r.type} — confidence: {Math.round(r.confidence * 100)}%
                        </div>
                      </div>
                      <span className="wp-opp-badge" style={{
                        background: r.priority === 'high' ? '#CC293620' : '#1a1a1a',
                        color: r.priority === 'high' ? '#CC2936' : '#888',
                      }}>{r.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
