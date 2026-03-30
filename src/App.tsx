/**
 * Modern Chief of Staff App with React Router
 */

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { apiRequest } from "./lib/api";
import { API_ROUTES } from "./lib/contract";
import { getStoredValue, removeStoredValue, setStoredValue } from "./lib/storage";
import type {
  UserResponse,
  OrganizationResponse,
  IntegrationResponse,
  TimelineResponse,
  EmailThreadResponse,
  EmailMessageResponse,
  MeetingResponse,
  DocumentResponse,
  BriefResponse,
} from "./lib/types";

// Layouts
import { DashboardLayout } from "./layouts/DashboardLayout";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InboxPage } from "./pages/InboxPage";
import { CalendarPage } from "./pages/CalendarPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { TimelinePage } from "./pages/TimelinePage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { TaskTriage } from "./components/TaskTriage";
import { ChatAssistant } from "./components/ChatAssistant";
import { ApprovalNotifications } from "./components/ApprovalNotifications";

// Operational intelligence pages
import CommandCenterPage from "./pages/CommandCenterPage";
import CommitmentsPage from "./pages/CommitmentsPage";
import GoalsPage from "./pages/GoalsPage";
import DecisionsPage from "./pages/DecisionsPage";
import WeeklyPlanPage from "./pages/WeeklyPlanPage";
import AgentActionsPage from "./pages/AgentActionsPage";
import WorkspacesPage from "./pages/WorkspacesPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import AgentCustomizePage from "./pages/AgentCustomizePage";
import DraftsPage from "./pages/DraftsPage";

const TOKEN_STORAGE_KEY = "chief_of_staff_access_token";
const ORG_STORAGE_KEY = "chief_of_staff_organization_id";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;

