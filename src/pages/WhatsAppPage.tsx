import React, { useState } from 'react';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';

interface Props {
  organizationId: string;
  token: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastTime: Date;
  unread: number;
  avatar: string;
}

export default function WhatsAppPage({ organizationId, token }: Props) {
  const [conversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [searchAgent, setSearchAgent] = useState('');
  const [agentResult, setAgentResult] = useState<string | null>(null);

  async function sendViaAgent() {
    if (!input.trim()) return;
    setSending(true);
    try {
      const r = await apiRequest<any>(API_ROUTES.chat.message, {
        method: 'POST', token,
        body: {
          organization_id: organizationId,
          message: `Send a WhatsApp message: "${input}"`,
          conversation_history: [],
        },
      });
      setAgentResult(r?.response || 'Message sent via agent');
      setInput('');
      setTimeout(() => setAgentResult(null), 5000);
    } catch (e) {
      setAgentResult('Failed to send. Make sure WhatsApp is connected via Composio.');
    }
    setSending(false);
  }

  async function searchWhatsApp() {
    if (!searchAgent.trim()) return;
    setSending(true);
    try {
      const r = await apiRequest<any>(API_ROUTES.chat.message, {
        method: 'POST', token,
        body: {
          organization_id: organizationId,
          message: searchAgent,
          conversation_history: [],
        },
      });
      setAgentResult(r?.response || 'No results');
    } catch (e) {
      setAgentResult('Search failed.');
    }
    setSending(false);
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .wa-container { display: grid; grid-template-columns: 360px 1fr; gap: 0; height: calc(100vh - 180px); border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden; }
        .wa-sidebar { background: #0a0a0a; border-right: 1px solid #1a1a1a; display: flex; flex-direction: column; }
        .wa-sidebar-header { padding: 16px 20px; border-bottom: 1px solid #1a1a1a; display: flex; align-items: center; gap: 12px; }
        .wa-sidebar-header h3 { color: #fff; font-size: 18px; font-weight: 600; flex: 1; }
        .wa-search { padding: 10px 16px; border-bottom: 1px solid #111; }
        .wa-search input { width: 100%; padding: 10px 14px; border-radius: 24px; border: none; background: #141414; color: #fff; font-size: 13px; outline: none; }
        .wa-search input::placeholder { color: #666; }
        .wa-conv-list { flex: 1; overflow-y: auto; }
        .wa-conv { padding: 14px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #0d0d0d; }
        .wa-conv:hover { background: #111; }
        .wa-conv.active { background: #141414; }
        .wa-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #25D366, #128C7E); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .wa-conv-info { flex: 1; min-width: 0; }
        .wa-conv-name { color: #fff; font-size: 15px; font-weight: 500; }
        .wa-conv-last { color: #888; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
        .wa-conv-time { color: #888; font-size: 11px; }
        .wa-unread { background: #25D366; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
        .wa-chat { background: #080808; display: flex; flex-direction: column; }
        .wa-chat-header { padding: 14px 20px; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; display: flex; align-items: center; gap: 12px; }
        .wa-chat-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
        .wa-msg { max-width: 65%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
        .wa-msg.sent { background: #005C4B; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
        .wa-msg.received { background: #1a1a1a; color: #e8e8e8; align-self: flex-start; border-bottom-left-radius: 4px; }
        .wa-msg-time { font-size: 10px; color: #888; margin-top: 4px; text-align: right; }
        .wa-msg-status { color: #53bdeb; font-size: 12px; margin-left: 4px; }
        .wa-input-bar { padding: 12px 16px; border-top: 1px solid #1a1a1a; background: #0a0a0a; display: flex; gap: 10px; align-items: center; }
        .wa-input { flex: 1; padding: 12px 18px; border-radius: 24px; border: none; background: #141414; color: #fff; font-size: 14px; outline: none; }
        .wa-send-btn { width: 44px; height: 44px; border-radius: 50%; background: #25D366; border: none; color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .wa-send-btn:hover { background: #128C7E; }
        .wa-send-btn:disabled { background: #333; cursor: not-allowed; }
        .wa-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #888; font-size: 14px; text-align: center; padding: 40px; }
        .wa-agent-panel { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 14px; padding: 20px; margin-top: 20px; }
        .wa-agent-input { display: flex; gap: 10px; margin-top: 12px; }
        .wa-result { background: #141414; border-radius: 10px; padding: 14px; margin-top: 12px; color: #e8e8e8; font-size: 13px; line-height: 1.6; border-left: 3px solid #25D366; }
      `}</style>

      <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>WhatsApp</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Send and manage messages via WhatsApp. Powered by Composio integration.</p>

      <div className="wa-container">
        <div className="wa-sidebar">
          <div className="wa-sidebar-header">
            <div className="wa-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>W</div>
            <h3>Chats</h3>
          </div>
          <div className="wa-search">
            <input placeholder="Search or start new chat" />
          </div>
          <div className="wa-conv-list">
            {conversations.length === 0 && (
              <div style={{ padding: 20, color: '#888', fontSize: 13, textAlign: 'center' }}>
                No conversations yet. Use the agent below or connect WhatsApp via Integrations.
              </div>
            )}
            {conversations.map(c => (
              <div key={c.id} className={`wa-conv ${selectedConv === c.id ? 'active' : ''}`} onClick={() => setSelectedConv(c.id)}>
                <div className="wa-avatar">{c.avatar}</div>
                <div className="wa-conv-info">
                  <div className="wa-conv-name">{c.name}</div>
                  <div className="wa-conv-last">{c.lastMessage}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="wa-conv-time">{c.lastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  {c.unread > 0 && <span className="wa-unread">{c.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="wa-chat">
          {!selectedConv ? (
            <div className="wa-empty">
              <div>
                <div style={{ fontSize: 60, marginBottom: 16, opacity: 0.2 }}>&#128172;</div>
                <div style={{ fontSize: 16, color: '#fff', marginBottom: 8 }}>WhatsApp via Bond AI</div>
                <div>Select a conversation or use the agent panel below to send messages.</div>
              </div>
            </div>
          ) : (
            <>
              <div className="wa-chat-header">
                <div className="wa-avatar" style={{ width: 40, height: 40 }}>
                  {conversations.find(c => c.id === selectedConv)?.avatar || '?'}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{conversations.find(c => c.id === selectedConv)?.name}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>{conversations.find(c => c.id === selectedConv)?.phone}</div>
                </div>
              </div>
              <div className="wa-chat-body">
                {messages.map(m => (
                  <div key={m.id} className={`wa-msg ${m.sender === 'user' ? 'sent' : 'received'}`}>
                    {m.text}
                    <div className="wa-msg-time">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {m.sender === 'user' && m.status === 'read' && <span className="wa-msg-status">&#10003;&#10003;</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="wa-input-bar">
                <input className="wa-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message" onKeyDown={e => { if (e.key === 'Enter') sendViaAgent(); }} />
                <button className="wa-send-btn" onClick={sendViaAgent} disabled={sending || !input.trim()}>&#9654;</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Agent-powered WhatsApp panel */}
      <div className="wa-agent-panel">
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Send via AI Agent</div>
        <div style={{ color: '#888', fontSize: 13 }}>
          Ask the agent to send WhatsApp messages, search conversations, or manage contacts. The agent uses Composio to interact with WhatsApp.
        </div>
        <div className="wa-agent-input">
          <input className="wa-input" style={{ flex: 1 }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendViaAgent(); }}
            placeholder='e.g. "Send hi to +91 9876543210 on WhatsApp"' />
          <button className="wa-send-btn" onClick={sendViaAgent} disabled={sending || !input.trim()}>&#9654;</button>
        </div>
        {agentResult && <div className="wa-result">{agentResult}</div>}
      </div>
    </div>
  );
}
