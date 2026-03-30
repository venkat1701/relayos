import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { API_ROUTES } from "../lib/contract";

interface Meeting {
  id: string;
  external_event_id: string;
  title: string;
  description?: string | null;
  agenda?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  attendee_emails: string[];
  location?: string | null;
  status: string;
  html_link?: string | null;
  meet_link?: string | null;
}

interface Brief {
  id: string;
  title: string;
  summary?: string | null;
  body: string;
  meeting_id?: string | null;
}

interface CalendarPageProps {
  meetings: Meeting[];
  briefs: Brief[];
  token: string;
  organizationId: string;
  onWorkspaceRefresh?: () => Promise<void> | void;
}

export function CalendarPage({
  meetings,
  briefs,
  token,
  organizationId,
  onWorkspaceRefresh,
}: CalendarPageProps) {
  const location = useLocation();
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id ?? "");
  const [showScheduler, setShowScheduler] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    attendeeEmails: "",
    durationMinutes: "50",
    windowStart: "",
    windowEnd: "",
    description: "",
    location: "Google Meet",
  });
  const [agendaDraft, setAgendaDraft] = useState("");
  const [rescheduleDraft, setRescheduleDraft] = useState({ start: "", end: "" });

  useEffect(() => {
    if (!meetings.length) {
      setSelectedMeetingId("");
      return;
    }
    if (!selectedMeetingId || !meetings.some((meeting) => meeting.id === selectedMeetingId)) {
      setSelectedMeetingId(meetings[0].id);
    }
  }, [meetings, selectedMeetingId]);

  const today = new Date();
  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedMeetingId) ?? null;
  const meetingBrief = briefs.find((brief) => brief.meeting_id === selectedMeeting?.id) ?? null;
  const todayMeetings = meetings.filter((meeting) => isSameDay(meeting.start_time, today));
  const upcomingMeetings = useMemo(
    () =>
      meetings
        .filter((meeting) => {
          if (!meeting.start_time) {
            return false;
          }
          const date = new Date(meeting.start_time);
          const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= -1 && diffDays <= 7;
        })
        .sort((left, right) => new Date(left.start_time || 0).getTime() - new Date(right.start_time || 0).getTime()),
    [meetings, today],
  );

  useEffect(() => {
    if (!selectedMeeting) {
      return;
    }
    setAgendaDraft(selectedMeeting.agenda || selectedMeeting.description || "");
    setRescheduleDraft({
      start: toLocalInputValue(selectedMeeting.start_time),
      end: toLocalInputValue(selectedMeeting.end_time),
    });
    setScheduleForm((current) => ({
      ...current,
      title: current.title || `Follow-up: ${selectedMeeting.title}`,
      attendeeEmails: current.attendeeEmails || selectedMeeting.attendee_emails.join(", "),
      description: current.description || selectedMeeting.description || selectedMeeting.agenda || "",
      windowStart: current.windowStart || toLocalInputValue(selectedMeeting.start_time),
      windowEnd: current.windowEnd || toLocalInputValue(selectedMeeting.end_time),
      location: current.location || selectedMeeting.location || "Google Meet",
    }));
  }, [selectedMeeting]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("compose") === "schedule") {
      setShowScheduler(true);
    }
  }, [location.search]);

  const executeTool = async (title: string, toolCalls: Array<{ name: string; args: Record<string, unknown> }>) => {
    setPendingAction(title);
    setStatusMessage(null);
    try {
      const response = await apiRequest<{ results: Array<Record<string, unknown>> }>(API_ROUTES.actions.execute, {
        method: "POST",
        token,
        body: {
          organization_id: organizationId,
          title,
          tool_calls: toolCalls,
        },
      });
      const firstResult = response.results[0] || {};
      const result = (firstResult.result as Record<string, unknown> | undefined) || {};
      const meetLink = typeof result.hangout_link === "string" ? result.hangout_link : null;
      setStatusMessage(meetLink ? `Done. Google Meet link created: ${meetLink}` : "Done.");
      await onWorkspaceRefresh?.();
      return response;
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Request failed.");
      return null;
    } finally {
      setPendingAction(null);
    }
  };

  const handleScheduleMeeting = async (event: FormEvent) => {
    event.preventDefault();
    if (!scheduleForm.title.trim() || !scheduleForm.windowStart || !scheduleForm.windowEnd) {
      setStatusMessage("Title, window start, and window end are required.");
      return;
    }
    await executeTool("Meeting scheduled", [
      {
        name: "schedule_meeting",
        args: {
          title: scheduleForm.title,
          attendee_emails: splitCsv(scheduleForm.attendeeEmails),
          duration_minutes: Number(scheduleForm.durationMinutes || 50),
          window_start: toIsoOrNull(scheduleForm.windowStart),
          window_end: toIsoOrNull(scheduleForm.windowEnd),
          description: scheduleForm.description,
          location: scheduleForm.location,
          create_meet_link: true,
        },
      },
    ]);
    setShowScheduler(false);
  };

  const handleSaveAgenda = async () => {
    if (!selectedMeeting) {
      return;
    }
    await executeTool("Meeting agenda updated", [
      {
        name: "add_agenda",
        args: {
          event_id: selectedMeeting.external_event_id,
          agenda: agendaDraft,
        },
      },
    ]);
  };

  const handleReschedule = async () => {
    if (!selectedMeeting) {
      return;
    }
    if (!rescheduleDraft.start || !rescheduleDraft.end) {
      setStatusMessage("Choose both a new start and end time.");
      return;
    }
    await executeTool("Meeting rescheduled", [
      {
        name: "reschedule_meeting",
        args: {
          event_id: selectedMeeting.external_event_id,
          start_time: toIsoOrNull(rescheduleDraft.start),
          end_time: toIsoOrNull(rescheduleDraft.end),
        },
      },
    ]);
  };

  const handleCancel = async () => {
    if (!selectedMeeting) {
      return;
    }
    await executeTool("Meeting cancelled", [
      {
        name: "cancel_meeting",
        args: {
          event_id: selectedMeeting.external_event_id,
        },
      },
    ]);
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div className="header-left">
          <h1>Calendar</h1>
          <p className="subtitle">{upcomingMeetings.length} meetings in the next 7 days</p>
        </div>
        <div className="header-actions">
          <div className="view-switcher">
            {(["day", "week", "month"] as const).map((item) => (
              <button
                key={item}
                className={`view-btn ${view === item ? "active" : ""}`}
                onClick={() => setView(item)}
                type="button"
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <button className="schedule-btn" onClick={() => setShowScheduler(true)} type="button">
            <span>+</span>
            Schedule Meeting
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="today-section">
          <div className="section-header">
            <h2>Upcoming</h2>
            <span className="count-badge">{upcomingMeetings.length}</span>
          </div>
          <div className="meeting-list">
            {upcomingMeetings.map((meeting) => (
              <button
                key={meeting.id}
                className={`meeting-card ${selectedMeeting?.id === meeting.id ? "selected" : ""} ${isSameDay(meeting.start_time, today) ? "today" : ""}`}
                onClick={() => {
                  setShowScheduler(false);
                  setSelectedMeetingId(meeting.id);
                }}
                type="button"
              >
                <div className="meeting-date-badge">{formatDate(meeting.start_time)}</div>
                <div className="meeting-time">{formatTime(meeting.start_time)}</div>
                <div className="meeting-content">
                  <h3 className="meeting-title">{meeting.title}</h3>
                  <div className="meeting-meta">
                    <span className="meta-item">{meeting.attendee_emails.length} attendees</span>
                    {meeting.location ? <span className="meta-item">{meeting.location}</span> : null}
                    <span className={`status-badge ${meeting.status}`}>{meeting.status}</span>
                  </div>
                </div>
              </button>
            ))}
            {!upcomingMeetings.length ? (
              <div className="empty-message">
                <span className="empty-icon">◐</span>
                <p>No meetings found for this workspace.</p>
              </div>
            ) : null}
          </div>

          <div className="summary-strip">
            <div className="summary-chip">
              <strong>{todayMeetings.length}</strong>
              <span>today</span>
            </div>
            <div className="summary-chip">
              <strong>{meetings.filter((meeting) => meeting.status === "cancelled").length}</strong>
              <span>cancelled</span>
            </div>
          </div>
        </div>

        <div className="detail-panel">
          {showScheduler ? (
            <form className="form-card" onSubmit={handleScheduleMeeting}>
              <div className="section-header">
                <div>
                  <h2>Schedule Meeting</h2>
                  <p>Create the event directly on Google Calendar and attach a Meet link.</p>
                </div>
              </div>
              <div className="composer-grid">
                <label className="field">
                  <span>Title</span>
                  <input
                    value={scheduleForm.title}
                    onChange={(event) => setScheduleForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Launch readiness review"
                  />
                </label>
                <label className="field">
                  <span>Attendees</span>
                  <input
                    value={scheduleForm.attendeeEmails}
                    onChange={(event) => setScheduleForm((current) => ({ ...current, attendeeEmails: event.target.value }))}
                    placeholder="name@company.com, another@company.com"
                  />
                </label>
              </div>
              <div className="composer-grid">
                <label className="field">
                  <span>Window start</span>
                  <input
                    type="datetime-local"
                    value={scheduleForm.windowStart}
                    onChange={(event) => setScheduleForm((current) => ({ ...current, windowStart: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Window end</span>
                  <input
                    type="datetime-local"
                    value={scheduleForm.windowEnd}
                    onChange={(event) => setScheduleForm((current) => ({ ...current, windowEnd: event.target.value }))}
                  />
                </label>
              </div>
              <div className="composer-grid">
                <label className="field">
                  <span>Duration (minutes)</span>
                  <input
                    value={scheduleForm.durationMinutes}
                    onChange={(event) => setScheduleForm((current) => ({ ...current, durationMinutes: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Location</span>
                  <input
                    value={scheduleForm.location}
                    onChange={(event) => setScheduleForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </label>
              </div>
              <label className="field">
                <span>Description</span>
                <textarea
                  rows={8}
                  value={scheduleForm.description}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              {statusMessage ? <p className="status-copy">{statusMessage}</p> : null}
              <div className="button-row">
                <button className="ghost-button" onClick={() => setShowScheduler(false)} type="button">
                  Close
                </button>
                <button className="primary-button" disabled={pendingAction === "Meeting scheduled"} type="submit">
                  {pendingAction === "Meeting scheduled" ? "Scheduling..." : "Book Meeting"}
                </button>
              </div>
            </form>
          ) : selectedMeeting ? (
            <>
              <div className="section-header">
                <div>
                  <h2>{selectedMeeting.title}</h2>
                  <p>{formatDateTimeRange(selectedMeeting.start_time, selectedMeeting.end_time)}</p>
                </div>
              </div>

              <div className="button-row">
                {selectedMeeting.meet_link ? (
                  <a className="primary-button link-button" href={selectedMeeting.meet_link} rel="noreferrer" target="_blank">
                    Join Meet
                  </a>
                ) : null}
                {selectedMeeting.html_link ? (
                  <a className="ghost-button link-button" href={selectedMeeting.html_link} rel="noreferrer" target="_blank">
                    Open Calendar
                  </a>
                ) : null}
                <button className="ghost-button" onClick={() => setShowScheduler(true)} type="button">
                  Follow-up
                </button>
              </div>

              <article className="form-card">
                <strong>Agenda</strong>
                <textarea value={agendaDraft} onChange={(event) => setAgendaDraft(event.target.value)} rows={6} />
                <div className="button-row">
                  <button className="secondary-button" disabled={pendingAction === "Meeting agenda updated"} onClick={handleSaveAgenda} type="button">
                    {pendingAction === "Meeting agenda updated" ? "Saving..." : "Save agenda"}
                  </button>
                </div>
              </article>

              <article className="form-card">
                <strong>Reschedule</strong>
                <div className="composer-grid">
                  <label className="field">
                    <span>Start</span>
                    <input
                      type="datetime-local"
                      value={rescheduleDraft.start}
                      onChange={(event) => setRescheduleDraft((current) => ({ ...current, start: event.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>End</span>
                    <input
                      type="datetime-local"
                      value={rescheduleDraft.end}
                      onChange={(event) => setRescheduleDraft((current) => ({ ...current, end: event.target.value }))}
                    />
                  </label>
                </div>
                <div className="button-row">
                  <button className="secondary-button" disabled={pendingAction === "Meeting rescheduled"} onClick={handleReschedule} type="button">
                    {pendingAction === "Meeting rescheduled" ? "Rescheduling..." : "Reschedule"}
                  </button>
                  <button className="ghost-button danger" disabled={pendingAction === "Meeting cancelled"} onClick={handleCancel} type="button">
                    {pendingAction === "Meeting cancelled" ? "Cancelling..." : "Cancel meeting"}
                  </button>
                </div>
              </article>

              {meetingBrief ? (
                <article className="form-card">
                  <div className="section-header brief-header">
                    <div>
                      <strong>{meetingBrief.title}</strong>
                      <p>{meetingBrief.summary || "Meeting brief generated from recent context."}</p>
                    </div>
                  </div>
                  <div className="brief-body">{meetingBrief.body}</div>
                </article>
              ) : null}

              {statusMessage ? <p className="status-copy">{statusMessage}</p> : null}
            </>
          ) : (
            <div className="empty-message">
              <span className="empty-icon">◐</span>
              <p>Select a meeting or use Schedule Meeting to book a new one.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .calendar-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .calendar-header,
        .header-actions,
        .section-header,
        .button-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .calendar-header {
          margin-bottom: 32px;
        }

        .calendar-header h1,
        .section-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .section-header h2 {
          font-size: 22px;
        }

        .subtitle,
        .section-header p,
        .brief-header p {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .view-switcher {
          display: flex;
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          overflow: hidden;
        }

        .view-btn,
        .schedule-btn,
        .primary-button,
        .secondary-button,
        .ghost-button {
          transition: all 0.2s;
          cursor: pointer;
          font-size: 14px;
          border-radius: 8px;
        }

        .view-btn {
          padding: 10px 20px;
          background: transparent;
          border: none;
          color: rgba(236, 228, 183, 0.6);
        }

        .view-btn.active {
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
        }

        .schedule-btn,
        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%);
          color: #020202;
          border: none;
          font-weight: 600;
        }

        .secondary-button {
          padding: 11px 18px;
          background: rgba(0, 167, 225, 0.18);
          border: 1px solid rgba(0, 167, 225, 0.34);
          color: #00A7E1;
        }

        .ghost-button {
          padding: 11px 18px;
          background: transparent;
          border: 1px solid #2a2a2a;
          color: rgba(236, 228, 183, 0.8);
        }

        .ghost-button.danger {
          border-color: rgba(204, 41, 54, 0.4);
          color: #CC2936;
        }

        .link-button {
          text-decoration: none;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: minmax(320px, 520px) minmax(0, 1fr);
          gap: 24px;
        }

        @media (max-width: 1080px) {
          .calendar-grid {
            grid-template-columns: 1fr;
          }
        }

        .today-section,
        .detail-panel {
          background: #0a0a0a;
          border-radius: 16px;
          border: 1px solid #1a1a1a;
          padding: 24px;
        }

        .meeting-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .meeting-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .meeting-card:hover,
        .meeting-card.selected {
          border-color: #00A7E1;
          background: #141414;
        }

        .meeting-card.today {
          background: rgba(0, 167, 225, 0.05);
        }

        .meeting-date-badge,
        .meeting-time,
        .count-badge,
        .status-badge,
        .summary-chip {
          border-radius: 8px;
        }

        .meeting-date-badge {
          padding: 6px 12px;
          background: #0a0a0a;
          color: rgba(236, 228, 183, 0.55);
          font-size: 12px;
          font-weight: 600;
        }

        .meeting-time {
          padding: 8px 12px;
          background: #0a0a0a;
          color: #00A7E1;
          font-size: 13px;
          font-weight: 600;
        }

        .meeting-content {
          flex: 1;
        }

        .meeting-title {
          color: #ECE4B7;
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 8px;
        }

        .meeting-meta,
        .composer-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .meta-item,
        .status-copy {
          color: rgba(236, 228, 183, 0.5);
          font-size: 13px;
        }

        .status-badge {
          padding: 6px 10px;
          background: rgba(236, 228, 183, 0.1);
          color: rgba(236, 228, 183, 0.7);
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.cancelled {
          background: rgba(204, 41, 54, 0.18);
          color: #CC2936;
        }

        .count-badge {
          padding: 6px 12px;
          background: rgba(236, 228, 183, 0.1);
          color: rgba(236, 228, 183, 0.6);
          font-size: 13px;
          font-weight: 600;
        }

        .summary-strip {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .summary-chip {
          padding: 10px 14px;
          background: #111111;
          border: 1px solid #1a1a1a;
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
          color: rgba(236, 228, 183, 0.6);
        }

        .summary-chip strong {
          font-size: 20px;
          color: #ECE4B7;
        }

        .detail-panel {
          display: grid;
          gap: 16px;
        }

        .form-card {
          background: #111111;
          border: 1px solid #1a1a1a;
          border-radius: 12px;
          padding: 18px;
          display: grid;
          gap: 14px;
        }

        .form-card strong {
          color: #ECE4B7;
        }

        .field {
          display: grid;
          gap: 8px;
          flex: 1;
          min-width: 220px;
        }

        .field span {
          color: rgba(236, 228, 183, 0.65);
          font-size: 13px;
        }

        .field input,
        .form-card textarea {
          width: 100%;
          border: 1px solid #1f1f1f;
          border-radius: 10px;
          padding: 12px 14px;
          background: #0b0b0b;
          color: #ECE4B7;
          font-size: 14px;
          outline: none;
        }

        .form-card textarea {
          resize: vertical;
          min-height: 120px;
        }

        .brief-body {
          white-space: pre-wrap;
          color: rgba(236, 228, 183, 0.72);
          line-height: 1.65;
        }

        .empty-message {
          padding: 60px 20px;
          text-align: center;
          color: rgba(236, 228, 183, 0.35);
        }

        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toIsoOrNull(value: string) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toLocalInputValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function isSameDay(value: string | null | undefined, target: Date) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "TBD";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "TBD";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatDateTimeRange(start: string | null | undefined, end: string | null | undefined) {
  const startLabel = formatDate(start);
  const timeLabel = formatTime(start);
  const endLabel = formatTime(end);
  return `${startLabel} · ${timeLabel}${end ? ` to ${endLabel}` : ""}`;
}
