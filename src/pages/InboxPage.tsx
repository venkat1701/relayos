import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import Markdown from "react-markdown";
import { apiRequest } from "../lib/api";
import { API_ROUTES } from "../lib/contract";

interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  summary?: string | null;
  classification: string;
  priority: string;
  status: string;
  last_message_at?: string | null;
  needs_reply: boolean;
}

interface EmailMessage {
  id: string;
  thread_id: string;
  sender?: string | null;
  subject: string;
  summary?: string | null;
  snippet?: string | null;
  body?: string | null;
  direction: string;
  received_at?: string | null;
}

interface InboxPageProps {
  threads: EmailThread[];
  messages: EmailMessage[];
  token: string;
  organizationId: string;
  userEmail?: string;
  onWorkspaceRefresh?: () => Promise<void> | void;
}

export function InboxPage({
  threads,
  messages,
  token,
  organizationId,
  userEmail,
  onWorkspaceRefresh,
}: InboxPageProps) {
  const location = useLocation();
  const [filter, setFilter] = useState<"all" | "needs_response">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id ?? "");
  const [composeMode, setComposeMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    if (!threads.length) {
      setSelectedThreadId("");
      return;
    }
    if (!selectedThreadId || !threads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  const filteredThreads = useMemo(() => {
    return threads.filter((thread) => {
      if (filter === "needs_response" && !thread.needs_reply) {
        return false;
      }
      if (!searchQuery.trim()) {
        return true;
      }
      const haystack = `${thread.subject} ${thread.summary ?? ""} ${thread.participants.join(" ")}`.toLowerCase();
      return haystack.includes(searchQuery.trim().toLowerCase());
    });
  }, [filter, searchQuery, threads]);

  const selectedThread = filteredThreads.find((thread) => thread.id === selectedThreadId)
    ?? threads.find((thread) => thread.id === selectedThreadId)
    ?? null;
  const threadMessages = useMemo(
    () => messages.filter((message) => message.thread_id === selectedThread?.id),
    [messages, selectedThread],
  );

  useEffect(() => {
    if (!selectedThread) {
      return;
    }
    const recipients = selectedThread.participants.filter(
      (participant) => participant.toLowerCase() !== (userEmail || "").toLowerCase(),
    );
    setEmailForm((current) => ({
      to: current.to || recipients.join(", "),
      subject:
        current.subject || (selectedThread.subject.toLowerCase().startsWith("re:") ? selectedThread.subject : `Re: ${selectedThread.subject}`),
      body:
        current.body || [
          "Hi,",
          "",
          "Following up on this thread.",
          "",
          "Best,",
        ].join("\n"),
    }));
  }, [selectedThread, userEmail]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("compose") === "1") {
      setComposeMode(true);
    }
  }, [location.search]);

  const needsReplyCount = threads.filter((thread) => thread.needs_reply).length;

  const startCompose = () => {
    setComposeMode(true);
    if (!selectedThread) {
      setEmailForm({ to: "", subject: "", body: "Hi,\n\n\n\nBest," });
    }
  };

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!emailForm.to.trim() || !emailForm.subject.trim() || !emailForm.body.trim()) {
      setStatusMessage("Recipient, subject, and body are required.");
      return;
    }
    setSending(true);
    setStatusMessage(null);
    try {
      await apiRequest(API_ROUTES.actions.execute, {
        method: "POST",
        token,
        body: {
          organization_id: organizationId,
          title: "Email sent from inbox",
          tool_calls: [
            {
              name: "send_gmail_message",
              args: {
                to: splitCsv(emailForm.to),
                subject: emailForm.subject,
                body: emailForm.body,
              },
            },
          ],
        },
      });
      setStatusMessage("Email sent.");
      setComposeMode(false);
      setEmailForm({ to: "", subject: "", body: "" });
      await onWorkspaceRefresh?.();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  const executeEmailAction = async (title: string, toolName: string, args: Record<string, unknown>) => {
    setSending(true);
    setStatusMessage(null);
    try {
      await apiRequest(API_ROUTES.actions.execute, {
        method: "POST",
        token,
        body: {
          organization_id: organizationId,
          title,
          tool_calls: [{ name: toolName, args }],
        },
      });
      setStatusMessage(title + " - Done.");
      await onWorkspaceRefresh?.();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setSending(false);
    }
  };

  const getLatestMessageId = () => {
    if (!threadMessages.length) return null;
    const sorted = [...threadMessages].sort((a, b) =>
      new Date(b.received_at || 0).getTime() - new Date(a.received_at || 0).getTime()
    );
    return sorted[0]?.id ?? null;
  };

  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <div className="header-left">
          <h1>Inbox</h1>
          <p className="subtitle">{threads.length} total threads</p>
        </div>
        <button className="compose-btn" onClick={startCompose} type="button">
          <span>+</span>
          Compose
        </button>
      </div>

      <div className="inbox-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
            type="button"
          >
            All
            <span className="count">{threads.length}</span>
          </button>
          <button
            className={`filter-tab ${filter === "needs_response" ? "active" : ""}`}
            onClick={() => setFilter("needs_response")}
            type="button"
          >
            Needs Response
            <span className="count">{needsReplyCount}</span>
          </button>
        </div>

        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="inbox-grid">
        <div className="thread-list">
          {filteredThreads.length === 0 ? (
            <div className="empty-state">
              <h3>No threads found</h3>
              <p>Adjust search or sync Gmail to ingest more messages.</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const lastMessage = messages
                .filter((message) => message.thread_id === thread.id)
                .sort((left, right) => {
                  const leftTime = new Date(left.received_at || 0).getTime();
                  const rightTime = new Date(right.received_at || 0).getTime();
                  return rightTime - leftTime;
                })[0];

              const isUnread = thread.needs_reply || thread.status === "open";
              return (
                <button
                  key={thread.id}
                  className={`thread-item ${selectedThread?.id === thread.id ? "selected" : ""} ${isUnread ? "unread" : ""}`}
                  onClick={() => {
                    setComposeMode(false);
                    setSelectedThreadId(thread.id);
                  }}
                  type="button"
                >
                  {isUnread && <span className="unread-dot" />}
                  <div className="thread-avatar">
                    {(thread.participants[0] || thread.subject || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="thread-content">
                    <div className="thread-header">
                      <span className={`thread-from ${isUnread ? "bold" : ""}`}>{thread.participants[0] || "Unknown sender"}</span>
                      <span className="thread-time">{formatStamp(thread.last_message_at)}</span>
                    </div>
                    <div className={`thread-subject ${isUnread ? "bold" : ""}`}>{thread.subject}</div>
                    <div className="thread-snippet">
                      {thread.summary || lastMessage?.summary || lastMessage?.snippet || "No summary yet."}
                    </div>
                    <div className="thread-labels">
                      <span className={`label ${thread.needs_reply ? "needs-response" : ""}`}>
                        {thread.needs_reply ? "Needs Reply" : thread.priority}
                      </span>
                      <span className="label">{thread.classification}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="detail-panel">
          {composeMode ? (
            <form className="composer-card" onSubmit={handleSend}>
              <div className="detail-header">
                <div>
                  <h2>Compose Email</h2>
                  <p>Send through Gmail directly from the workspace.</p>
                </div>
              </div>
              <label className="field">
                <span>To</span>
                <input
                  value={emailForm.to}
                  onChange={(event) => setEmailForm((current) => ({ ...current, to: event.target.value }))}
                  placeholder="name@company.com, teammate@company.com"
                />
              </label>
              <label className="field">
                <span>Subject</span>
                <input
                  value={emailForm.subject}
                  onChange={(event) => setEmailForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Subject"
                />
              </label>
              <label className="field">
                <span>Body</span>
                <textarea
                  value={emailForm.body}
                  onChange={(event) => setEmailForm((current) => ({ ...current, body: event.target.value }))}
                  rows={12}
                />
              </label>
              {statusMessage ? <p className="status-copy">{statusMessage}</p> : null}
              <div className="button-row">
                <button className="ghost-button" onClick={() => setComposeMode(false)} type="button">
                  Close
                </button>
                <button className="primary-button" disabled={sending} type="submit">
                  {sending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          ) : selectedThread ? (
            <>
              <div className="detail-header">
                <div>
                  <h2>{selectedThread.subject}</h2>
                  <p>{selectedThread.participants.join(", ") || "No participants captured"}</p>
                </div>
                <button className="ghost-button" onClick={() => {
                  const lastMsg = threadMessages.sort((a, b) =>
                    new Date(b.received_at || 0).getTime() - new Date(a.received_at || 0).getTime()
                  )[0];
                  const quotedBody = lastMsg?.body || lastMsg?.snippet || "";
                  const plainQuoted = quotedBody.replace(/<[^>]*>/g, "").trim();
                  const quotedLines = plainQuoted.split("\n").map(line => `> ${line}`).join("\n");
                  setComposeMode(true);
                  const recipients = selectedThread.participants.filter(
                    p => p.toLowerCase() !== (userEmail || "").toLowerCase(),
                  );
                  setEmailForm({
                    to: recipients.join(", "),
                    subject: selectedThread.subject.toLowerCase().startsWith("re:")
                      ? selectedThread.subject
                      : `Re: ${selectedThread.subject}`,
                    body: `\n\n\nOn ${formatStamp(lastMsg?.received_at)}, ${lastMsg?.sender || "they"} wrote:\n${quotedLines}`,
                  });
                }} type="button">
                  Reply
                </button>
              </div>

              <div className="badge-row">
                <span className={`label ${selectedThread.needs_reply ? "needs-response" : ""}`}>
                  {selectedThread.needs_reply ? "Needs Reply" : selectedThread.priority}
                </span>
                <span className="label">{selectedThread.classification}</span>
                <span className="label">{selectedThread.status}</span>
              </div>

              <div className="email-actions">
                <button
                  className="action-btn"
                  title="Archive"
                  disabled={sending}
                  onClick={() => {
                    const msgId = getLatestMessageId();
                    if (msgId) executeEmailAction("Email archived", "archive_email", { message_id: msgId });
                  }}
                  type="button"
                >
                  Archive
                </button>
                <button
                  className="action-btn"
                  title="Star"
                  disabled={sending}
                  onClick={() => {
                    const msgId = getLatestMessageId();
                    if (msgId) executeEmailAction("Email starred", "star_email", { message_id: msgId });
                  }}
                  type="button"
                >
                  Star
                </button>
                <button
                  className="action-btn"
                  title="Mark as Read"
                  disabled={sending}
                  onClick={() => {
                    const msgId = getLatestMessageId();
                    if (msgId) executeEmailAction("Marked as read", "mark_read", { message_id: msgId });
                  }}
                  type="button"
                >
                  Mark Read
                </button>
                <button
                  className="action-btn danger"
                  title="Trash"
                  disabled={sending}
                  onClick={() => {
                    const msgId = getLatestMessageId();
                    if (msgId && window.confirm("Move this email to trash?")) {
                      executeEmailAction("Email trashed", "trash_email", { message_id: msgId });
                    }
                  }}
                  type="button"
                >
                  Trash
                </button>
                <button
                  className="action-btn"
                  title="Forward"
                  disabled={sending}
                  onClick={() => {
                    setComposeMode(true);
                    if (selectedThread) {
                      const lastMsg = threadMessages.sort((a, b) => new Date(b.received_at || 0).getTime() - new Date(a.received_at || 0).getTime())[0];
                      setEmailForm({
                        to: "",
                        subject: selectedThread.subject.startsWith("Fwd:") ? selectedThread.subject : `Fwd: ${selectedThread.subject}`,
                        body: `---------- Forwarded message ----------\n${lastMsg?.body || lastMsg?.snippet || ""}`,
                      });
                    }
                  }}
                  type="button"
                >
                  Forward
                </button>
              </div>

              {statusMessage ? <p className="status-copy">{statusMessage}</p> : null}

              <article className="summary-card">
                <strong>Thread Summary</strong>
                <div className="summary-content">
                  {selectedThread.summary ? (
                    <Markdown>{selectedThread.summary}</Markdown>
                  ) : (
                    <p>No thread summary available yet.</p>
                  )}
                </div>
              </article>

              <div className="message-stack">
                {threadMessages.map((message) => {
                  const rawBody = message.body || "";
                  const isHtml = /<[a-z][\s\S]*>/i.test(rawBody);
                  const displayBody = rawBody || message.summary || message.snippet || "";

                  return (
                    <article key={message.id} className={`message-card ${message.direction === "outbound" ? "outbound" : ""}`}>
                      <div className="message-top">
                        <div className="message-sender-row">
                          <strong>{message.sender || "Unknown sender"}</strong>
                          <span className={`direction-badge ${message.direction}`}>
                            {message.direction === "outbound" ? "Sent" : "Received"}
                          </span>
                        </div>
                        <span>{formatStamp(message.received_at)}</span>
                      </div>
                      {displayBody ? (
                        isHtml ? (
                          <div
                            className="message-body html-body"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayBody, {
                              ALLOWED_TAGS: ["p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code", "span", "div", "table", "thead", "tbody", "tr", "td", "th", "img", "hr"],
                              ALLOWED_ATTR: ["href", "src", "alt", "style", "class", "target", "width", "height"],
                              ALLOW_DATA_ATTR: false,
                            }) }}
                          />
                        ) : (
                          <div className="message-body plain-body">
                            {displayBody.split("\n").map((line, i) => (
                              <span key={i}>{linkifyLine(line)}<br /></span>
                            ))}
                          </div>
                        )
                      ) : (
                        <p className="empty-copy">No message body captured.</p>
                      )}
                      <div className="message-meta">
                        <span>{message.direction}</span>
                      </div>
                    </article>
                  );
                })}
                {!threadMessages.length ? (
                  <p className="empty-copy">No message bodies were stored for this thread yet.</p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>No thread selected</h3>
              <p>Pick a thread to see its messages and reply from here.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .inbox-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .inbox-header,
        .detail-header,
        .inbox-filters,
        .button-row,
        .thread-header,
        .message-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .inbox-header {
          margin-bottom: 32px;
        }

        .inbox-header h1,
        .detail-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .detail-header h2 {
          font-size: 22px;
        }

        .subtitle,
        .detail-header p {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .compose-btn,
        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .compose-btn:hover,
        .primary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(0, 167, 225, 0.25);
        }

        .primary-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .ghost-button {
          padding: 10px 18px;
          background: transparent;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          color: rgba(236, 228, 183, 0.8);
          cursor: pointer;
        }

        .inbox-filters {
          margin-bottom: 24px;
          gap: 20px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
        }

        .filter-tab,
        .label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          font-size: 14px;
          color: rgba(236, 228, 183, 0.6);
        }

        .filter-tab {
          cursor: pointer;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, rgba(0, 167, 225, 0.2) 0%, rgba(222, 192, 241, 0.2) 100%);
          color: #ECE4B7;
          border-color: #00A7E1;
        }

        .count {
          padding: 2px 8px;
          background: rgba(236, 228, 183, 0.08);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          min-width: 320px;
        }

        .search-box input,
        .field input,
        .field textarea {
          width: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          color: #ECE4B7;
          background: transparent;
        }

        .search-box input::placeholder,
        .field input::placeholder {
          color: rgba(236, 228, 183, 0.3);
        }

        .inbox-grid {
          display: grid;
          grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
          gap: 20px;
        }

        @media (max-width: 1100px) {
          .inbox-grid {
            grid-template-columns: 1fr;
          }
        }

        .thread-list,
        .detail-panel {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          overflow: hidden;
        }

        .thread-item {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 20px;
          border-bottom: 1px solid #1a1a1a;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s, border-color 0.2s;
        }

        .thread-item:last-child {
          border-bottom: none;
        }

        .thread-item:hover,
        .thread-item.selected {
          background: #111111;
        }

        .thread-item.selected {
          border-left: 2px solid #00A7E1;
          padding-left: 18px;
        }

        .thread-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }

        .thread-content,
        .composer-card,
        .summary-card,
        .message-card {
          min-width: 0;
        }

        .thread-content {
          flex: 1;
        }

        .thread-from,
        .thread-subject,
        .summary-card strong,
        .message-card strong {
          color: #ECE4B7;
        }

        .thread-from {
          font-size: 14px;
          font-weight: 600;
        }

        .thread-time,
        .message-top span,
        .message-meta,
        .status-copy,
        .empty-copy {
          color: rgba(236, 228, 183, 0.45);
          font-size: 13px;
        }

        .thread-subject {
          font-size: 15px;
          font-weight: 600;
          margin: 6px 0;
        }

        .thread-snippet,
        .summary-card p,
        .message-card p,
        .empty-state p {
          color: rgba(236, 228, 183, 0.62);
          line-height: 1.55;
          margin: 0;
        }

        .thread-labels,
        .badge-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .label {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
        }

        .label.needs-response {
          background: rgba(204, 41, 54, 0.18);
          color: #CC2936;
          border-color: rgba(204, 41, 54, 0.35);
        }

        .detail-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .summary-card,
        .composer-card,
        .message-card {
          background: #111111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 18px;
        }

        .message-stack {
          display: grid;
          gap: 12px;
        }

        .field {
          display: grid;
          gap: 8px;
        }

        .field span {
          color: rgba(236, 228, 183, 0.65);
          font-size: 13px;
        }

        .field input,
        .field textarea {
          border: 1px solid #1f1f1f;
          border-radius: 10px;
          padding: 12px 14px;
          background: #0b0b0b;
        }

        .field textarea {
          resize: vertical;
          min-height: 220px;
        }

        .empty-state {
          padding: 48px 24px;
        }

        .empty-state h3 {
          color: #ECE4B7;
          margin: 0 0 8px;
        }

        .email-actions {
          display: flex;
          gap: 8px;
          padding: 12px 0;
          border-bottom: 1px solid #1a1a1a;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 8px 16px;
          border-radius: 6px;
          background: #141414;
          border: 1px solid #1a1a1a;
          color: rgba(236, 228, 183, 0.7);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover:not(:disabled) {
          background: #1a1a1a;
          border-color: #00A7E1;
          color: #ECE4B7;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.danger:hover:not(:disabled) {
          border-color: #CC2936;
          color: #CC2936;
        }

        /* Summary card markdown */
        .summary-content p { margin: 4px 0; line-height: 1.5; }
        .summary-content ul, .summary-content ol { padding-left: 18px; margin: 4px 0; }
        .summary-content li { margin: 2px 0; font-size: 13px; }
        .summary-content li::marker { color: #00A7E1; }
        .summary-content strong { color: #ECE4B7; }
        .summary-content a { color: #00A7E1; text-decoration: underline; }

        /* Read/Unread states */
        .thread-item.unread {
          background: #0d0d0d;
        }
        .thread-item.unread .thread-subject,
        .thread-item.unread .thread-from {
          color: #ECE4B7;
        }
        .thread-from.bold, .thread-subject.bold {
          font-weight: 700;
        }
        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00A7E1;
          flex-shrink: 0;
          margin-top: 18px;
        }

        /* Message direction badges */
        .message-sender-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .direction-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .direction-badge.inbound {
          background: rgba(0, 167, 225, 0.12);
          color: #00A7E1;
        }
        .direction-badge.outbound {
          background: rgba(222, 192, 241, 0.12);
          color: #DEC0F1;
        }
        .message-card.outbound {
          border-left: 3px solid #DEC0F1;
        }

        /* HTML email body rendering */
        .message-body {
          margin-top: 12px;
          line-height: 1.6;
          color: rgba(236, 228, 183, 0.85);
        }
        .html-body {
          overflow-x: auto;
        }
        .html-body a {
          color: #00A7E1;
          text-decoration: underline;
        }
        .html-body blockquote {
          border-left: 3px solid #333;
          padding-left: 12px;
          margin: 8px 0;
          color: rgba(236, 228, 183, 0.5);
        }
        .html-body img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
        }
        .html-body table {
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0;
        }
        .html-body td, .html-body th {
          border: 1px solid #2a2a2a;
          padding: 6px 10px;
          font-size: 13px;
        }
        .html-body h1, .html-body h2, .html-body h3 {
          color: #ECE4B7;
          margin: 12px 0 6px;
        }
        .html-body pre, .html-body code {
          background: #141414;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 13px;
        }
        .plain-body {
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 14px;
          line-height: 1.65;
        }

        /* Quoted text in replies (lines starting with >) */
        .plain-body span {
          display: inline;
        }

        /* Email signature detection */
        .message-body .sig-separator {
          border-top: 1px solid #1a1a1a;
          margin-top: 12px;
          padding-top: 8px;
          color: rgba(236, 228, 183, 0.35);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

function linkifyLine(line: string) {
  // Match URLs and email addresses in plain text
  const urlRegex = /(https?:\/\/[^\s<]+[^\s<.,;:!?)"])/g;
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  const combined = new RegExp(`(${urlRegex.source})|(${emailRegex.source})`, "g");
  let match: RegExpExecArray | null;

  while ((match = combined.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const text = match[0];
    if (text.includes("@") && !text.startsWith("http")) {
      parts.push(
        <a key={match.index} href={`mailto:${text}`} style={{ color: "#00A7E1", textDecoration: "underline" }}>
          {text}
        </a>
      );
    } else {
      parts.push(
        <a key={match.index} href={text} target="_blank" rel="noopener noreferrer" style={{ color: "#00A7E1", textDecoration: "underline", wordBreak: "break-all" }}>
          {text.length > 60 ? text.slice(0, 57) + "..." : text}
        </a>
      );
    }
    lastIndex = match.index + text.length;
  }
  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }
  return parts.length > 0 ? <>{parts}</> : line;
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatStamp(value: string | null | undefined) {
  if (!value) {
    return "TBD";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}
