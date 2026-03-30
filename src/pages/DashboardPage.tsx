import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";

type DashboardTask = {
  id: string;
  title: string;
  due_at?: string | null;
  priority?: string | null;
  priority_score?: number | null;
  eisenhower_quadrant?: string | null;
  status?: string;
};

type DashboardMeeting = {
  id: string;
  title: string;
  start_time?: string | null;
  end_time?: string | null;
  attendee_emails?: string[];
  status?: string;
};

type DashboardThread = {
  id: string;
  subject: string;
  needs_reply?: boolean;
  priority?: string | null;
  status?: string | null;
  classification?: string;
  last_message_at?: string | null;
  participants?: string[];
};

type DashboardBrief = {
  id: string;
  title: string;
  summary?: string | null;
  body: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
};

type DashboardApproval = {
  id: string;
  title?: string;
  status?: string | null;
  due_at?: string | null;
};

interface DashboardPageProps {
  tasks: DashboardTask[];
  meetings: DashboardMeeting[];
  emails: DashboardThread[];
  briefs: DashboardBrief[];
  approvals: DashboardApproval[];
  onGenerateBrief: () => Promise<void> | void;
  generatingBrief?: boolean;
}

export function DashboardPage({
  tasks,
  meetings,
  emails,
  briefs,
  approvals,
  onGenerateBrief,
  generatingBrief = false,
}: DashboardPageProps) {
  const navigate = useNavigate();
  const now = new Date();

  // Derive intelligence
  const scoredTasks = tasks.map(t => ({ ...t, score: typeof t.priority_score === "number" ? t.priority_score : deriveTaskPriority(t) }));
  const highPriority = scoredTasks.filter(t => t.score >= 70);
  const overdueTasks = scoredTasks.filter(t => t.due_at && new Date(t.due_at) < now && t.status !== "done");
  const todayMeetings = meetings.filter(m => isSameDay(m.start_time, now) && m.status !== "cancelled");
  const nextMeeting = todayMeetings.sort((a, b) => new Date(a.start_time || 0).getTime() - new Date(b.start_time || 0).getTime())[0];
  const needsReply = emails.filter(t => t.needs_reply);
  const escalations = emails.filter(t => t.classification === "escalation" || t.priority === "urgent");
  const pendingApprovals = approvals.filter(a => a.status === "pending");
  const latestBrief = briefs[0];
  const briefSections = parseBriefSections(latestBrief?.metadata);

  // Meeting load for today
  const meetingMinutes = todayMeetings.reduce((sum, m) => {
    if (!m.start_time || !m.end_time) return sum;
    return sum + (new Date(m.end_time).getTime() - new Date(m.start_time).getTime()) / 60000;
  }, 0);
  const meetingHours = Math.round(meetingMinutes / 60 * 10) / 10;
  const meetingLoadPct = Math.min(100, Math.round(meetingMinutes / 480 * 100));

  // Urgency score (simple crisis indicator)
  const urgencyScore = overdueTasks.length * 10 + escalations.length * 15 + needsReply.length * 5 + pendingApprovals.length * 8;
  const urgencyLevel = urgencyScore >= 60 ? "high" : urgencyScore >= 30 ? "medium" : "low";

  return (
    <div className="dash">
      <style>{`
        .dash { max-width: 1400px; margin: 0 auto; }
        .dash-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .dash-greeting { color: #ECE4B7; font-size: 26px; font-weight: 700; }
        .dash-date { color: #888; font-size: 14px; margin-top: 4px; }
        .dash-actions { display: flex; gap: 10px; }
        .dash-btn { padding: 10px 20px; border-radius: 8px; border: 1px solid #333; background: transparent; color: #ECE4B7; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .dash-btn:hover { background: #141414; border-color: #00A7E1; }
        .dash-btn.primary { background: linear-gradient(135deg, #00A7E1, #DEC0F1); color: #020202; border: none; }

        .urgency-bar { padding: 14px 20px; border-radius: 10px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .urgency-bar.high { background: #CC293615; border: 1px solid #CC293640; }
        .urgency-bar.medium { background: #f0a03012; border: 1px solid #f0a03035; }
        .urgency-bar.low { background: #4ade8010; border: 1px solid #4ade8025; }
        .urgency-text { flex: 1; color: #ECE4B7; font-size: 14px; }
        .urgency-score { font-weight: 700; font-size: 14px; }

        .dash-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .dash-stat { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 18px; cursor: pointer; transition: all 0.2s; }
        .dash-stat:hover { border-color: #333; transform: translateY(-1px); }
        .dash-stat-value { font-size: 28px; font-weight: 800; margin-bottom: 2px; }
        .dash-stat-label { color: #888; font-size: 12px; }
        .dash-stat-detail { color: #666; font-size: 11px; margin-top: 6px; }

        .dash-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .dash-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; }
        .dash-card-title { color: #ECE4B7; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .dash-item { padding: 10px 0; border-bottom: 1px solid #111; display: flex; justify-content: space-between; align-items: center; }
        .dash-item:last-child { border-bottom: none; }
        .dash-item-title { color: #ECE4B7; font-size: 13px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dash-item-meta { color: #666; font-size: 11px; margin-top: 2px; }
        .dash-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .dash-link { color: #00A7E1; font-size: 12px; cursor: pointer; background: none; border: none; font-weight: 600; }

        .meeting-load { margin-bottom: 24px; }
        .load-bar { height: 8px; background: #1a1a1a; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .load-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }

        .brief-preview { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .brief-summary { color: #aaa; font-size: 14px; line-height: 1.6; margin: 12px 0; }
        .brief-sections-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .brief-section-chip { padding: 8px 14px; background: #141414; border-radius: 8px; border: 1px solid #1a1a1a; font-size: 12px; color: #aaa; }
        .brief-section-chip strong { color: #ECE4B7; }
      `}</style>

      <div className="dash-top">
        <div>
          <div className="dash-greeting">{getGreeting()}</div>
          <div className="dash-date">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
        <div className="dash-actions">
          <button className="dash-btn" onClick={() => navigate("/chat")}>AI Agent</button>
          <button className="dash-btn" onClick={() => navigate("/inbox?compose=1")}>Compose</button>
          <button className="dash-btn primary" onClick={() => void onGenerateBrief()} disabled={generatingBrief}>
            {generatingBrief ? "Generating..." : "Generate Brief"}
          </button>
        </div>
      </div>

      {/* Urgency Bar */}
      <div className={`urgency-bar ${urgencyLevel}`}>
        <span className="urgency-text">
          {urgencyLevel === "high"
            ? `High attention needed: ${overdueTasks.length} overdue tasks, ${escalations.length} escalations, ${needsReply.length} emails waiting`
            : urgencyLevel === "medium"
            ? `Some items need attention: ${needsReply.length} replies needed, ${pendingApprovals.length} approvals pending`
            : "Operations running smoothly. No urgent items."}
        </span>
        <span className="urgency-score" style={{ color: urgencyLevel === "high" ? "#CC2936" : urgencyLevel === "medium" ? "#f0a030" : "#4ade80" }}>
          {urgencyLevel === "low" ? "Clear" : `Score: ${urgencyScore}`}
        </span>
      </div>

      {/* Key Stats */}
      <div className="dash-grid">
        <div className="dash-stat" onClick={() => navigate("/tasks")}>
          <div className="dash-stat-value" style={{ color: highPriority.length > 0 ? "#CC2936" : "#4ade80" }}>
            {highPriority.length}
          </div>
          <div className="dash-stat-label">High Priority Tasks</div>
          <div className="dash-stat-detail">{overdueTasks.length} overdue</div>
        </div>
        <div className="dash-stat" onClick={() => navigate("/calendar")}>
          <div className="dash-stat-value" style={{ color: meetingLoadPct > 70 ? "#CC2936" : "#00A7E1" }}>
            {todayMeetings.length}
          </div>
          <div className="dash-stat-label">Meetings Today</div>
          <div className="dash-stat-detail">{meetingHours}h booked ({meetingLoadPct}% load)</div>
        </div>
        <div className="dash-stat" onClick={() => navigate("/inbox")}>
          <div className="dash-stat-value" style={{ color: needsReply.length > 5 ? "#f0a030" : "#ECE4B7" }}>
            {needsReply.length}
          </div>
          <div className="dash-stat-label">Waiting on You</div>
          <div className="dash-stat-detail">{escalations.length} escalations</div>
        </div>
        <div className="dash-stat" onClick={() => navigate("/commitments")}>
          <div className="dash-stat-value" style={{ color: pendingApprovals.length > 0 ? "#DEC0F1" : "#888" }}>
            {pendingApprovals.length}
          </div>
          <div className="dash-stat-label">Pending Approvals</div>
          <div className="dash-stat-detail">Awaiting your decision</div>
        </div>
      </div>

      {/* Meeting Load Bar */}
      <div className="meeting-load">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#888", fontSize: 12 }}>Today's Calendar Load</span>
          <span style={{ color: "#ECE4B7", fontSize: 12, fontWeight: 600 }}>{meetingHours}h / 8h</span>
        </div>
        <div className="load-bar">
          <div className="load-fill" style={{
            width: `${meetingLoadPct}%`,
            background: meetingLoadPct > 80 ? "#CC2936" : meetingLoadPct > 60 ? "#f0a030" : "#4ade80",
          }} />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dash-cols">
        {/* Next Meetings */}
        <div className="dash-card">
          <div className="dash-card-title">
            <span>Today's Schedule</span>
            <button className="dash-link" onClick={() => navigate("/calendar")}>View all</button>
          </div>
          {todayMeetings.length === 0 ? (
            <div style={{ color: "#666", fontSize: 13, padding: "12px 0" }}>No meetings today. Rare and precious.</div>
          ) : (
            todayMeetings.slice(0, 5).map(m => {
              const start = m.start_time ? new Date(m.start_time) : null;
              const isNext = m === nextMeeting;
              return (
                <div key={m.id} className="dash-item">
                  <div>
                    <div className="dash-item-title" style={isNext ? { color: "#00A7E1", fontWeight: 600 } : undefined}>
                      {isNext ? "NEXT: " : ""}{m.title}
                    </div>
                    <div className="dash-item-meta">
                      {start ? start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"}
                      {m.attendee_emails ? ` — ${m.attendee_emails.length} attendees` : ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Needs Reply */}
        <div className="dash-card">
          <div className="dash-card-title">
            <span>Emails Waiting on You</span>
            <button className="dash-link" onClick={() => navigate("/inbox")}>View all</button>
          </div>
          {needsReply.length === 0 ? (
            <div style={{ color: "#666", fontSize: 13, padding: "12px 0" }}>Inbox clear. No replies pending.</div>
          ) : (
            needsReply.slice(0, 5).map(t => (
              <div key={t.id} className="dash-item" onClick={() => navigate("/inbox")} style={{ cursor: "pointer" }}>
                <div>
                  <div className="dash-item-title">{t.subject}</div>
                  <div className="dash-item-meta">
                    {(t.participants || [])[0] || "Unknown"}
                    {t.last_message_at ? ` — ${formatRelative(t.last_message_at)}` : ""}
                  </div>
                </div>
                <span className="dash-badge" style={{
                  background: t.priority === "urgent" ? "#CC293620" : "#1a1a1a",
                  color: t.priority === "urgent" ? "#CC2936" : "#888",
                }}>{t.priority || "normal"}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dash-cols">
        {/* High Priority Tasks */}
        <div className="dash-card">
          <div className="dash-card-title">
            <span>Priority Tasks</span>
            <button className="dash-link" onClick={() => navigate("/tasks")}>View all</button>
          </div>
          {highPriority.length === 0 ? (
            <div style={{ color: "#666", fontSize: 13, padding: "12px 0" }}>No high-priority tasks. Consider reviewing your goals.</div>
          ) : (
            highPriority.slice(0, 5).map(t => {
              const isOverdue = t.due_at && new Date(t.due_at) < now;
              return (
                <div key={t.id} className="dash-item">
                  <div>
                    <div className="dash-item-title">{t.title}</div>
                    <div className="dash-item-meta">
                      {t.due_at ? (isOverdue ? "OVERDUE: " : "Due ") + new Date(t.due_at).toLocaleDateString() : "No date"}
                      {t.eisenhower_quadrant ? ` — ${t.eisenhower_quadrant}` : ""}
                    </div>
                  </div>
                  <span className="dash-badge" style={{ background: "#CC293620", color: "#CC2936" }}>
                    {t.score}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Pending Approvals */}
        <div className="dash-card">
          <div className="dash-card-title">
            <span>Pending Approvals</span>
            <button className="dash-link" onClick={() => navigate("/agent-actions")}>Agent log</button>
          </div>
          {pendingApprovals.length === 0 ? (
            <div style={{ color: "#666", fontSize: 13, padding: "12px 0" }}>No approvals pending.</div>
          ) : (
            pendingApprovals.slice(0, 5).map(a => (
              <div key={a.id} className="dash-item">
                <div>
                  <div className="dash-item-title">{a.title || "Approval request"}</div>
                  <div className="dash-item-meta">{a.due_at ? `Due ${new Date(a.due_at).toLocaleDateString()}` : "No deadline"}</div>
                </div>
                <span className="dash-badge" style={{ background: "#DEC0F120", color: "#DEC0F1" }}>pending</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Brief Preview */}
      {latestBrief && (
        <div className="brief-preview">
          <div className="dash-card-title">
            <span>Latest Executive Brief</span>
            <span style={{ color: "#666", fontSize: 11, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              {new Date(latestBrief.updated_at || latestBrief.created_at || Date.now()).toLocaleString()}
            </span>
          </div>
          <div className="brief-summary"><Markdown>{latestBrief.summary || latestBrief.body.slice(0, 400)}</Markdown></div>
          {briefSections && (
            <div className="brief-sections-row">
              <div className="brief-section-chip"><strong>{briefSections.know}</strong> signals to know</div>
              <div className="brief-section-chip"><strong>{briefSections.waiting}</strong> waiting on you</div>
              <div className="brief-section-chip"><strong>{briefSections.todo}</strong> things to do</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function deriveTaskPriority(task: DashboardTask): number {
  if (typeof task.priority_score === "number") return task.priority_score;
  const p = String(task.priority || "").toLowerCase();
  if (p === "high" || p === "critical") return 85;
  if (p === "medium") return 64;
  const dueAt = task.due_at ? new Date(task.due_at) : null;
  if (dueAt && !Number.isNaN(dueAt.getTime()) && dueAt.getTime() <= Date.now() + 86400000) return 78;
  return 48;
}

function isSameDay(value: string | null | undefined, target: Date) {
  if (!value) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth() && d.getDate() === target.getDate();
}

function formatRelative(value: string): string {
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function parseBriefSections(metadata: Record<string, unknown> | undefined): { know: number; waiting: number; todo: number } | null {
  const sections = metadata?.sections;
  if (!sections || typeof sections !== "object") return null;
  const root = sections as Record<string, unknown>;
  return {
    know: countSection(root.what_you_need_to_know),
    waiting: countSection(root.whos_waiting_on_you),
    todo: countSection(root.what_you_need_to_do),
  };
}

function countSection(section: unknown): number {
  if (!section || typeof section !== "object") return 0;
  return Object.values(section as Record<string, unknown>).reduce<number>((total, v) => {
    if (Array.isArray(v)) return total + v.length;
    return total;
  }, 0);
}
