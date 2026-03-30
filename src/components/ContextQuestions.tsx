import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { API_ROUTES } from "../lib/contract";
import type { ContextQuestionResponse } from "../lib/types";

interface Props {
  organizationId: string;
  token: string;
  workspaceId?: string | null;
}

export function ContextQuestions({ organizationId, token, workspaceId }: Props) {
  const [questions, setQuestions] = useState<ContextQuestionResponse[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => { loadQuestions(); }, [organizationId, workspaceId]);

  async function loadQuestions() {
    try {
      let url = API_ROUTES.contextQuestions.list + `?organization_id=${organizationId}&status=pending`;
      if (workspaceId) url += `&workspace_id=${workspaceId}`;
      const data = await apiRequest<ContextQuestionResponse[]>(url, { token });
      setQuestions(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }

  async function submitAnswer(id: string) {
    const answer = answers[id]?.trim();
    if (!answer) return;
    setSubmitting(id);
    try {
      await apiRequest(API_ROUTES.contextQuestions.answer(id), {
        method: "POST", token, body: { answer },
      });
      setAnswers(prev => { const n = { ...prev }; delete n[id]; return n; });
      await loadQuestions();
    } catch (e) { console.error(e); }
    setSubmitting(null);
  }

  if (questions.length === 0) return null;

  return (
    <div style={{ margin: "0 0 24px" }}>
      <div style={{
        color: "#DEC0F1", fontSize: 13, fontWeight: 600, textTransform: "uppercase",
        letterSpacing: "0.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: "#DEC0F1", display: "inline-block",
        }} />
        Agent needs your input ({questions.length})
      </div>

      {questions.map(q => (
        <div key={q.id} style={{
          background: "#0a0a0a", border: "1px solid #DEC0F130", borderLeft: "3px solid #DEC0F1",
          borderRadius: "0 10px 10px 0", padding: "14px 16px", marginBottom: 8,
        }}>
          <div style={{ color: "#ECE4B7", fontSize: 14, marginBottom: 8, lineHeight: 1.5 }}>{q.question}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={answers[q.id] || ""}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              onKeyDown={e => { if (e.key === "Enter") submitAnswer(q.id); }}
              placeholder="Type your answer..."
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8,
                border: "1px solid #333", background: "#0b0b0b", color: "#ECE4B7",
                fontSize: 13, outline: "none",
              }}
            />
            <button
              onClick={() => submitAnswer(q.id)}
              disabled={submitting === q.id || !answers[q.id]?.trim()}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: "#DEC0F1", color: "#020202", fontSize: 12, fontWeight: 600,
                cursor: "pointer", opacity: submitting === q.id ? 0.5 : 1,
              }}
            >{submitting === q.id ? "..." : "Answer"}</button>
          </div>
          <div style={{ color: "#888", fontSize: 11, marginTop: 6 }}>
            {q.category} {q.workspace_id ? " | workspace-scoped" : ""} | {new Date(q.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