function App() {
  const [token, setToken] = useState<string | null>(() => getStoredValue(TOKEN_STORAGE_KEY));
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    () => getStoredValue("chief_of_staff_workspace_id"),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const handleWorkspaceSelect = (id: string | null) => {
    setActiveWorkspaceId(id);
    if (id) setStoredValue("chief_of_staff_workspace_id", id);
    else removeStoredValue("chief_of_staff_workspace_id");
  };

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const [user, setUser] = useState<UserResponse | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>(
    () => getStoredValue(ORG_STORAGE_KEY) ?? "",
  );
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [syntheticTasks, setSyntheticTasks] = useState<any[]>([]);
  const [threads, setThreads] = useState<EmailThreadResponse[]>([]);
  const [messages, setMessages] = useState<EmailMessageResponse[]>([]);
  const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [briefs, setBriefs] = useState<BriefResponse[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationResponse[]>([]);
  const [agentRunning, setAgentRunning] = useState(false);
  const [briefGenerating, setBriefGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      void loadUserAndOrganizations();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedOrganizationId && user) {
      void loadWorkspace(selectedOrganizationId);
      void checkAgentStatus();
    }
  }, [token, selectedOrganizationId, user]);

  useEffect(() => {
    if (allTasks.length) {
      setSyntheticTasks([]);
      return;
    }
    setSyntheticTasks(buildFallbackTasks(threads, meetings, documents));
  }, [allTasks, threads, meetings, documents]);

  useEffect(() => {
    if (selectedOrganizationId) {
      setStoredValue(ORG_STORAGE_KEY, selectedOrganizationId);
    } else {
      removeStoredValue(ORG_STORAGE_KEY);
    }
  }, [selectedOrganizationId]);

  const checkAgentStatus = async () => {
    try {
      const response = await apiRequest<{ is_running: boolean }>(
        "/api/v1/agent/status",
        { token, query: { organization_id: selectedOrganizationId } }
      );
      setAgentRunning(response.is_running);
    } catch (error) {
      console.error("Failed to check agent status:", error);
    }
  };

  const handleStartAgent = async () => {
    try {
      await apiRequest("/api/v1/agent/start", {
        method: "POST",
        token,
        query: { organization_id: selectedOrganizationId },
      });
      setAgentRunning(true);
      addToast("Autonomous AI agent started. It will monitor your workspace and generate suggestions.", "success");
    } catch (error) {
      console.error("Failed to start agent:", error);
      addToast("Failed to start agent. Please try again.", "error");
    }
  };

  const handleStopAgent = async () => {
    try {
      await apiRequest("/api/v1/agent/stop", {
        method: "POST",
        token,
        query: { organization_id: selectedOrganizationId },
      });
      setAgentRunning(false);
      addToast("Autonomous AI agent stopped.", "info");
    } catch (error) {
      console.error("Failed to stop agent:", error);
      addToast("Failed to stop agent.", "error");
    }
  };

  const loadUserAndOrganizations = async () => {
    try {
      const [userData, orgsData] = await Promise.all([
        apiRequest<UserResponse>(API_ROUTES.auth.me, { method: "GET", token }),
        apiRequest<OrganizationResponse[]>(API_ROUTES.organizations, { method: "GET", token }),
      ]);

      setUser(userData);
      setOrganizations(orgsData);

      if (orgsData.length > 0 && !selectedOrganizationId) {
        const firstOrgId = orgsData[0].id;
        setSelectedOrganizationId(firstOrgId);
        setStoredValue(ORG_STORAGE_KEY, firstOrgId);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspace = async (orgId: string) => {
    try {
      const [timelineData, tasksData, threadData, messageData, meetingData, documentData, briefData, integrationsData] = await Promise.all([
        apiRequest<TimelineResponse>(
          API_ROUTES.events.timeline,
          { token, query: { organization_id: orgId } }
        ),
        apiRequest<any[]>(
          API_ROUTES.tasks.list,
          { token, query: { organization_id: orgId, limit: 500 } }
        ),
        apiRequest<EmailThreadResponse[]>(
          API_ROUTES.threads,
          { token, query: { organization_id: orgId, limit: 200 } }
        ),
        apiRequest<EmailMessageResponse[]>(
          API_ROUTES.emails,
          { token, query: { organization_id: orgId, limit: 200 } }
        ),
        apiRequest<MeetingResponse[]>(
          API_ROUTES.meetings,
          { token, query: { organization_id: orgId, limit: 200 } }
        ),
        apiRequest<DocumentResponse[]>(
          API_ROUTES.documents,
          { token, query: { organization_id: orgId, limit: 200 } }
        ),
        apiRequest<BriefResponse[]>(
          API_ROUTES.briefs,
          { token, query: { organization_id: orgId, limit: 100 } }
        ),
        apiRequest<IntegrationResponse[]>(
          API_ROUTES.integrations.list,
          { token, query: { organization_id: orgId } }
        ),
      ]);
      setTimeline(timelineData);
      setAllTasks(tasksData);
      setThreads(threadData);
      setMessages(messageData);
      setMeetings(meetingData);
      setDocuments(documentData);
      setBriefs(briefData);
      setIntegrations(integrationsData);
    } catch (error) {
      console.error("Failed to load workspace:", error);
    }
  };

  const handleGenerateBrief = async () => {
    if (!token || !selectedOrganizationId) {
      return;
    }
    setBriefGenerating(true);
    try {
      await apiRequest(API_ROUTES.agents.dailyBrief, {
        method: "POST",
        token,
        body: {
          organization_id: selectedOrganizationId,
          limit: 25,
        },
      });
      await loadWorkspace(selectedOrganizationId);
    } catch (error) {
      console.error("Failed to generate brief:", error);
      addToast("Failed to generate brief.", "error");
    } finally {
      setBriefGenerating(false);
    }
  };

  const handleConnectIntegration = async (provider: string) => {
    if (provider !== "google") {
      addToast("Use the Composio section below to connect " + provider + ".", "info");
      return;
    }
    try {
      const response = await apiRequest<{ authorization_url: string }>(
        API_ROUTES.oauth.googleStart,
        { token, query: { organization_id: selectedOrganizationId } }
      );
      window.location.href = response.authorization_url;
    } catch (error) {
      console.error("Failed to start OAuth:", error);
      addToast("Failed to start Google integration.", "error");
    }
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    if (!confirm("Are you sure you want to disconnect this integration?")) return;

    try {
      await apiRequest(`/api/v1/integrations/${integrationId}`, {
        method: "DELETE",
        token
      });
      await loadWorkspace(selectedOrganizationId);
      addToast("Integration disconnected.", "success");
    } catch (error) {
      console.error("Failed to disconnect integration:", error);
      addToast("Failed to disconnect integration.", "error");
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    try {
      await apiRequest(API_ROUTES.integrations.syncNow(integrationId), {
        method: "POST",
        token
      });
      addToast("Sync started. This may take a few moments.", "info");
      // Refresh after a delay to show updated sync time
      setTimeout(() => loadWorkspace(selectedOrganizationId), 3000);
    } catch (error) {
      console.error("Failed to sync integration:", error);
      addToast("Failed to start sync.", "error");
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await apiRequest<{ access_token: string }>(API_ROUTES.auth.login, {
      method: "POST",
      body: { email, password },
    });

    const newToken = response.access_token;
    setToken(newToken);
    setStoredValue(TOKEN_STORAGE_KEY, newToken);
  };

  const handleRegister = async (fullName: string, email: string, password: string) => {
    const response = await apiRequest<{ access_token: string }>(API_ROUTES.auth.register, {
      method: "POST",
      body: { full_name: fullName, email, password },
    });

    const newToken = response.access_token;
    setToken(newToken);
    setStoredValue(TOKEN_STORAGE_KEY, newToken);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setOrganizations([]);
    setSelectedOrganizationId("");
    removeStoredValue(TOKEN_STORAGE_KEY);
    removeStoredValue(ORG_STORAGE_KEY);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div className="spinner" />
      </div>
    );
  }

  const isAuthenticated = Boolean(token && user);
  const approvals = timeline?.approvals || [];
  const actionableTasks = allTasks.length ? allTasks : syntheticTasks;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/command" /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/command" /> : <AuthPage mode="login" onLogin={handleLogin} onRegister={handleRegister} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/command" /> : <AuthPage mode="register" onLogin={handleLogin} onRegister={handleRegister} />} />

        {isAuthenticated ? (
          <Route path="/*" element={<DashboardLayout user={user} onLogout={handleLogout} organizationId={selectedOrganizationId} token={token || ""} activeWorkspaceId={activeWorkspaceId} onWorkspaceSelect={handleWorkspaceSelect}><Routes>
            <Route path="/command" element={<CommandCenterPage organizationId={selectedOrganizationId} token={token || ""} workspaceId={activeWorkspaceId} />} />
            <Route path="/dashboard" element={<DashboardPage tasks={actionableTasks as any} meetings={meetings as any} emails={threads as any} briefs={briefs as any} approvals={approvals} onGenerateBrief={handleGenerateBrief} generatingBrief={briefGenerating} />} />
            <Route path="/tasks" element={<TaskTriage tasks={actionableTasks as any} onTaskMove={async (taskId, newQuadrant) => {
              if (!allTasks.length) {
                setSyntheticTasks((current) => current.map((task) => task.id === taskId ? { ...task, eisenhower_quadrant: newQuadrant } : task));
                return;
              }
              await apiRequest(API_ROUTES.tasks.update(taskId), { method: "PATCH", token, body: { eisenhower_quadrant: newQuadrant, triage_status: "triaged" } });
              await loadWorkspace(selectedOrganizationId);
            }} onTaskClick={(task) => console.log("Task clicked:", task)} />} />
            <Route path="/chat" element={<ChatAssistant organizationId={selectedOrganizationId} token={token || ""} />} />
            <Route path="/inbox" element={<InboxPage threads={threads as any} messages={messages as any} token={token || ""} organizationId={selectedOrganizationId} userEmail={user?.email} onWorkspaceRefresh={() => loadWorkspace(selectedOrganizationId)} />} />
            <Route path="/calendar" element={<CalendarPage meetings={meetings as any} briefs={briefs as any} token={token || ""} organizationId={selectedOrganizationId} onWorkspaceRefresh={() => loadWorkspace(selectedOrganizationId)} />} />
            <Route path="/documents" element={<DocumentsPage documents={documents as any} token={token || ""} organizationId={selectedOrganizationId} onWorkspaceRefresh={() => loadWorkspace(selectedOrganizationId)} />} />
            <Route path="/commitments" element={<CommitmentsPage organizationId={selectedOrganizationId} token={token || ""} workspaceId={activeWorkspaceId} />} />
            <Route path="/goals" element={<GoalsPage organizationId={selectedOrganizationId} token={token || ""} workspaceId={activeWorkspaceId} />} />
            <Route path="/decisions" element={<DecisionsPage organizationId={selectedOrganizationId} token={token || ""} workspaceId={activeWorkspaceId} />} />
            <Route path="/weekly" element={<WeeklyPlanPage organizationId={selectedOrganizationId} token={token || ""} workspaceId={activeWorkspaceId} />} />
            <Route path="/agent-actions" element={<AgentActionsPage organizationId={selectedOrganizationId} token={token || ""} workspaceId={activeWorkspaceId} />} />
            <Route path="/workspaces" element={<WorkspacesPage organizationId={selectedOrganizationId} token={token || ""} onWorkspaceSelect={handleWorkspaceSelect} />} />
            <Route path="/whatsapp" element={<WhatsAppPage organizationId={selectedOrganizationId} token={token || ""} />} />
            <Route path="/agent-studio" element={<AgentCustomizePage organizationId={selectedOrganizationId} token={token || ""} />} />
            <Route path="/drafts" element={<DraftsPage organizationId={selectedOrganizationId} token={token || ""} />} />
            <Route path="/timeline" element={<TimelinePage events={timeline?.events || []} />} />
            <Route path="/settings" element={<SettingsPage
              agentRunning={agentRunning}
              onStartAgent={handleStartAgent}
              onStopAgent={handleStopAgent}
            />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/integrations" element={<IntegrationsPage
              integrations={integrations as any}
              onConnect={handleConnectIntegration}
              onDisconnect={handleDisconnectIntegration}
              onSync={handleSyncIntegration}
            />} />
            <Route path="*" element={<Navigate to="/command" />} />
          </Routes></DashboardLayout>} />
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>

      {/* Approval Notifications - Shows when autonomous agent generates suggestions */}
      {isAuthenticated && token && selectedOrganizationId && (
        <ApprovalNotifications
          organizationId={selectedOrganizationId}
          token={token}
          onApprovalDecided={() => loadWorkspace(selectedOrganizationId)}
        />
      )}
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </BrowserRouter>
  );
}

export default App;

function buildFallbackTasks(threads: EmailThreadResponse[], meetings: MeetingResponse[], documents: DocumentResponse[]) {
  const threadTasks = threads
    .filter((thread) => thread.needs_reply)
    .slice(0, 6)
    .map((thread, index) => ({
      id: `thread-${thread.id}`,
      title: `Reply: ${thread.subject}`,
      description: thread.summary || "Thread needs a response.",
      status: "pending",
      priority: thread.priority,
      priority_score: thread.priority === "high" ? 82 : 68,
      due_at: thread.followup_date || thread.last_message_at,
      triage_status: "suggested",
      eisenhower_quadrant: index < 3 ? "Q1" : "Q2",
    }));

  const meetingTasks = meetings
    .filter((meeting) => meeting.status !== "cancelled")
    .slice(0, 4)
    .map((meeting, index) => ({
      id: `meeting-${meeting.id}`,
      title: `Prep: ${meeting.title}`,
      description: meeting.agenda || meeting.description || "Meeting needs prep or follow-up.",
      status: "pending",
      priority: "medium",
      priority_score: 66,
      due_at: meeting.start_time,
      triage_status: "suggested",
      eisenhower_quadrant: index < 2 ? "Q1" : "Q2",
    }));

  const documentTasks = documents
    .slice(0, 4)
    .map((document, index) => ({
      id: `document-${document.id}`,
      title: `Review: ${document.name}`,
      description: document.summary || "Document needs classification, review, or follow-up.",
      status: "pending",
      priority: "medium",
      priority_score: 58,
      due_at: document.last_modified_at,
      triage_status: "suggested",
      eisenhower_quadrant: index % 2 === 0 ? "Q2" : "Q3",
    }));

  return [...threadTasks, ...meetingTasks, ...documentTasks];
}
