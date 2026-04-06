import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';
import type { AgentActionResponse } from '../lib/types';

interface Props {
  organizationId: string;
  token: string;
}

interface Draft {
  id: string;
  title: string;
  to: string;
  subject: string;
  body: string;
  context: string;
  status: string;
  confidence: number;
  created_at: string;
  source_thread?: string;
}

export default function DraftsPage({ organizationId, token }: Props) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { loadDrafts(); const i = setInterval(loadDrafts, 15000); return () => clearInterval(i); }, [organizationId]);

  async function loadDrafts() {
    try {
      const actions = await apiRequest<AgentActionResponse[]>(
        API_ROUTES.intelligence.agentActions + `?organization_id=${organizationId}&limit=100`, { token },
      );
      const arr = Array.isArray(actions) ? actions : [];
      const emailDrafts: Draft[] = arr
        .filter(a => a.action_type === 'draft_email' && ['proposed', 'approved', 'executed'].includes(a.status))
        .map(a => ({
          id: a.id,
          title: a.title,
          to: (a.action_params as any)?.to || '',
          subject: (a.action_params as any)?.subject || a.title,
          body: (a.action_params as any)?.body || a.description || '',
          context: a.description || '',
          status: a.status,
          confidence: a.confidence,
          created_at: a.created_at,
          source_thread: (a.action_params as any)?.thread_id,
        }));
      setDrafts(emailDrafts);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const selected = drafts.find(d => d.id === selectedId);

  useEffect(() => {
    if (selected) {
      setEditBody(selected.body);
      setEditSubject(selected.subject);
    }
  }, [selectedId]);

  async function approveDraft(id: string) {
    await apiRequest(API_ROUTES.intelligence.agentActionApprove(id), { method: 'POST', token });
    setMsg('Draft approved'); setTimeout(() => setMsg(null), 3000);
    loadDrafts();
  }

  async function rejectDraft(id: string) {
    await apiRequest(API_ROUTES.intelligence.agentActionReject(id), { method: 'POST', token });
    setMsg('Draft rejected'); setTimeout(() => setMsg(null), 3000);
    loadDrafts();
  }

  async function sendDraft() {
    if (!selected) return;
    setSending(true);
    try {
      // Approve first if pending
      if (selected.status === 'proposed') {
        await apiRequest(API_ROUTES.intelligence.agentActionApprove(selected.id), { method: 'POST', token });
      }
      // Send via Gmail
      await apiRequest(API_ROUTES.actions.execute, {
        method: 'POST', token,
        body: {
          organization_id: organizationId,
          title: 'Send approved draft',
          tool_calls: [{
            name: 'send_gmail_message',
            args: { to: [selected.to], subject: editSubject, body: editBody },
          }],
        },
      });
      setMsg('Email sent!'); setTimeout(() => setMsg(null), 3000);
      loadDrafts();
    } catch (e) { setMsg('Send failed'); }
    setSending(false);
  }

  const pending = drafts.filter(d => d.status === 'proposed');
  const sent = drafts.filter(d => d.status === 'executed');

  return (
    <div className="dr">
      <style>{`
        .dr { max-width: 1400px; margin: 0 auto; padding: 24px; }
        .dr-header { margin-bottom: 24px; }
        .dr-header h1 { color: #fff; font-size: 24px; font-weight: 700; margin: 0 0 4px; }
        .dr-header p { color: #888; font-size: 14px; margin: 0; }
        .dr-layout { display: grid; grid-template-columns: 380px 1fr; gap: 20px; }
        .dr-list { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; max-height: calc(100vh - 200px); overflow-y: auto; }
        .dr-section-label { padding: 12px 18px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #111; }
        .dr-item { padding: 16px 18px; cursor: pointer; transition: all 0.15s; border-bottom: 1px solid #0d0d0d; }
        .dr-item:hover { background: #0d0d0d; }
        .dr-item.active { background: #0d0d0d; border-left: 3px solid #DEC0F1; padding-left: 15px; }
        .dr-item-to { color: #fff; font-size: 14px; font-weight: 500; margin-bottom: 2px; }
        .dr-item-subject { color: #aaa; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dr-item-meta { display: flex; gap: 8px; margin-top: 6px; align-items: center; }
        .dr-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .dr-badge.proposed { background: #DEC0F120; color: #DEC0F1; }
        .dr-badge.approved { background: #00A7E120; color: #00A7E1; }
        .dr-badge.executed { background: #4ade8020; color: #4ade80; }

        .dr-detail { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 28px; }
        .dr-detail-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #111; }
        .dr-field { margin-bottom: 16px; }
        .dr-field-label { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .dr-field-value { color: #fff; font-size: 14px; }
        .dr-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #333; background: #0b0b0b; color: #fff; font-size: 14px; outline: none; }
        .dr-input:focus { border-color: #00A7E1; }
        .dr-textarea { width: 100%; min-height: 200px; padding: 14px; border-radius: 8px; border: 1px solid #333; background: #0b0b0b; color: #fff; font-size: 14px; outline: none; font-family: inherit; line-height: 1.6; resize: vertical; }
        .dr-textarea:focus { border-color: #00A7E1; }
        .dr-actions { display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #111; }
        .dr-btn { padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; }
        .dr-btn.send { background: #4ade80; color: #020202; }
        .dr-btn.send:hover { background: #22c55e; }
        .dr-btn.send:disabled { opacity: 0.5; }
        .dr-btn.reject { background: transparent; border: 1px solid #CC2936; color: #CC2936; }
        .dr-btn.edit { background: transparent; border: 1px solid #333; color: #ECE4B7; }
        .dr-context { background: #080808; border: 1px solid #111; border-radius: 8px; padding: 12px 14px; margin-top: 12px; }
        .dr-context-label { color: #888; font-size: 11px; margin-bottom: 4px; }
        .dr-context-text { color: #aaa; font-size: 13px; line-height: 1.5; }
        .dr-empty { display: flex; align-items: center; justify-content: center; height: 300px; color: #888; }
        .dr-msg { position: fixed; bottom: 24px; right: 24px; background: #0a0a0a; border: 1px solid #4ade8040; border-radius: 10px; padding: 10px 20px; color: #4ade80; font-size: 13px; z-index: 100; }
        .dr-confidence { display: flex; align-items: center; gap: 6px; }
        .dr-conf-bar { width: 60px; height: 4px; background: #1a1a1a; border-radius: 2px; overflow: hidden; }
        .dr-conf-fill { height: 100%; border-radius: 2px; }
      `}</style>

      <div className="dr-header">
        <h1>Email Drafts</h1>
        <p>Review, edit, and approve AI-drafted emails before they're sent. Nothing goes out without your approval.</p>
      </div>

      {loading ? (
        <div className="dr-layout">
          <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid #111' }}>
                <div className="skeleton skeleton-line w70" />
                <div className="skeleton skeleton-line w40" style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
          <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, padding: 24 }}>
            <div className="skeleton skeleton-line w50" style={{ height: 20, marginBottom: 20 }} />
            <div className="skeleton skeleton-line w80" />
            <div className="skeleton skeleton-line w90" />
            <div className="skeleton" style={{ height: 160, marginTop: 16, borderRadius: 8 }} />
          </div>
        </div>
      ) : (

      <div className="dr-layout">
        <div className="dr-list">
          {pending.length > 0 && (
            <>
              <div className="dr-section-label">Pending Review ({pending.length})</div>
              {pending.map(d => (
                <div key={d.id} className={`dr-item ${selectedId === d.id ? 'active' : ''}`} onClick={() => setSelectedId(d.id)}>
                  <div className="dr-item-to">To: {d.to}</div>
                  <div className="dr-item-subject">{d.subject}</div>
                  <div className="dr-item-meta">
                    <span className="dr-badge proposed">pending</span>
                    <span style={{ color: '#666', fontSize: 11 }}>{new Date(d.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </>
          )}
          {sent.length > 0 && (
            <>
              <div className="dr-section-label">Sent ({sent.length})</div>
              {sent.map(d => (
                <div key={d.id} className={`dr-item ${selectedId === d.id ? 'active' : ''}`} onClick={() => setSelectedId(d.id)}>
                  <div className="dr-item-to">To: {d.to}</div>
                  <div className="dr-item-subject">{d.subject}</div>
                  <div className="dr-item-meta">
                    <span className="dr-badge executed">sent</span>
                    <span style={{ color: '#666', fontSize: 11 }}>{new Date(d.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </>
          )}
          {loading && <div className="dr-empty">Loading...</div>}
          {!loading && drafts.length === 0 && (
            <div className="dr-empty" style={{ padding: 40, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 32, opacity: 0.2, marginBottom: 8 }}>&#9993;</div>
                No drafts yet. Enable "Draft email replies" in Agent Studio to have the agent prepare responses.
              </div>
            </div>
          )}
        </div>

        <div className="dr-detail">
          {!selected ? (
            <div className="dr-empty">Select a draft to review</div>
          ) : (
            <>
              <div className="dr-detail-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`dr-badge ${selected.status}`}>{selected.status}</span>
                  <div className="dr-confidence">
                    <span style={{ color: '#888', fontSize: 11 }}>Confidence:</span>
                    <div className="dr-conf-bar">
                      <div className="dr-conf-fill" style={{ width: `${selected.confidence * 100}%`, background: selected.confidence > 0.8 ? '#4ade80' : selected.confidence > 0.6 ? '#f0a030' : '#CC2936' }} />
                    </div>
                    <span style={{ color: '#888', fontSize: 11 }}>{Math.round(selected.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="dr-field">
                <div className="dr-field-label">To</div>
                <div className="dr-field-value">{selected.to}</div>
              </div>

              <div className="dr-field">
                <div className="dr-field-label">Subject</div>
                <input className="dr-input" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
              </div>

              <div className="dr-field">
                <div className="dr-field-label">Body</div>
                <textarea className="dr-textarea" value={editBody} onChange={e => setEditBody(e.target.value)} />
              </div>

              {selected.context && (
                <div className="dr-context">
                  <div className="dr-context-label">Why the agent drafted this</div>
                  <div className="dr-context-text">{selected.context}</div>
                </div>
              )}

              {selected.status === 'proposed' && (
                <div className="dr-actions">
                  <button className="dr-btn send" onClick={sendDraft} disabled={sending}>
                    {sending ? 'Sending...' : 'Approve & Send'}
                  </button>
                  <button className="dr-btn reject" onClick={() => rejectDraft(selected.id)}>Reject</button>
                </div>
              )}
              {selected.status === 'executed' && (
                <div style={{ marginTop: 16, color: '#4ade80', fontSize: 13 }}>
                  This email was sent on {new Date(selected.created_at).toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      )}

      {msg && <div className="dr-msg">{msg}</div>}
    </div>
  );
}
