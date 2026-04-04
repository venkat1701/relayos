/**
 * Conversational Assistant Component
 *
 * Provides a chat interface with streaming responses and tool activity indicators.
 * Uses Server-Sent Events for real-time streaming, with a non-streaming fallback.
 */

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { API_ROUTES } from "../lib/contract";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  tool: string;
  status: "executing" | "completed" | "failed";
  args?: Record<string, unknown>;
  result?: string;
}

interface ChatAssistantProps {
  organizationId: string;
  token: string;
  onClose?: () => void;
}

function formatToolName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatToolResult(result: string): string {
  // Try to parse JSON and show a structured summary
  try {
    const parsed = JSON.parse(result);
    if (parsed.summary) return parsed.summary;
    if (parsed.status === "executed" && parsed.result) {
      if (typeof parsed.result === "string") return parsed.result;
      return JSON.stringify(parsed.result, null, 2).slice(0, 200);
    }
    if (typeof parsed === "string") return parsed;
    return JSON.stringify(parsed, null, 2).slice(0, 200);
  } catch {
    // Not JSON, return as-is but truncated
    return result.length > 150 ? result.slice(0, 147) + "..." : result;
  }
}

export function ChatAssistant({ organizationId, token, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I'm Bond AI, your RelayOS assistant. I can send emails, schedule meetings, track commitments, record decisions, analyze your calendar, detect risks, generate briefs, and manage your operational rhythm. What needs attention?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [toolActivity, setToolActivity] = useState<ToolCall | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const finalizeAssistantMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setStreamingMessage("");
  };

  const handleStreamFrame = (frame: string) => {
    const lines = frame
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean);
    if (!lines.length) {
      return;
    }

    let eventType = "message";
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }

    if (!dataLines.length) {
      return;
    }

    const data = JSON.parse(dataLines.join("\n"));
    switch (eventType) {
      case "status":
        setStatusMessage(data.message);
        break;
      case "context_ready":
        setStatusMessage(`Loaded ${data.items_loaded} recent items`);
        window.setTimeout(() => setStatusMessage(null), 2000);
        break;
      case "message":
        setStreamingMessage(data.text || "");
        if (data.is_complete) {
          finalizeAssistantMessage(String(data.text || ""));
        }
        break;
      case "tool_activity":
        setToolActivity({
          tool: data.tool,
          status: data.status,
          args: data.args,
          result: data.result,
        });
        if (data.status === "completed" || data.status === "failed") {
          window.setTimeout(() => setToolActivity(null), 3000);
        }
        break;
      case "done":
        setIsStreaming(false);
        setStatusMessage(null);
        break;
      case "error":
        throw new Error(String(data.message || "Chat request failed."));
      default:
        break;
    }
  };

  const sendMessage = async (presetMessage?: string) => {
    const content = (presetMessage ?? inputValue).trim();
    if (!content || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);
    setStreamingMessage("");
    setToolActivity(null);
    setStatusMessage(null);

    try {
      const response = await fetch(API_ROUTES.chat.stream, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organization_id: organizationId,
          message: userMessage.content,
          conversation_history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let sawDone = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";

        for (const frame of frames) {
          handleStreamFrame(frame);
          if (frame.includes("event: done")) {
            sawDone = true;
          }
        }
      }

      if (buffer.trim()) {
        handleStreamFrame(buffer);
        if (buffer.includes("event: done")) {
          sawDone = true;
        }
      }

      if (!sawDone) {
        setIsStreaming(false);
        setStatusMessage(null);
      }
    } catch (error) {
      try {
        const fallbackResponse = await fetch(API_ROUTES.chat.message, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            organization_id: organizationId,
            message: userMessage.content,
            conversation_history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!fallbackResponse.ok) {
          throw new Error("Fallback chat request failed");
        }

        const payload = await fallbackResponse.json();
        finalizeAssistantMessage(String(payload.response || "I couldn't generate a response."));
        setStatusMessage(null);
      } catch (fallbackError) {
        console.error("Failed to send message:", error, fallbackError);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Sorry, I encountered an error processing your message. Please try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    if (!isStreaming) {
      sendMessage(action);
    }
  };

  return (
    <div className="chat-assistant">
      <div className="chat-header">
        <div>
          <h2>Chat Assistant</h2>
          <p>Ask me about tasks, meetings, emails, or briefs</p>
        </div>
        {onClose && (
          <button className="ghost-button" onClick={onClose} type="button">
            ×
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.role}`}>
            <div className="message-avatar">{message.role === "user" ? "U" : "AI"}</div>
            <div className="message-content">
              <div className="message-text markdown-body">
                {message.role === "assistant" ? (
                  <Markdown>{message.content}</Markdown>
                ) : (
                  message.content
                )}
              </div>
              <div className="message-timestamp">{message.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}

        {streamingMessage && (
          <div className="chat-message assistant streaming">
            <div className="message-avatar">AI</div>
            <div className="message-content">
              <div className="message-text markdown-body">
                <Markdown>{streamingMessage}</Markdown>
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {toolActivity && (
          <div className="tool-activity" style={{
            background: toolActivity.status === "completed" ? "rgba(74, 222, 128, 0.06)" :
                        toolActivity.status === "failed" ? "rgba(204, 41, 54, 0.06)" :
                        "rgba(0, 167, 225, 0.06)",
            border: `1px solid ${toolActivity.status === "completed" ? "rgba(74, 222, 128, 0.2)" :
                     toolActivity.status === "failed" ? "rgba(204, 41, 54, 0.2)" :
                     "rgba(0, 167, 225, 0.2)"}`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: toolActivity.result ? 6 : 0 }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>
                {toolActivity.status === "executing" ? <i className="fi fi-rr-arrows-repeat" style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> : toolActivity.status === "completed" ? <i className="fi fi-rr-check" style={{ color: '#4ade80' }} /> : <i className="fi fi-rr-cross-small" style={{ color: '#CC2936' }} />}
              </span>
              <strong style={{ color: "#ECE4B7", fontSize: 13 }}>{formatToolName(toolActivity.tool)}</strong>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                color: toolActivity.status === "completed" ? "#4ade80" : toolActivity.status === "failed" ? "#CC2936" : "#00A7E1",
                background: toolActivity.status === "completed" ? "rgba(74,222,128,0.1)" : toolActivity.status === "failed" ? "rgba(204,41,54,0.1)" : "rgba(0,167,225,0.1)",
              }}>{toolActivity.status}</span>
            </div>
            {toolActivity.args && Object.keys(toolActivity.args).length > 0 && toolActivity.status === "executing" && (
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                {Object.entries(toolActivity.args).slice(0, 3).map(([k, v]) => (
                  <span key={k} style={{ marginRight: 12 }}>{k}: <span style={{ color: "#aaa" }}>{String(v).slice(0, 40)}</span></span>
                ))}
              </div>
            )}
            {toolActivity.result && (
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 4, lineHeight: 1.5 }}>
                {formatToolResult(toolActivity.result)}
              </div>
            )}
          </div>
        )}

        {statusMessage && (
          <div className="status-message">
            <span className="status-icon">i</span>
            {statusMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        <button className="quick-action-chip" onClick={() => handleQuickAction("What needs my attention today?")} type="button">
          What matters today
        </button>
        <button className="quick-action-chip" onClick={() => handleQuickAction("Show overdue commitments and who I'm waiting on")} type="button">
          Overdue commitments
        </button>
        <button className="quick-action-chip" onClick={() => handleQuickAction("Analyze my calendar this week - am I overloaded?")} type="button">
          Calendar analysis
        </button>
        <button className="quick-action-chip" onClick={() => handleQuickAction("Assess crisis level - any risks or escalations?")} type="button">
          Crisis check
        </button>
        <button className="quick-action-chip" onClick={() => handleQuickAction("Generate my daily executive brief")} type="button">
          Generate brief
        </button>
        <button className="quick-action-chip" onClick={() => handleQuickAction("What decisions are pending?")} type="button">
          Pending decisions
        </button>
      </div>

      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isStreaming}
        />
        <button className="primary-button" onClick={() => void sendMessage()} disabled={!inputValue.trim() || isStreaming} type="button">
          {isStreaming ? "⋯" : "Send"}
        </button>
      </div>

      <style>{`
        .chat-assistant {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0a0a0a;
          border-radius: 8px;
          border: 1px solid #1a1a1a;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #1a1a1a;
        }

        .chat-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #ECE4B7;
        }

        .chat-header p {
          margin: 4px 0 0;
          font-size: 14px;
          color: rgba(236, 228, 183, 0.5);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chat-message {
          display: flex;
          gap: 12px;
          animation: fadeIn 0.3s ease-in;
        }

        .chat-message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #020202;
          flex-shrink: 0;
        }

        .message-content {
          max-width: 70%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .message-text {
          padding: 12px 16px;
          border-radius: 12px;
          background: #141414;
          border: 1px solid #1a1a1a;
          color: #ECE4B7;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .chat-message.user .message-text {
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          border: none;
        }

        .message-timestamp {
          font-size: 11px;
          color: rgba(236, 228, 183, 0.3);
          padding: 0 8px;
        }

        .chat-message.user .message-timestamp {
          text-align: right;
        }

        .chat-message.streaming .message-text {
          background: #0a0a0a;
          border: 1px dashed #2a2a2a;
        }

        /* Markdown rendering in chat messages */
        .markdown-body h1, .markdown-body h2, .markdown-body h3,
        .markdown-body h4, .markdown-body h5, .markdown-body h6 {
          color: #ECE4B7;
          margin: 12px 0 6px;
          line-height: 1.3;
        }
        .markdown-body h1 { font-size: 18px; }
        .markdown-body h2 { font-size: 16px; }
        .markdown-body h3 { font-size: 14px; font-weight: 600; }
        .markdown-body p { margin: 6px 0; line-height: 1.6; }
        .markdown-body ul, .markdown-body ol {
          margin: 6px 0; padding-left: 20px;
        }
        .markdown-body li { margin: 3px 0; line-height: 1.5; }
        .markdown-body li::marker { color: #00A7E1; }
        .markdown-body strong { color: #ECE4B7; font-weight: 600; }
        .markdown-body em { color: rgba(236,228,183,0.8); }
        .markdown-body a {
          color: #00A7E1; text-decoration: underline;
          text-underline-offset: 2px;
        }
        .markdown-body a:hover { color: #DEC0F1; }
        .markdown-body code {
          background: #141414; padding: 2px 6px; border-radius: 4px;
          font-size: 12px; font-family: 'SF Mono', 'Fira Code', monospace;
          color: #DEC0F1;
        }
        .markdown-body pre {
          background: #0a0a0a; border: 1px solid #1a1a1a;
          border-radius: 8px; padding: 12px 16px;
          overflow-x: auto; margin: 8px 0;
        }
        .markdown-body pre code {
          background: none; padding: 0; font-size: 12px;
          color: rgba(236,228,183,0.85);
        }
        .markdown-body blockquote {
          border-left: 3px solid #00A7E1; padding-left: 12px;
          margin: 8px 0; color: rgba(236,228,183,0.6);
          font-style: italic;
        }
        .markdown-body hr {
          border: none; border-top: 1px solid #1a1a1a; margin: 12px 0;
        }
        .markdown-body table {
          border-collapse: collapse; width: 100%; margin: 8px 0;
        }
        .markdown-body th, .markdown-body td {
          border: 1px solid #1a1a1a; padding: 6px 10px;
          font-size: 13px; text-align: left;
        }
        .markdown-body th {
          background: #141414; color: #ECE4B7; font-weight: 600;
        }
        .markdown-body td { color: rgba(236,228,183,0.8); }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 0 8px;
        }

        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(236, 228, 183, 0.4);
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tool-activity {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(0, 167, 225, 0.06);
          border-radius: 8px;
          border: 1px solid rgba(0, 167, 225, 0.2);
          animation: slideIn 0.3s ease-out;
        }

        .tool-icon {
          font-size: 24px;
        }

        .tool-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tool-status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .tool-status.executing {
          background: rgba(0, 167, 225, 0.2);
          color: #78350f;
        }

        .tool-status.completed {
          background: #34d399;
          color: #064e3b;
        }

        .tool-status.failed {
          background: rgba(204, 41, 54, 0.2);
          color: #7f1d1d;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(0, 167, 225, 0.06);
          border-radius: 6px;
          font-size: 13px;
          color: #00A7E1;
        }

        .quick-actions {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          overflow-x: auto;
          border-top: 1px solid #1a1a1a;
        }

        .quick-action-chip {
          padding: 8px 16px;
          border-radius: 20px;
          background: #141414;
          border: 1px solid #1a1a1a;
          color: rgba(236, 228, 183, 0.8);
          font-size: 13px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-action-chip:hover {
          background: #1a1a1a;
          border-color: #2a2a2a;
          color: #ECE4B7;
        }

        .chat-input-container {
          display: flex;
          gap: 12px;
          padding: 20px;
          border-top: 1px solid #1a1a1a;
          background: #0a0a0a;
        }

        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          font-size: 14px;
          background: #141414;
          color: #ECE4B7;
          outline: none;
        }

        .chat-input::placeholder {
          color: rgba(236, 228, 183, 0.3);
        }

        .chat-input:focus {
          border-color: #00A7E1;
          box-shadow: 0 0 0 3px rgba(0, 167, 225, 0.1);
        }

        .chat-input:disabled {
          background: #0a0a0a;
          cursor: not-allowed;
          color: rgba(236, 228, 183, 0.4);
        }

        .status-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #00A7E1;
          color: #020202;
          font-size: 11px;
          font-weight: 700;
        }

        .primary-button {
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

        .primary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 167, 225, 0.3);
        }

        .primary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ghost-button {
          background: none;
          border: none;
          color: rgba(236, 228, 183, 0.5);
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
          transition: color 0.2s;
        }

        .ghost-button:hover {
          color: #ECE4B7;
        }
      `}</style>
    </div>
  );
}
