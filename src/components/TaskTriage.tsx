/**
 * Eisenhower Matrix Task Triage Component
 *
 * Displays tasks in a 2x2 matrix based on urgency and importance.
 * Allows drag-and-drop for manual triage and re-categorization.
 */

import { useState } from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority_score?: number;
  urgency_score?: number;
  importance_score?: number;
  eisenhower_quadrant?: "Q1" | "Q2" | "Q3" | "Q4";
  effort_estimate?: "S" | "M" | "L" | "XL";
  impact_estimate?: "low" | "medium" | "high" | "critical";
  triage_status?: string;
  due_at?: string;
  status?: string;
}

interface TaskTriageProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newQuadrant: string) => void;
  onTaskClick?: (task: Task) => void;
}

export function TaskTriage({ tasks, onTaskMove, onTaskClick }: TaskTriageProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const normalizedTasks = tasks.map((task) => ({
    ...task,
    priority_score: task.priority_score ?? derivePriorityScore(task),
    eisenhower_quadrant: task.eisenhower_quadrant ?? deriveQuadrant(task),
  }));

  // Group tasks by Eisenhower quadrant
  const tasksByQuadrant = {
    Q1: normalizedTasks.filter((t) => t.eisenhower_quadrant === "Q1"),
    Q2: normalizedTasks.filter((t) => t.eisenhower_quadrant === "Q2"),
    Q3: normalizedTasks.filter((t) => t.eisenhower_quadrant === "Q3"),
    Q4: normalizedTasks.filter((t) => t.eisenhower_quadrant === "Q4"),
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, quadrant: string) => {
    e.preventDefault();
    if (draggedTask && onTaskMove) {
      onTaskMove(draggedTask.id, quadrant);
    }
    setDraggedTask(null);
  };

  const getQuadrantColors = (quadrant: string) => {
    switch (quadrant) {
      case "Q1":
        return {
          bg: "rgba(204, 41, 54, 0.05)",
          border: "rgba(204, 41, 54, 0.3)",
          accent: "#CC2936",
        };
      case "Q2":
        return {
          bg: "rgba(0, 167, 225, 0.05)",
          border: "rgba(0, 167, 225, 0.3)",
          accent: "#00A7E1",
        };
      case "Q3":
        return {
          bg: "rgba(222, 192, 241, 0.05)",
          border: "rgba(222, 192, 241, 0.3)",
          accent: "#DEC0F1",
        };
      case "Q4":
        return {
          bg: "rgba(236, 228, 183, 0.03)",
          border: "rgba(236, 228, 183, 0.15)",
          accent: "#ECE4B7",
        };
      default:
        return {
          bg: "#0a0a0a",
          border: "#1a1a1a",
          accent: "#ECE4B7",
        };
    }
  };

  const getQuadrantIcon = (quadrant: string) => {
    switch (quadrant) {
      case "Q1":
        return "Q1";
      case "Q2":
        return "Q2";
      case "Q3":
        return "Q3";
      case "Q4":
        return "Q4";
      default:
        return "—";
    }
  };

  const renderQuadrant = (
    quadrant: "Q1" | "Q2" | "Q3" | "Q4",
    title: string,
    subtitle: string
  ) => {
    const quadrantTasks = tasksByQuadrant[quadrant];
    const colors = getQuadrantColors(quadrant);

    return (
      <div
        className="quadrant-container"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, quadrant)}
      >
        <div className="quadrant-header">
          <div className="quadrant-title-row">
            <span className="quadrant-badge" style={{ background: colors.accent }}>
              {getQuadrantIcon(quadrant)}
            </span>
            <h3 className="quadrant-title">{title}</h3>
            <span className="quadrant-count">({quadrantTasks.length})</span>
          </div>
          <p className="quadrant-subtitle">{subtitle}</p>
        </div>

        <div className="tasks-list">
          {quadrantTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onClick={() => onTaskClick?.(task)}
              className="task-card"
            >
              <div className="task-title">{task.title}</div>

              {task.description && (
                <div className="task-description">{task.description}</div>
              )}

              <div className="task-meta">
                {task.priority_score !== undefined && (
                  <span
                    className="task-badge"
                    style={{
                      background: task.priority_score >= 80 ? "rgba(204, 41, 54, 0.2)" : task.priority_score >= 60 ? "rgba(0, 167, 225, 0.2)" : "rgba(236, 228, 183, 0.2)",
                      color: task.priority_score >= 80 ? "#CC2936" : task.priority_score >= 60 ? "#00A7E1" : "#ECE4B7",
                    }}
                  >
                    {task.priority_score}
                  </span>
                )}

                {task.effort_estimate && (
                  <span className="task-badge task-badge-effort">
                    {task.effort_estimate}
                  </span>
                )}

                {task.due_at && (
                  <span className="task-badge task-badge-due">
                    {new Date(task.due_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}

          {quadrantTasks.length === 0 && (
            <div className="empty-quadrant">
              No tasks in this quadrant
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="task-triage-container">
      <div className="triage-header">
        <h2 className="triage-title">Task Triage</h2>
        <p className="triage-subtitle">
          Drag and drop tasks to reorganize by urgency and importance
        </p>
      </div>

      {/* Eisenhower Matrix Grid */}
      <div className="matrix-grid">
        {renderQuadrant("Q1", "Do First", "Urgent & Important")}
        {renderQuadrant("Q2", "Schedule", "Important, Not Urgent")}
        {renderQuadrant("Q3", "Delegate", "Urgent, Not Important")}
        {renderQuadrant("Q4", "Eliminate", "Neither Urgent nor Important")}
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="stat-card" style={{ background: "rgba(204, 41, 54, 0.1)" }}>
          <div className="stat-value" style={{ color: "#CC2936" }}>
            {tasksByQuadrant.Q1.length}
          </div>
          <div className="stat-label">Do First</div>
        </div>
        <div className="stat-card" style={{ background: "rgba(0, 167, 225, 0.1)" }}>
          <div className="stat-value" style={{ color: "#00A7E1" }}>
            {tasksByQuadrant.Q2.length}
          </div>
          <div className="stat-label">Schedule</div>
        </div>
        <div className="stat-card" style={{ background: "rgba(222, 192, 241, 0.1)" }}>
          <div className="stat-value" style={{ color: "#DEC0F1" }}>
            {tasksByQuadrant.Q3.length}
          </div>
          <div className="stat-label">Delegate</div>
        </div>
        <div className="stat-card" style={{ background: "rgba(236, 228, 183, 0.1)" }}>
          <div className="stat-value" style={{ color: "#ECE4B7" }}>
            {tasksByQuadrant.Q4.length}
          </div>
          <div className="stat-label">Eliminate</div>
        </div>
      </div>

      <style>{`
        .task-triage-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .triage-header {
          margin-bottom: 32px;
        }

        .triage-title {
          font-size: 32px;
          font-weight: 800;
          color: #ECE4B7;
          margin: 0 0 8px;
          background: linear-gradient(135deg, #ECE4B7 0%, rgba(236, 228, 183, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .triage-subtitle {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .matrix-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .quadrant-container {
          border: 2px solid;
          border-radius: 12px;
          padding: 20px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
        }

        .quadrant-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 167, 225, 0.1);
        }

        .quadrant-header {
          margin-bottom: 16px;
        }

        .quadrant-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .quadrant-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          color: #020202;
          flex-shrink: 0;
        }

        .quadrant-title {
          font-size: 18px;
          font-weight: 700;
          color: #ECE4B7;
          margin: 0;
        }

        .quadrant-count {
          font-size: 14px;
          color: rgba(236, 228, 183, 0.4);
        }

        .quadrant-subtitle {
          font-size: 13px;
          color: rgba(236, 228, 183, 0.5);
          margin: 0;
        }

        .tasks-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .task-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 8px;
          padding: 14px;
          cursor: move;
          transition: all 0.2s;
        }

        .task-card:hover {
          background: #141414;
          border-color: #2a2a2a;
          transform: translateX(2px);
          box-shadow: 0 4px 12px rgba(0, 167, 225, 0.1);
        }

        .task-title {
          font-size: 14px;
          font-weight: 600;
          color: #ECE4B7;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .task-description {
          font-size: 12px;
          color: rgba(236, 228, 183, 0.5);
          margin-bottom: 10px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .task-badge {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .task-badge-effort {
          background: rgba(222, 192, 241, 0.2);
          color: #DEC0F1;
        }

        .task-badge-due {
          background: rgba(0, 167, 225, 0.2);
          color: #00A7E1;
        }

        .empty-quadrant {
          text-align: center;
          padding: 60px 20px;
          color: rgba(236, 228, 183, 0.3);
          font-size: 13px;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card {
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(236, 228, 183, 0.5);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 1024px) {
          .matrix-grid {
            grid-template-columns: 1fr;
          }

          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

function derivePriorityScore(task: Task): number {
  if (typeof task.priority_score === "number") {
    return task.priority_score;
  }
  const status = String(task.status || "").toLowerCase();
  const dueAt = task.due_at ? new Date(task.due_at) : null;
  const now = new Date();

  if (dueAt && !Number.isNaN(dueAt.getTime())) {
    const diffHours = (dueAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 0) {
      return 92;
    }
    if (diffHours <= 24) {
      return 84;
    }
    if (diffHours <= 72) {
      return 72;
    }
  }

  if (status === "overdue") {
    return 90;
  }
  if (status === "in_progress") {
    return 68;
  }
  return 52;
}

function deriveQuadrant(task: Task): "Q1" | "Q2" | "Q3" | "Q4" {
  if (task.eisenhower_quadrant) {
    return task.eisenhower_quadrant;
  }

  const dueAt = task.due_at ? new Date(task.due_at) : null;
  const now = new Date();
  const priorityScore = derivePriorityScore(task);
  const urgencyScore =
    typeof task.urgency_score === "number"
      ? task.urgency_score
      : dueAt && !Number.isNaN(dueAt.getTime())
        ? dueAt.getTime() <= now.getTime()
          ? 95
          : dueAt.getTime() - now.getTime() <= 1000 * 60 * 60 * 24
            ? 82
            : dueAt.getTime() - now.getTime() <= 1000 * 60 * 60 * 24 * 3
              ? 65
              : 35
        : priorityScore >= 80
          ? 72
          : 38;

  const importanceScore =
    typeof task.importance_score === "number"
      ? task.importance_score
      : priorityScore >= 80
        ? 88
        : priorityScore >= 65
          ? 72
          : 36;

  const urgent = urgencyScore >= 65;
  const important = importanceScore >= 65;

  if (urgent && important) return "Q1";
  if (!urgent && important) return "Q2";
  if (urgent && !important) return "Q3";
  return "Q4";
}
