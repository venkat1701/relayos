import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { API_ROUTES } from "../lib/contract";
import { TiptapEditor } from "../components/TiptapEditor";
import { SearchBar } from "../components/SearchBar";
import type { DocumentContentResponse } from "../lib/types";

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  mime_type?: string | null;
  summary?: string | null;
  extracted_text?: string | null;
  extracted_data?: Record<string, unknown>;
  current_version: number;
  folder_path?: string | null;
  web_view_link?: string | null;
  approval_status?: string | null;
  last_modified_at?: string | null;
}

interface DocumentsPageProps {
  documents: Document[];
  token: string;
  organizationId: string;
  onWorkspaceRefresh?: () => Promise<void> | void;
}

const ICONS: Record<string, string> = {
  "application/vnd.google-apps.document": "fi fi-rr-document",
  "application/vnd.google-apps.spreadsheet": "fi fi-rr-apps",
  "application/vnd.google-apps.presentation": "fi fi-rr-play-circle",
  "application/pdf": "fi fi-rr-file-pdf",
};
const TYPES: Record<string, string> = {
  "application/vnd.google-apps.document": "Google Doc",
  "application/vnd.google-apps.spreadsheet": "Google Sheet",
  "application/vnd.google-apps.presentation": "Slides",
  "application/pdf": "PDF",
};

