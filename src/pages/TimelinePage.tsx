/**
 * Dark Theme Timeline Page - Activity Audit Trail
 */

interface Event {
  id: string;
  source: string;
  type: string;
  title: string;
  content: string | null;
  created_at: string;
  processing_status: string;
}

interface TimelinePageProps {
  events: Event[];
}

export function TimelinePage({ events }: TimelinePageProps) {
  const getEventIconLabel = (source: string) => {
    if (source === "gmail") return "GM";
    if (source === "calendar") return "CAL";
    if (source === "drive") return "DR";
    if (source === "agent") return "AI";
    return "EV";
  };

  const getEventColor = (source: string) => {
    if (source === "gmail") return "linear-gradient(135deg, #DEC0F1 0%, #CC2936 100%)";
    if (source === "calendar") return "linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%)";
    if (source === "drive") return "linear-gradient(135deg, #00A7E1 0%, #CC2936 100%)";
    if (source === "agent") return "linear-gradient(135deg, #CC2936 0%, #DEC0F1 100%)";
    return "linear-gradient(135deg, #00A7E1 0%, #DEC0F1 100%)";
  };

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1>Activity Timeline</h1>
        <p className="subtitle">{events.length} events logged</p>
      </div>

      <div className="timeline-container">
        {events.map((event, index) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <div
                className="event-icon"
                style={{ background: getEventColor(event.source) }}
              >
                {getEventIconLabel(event.source)}
              </div>
              {index < events.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <div className="event-header">
                <h3 className="event-title">{event.title}</h3>
                <span className="event-time">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
              <div className="event-meta">
                <span className="event-source">{event.source}</span>
                <span className="event-type">{event.type}</span>
                <span className={`event-status ${event.processing_status}`}>
                  {event.processing_status}
                </span>
              </div>
              {event.content && (
                <p className="event-content">{event.content.slice(0, 200)}...</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .timeline-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .timeline-header {
          margin-bottom: 32px;
        }

        .timeline-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0 0 4px;
        }

        .subtitle {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .timeline-container {
          background: #0a0a0a;
          border-radius: 12px;
          border: 1px solid #1a1a1a;
          padding: 32px;
        }

        .timeline-item {
          display: flex;
          gap: 20px;
          position: relative;
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .event-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #020202;
          flex-shrink: 0;
          z-index: 1;
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          background: linear-gradient(180deg, rgba(0, 167, 225, 0.3) 0%, rgba(222, 192, 241, 0.3) 100%);
          margin: 8px 0;
        }

        .timeline-content {
          flex: 1;
          padding-bottom: 32px;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 16px;
        }

        .event-title {
          font-size: 16px;
          font-weight: 600;
          color: #ECE4B7;
          margin: 0;
        }

        .event-time {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.4);
          white-space: nowrap;
        }

        .event-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .event-source,
        .event-type,
        .event-status {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(236, 228, 183, 0.1);
          color: rgba(236, 228, 183, 0.6);
        }

        .event-status.processed {
          background: rgba(0, 167, 225, 0.2);
          color: #00A7E1;
        }

        .event-status.pending {
          background: rgba(222, 192, 241, 0.2);
          color: #DEC0F1;
        }

        .event-content {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
