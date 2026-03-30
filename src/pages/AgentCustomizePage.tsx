import React, { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import type { ContextQuestionResponse, UserPreferences } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
}

export default function AgentCustomizePage({ organizationId, token }: Props) {
  const [tab, setTab] = useState<'questions' | 'context' | 'preferences' | 'documents'>('questions');
  const [questions, setQuestions] = useState<ContextQuestionResponse[]>([]);
  const [answered, setAnswered] = useState<ContextQuestionResponse[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [customContext, setCustomContext] = useState('');
  const [savingContext, setSavingContext] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, [organizationId]);

  async function loadAll() {
    setLoading(true);
    try {
      const [pending, done, prefsData] = await Promise.all([
        apiRequest<ContextQuestionResponse[]>(API_ROUTES.contextQuestions.list + `?organization_id=${organizationId}&status=pending`, { token }).catch(() => []),
        apiRequest<ContextQuestionResponse[]>(API_ROUTES.contextQuestions.list + `?organization_id=${organizationId}&status=answered`, { token }).catch(() => []),
        apiRequest<UserPreferences>(API_ROUTES.intelligence.preferences + `?organization_id=${organizationId}`, { token }).catch(() => null),
      ]);
      setQuestions(Array.isArray(pending) ? pending : []);
      setAnswered(Array.isArray(done) ? done : []);
      if (prefsData && typeof prefsData === 'object' && 'autonomy_mode' in prefsData) setPrefs(prefsData);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function submitAnswer(id: string) {
    const answer = answers[id]?.trim();
    if (!answer) return;
    setSubmitting(id);
    await apiRequest(API_ROUTES.contextQuestions.answer(id), { method: 'POST', token, body: { answer } });
    setAnswers(prev => { const n = { ...prev }; delete n[id]; return n; });
    setSubmitting(null);
    loadAll();
  }

  async function savePrefs(updates: Partial<UserPreferences>) {
    setSavingPrefs(true);
    await apiRequest(API_ROUTES.intelligence.preferences + `?organization_id=${organizationId}`, { method: 'PATCH', token, body: updates });
    setSavingPrefs(false);
    loadAll();
  }

  const tabs = [
    { key: 'questions', label: `Questions (${questions.length})`, desc: 'Answer agent questions to improve context' },
    { key: 'context', label: 'Custom Context', desc: 'Add documents, notes, and instructions' },
    { key: 'preferences', label: 'Agent Behavior', desc: 'Configure autonomy and preferences' },
    { key: 'documents', label: 'Knowledge Base', desc: 'Upload reference materials' },
  ] as const;

  return (
    <div style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .ac-page { display: flex; height: calc(100vh - 80px); overflow: hidden; }
        .ac-sidebar { width: 280px; background: #0a0a0a; border-right: 1px solid #1a1a1a; padding: 24px 0; flex-shrink: 0; display: flex; flex-direction: column; }
        .ac-sidebar-title { padding: 0 20px 20px; color: #fff; font-size: 20px; font-weight: 700; }
        .ac-sidebar-sub { padding: 0 20px 16px; color: #888; font-size: 13px; }
        .ac-tab { padding: 14px 20px; cursor: pointer; transition: all 0.15s; border-left: 3px solid transparent; }
        .ac-tab:hover { background: #111; }
        .ac-tab.active { background: #111; border-left-color: #00A7E1; }
        .ac-tab-label { color: #fff; font-size: 14px; font-weight: 500; }
        .ac-tab-desc { color: #666; font-size: 12px; margin-top: 2px; }
        .ac-main { flex: 1; overflow-y: auto; padding: 32px 40px; }
        .ac-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 12px; transition: all 0.2s; }
        .ac-card:hover { border-color: #222; }
        .ac-q-category { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; background: #1a1a1a; color: #888; margin-bottom: 8px; }
        .ac-q-text { color: #fff; font-size: 15px; line-height: 1.5; margin-bottom: 12px; }
        .ac-q-answer-row { display: flex; gap: 8px; }
        .ac-input { flex: 1; padding: 10px 14px; border-radius: 8px; border: 1px solid #333; background: #0b0b0b; color: #fff; font-size: 14px; outline: none; }
        .ac-input:focus { border-color: #00A7E1; }
        .ac-textarea { width: 100%; min-height: 120px; padding: 14px; border-radius: 10px; border: 1px solid #333; background: #0b0b0b; color: #fff; font-size: 14px; outline: none; font-family: inherit; resize: vertical; line-height: 1.6; }
        .ac-textarea:focus { border-color: #00A7E1; }
        .ac-btn { padding: 10px 20px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .ac-btn-primary { background: #00A7E1; color: #020202; }
        .ac-btn-primary:hover { background: #0090c5; }
        .ac-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .ac-btn-ghost { background: transparent; border: 1px solid #333; color: #ECE4B7; }
        .ac-answered { background: #080808; border: 1px solid #111; border-radius: 10px; padding: 14px 16px; margin-bottom: 8px; }
        .ac-answered-q { color: #888; font-size: 13px; margin-bottom: 4px; }
        .ac-answered-a { color: #fff; font-size: 14px; }
        .ac-toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #111; }
        .ac-toggle-label { color: #fff; font-size: 14px; }
        .ac-toggle-desc { color: #888; font-size: 12px; margin-top: 2px; }
        .ac-toggle { width: 44px; height: 24px; border-radius: 12px; background: #333; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
        .ac-toggle.on { background: #00A7E1; }
        .ac-toggle::after { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #fff; top: 3px; left: 3px; transition: transform 0.2s; }
        .ac-toggle.on::after { transform: translateX(20px); }
        .ac-mode-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
        .ac-mode-card { padding: 20px; background: #0a0a0a; border: 2px solid #1a1a1a; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: center; }
        .ac-mode-card:hover { border-color: #333; }
        .ac-mode-card.active { border-color: #00A7E1; background: #081218; }
        .ac-mode-name { color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .ac-mode-desc { color: #888; font-size: 12px; line-height: 1.4; }
        .ac-section-title { color: #fff; font-size: 18px; font-weight: 700; margin-bottom: 16px; }
        .ac-section-sub { color: #888; font-size: 14px; margin-bottom: 20px; }
        .ac-doc-card { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 10px; margin-bottom: 8px; }
        .ac-doc-icon { width: 40px; height: 40px; border-radius: 8px; background: #141414; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #888; }
      `}</style>

      <div className="ac-page">
        <div className="ac-sidebar">
          <div className="ac-sidebar-title">Agent Studio</div>
          <div className="ac-sidebar-sub">Customize how Bond AI understands and operates in your workspace</div>
          {tabs.map(t => (
            <div key={t.key} className={`ac-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <div className="ac-tab-label">{t.label}</div>
              <div className="ac-tab-desc">{t.desc}</div>
            </div>
          ))}
        </div>

        <div className="ac-main">
          {loading ? (
            <div>{[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 80 }} />)}</div>
          ) : tab === 'questions' ? (
            <>
              <div className="ac-section-title">Pending Questions</div>
              <div className="ac-section-sub">The agent needs these answers to improve its understanding of your work. The more you answer, the smarter it gets.</div>

              {questions.length === 0 ? (
                <div className="ac-card" style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                  No pending questions. The agent will ask when it encounters ambiguity.
                </div>
              ) : (
                questions.map(q => (
                  <div key={q.id} className="ac-card">
                    <span className="ac-q-category">{q.category}</span>
                    <div className="ac-q-text">{q.question}</div>
                    <div className="ac-q-answer-row">
                      <input
                        className="ac-input"
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') submitAnswer(q.id); }}
                        placeholder="Type your answer..."
                      />
                      <button className="ac-btn ac-btn-primary" onClick={() => submitAnswer(q.id)} disabled={submitting === q.id || !answers[q.id]?.trim()}>
                        {submitting === q.id ? '...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                ))
              )}

              {answered.length > 0 && (
                <>
                  <div className="ac-section-title" style={{ marginTop: 32 }}>Answered ({answered.length})</div>
                  {answered.map(q => (
                    <div key={q.id} className="ac-answered">
                      <div className="ac-answered-q">{q.question}</div>
                      <div className="ac-answered-a">{q.answer}</div>
                    </div>
                  ))}
                </>
              )}
            </>

          ) : tab === 'context' ? (
            <>
              <div className="ac-section-title">Custom Context</div>
              <div className="ac-section-sub">
                Add any text the agent should know about. Company context, project details, team structure,
                communication preferences — anything that helps the agent understand your world.
              </div>
              <textarea
                className="ac-textarea"
                style={{ minHeight: 200 }}
                value={customContext}
                onChange={e => setCustomContext(e.target.value)}
                placeholder={"Example:\n\nWe are a 50-person SaaS company building developer tools.\nOur Q2 priority is launching the enterprise plan.\nJohn (CTO) owns all technical decisions.\nSarah (VP Sales) manages the pipeline in the Deals sheet.\nBoard meeting is May 15 — prep starts 2 weeks before.\nNever auto-reply to emails from investors.\nAlways draft follow-ups within 24 hours of meetings."}
              />
              <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="ac-btn ac-btn-primary" onClick={() => { setSavingContext(true); setTimeout(() => setSavingContext(false), 1000); }} disabled={savingContext}>
                  {savingContext ? 'Saved!' : 'Save Context'}
                </button>
              </div>
            </>

          ) : tab === 'preferences' ? (
            <>
              <div className="ac-section-title">Autonomy Mode</div>
              <div className="ac-section-sub">How much independence should the agent have?</div>
              <div className="ac-mode-grid">
                {[
                  { mode: 'advisory', name: 'Advisory', desc: 'Agent only suggests. You approve everything.' },
                  { mode: 'delegated', name: 'Delegated', desc: 'Agent acts on low-risk tasks. Asks for high-risk.' },
                  { mode: 'autonomous', name: 'Autonomous', desc: 'Agent operates independently. You review afterwards.' },
                ].map(m => (
                  <div key={m.mode} className={`ac-mode-card ${prefs?.autonomy_mode === m.mode ? 'active' : ''}`}
                    onClick={() => savePrefs({ autonomy_mode: m.mode })}>
                    <div className="ac-mode-name">{m.name}</div>
                    <div className="ac-mode-desc">{m.desc}</div>
                  </div>
                ))}
              </div>

              <div className="ac-section-title" style={{ marginTop: 32 }}>Auto-Actions</div>
              <div className="ac-section-sub">Toggle which actions the agent can take automatically</div>

              {[
                { key: 'auto_draft_replies', label: 'Draft email replies', desc: 'Generate draft replies for emails needing response' },
                { key: 'auto_block_focus_time', label: 'Block focus time', desc: 'Automatically place focus blocks on your calendar' },
                { key: 'auto_nudge_overdue', label: 'Nudge overdue items', desc: 'Send follow-up reminders for overdue commitments' },
                { key: 'auto_update_trackers', label: 'Update trackers', desc: 'Write status updates to sheets and docs' },
                { key: 'auto_create_prep_docs', label: 'Create meeting prep', desc: 'Auto-generate preparation packets before meetings' },
              ].map(item => (
                <div key={item.key} className="ac-toggle-row">
                  <div>
                    <div className="ac-toggle-label">{item.label}</div>
                    <div className="ac-toggle-desc">{item.desc}</div>
                  </div>
                  <div
                    className={`ac-toggle ${(prefs as any)?.[item.key] ? 'on' : ''}`}
                    onClick={() => savePrefs({ [item.key]: !(prefs as any)?.[item.key] } as any)}
                  />
                </div>
              ))}

              <div className="ac-section-title" style={{ marginTop: 32 }}>Timing</div>
              <div className="ac-toggle-row">
                <div>
                  <div className="ac-toggle-label">Daily briefing time</div>
                  <div className="ac-toggle-desc">When should the morning brief be generated?</div>
                </div>
                <input
                  type="time"
                  value={prefs?.briefing_time?.slice(0, 5) || '08:00'}
                  onChange={e => savePrefs({ briefing_time: e.target.value } as any)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #333', background: '#0b0b0b', color: '#fff', fontSize: 13 }}
                />
              </div>
              <div className="ac-toggle-row">
                <div>
                  <div className="ac-toggle-label">Focus hours per day</div>
                  <div className="ac-toggle-desc">Minimum deep work hours to protect</div>
                </div>
                <select
                  value={prefs?.focus_hours_per_day || 2}
                  onChange={e => savePrefs({ focus_hours_per_day: parseFloat(e.target.value) })}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #333', background: '#0b0b0b', color: '#fff', fontSize: 13 }}
                >
                  {[1, 1.5, 2, 2.5, 3, 4].map(h => <option key={h} value={h}>{h}h</option>)}
                </select>
              </div>
              <div className="ac-toggle-row" style={{ borderBottom: 'none' }}>
                <div>
                  <div className="ac-toggle-label">Escalation threshold</div>
                  <div className="ac-toggle-desc">Hours before overdue items get escalated</div>
                </div>
                <select
                  value={prefs?.escalation_threshold_hours || 48}
                  onChange={e => savePrefs({ escalation_threshold_hours: parseInt(e.target.value) })}
                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #333', background: '#0b0b0b', color: '#fff', fontSize: 13 }}
                >
                  {[12, 24, 48, 72, 168].map(h => <option key={h} value={h}>{h}h ({Math.round(h/24)}d)</option>)}
                </select>
              </div>
            </>

          ) : tab === 'documents' ? (
            <>
              <div className="ac-section-title">Knowledge Base</div>
              <div className="ac-section-sub">
                Upload documents, paste text, or link Google Docs that the agent should reference when making decisions.
                These form the agent's long-term memory.
              </div>

              <div className="ac-card" style={{ borderStyle: 'dashed', textAlign: 'center', cursor: 'pointer', padding: 40 }}>
                <div style={{ fontSize: 32, color: '#333', marginBottom: 8 }}>+</div>
                <div style={{ color: '#888', fontSize: 14 }}>Drop files here or click to upload</div>
                <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>PDF, DOCX, TXT, or Markdown</div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>Or paste a Google Doc/Sheet link:</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="ac-input" placeholder="https://docs.google.com/document/d/..." style={{ flex: 1 }} />
                  <button className="ac-btn ac-btn-primary">Add</button>
                </div>
              </div>

              <div style={{ marginTop: 24, color: '#888', fontSize: 13 }}>
                No documents added yet. The agent will use workspace-linked documents and answered questions as context.
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