export function DocumentsPage({ documents, token, organizationId, onWorkspaceRefresh }: DocumentsPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? "");
  const [content, setContent] = useState<DocumentContentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState("");
  const [textDraft, setTextDraft] = useState("");
  const [sheetDraft, setSheetDraft] = useState<string[][]>([]);
  const [sheetTab, setSheetTab] = useState(0);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<"reader" | "writer" | "commenter">("reader");
  const [sharing, setSharing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (documents.length && !documents.find(d => d.id === selectedId)) setSelectedId(documents[0]?.id ?? "");
  }, [documents]);

  const selected = documents.find(d => d.id === selectedId) || null;
  const isDoc = selected?.mime_type?.includes("document");
  const isSheet = selected?.mime_type?.includes("spreadsheet");

  useEffect(() => { if (selected) loadContent(selected.id); }, [selectedId]);

  const filtered = useMemo(() => {
    let items = documents;
    if (filter === "docs") items = items.filter(d => d.mime_type?.includes("document"));
    else if (filter === "sheets") items = items.filter(d => d.mime_type?.includes("spreadsheet"));
    else if (filter === "slides") items = items.filter(d => d.mime_type?.includes("presentation"));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(d => d.name.toLowerCase().includes(q) || (d.summary || "").toLowerCase().includes(q));
    }
    return items;
  }, [documents, filter, search]);

  async function loadContent(id: string) {
    setLoading(true);
    try {
      const data = await apiRequest<DocumentContentResponse>(API_ROUTES.documentContent(id), { token });
      setContent(data);
      if (data?.text) setTextDraft(data.text);
      if (data?.html) setHtmlDraft(data.html);
      if (data?.sheets?.[0]?.values) setSheetDraft(data.sheets[0].values.map(r => r.map(String)));
    } catch { setContent(null); }
    setLoading(false);
  }

  async function saveDraft() {
    if (!selected) return;
    setSaving(true);
    try {
      await apiRequest(API_ROUTES.documentAppend(selected.id), {
        method: "POST", token, body: { text: textDraft, mode: "replace" },
      });
      setMsg("Saved"); setTimeout(() => setMsg(null), 2000);
    } catch { setMsg("Save failed"); }
    setSaving(false);
  }

  async function saveSheet() {
    if (!selected || !content?.sheets?.[sheetTab]) return;
    setSaving(true);
    try {
      await apiRequest(API_ROUTES.documentSheet(selected.id), {
        method: "PUT", token, body: { range_a1: content.sheets[sheetTab].range_a1, values: sheetDraft },
      });
      setMsg("Sheet saved"); setTimeout(() => setMsg(null), 2000);
    } catch { setMsg("Save failed"); }
    setSaving(false);
  }

  async function share() {
    if (!selected || !shareEmail) return;
    setSharing(true);
    await apiRequest(API_ROUTES.actions.execute, {
      method: "POST", token,
      body: { organization_id: organizationId, title: "Share file", tool_calls: [{ name: "share_file", args: { file_id: selected.id, email: shareEmail, role: shareRole } }] },
    });
    setShareEmail(""); setSharing(false);
    setMsg("Shared"); setTimeout(() => setMsg(null), 2000);
  }

  return (
    <div className="dp">
      <style>{`
        .dp { max-width: 1400px; margin: 0 auto; }
        .dp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .dp-header h1 { color: #fff; font-size: 24px; font-weight: 700; margin: 0; }
        .dp-header p { color: #888; font-size: 13px; margin: 4px 0 0; }
        .dp-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .dp-filter { padding: 8px 16px; border-radius: 8px; border: 1px solid #1a1a1a; background: #0a0a0a; color: #888; font-size: 13px; cursor: pointer; transition: all 0.15s; }
        .dp-filter.active { background: #111; color: #fff; border-color: #00A7E1; }
        .dp-layout { display: grid; grid-template-columns: 340px 1fr; gap: 20px; }
        .dp-list { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; max-height: calc(100vh - 220px); overflow-y: auto; }
        .dp-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; cursor: pointer; transition: all 0.15s; border-bottom: 1px solid #0d0d0d; }
        .dp-item:last-child { border-bottom: none; }
        .dp-item:hover { background: #0d0d0d; }
        .dp-item.active { background: #0d0d0d; border-left: 3px solid #00A7E1; padding-left: 15px; }
        .dp-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
        .dp-icon.doc { background: #1a3a5c; color: #4a9eff; }
        .dp-icon.sheet { background: #1a3c2a; color: #4ade80; }
        .dp-icon.slides { background: #3c2a1a; color: #f0a030; }
        .dp-icon.other { background: #1a1a1a; color: #888; }
        .dp-item-info { flex: 1; min-width: 0; }
        .dp-item-name { color: #fff; font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dp-item-meta { color: #666; font-size: 11px; margin-top: 2px; }
        .dp-detail { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px; max-height: calc(100vh - 220px); overflow-y: auto; }
        .dp-detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #111; }
        .dp-detail-header h2 { color: #fff; font-size: 18px; font-weight: 700; margin: 0 0 4px; }
        .dp-detail-header p { color: #888; font-size: 12px; margin: 0; }
        .dp-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .dp-btn { padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; }
        .dp-btn-primary { background: #00A7E1; color: #020202; }
        .dp-btn-primary:hover { background: #0090c5; }
        .dp-btn-ghost { background: transparent; border: 1px solid #333; color: #ECE4B7; }
        .dp-btn-ghost:hover { background: #141414; }
        .dp-section { margin-bottom: 20px; }
        .dp-section-title { color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .dp-summary { color: #ccc; font-size: 14px; line-height: 1.6; background: #080808; border-radius: 8px; padding: 14px; }
        .dp-share-row { display: flex; gap: 8px; margin-top: 8px; }
        .dp-share-input { flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #333; background: #0b0b0b; color: #fff; font-size: 13px; outline: none; }
        .dp-share-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #333; background: #0b0b0b; color: #fff; font-size: 13px; outline: none; }
        .dp-sheet-grid { overflow-x: auto; margin: 12px 0; }
        .dp-sheet-grid table { border-collapse: collapse; width: 100%; }
        .dp-sheet-grid td { border: 1px solid #1a1a1a; padding: 0; }
        .dp-sheet-grid input { width: 100%; padding: 6px 8px; border: none; background: transparent; color: #fff; font-size: 12px; outline: none; }
        .dp-sheet-grid input:focus { background: #141414; }
        .dp-sheet-tabs { display: flex; gap: 4px; margin-bottom: 8px; }
        .dp-sheet-tab { padding: 6px 14px; border-radius: 6px; border: 1px solid #1a1a1a; background: transparent; color: #888; font-size: 12px; cursor: pointer; }
        .dp-sheet-tab.active { background: #141414; color: #fff; border-color: #333; }
        .dp-msg { position: fixed; bottom: 24px; right: 24px; background: #0a0a0a; border: 1px solid #00A7E140; border-radius: 10px; padding: 10px 20px; color: #00A7E1; font-size: 13px; z-index: 100; }
        .dp-empty { display: flex; align-items: center; justify-content: center; height: 300px; color: #888; font-size: 14px; }
      `}</style>

      <div className="dp-header">
        <div>
          <h1>Documents</h1>
          <p>{documents.length} files from Google Drive</p>
        </div>
      </div>

      <div className="dp-toolbar">
        {["all", "docs", "sheets", "slides"].map(f => (
          <button key={f} className={`dp-filter ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
        <SearchBar value={search} onChange={setSearch} placeholder="Search documents..." />
      </div>

      <div className="dp-layout">
        <div className="dp-list">
          {filtered.length === 0 ? (
            <div className="dp-empty">No documents match your filter</div>
          ) : (
            filtered.map(doc => {
              const iconClass = doc.mime_type?.includes("document") ? "doc" : doc.mime_type?.includes("spreadsheet") ? "sheet" : doc.mime_type?.includes("presentation") ? "slides" : "other";
              return (
                <div key={doc.id} className={`dp-item ${selectedId === doc.id ? "active" : ""}`} onClick={() => setSelectedId(doc.id)}>
                  <div className={`dp-icon ${iconClass}`}><i className={ICONS[doc.mime_type || ""] || "fi fi-rr-file"} /></div>
                  <div className="dp-item-info">
                    <div className="dp-item-name">{doc.name}</div>
                    <div className="dp-item-meta">{TYPES[doc.mime_type || ""] || doc.type} | {doc.last_modified_at ? new Date(doc.last_modified_at).toLocaleDateString() : "—"}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="dp-detail">
          {!selected ? (
            <div className="dp-empty">Select a document</div>
          ) : loading ? (
            <div>{[1,2].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 80 }} />)}</div>
          ) : (
            <>
              <div className="dp-detail-header">
                <div>
                  <h2>{selected.name}</h2>
                  <p>{TYPES[selected.mime_type || ""] || selected.type} | v{selected.current_version} | {selected.last_modified_at ? new Date(selected.last_modified_at).toLocaleString() : "—"}</p>
                </div>
                <div className="dp-actions">
                  {isDoc && <button className="dp-btn dp-btn-primary" onClick={() => setEditorOpen(true)}>Edit</button>}
                  {selected.web_view_link && <a className="dp-btn dp-btn-ghost" href={selected.web_view_link} target="_blank" rel="noreferrer">Open in Google</a>}
                </div>
              </div>

              {/* Summary */}
              {selected.summary && (
                <div className="dp-section">
                  <div className="dp-section-title">Summary</div>
                  <div className="dp-summary">{selected.summary}</div>
                </div>
              )}

              {/* Doc content preview */}
              {isDoc && content?.text && !editorOpen && (
                <div className="dp-section">
                  <div className="dp-section-title">Content Preview</div>
                  <div className="dp-summary" style={{ maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 13 }}>
                    {content.text.slice(0, 2000)}{content.text.length > 2000 ? "\n\n..." : ""}
                  </div>
                </div>
              )}

              {/* Sheet editor */}
              {isSheet && content?.sheets && content.sheets.length > 0 && (
                <div className="dp-section">
                  <div className="dp-section-title">Sheet Data</div>
                  {content.sheets.length > 1 && (
                    <div className="dp-sheet-tabs">
                      {content.sheets.map((s, i) => (
                        <button key={i} className={`dp-sheet-tab ${sheetTab === i ? "active" : ""}`} onClick={() => { setSheetTab(i); setSheetDraft(content.sheets[i].values.map(r => r.map(String))); }}>
                          {s.title || `Sheet ${i + 1}`}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="dp-sheet-grid">
                    <table>
                      <tbody>
                        {sheetDraft.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci}>
                                <input value={cell} onChange={e => {
                                  const next = sheetDraft.map(r => [...r]);
                                  next[ri][ci] = e.target.value;
                                  setSheetDraft(next);
                                }} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="dp-btn dp-btn-primary" onClick={saveSheet} disabled={saving}>{saving ? "Saving..." : "Save Sheet"}</button>
                </div>
              )}

              {/* Share */}
              <div className="dp-section">
                <div className="dp-section-title">Share</div>
                <div className="dp-share-row">
                  <input className="dp-share-input" type="email" placeholder="Email address" value={shareEmail} onChange={e => setShareEmail(e.target.value)} />
                  <select className="dp-share-select" value={shareRole} onChange={e => setShareRole(e.target.value as any)}>
                    <option value="reader">Viewer</option>
                    <option value="writer">Editor</option>
                    <option value="commenter">Commenter</option>
                  </select>
                  <button className="dp-btn dp-btn-primary" onClick={share} disabled={sharing || !shareEmail}>{sharing ? "..." : "Share"}</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen editor overlay */}
      {editorOpen && (
        <TiptapEditor
          content={htmlDraft || content?.html || content?.text || ""}
          onUpdate={(html, text) => { setHtmlDraft(html); setTextDraft(text); }}
          fullscreen
          documentName={selected?.name || "Document"}
          onSave={saveDraft}
          saving={saving}
          onClose={() => setEditorOpen(false)}
          placeholder="Start writing..."
        />
      )}

      {msg && <div className="dp-msg">{msg}</div>}
    </div>
  );
}
