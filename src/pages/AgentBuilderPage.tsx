import React, { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { API_ROUTES } from '../lib/contract';

interface Props {
  organizationId: string;
  token: string;
}

interface CustomAgent {
  id: string;
  organization_id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  system_prompt: string;
  tools: string[];
  triggers: Record<string, unknown>[];
  is_active: boolean;
  schedule_cron: string | null;
  last_run_at: string | null;
  run_count: number;
  created_at: string;
  updated_at: string;
}

interface AvailableTool {
  name: string;
  description: string;
  category: string;
}

interface RunResult {
  agent_id: string;
  status: string;
  result: string | null;
  error: string | null;
}

const TRIGGER_TYPES = [
  { value: 'email_received', label: 'Email received' },
  { value: 'meeting_ended', label: 'Meeting ended' },
  { value: 'document_updated', label: 'Document updated' },
  { value: 'task_created', label: 'Task created' },
  { value: 'calendar_event', label: 'Calendar event' },
  { value: 'schedule', label: 'On schedule (cron)' },
];

const SCHEDULE_PRESETS = [
  { label: 'Every weekday at 9 AM', cron: '0 9 * * 1-5' },
  { label: 'Every Monday at 8 AM', cron: '0 8 * * 1' },
  { label: 'Every hour', cron: '0 * * * *' },
  { label: 'Every day at 6 PM', cron: '0 18 * * *' },
  { label: 'Custom', cron: '' },
];

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AgentBuilderPage({ organizationId, token }: Props) {
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [availableTools, setAvailableTools] = useState<AvailableTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [toolFilter, setToolFilter] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    system_prompt: '',
    tools: [] as string[],
    triggers: [] as Record<string, unknown>[],
    is_active: true,
    schedule_cron: '',
  });

  useEffect(() => {
    loadAll();
  }, [organizationId]);

  async function loadAll() {
    setLoading(true);
    try {
      const [agentsData, toolsData] = await Promise.all([
        apiRequest<CustomAgent[]>(API_ROUTES.customAgents.list, {
          token,
          query: { organization_id: organizationId },
        }).catch(() => []),
        apiRequest<AvailableTool[]>(API_ROUTES.customAgents.availableTools, {
          token,
        }).catch(() => []),
      ]);
      setAgents(Array.isArray(agentsData) ? agentsData : []);
      setAvailableTools(Array.isArray(toolsData) ? toolsData : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function resetForm() {
    setForm({
      name: '',
      description: '',
      system_prompt: '',
      tools: [],
      triggers: [],
      is_active: true,
      schedule_cron: '',
    });
    setRunResult(null);
  }

  function startCreate() {
    resetForm();
    setSelectedId(null);
    setMode('create');
  }

  function startEdit(agent: CustomAgent) {
    setSelectedId(agent.id);
    setForm({
      name: agent.name,
      description: agent.description || '',
      system_prompt: agent.system_prompt,
      tools: agent.tools || [],
      triggers: agent.triggers || [],
      is_active: agent.is_active,
      schedule_cron: agent.schedule_cron || '',
    });
    setRunResult(null);
    setMode('edit');
  }

  async function saveAgent() {
    if (!form.name.trim() || !form.system_prompt.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        system_prompt: form.system_prompt,
        tools: form.tools,
        triggers: form.triggers,
        is_active: form.is_active,
        schedule_cron: form.schedule_cron || null,
      };

      if (mode === 'create') {
        await apiRequest(API_ROUTES.customAgents.create, {
          method: 'POST',
          token,
          query: { organization_id: organizationId },
          body,
        });
      } else if (mode === 'edit' && selectedId) {
        await apiRequest(API_ROUTES.customAgents.update(selectedId), {
          method: 'PUT',
          token,
          body,
        });
      }
      await loadAll();
      setMode('list');
      resetForm();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  async function deleteAgent(id: string) {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
      await apiRequest(API_ROUTES.customAgents.delete(id), { method: 'DELETE', token });
      if (selectedId === id) {
        setSelectedId(null);
        setMode('list');
      }
      await loadAll();
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleAgent(id: string) {
    try {
      await apiRequest(API_ROUTES.customAgents.toggle(id), { method: 'POST', token });
      await loadAll();
    } catch (e) {
      console.error(e);
    }
  }

  async function runAgent(id: string) {
    setRunning(id);
    setRunResult(null);
    try {
      const result = await apiRequest<RunResult>(API_ROUTES.customAgents.run(id), {
        method: 'POST',
        token,
      });
      setRunResult(result);
      await loadAll();
    } catch (e: any) {
      setRunResult({
        agent_id: id,
        status: 'error',
        result: null,
        error: e?.message || 'Unknown error',
      });
    }
    setRunning(null);
  }

  function toggleTool(toolName: string) {
    setForm(prev => ({
      ...prev,
      tools: prev.tools.includes(toolName)
        ? prev.tools.filter(t => t !== toolName)
        : [...prev.tools, toolName],
    }));
  }

  function addTrigger(type: string) {
    const trigger: Record<string, unknown> = { type };
    if (type === 'schedule') {
      trigger.cron = form.schedule_cron || '0 9 * * 1-5';
    }
    setForm(prev => ({
      ...prev,
      triggers: [...prev.triggers, trigger],
    }));
  }

  function removeTrigger(index: number) {
    setForm(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index),
    }));
  }

  // Group tools by category
  const toolsByCategory: Record<string, AvailableTool[]> = {};
  const filteredTools = availableTools.filter(t =>
    !toolFilter || t.name.toLowerCase().includes(toolFilter.toLowerCase()) || t.description.toLowerCase().includes(toolFilter.toLowerCase()) || t.category.toLowerCase().includes(toolFilter.toLowerCase())
  );
  for (const tool of filteredTools) {
    if (!toolsByCategory[tool.category]) toolsByCategory[tool.category] = [];
    toolsByCategory[tool.category].push(tool);
  }

  const selectedAgent = agents.find(a => a.id === selectedId);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <style>{`
        .ab-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .ab-title { font-size: 28px; font-weight: 700; color: #ECE4B7; margin: 0; }
        .ab-subtitle { font-size: 14px; color: rgba(236, 228, 183, 0.5); margin-top: 4px; }
        .ab-grid { display: grid; grid-template-columns: 380px 1fr; gap: 24px; min-height: 600px; }
        .ab-panel { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden; }
        .ab-panel-header { padding: 16px 20px; border-bottom: 1px solid #1a1a1a; display: flex; align-items: center; justify-content: space-between; }
        .ab-panel-title { font-size: 14px; font-weight: 600; color: rgba(236, 228, 183, 0.7); text-transform: uppercase; letter-spacing: 0.5px; }

        /* Agent cards */
        .ab-card { padding: 16px 20px; border-bottom: 1px solid #111; cursor: pointer; transition: all 0.2s; position: relative; }
        .ab-card:hover { background: rgba(236, 228, 183, 0.03); }
        .ab-card.active { background: rgba(0, 167, 225, 0.08); border-left: 3px solid #00A7E1; }
        .ab-card:last-child { border-bottom: none; }
        .ab-card-name { font-size: 15px; font-weight: 600; color: #ECE4B7; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .ab-card-desc { font-size: 12px; color: rgba(236, 228, 183, 0.45); line-height: 1.4; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ab-card-meta { display: flex; align-items: center; gap: 12px; font-size: 11px; color: rgba(236, 228, 183, 0.35); }
        .ab-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .ab-badge-active { background: rgba(0, 200, 83, 0.15); color: #00c853; }
        .ab-badge-inactive { background: rgba(236, 228, 183, 0.08); color: rgba(236, 228, 183, 0.4); }
        .ab-card-actions { display: flex; gap: 6px; margin-top: 8px; }

        /* Buttons */
        .ab-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; gap: 6px; }
        .ab-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ab-btn-primary { background: linear-gradient(135deg, #00A7E1, #0090c4); color: #fff; }
        .ab-btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .ab-btn-secondary { background: #1a1a1a; color: #ECE4B7; border: 1px solid #2a2a2a; }
        .ab-btn-secondary:hover:not(:disabled) { background: #222; }
        .ab-btn-danger { background: rgba(204, 41, 54, 0.15); color: #CC2936; border: 1px solid rgba(204, 41, 54, 0.3); }
        .ab-btn-danger:hover:not(:disabled) { background: rgba(204, 41, 54, 0.25); }
        .ab-btn-run { background: rgba(222, 192, 241, 0.12); color: #DEC0F1; border: 1px solid rgba(222, 192, 241, 0.25); }
        .ab-btn-run:hover:not(:disabled) { background: rgba(222, 192, 241, 0.2); }
        .ab-btn-sm { padding: 5px 10px; font-size: 11px; border-radius: 6px; }
        .ab-btn-icon { width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: #1a1a1a; border: 1px solid #2a2a2a; color: rgba(236, 228, 183, 0.6); cursor: pointer; transition: all 0.2s; }
        .ab-btn-icon:hover { background: #222; color: #ECE4B7; }

        /* Editor */
        .ab-editor { padding: 24px; overflow-y: auto; max-height: calc(100vh - 200px); }
        .ab-field { margin-bottom: 20px; }
        .ab-label { display: block; font-size: 12px; font-weight: 600; color: rgba(236, 228, 183, 0.6); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .ab-input { width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #2a2a2a; background: #0b0b0b; color: #ECE4B7; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .ab-input:focus { border-color: #00A7E1; }
        .ab-input::placeholder { color: rgba(236, 228, 183, 0.25); }
        .ab-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }
        .ab-textarea-lg { min-height: 180px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; }

        /* Tool selector */
        .ab-tools-search { margin-bottom: 12px; }
        .ab-tools-grid { display: grid; grid-template-columns: 1fr; gap: 4px; max-height: 280px; overflow-y: auto; padding-right: 4px; }
        .ab-tools-grid::-webkit-scrollbar { width: 4px; }
        .ab-tools-grid::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        .ab-tool-category { font-size: 11px; font-weight: 700; color: rgba(236, 228, 183, 0.4); text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0 4px; margin-top: 4px; }
        .ab-tool-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s; user-select: none; }
        .ab-tool-item:hover { background: rgba(236, 228, 183, 0.04); }
        .ab-tool-item.selected { background: rgba(0, 167, 225, 0.1); }
        .ab-tool-check { width: 18px; height: 18px; border-radius: 4px; border: 2px solid #333; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
        .ab-tool-item.selected .ab-tool-check { background: #00A7E1; border-color: #00A7E1; }
        .ab-tool-name { font-size: 13px; color: #ECE4B7; font-family: 'SF Mono', 'Fira Code', monospace; }
        .ab-tool-desc { font-size: 11px; color: rgba(236, 228, 183, 0.4); }

        /* Triggers */
        .ab-trigger-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #111; border-radius: 6px; margin-bottom: 6px; }
        .ab-trigger-type { font-size: 12px; color: #00A7E1; font-weight: 600; }
        .ab-trigger-detail { font-size: 11px; color: rgba(236, 228, 183, 0.4); flex: 1; }
        .ab-trigger-remove { width: 20px; height: 20px; border-radius: 4px; border: none; background: rgba(204, 41, 54, 0.2); color: #CC2936; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }

        /* Schedule presets */
        .ab-schedule-presets { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .ab-preset { padding: 4px 10px; border-radius: 4px; border: 1px solid #2a2a2a; background: #111; color: rgba(236, 228, 183, 0.6); font-size: 11px; cursor: pointer; transition: all 0.15s; }
        .ab-preset:hover { border-color: #00A7E1; color: #ECE4B7; }
        .ab-preset.active { border-color: #00A7E1; background: rgba(0, 167, 225, 0.1); color: #00A7E1; }

        /* Toggle */
        .ab-toggle { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
        .ab-toggle-track { width: 40px; height: 22px; border-radius: 11px; background: #333; transition: background 0.2s; position: relative; }
        .ab-toggle-track.on { background: #00A7E1; }
        .ab-toggle-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px; transition: transform 0.2s; }
        .ab-toggle-track.on .ab-toggle-thumb { transform: translateX(18px); }
        .ab-toggle-label { font-size: 13px; color: rgba(236, 228, 183, 0.7); }

        /* Run result */
        .ab-run-result { margin-top: 16px; padding: 16px; border-radius: 10px; border: 1px solid #1a1a1a; background: #0b0b0b; }
        .ab-run-result.success { border-color: rgba(0, 200, 83, 0.3); }
        .ab-run-result.error { border-color: rgba(204, 41, 54, 0.3); }
        .ab-run-result-header { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .ab-run-result.success .ab-run-result-header { color: #00c853; }
        .ab-run-result.error .ab-run-result-header { color: #CC2936; }
        .ab-run-result-body { font-size: 13px; color: rgba(236, 228, 183, 0.7); line-height: 1.5; white-space: pre-wrap; font-family: 'SF Mono', 'Fira Code', monospace; }

        /* Empty state */
        .ab-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 32px; text-align: center; }
        .ab-empty-icon { width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, rgba(0, 167, 225, 0.15), rgba(222, 192, 241, 0.1)); display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px; color: #00A7E1; }
        .ab-empty-title { font-size: 18px; font-weight: 600; color: #ECE4B7; margin-bottom: 8px; }
        .ab-empty-text { font-size: 13px; color: rgba(236, 228, 183, 0.4); margin-bottom: 20px; max-width: 300px; }

        /* Section divider */
        .ab-divider { border: none; border-top: 1px solid #1a1a1a; margin: 20px 0; }

        /* Footer actions */
        .ab-footer { display: flex; gap: 8px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid #1a1a1a; margin-top: 8px; }

        /* Selected tool count */
        .ab-tool-count { font-size: 11px; color: #00A7E1; font-weight: 600; }

        /* Loading spinner */
        .ab-spinner { width: 16px; height: 16px; border: 2px solid rgba(236, 228, 183, 0.2); border-top-color: #00A7E1; border-radius: 50%; animation: ab-spin 0.6s linear infinite; display: inline-block; }
        @keyframes ab-spin { to { transform: rotate(360deg); } }

        /* Scrollbar for list panel */
        .ab-list-scroll { overflow-y: auto; max-height: calc(100vh - 260px); }
        .ab-list-scroll::-webkit-scrollbar { width: 4px; }
        .ab-list-scroll::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>

      <div className="ab-header">
        <div>
          <h1 className="ab-title">Agent Builder</h1>
          <p className="ab-subtitle">Create custom AI agents that automate any workflow with any tool</p>
        </div>
        <button className="ab-btn ab-btn-primary" onClick={startCreate}>
          + New Agent
        </button>
      </div>

      <div className="ab-grid">
        {/* Left Panel - Agent List */}
        <div className="ab-panel">
          <div className="ab-panel-header">
            <span className="ab-panel-title">Your Agents ({agents.length})</span>
          </div>
          <div className="ab-list-scroll">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div className="ab-spinner" />
              </div>
            ) : agents.length === 0 ? (
              <div className="ab-empty">
                <div className="ab-empty-icon"><i className="fi fi-rr-cube" /></div>
                <div className="ab-empty-title">No agents yet</div>
                <div className="ab-empty-text">
                  Create your first custom agent to automate any workflow.
                </div>
                <button className="ab-btn ab-btn-primary" onClick={startCreate}>
                  + Create Agent
                </button>
              </div>
            ) : (
              agents.map(agent => (
                <div
                  key={agent.id}
                  className={`ab-card ${selectedId === agent.id ? 'active' : ''}`}
                  onClick={() => startEdit(agent)}
                >
                  <div className="ab-card-name">
                    {agent.name}
                    <span className={`ab-badge ${agent.is_active ? 'ab-badge-active' : 'ab-badge-inactive'}`}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="ab-card-desc">
                    {agent.description || 'No description'}
                  </div>
                  <div className="ab-card-meta">
                    <span>{agent.tools?.length || 0} tools</span>
                    <span>&#x2022;</span>
                    <span>{agent.run_count} runs</span>
                    <span>&#x2022;</span>
                    <span>Last run: {formatRelativeTime(agent.last_run_at)}</span>
                  </div>
                  <div className="ab-card-actions">
                    <button
                      className="ab-btn ab-btn-run ab-btn-sm"
                      onClick={e => { e.stopPropagation(); runAgent(agent.id); }}
                      disabled={running === agent.id}
                    >
                      {running === agent.id ? <span className="ab-spinner" /> : null}
                      Run Now
                    </button>
                    <button
                      className="ab-btn ab-btn-secondary ab-btn-sm"
                      onClick={e => { e.stopPropagation(); toggleAgent(agent.id); }}
                    >
                      {agent.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="ab-btn ab-btn-danger ab-btn-sm"
                      onClick={e => { e.stopPropagation(); deleteAgent(agent.id); }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="ab-panel">
          {mode === 'list' && !selectedId ? (
            <div className="ab-empty" style={{ height: '100%' }}>
              <div className="ab-empty-icon"><i className="fi fi-rr-cube" /></div>
              <div className="ab-empty-title">Select or create an agent</div>
              <div className="ab-empty-text">
                Choose an agent from the list to edit, or create a new one to get started.
              </div>
              <button className="ab-btn ab-btn-primary" onClick={startCreate}>
                + New Agent
              </button>
            </div>
          ) : (
            <>
              <div className="ab-panel-header">
                <span className="ab-panel-title">
                  {mode === 'create' ? 'Create New Agent' : `Edit: ${form.name || 'Untitled'}`}
                </span>
                <button
                  className="ab-btn ab-btn-secondary ab-btn-sm"
                  onClick={() => { setMode('list'); setSelectedId(null); resetForm(); }}
                >
                  Cancel
                </button>
              </div>
              <div className="ab-editor">
                {/* Name */}
                <div className="ab-field">
                  <label className="ab-label">Agent Name</label>
                  <input
                    className="ab-input"
                    type="text"
                    placeholder="e.g. Sales Follow-Up Agent"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Description */}
                <div className="ab-field">
                  <label className="ab-label">Description</label>
                  <input
                    className="ab-input"
                    type="text"
                    placeholder="Brief description of what this agent does..."
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* System Prompt */}
                <div className="ab-field">
                  <label className="ab-label">System Prompt (Instructions)</label>
                  <textarea
                    className="ab-input ab-textarea ab-textarea-lg"
                    placeholder={"You are a sales follow-up agent. When a new email arrives from a prospect, draft a personalized response that:\n1. Acknowledges their interest\n2. Addresses any questions they raised\n3. Proposes a meeting time\n\nBe professional but warm. Keep responses under 200 words."}
                    value={form.system_prompt}
                    onChange={e => setForm(prev => ({ ...prev, system_prompt: e.target.value }))}
                  />
                </div>

                <hr className="ab-divider" />

                {/* Tools */}
                <div className="ab-field">
                  <label className="ab-label">
                    Tools <span className="ab-tool-count">({form.tools.length} selected)</span>
                  </label>
                  <div className="ab-tools-search">
                    <input
                      className="ab-input"
                      type="text"
                      placeholder="Search tools..."
                      value={toolFilter}
                      onChange={e => setToolFilter(e.target.value)}
                    />
                  </div>
                  <div className="ab-tools-grid">
                    {Object.entries(toolsByCategory).map(([category, tools]) => (
                      <React.Fragment key={category}>
                        <div className="ab-tool-category">{category}</div>
                        {tools.map(tool => {
                          const isSelected = form.tools.includes(tool.name);
                          return (
                            <div
                              key={tool.name}
                              className={`ab-tool-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => toggleTool(tool.name)}
                            >
                              <div className="ab-tool-check">
                                {isSelected && (
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                              <div>
                                <div className="ab-tool-name">{tool.name}</div>
                                <div className="ab-tool-desc">{tool.description}</div>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <hr className="ab-divider" />

                {/* Triggers */}
                <div className="ab-field">
                  <label className="ab-label">Triggers</label>
                  {form.triggers.map((trigger, idx) => (
                    <div key={idx} className="ab-trigger-row">
                      <span className="ab-trigger-type">{String(trigger.type || 'event')}</span>
                      <span className="ab-trigger-detail">
                        {trigger.cron ? `cron: ${trigger.cron}` : trigger.source ? `source: ${trigger.source}` : ''}
                      </span>
                      <button className="ab-trigger-remove" onClick={() => removeTrigger(idx)} type="button">
                        x
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {TRIGGER_TYPES.map(tt => (
                      <button
                        key={tt.value}
                        className="ab-btn ab-btn-secondary ab-btn-sm"
                        onClick={() => addTrigger(tt.value)}
                        type="button"
                      >
                        + {tt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule Cron */}
                <div className="ab-field">
                  <label className="ab-label">Schedule (Cron)</label>
                  <input
                    className="ab-input"
                    type="text"
                    placeholder="e.g. 0 9 * * 1-5  (weekdays at 9 AM)"
                    value={form.schedule_cron}
                    onChange={e => setForm(prev => ({ ...prev, schedule_cron: e.target.value }))}
                  />
                  <div className="ab-schedule-presets">
                    {SCHEDULE_PRESETS.map(preset => (
                      <button
                        key={preset.label}
                        className={`ab-preset ${form.schedule_cron === preset.cron ? 'active' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, schedule_cron: preset.cron }))}
                        type="button"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="ab-divider" />

                {/* Active Toggle */}
                <div className="ab-field">
                  <div
                    className="ab-toggle"
                    onClick={() => setForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                  >
                    <div className={`ab-toggle-track ${form.is_active ? 'on' : ''}`}>
                      <div className="ab-toggle-thumb" />
                    </div>
                    <span className="ab-toggle-label">
                      {form.is_active ? 'Agent is active' : 'Agent is inactive'}
                    </span>
                  </div>
                </div>

                {/* Run Result */}
                {runResult && runResult.agent_id === selectedId && (
                  <div className={`ab-run-result ${runResult.status}`}>
                    <div className="ab-run-result-header">
                      {runResult.status === 'success' ? 'Execution Result' : 'Execution Error'}
                    </div>
                    <div className="ab-run-result-body">
                      {runResult.result || runResult.error || 'No output'}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="ab-footer">
                  {mode === 'edit' && selectedId && (
                    <>
                      <button
                        className="ab-btn ab-btn-danger"
                        onClick={() => deleteAgent(selectedId)}
                      >
                        Delete
                      </button>
                      <button
                        className="ab-btn ab-btn-run"
                        onClick={() => runAgent(selectedId)}
                        disabled={running === selectedId}
                      >
                        {running === selectedId ? <span className="ab-spinner" /> : null}
                        Run Now
                      </button>
                    </>
                  )}
                  <button
                    className="ab-btn ab-btn-primary"
                    onClick={saveAgent}
                    disabled={saving || !form.name.trim() || !form.system_prompt.trim()}
                  >
                    {saving ? <span className="ab-spinner" /> : null}
                    {mode === 'create' ? 'Create Agent' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
