export type JsonMap = Record<string, unknown>;

export interface HealthResponse {
  status: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface OAuthStartResponse {
  authorization_url: string;
  provider: string;
}

export interface IntegrationResponse {
  id: string;
  provider: string;
  provider_account_id: string | null;
  expiry: string | null;
  scopes: string[];
  webhook_id: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
}

export interface EventResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  source: string;
  type: string;
  title: string;
  content: string | null;
  external_id: string | null;
  workflow_key?: string | null;
  decision_summary?: string | null;
  provider_cursor?: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  related_entities?: Array<Record<string, unknown>>;
  tool_outcome?: JsonMap;
  raw_payload: JsonMap;
  processing_status: string;
  created_at: string;
  processed_at: string | null;
}

export interface TaskResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  source_event_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  // Phase 5: Eisenhower matrix and prioritization fields
  priority_score?: number;
  urgency_score?: number;
  importance_score?: number;
  eisenhower_quadrant?: "Q1" | "Q2" | "Q3" | "Q4";
  effort_estimate?: "S" | "M" | "L" | "XL";
  impact_estimate?: "low" | "medium" | "high" | "critical";
  triage_status?: string;
  due_at: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
}

export interface TimelineResponse {
  events: EventResponse[];
  tasks: TaskResponse[];
  email_threads: EmailThreadResponse[];
  meetings: MeetingResponse[];
  documents: DocumentResponse[];
  approvals: ApprovalResponse[];
  briefs: BriefResponse[];
}

export interface AgentArtifact {
  workflow: string;
  summary: string;
  decision?: string | null;
  confidence?: number;
  tool_calls?: Array<Record<string, unknown>>;
  next_jobs?: Array<Record<string, unknown>>;
  entity_links?: Array<Record<string, unknown>>;
  payload: JsonMap;
}

export interface AgentResponse {
  results: AgentArtifact[];
}

export interface ActionExecutionResponse {
  event_id: string | null;
  results: Array<Record<string, unknown>>;
}

export interface DocumentContentSheet {
  title: string | null;
  sheet_id: number | null;
  range_a1: string;
  row_count: number | null;
  column_count: number | null;
  values: unknown[][];
}

export interface DocumentContentResponse {
  document_id: string;
  name: string;
  mime_type: string | null;
  kind: string;
  text: string | null;
  html: string | null;
  sheets: DocumentContentSheet[];
  web_view_link: string | null;
  metadata: JsonMap;
}

export interface EmailThreadResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  external_thread_id: string;
  subject: string;
  participants: string[];
  summary: string | null;
  classification: string;
  priority: string;
  status: string;
  sentiment: string;
  followup_date: string | null;
  last_message_at: string | null;
  needs_reply: boolean;
  project_id: string | null;
  deal_id: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
  updated_at: string;
}

export interface EmailMessageResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  thread_id: string;
  external_message_id: string;
  subject: string;
  sender: string | null;
  recipients: string[];
  cc: string[];
  bcc: string[];
  labels: string[];
  body: string | null;
  snippet: string | null;
  summary: string | null;
  classification: string;
  priority: string;
  sentiment: string;
  direction: string;
  status: string;
  received_at: string | null;
  deadline_at: string | null;
  meeting_detected: boolean;
  tasks_extracted: Array<Record<string, unknown>>;
  approvals_extracted: Array<Record<string, unknown>>;
  attachments: Array<Record<string, unknown>>;
  project_id: string | null;
  deal_id: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
  updated_at: string;
}

export interface MeetingResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  external_event_id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  organizer: JsonMap;
  attendees: Array<Record<string, unknown>>;
  attendee_emails: string[];
  location: string | null;
  meet_link: string | null;
  html_link: string | null;
  recurrence_rule: string | null;
  agenda: string | null;
  reminders: Array<Record<string, unknown>>;
  document_links: Array<Record<string, unknown>>;
  project_id: string | null;
  deal_id: string | null;
  followup_meeting_id: string | null;
  status: string;
  transcript: string | null;
  meeting_notes: string | null;
  action_items: Array<Record<string, unknown>>;
  conflicts: Array<Record<string, unknown>>;
  optimization_suggestions: Array<Record<string, unknown>>;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
  updated_at: string;
}

export interface DocumentResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  external_file_id: string;
  name: string;
  type: string;
  mime_type: string | null;
  owner: string | null;
  organization_name: string | null;
  project_id: string | null;
  deal_id: string | null;
  related_meeting_id: string | null;
  current_version: number;
  status: string;
  summary: string | null;
  extracted_text: string | null;
  extracted_data: JsonMap;
  permissions: Array<Record<string, unknown>>;
  folder_path: string | null;
  web_view_link: string | null;
  approval_status: string;
  last_modified_at: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
  updated_at: string;
}

export interface ProjectResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  name: string;
  slug: string;
  summary: string | null;
  status: string;
  priority: string;
  health: string;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
  updated_at: string;
}

export interface DealResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  name: string;
  slug: string;
  organization_name: string | null;
  stage: string;
  value_text: string | null;
  summary: string | null;
  status: string;
  next_step: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
  updated_at: string;
}

export interface ApprovalResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  title: string;
  status: string;
  requested_from: string[];
  requested_at: string | null;
  due_at: string | null;
  responded_at: string | null;
  notes: string | null;
  document_id: string | null;
  project_id: string | null;
  deal_id: string | null;
  meeting_id: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
  updated_at: string;
}

export interface BriefResponse {
  id: string;
  organization_id: string;
  user_id: string | null;
  kind: string;
  title: string;
  summary: string | null;
  body: string;
  generated_for: string | null;
  meeting_id: string | null;
  thread_id: string | null;
  project_id: string | null;
  deal_id: string | null;
  details?: JsonMap;
  metadata?: JsonMap;
  created_at: string;
  updated_at: string;
}

// Operational intelligence types

export interface CommitmentResponse {
  id: string;
  title: string;
  description: string | null;
  commitment_type: string;
  status: string;
  owner_email: string | null;
  counterparty_email: string | null;
  due_at: string | null;
  completed_at: string | null;
  confidence: number;
  source_type: string | null;
  nudge_policy: string;
  remind_count: number;
  evidence_text: string | null;
  created_at: string;
}

export interface GoalResponse {
  id: string;
  title: string;
  description: string | null;
  goal_type: string;
  status: string;
  progress: number;
  target_value: string | null;
  current_value: string | null;
  unit: string | null;
  due_at: string | null;
  parent_goal_id: string | null;
  calendar_hours_allocated: number;
  calendar_hours_needed: number;
  created_at: string;
}

export interface DecisionResponse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  execution_status: string;
  rationale: string | null;
  impact: string | null;
  decided_at: string | null;
  review_date: string | null;
  confidence: number;
  source_type: string | null;
  created_at: string;
}

export interface RiskResponse {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  likelihood: string;
  status: string;
  risk_type: string;
  mitigation_plan: string | null;
  detected_at: string;
  source_type: string | null;
  created_at: string;
}

export interface PersonResponse {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  company: string | null;
  relationship_type: string;
  importance: string;
  interaction_count: number;
  last_interaction_at: string | null;
}

export interface FollowUpResponse {
  id: string;
  title: string;
  status: string;
  follow_up_type: string;
  priority: string;
  target_email: string | null;
  due_at: string | null;
  attempt_count: number;
  draft_message: string | null;
  created_at: string;
}

export interface AgentActionResponse {
  id: string;
  action_type: string;
  status: string;
  title: string;
  description: string | null;
  confidence: number;
  autonomy_mode: string;
  requires_approval: boolean;
  source_evidence: Array<Record<string, unknown>>;
  action_params: JsonMap;
  result: JsonMap;
  created_at: string;
  approved_at: string | null;
  executed_at: string | null;
}

export interface KPIMetric {
  id: string;
  name: string;
  value: number | null;
  target: number | null;
  previous: number | null;
  unit: string | null;
  status: string;
  trend: string | null;
  anomaly_score: number;
  snapshot_at: string;
}

export interface KPIDashboard {
  metrics: KPIMetric[];
  anomalies: Array<{
    metric_name: string;
    value: number | null;
    target: number | null;
    anomaly_score: number;
    description: string | null;
    status: string;
  }>;
  total_metrics: number;
  metrics_on_track: number;
  metrics_warning: number;
  metrics_critical: number;
}

export interface CalendarAnalysis {
  period: { start: string; end: string; days: number };
  total_meeting_minutes: number;
  total_available_minutes: number;
  meeting_load_pct: number;
  focus_time_available_minutes: number;
  by_type: Record<string, number>;
  by_day: Record<string, number>;
  avg_meeting_minutes_per_day?: number;
  fragmented_days: Array<{ date: string; meeting_count: number; meeting_minutes: number; severity: string }>;
  avg_meetings_per_day: number;
}

export interface WeeklyPlanResponse {
  id: string;
  week_start: string;
  time_analysis: CalendarAnalysis;
  recommendations: Array<{
    type: string;
    description: string;
    confidence: number;
    priority: string;
  }>;
  summary: string | null;
}

export interface CrisisAssessment {
  level: string;
  score: number;
  signals: Array<{
    type: string;
    title: string;
    severity: number;
    entity_id?: string;
  }>;
  summary: string;
  recommended_actions: Array<{
    action: string;
    description: string;
    priority: string;
  }>;
  assessed_at: string;
}

export interface MeetingPrepResponse {
  id: string;
  meeting_id: string;
  meeting_title: string;
  start_time: string | null;
  purpose: string;
  suggested_agenda: string;
  context_summary: string;
  prior_decisions: Array<{ title: string; status: string }>;
  unresolved_items: Array<{ title: string; owner: string | null; due_at: string | null }>;
  attendee_context: Array<{ email: string; name: string | null; open_items?: number }>;
  open_risks: Array<{ title: string; severity: string }>;
  recommended_outcomes: Array<{ outcome: string }>;
  talking_points: Array<{ topic: string; context: string }>;
}

export interface UserPreferences {
  autonomy_mode: string;
  briefing_time: string;
  briefing_timezone: string;
  focus_hours_per_day: number;
  prep_minutes_before_meeting: number;
  vip_senders: string[];
  auto_draft_replies: boolean;
  auto_create_prep_docs: boolean;
  auto_block_focus_time: boolean;
  auto_nudge_overdue: boolean;
  auto_update_trackers: boolean;
  escalation_threshold_hours: number;
  onboarding_completed: boolean;
}

export interface WorkspaceResponse {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  context_rules: JsonMap;
  linked_project_ids: string[];
  linked_document_ids: string[];
  linked_folder_paths: string[];
  is_default: boolean;
  created_at: string;
}

export interface ContextQuestionResponse {
  id: string;
  question: string;
  answer: string | null;
  category: string;
  status: string;
  workspace_id: string | null;
  source: string | null;
  created_at: string;
  answered_at: string | null;
}
