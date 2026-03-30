import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

interface Props {
  content: string;
  onUpdate?: (html: string, text: string) => void;
  placeholder?: string;
  editable?: boolean;
  fullscreen?: boolean;
  documentName?: string;
  onClose?: () => void;
  onSave?: () => void;
  saving?: boolean;
}

export function TiptapEditor({ content, onUpdate, placeholder = "Start writing...", editable = true, fullscreen, documentName, onClose, onSave, saving }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "code-block" } },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: true, HTMLAttributes: { class: "editor-link" } }),
    ],
    content,
    editable,
    onUpdate: ({ editor: e }) => {
      onUpdate?.(e.getHTML(), e.getText());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  if (!editor) return null;

  const toolbar = editable ? (
    <div className="tiptap-toolbar">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? "active" : ""}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "active" : ""}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? "active" : ""}>H3</button>
      <span className="tb-divider" />
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "active" : ""} style={{ fontWeight: 700 }}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "active" : ""}><em>I</em></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "active" : ""}><s>S</s></button>
      <span className="tb-divider" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "active" : ""}>&#8226; List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "active" : ""}>1. List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive("blockquote") ? "active" : ""}>Quote</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive("codeBlock") ? "active" : ""}>Code</button>
      <span className="tb-divider" />
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>Line</button>
      <button type="button" onClick={() => { const url = window.prompt("Enter URL:"); if (url) editor.chain().focus().setLink({ href: url }).run(); }}>Link</button>
      <button type="button" onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
    </div>
  ) : null;

  if (fullscreen) {
    return (
      <div className="tiptap-fullscreen">
        <div className="tiptap-fs-header">
          <div className="tiptap-fs-title">{documentName || "Document"}</div>
          <div className="tiptap-fs-actions">
            {onSave && <button className="tiptap-fs-btn save" onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>}
            {onClose && <button className="tiptap-fs-btn close" onClick={onClose}>Close</button>}
          </div>
        </div>
        {toolbar}
        <div className="tiptap-fs-body">
          <div className="tiptap-fs-page">
            <EditorContent editor={editor} className="tiptap-content" />
          </div>
        </div>
        {editorStyles}
      </div>
    );
  }

  return (
    <div className="tiptap-wrapper">
      {toolbar}
      <EditorContent editor={editor} className="tiptap-content" />
      {editorStyles}
    </div>
  );
}

const editorStyles = (
  <style>{`
    .tiptap-wrapper {
      border: 1px solid #1a1a1a;
      border-radius: 10px;
      overflow: hidden;
      background: #0a0a0a;
    }

    /* Fullscreen overlay */
    .tiptap-fullscreen {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: #020202;
      display: flex;
      flex-direction: column;
    }
    .tiptap-fs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      border-bottom: 1px solid #1a1a1a;
      background: #0a0a0a;
    }
    .tiptap-fs-title {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }
    .tiptap-fs-actions {
      display: flex;
      gap: 8px;
    }
    .tiptap-fs-btn {
      padding: 8px 20px;
      border-radius: 8px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .tiptap-fs-btn.save {
      background: #00A7E1;
      color: #020202;
    }
    .tiptap-fs-btn.close {
      background: #1a1a1a;
      color: #ECE4B7;
      border: 1px solid #333;
    }
    .tiptap-fs-body {
      flex: 1;
      overflow-y: auto;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      background: #080808;
    }
    .tiptap-fs-page {
      max-width: 800px;
      width: 100%;
      background: #0d0d0d;
      border: 1px solid #1a1a1a;
      border-radius: 8px;
      min-height: 600px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }

    /* Toolbar */
    .tiptap-toolbar {
      display: flex;
      gap: 2px;
      padding: 8px 12px;
      border-bottom: 1px solid #1a1a1a;
      background: #0a0a0a;
      flex-wrap: wrap;
      align-items: center;
    }
    .tiptap-toolbar button {
      padding: 5px 12px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #888;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .tiptap-toolbar button:hover {
      background: #1a1a1a;
      color: #fff;
    }
    .tiptap-toolbar button.active {
      background: rgba(0, 167, 225, 0.15);
      color: #00A7E1;
    }
    .tb-divider {
      width: 1px;
      height: 20px;
      background: #1a1a1a;
      margin: 0 6px;
    }

    /* Editor content */
    .tiptap-content {
      padding: 20px 28px;
      min-height: 300px;
    }
    .tiptap-content .tiptap {
      outline: none;
      color: #fff;
      font-size: 15px;
      line-height: 1.75;
    }
    .tiptap-content .tiptap h1 { font-size: 26px; font-weight: 700; margin: 20px 0 10px; color: #fff; }
    .tiptap-content .tiptap h2 { font-size: 20px; font-weight: 600; margin: 18px 0 8px; color: #fff; }
    .tiptap-content .tiptap h3 { font-size: 16px; font-weight: 600; margin: 14px 0 6px; color: #fff; }
    .tiptap-content .tiptap p { margin: 8px 0; color: #e8e8e8; }
    .tiptap-content .tiptap ul, .tiptap-content .tiptap ol { padding-left: 24px; margin: 8px 0; }
    .tiptap-content .tiptap li { margin: 4px 0; color: #e8e8e8; }
    .tiptap-content .tiptap li::marker { color: #00A7E1; }
    .tiptap-content .tiptap strong { color: #fff; font-weight: 600; }
    .tiptap-content .tiptap em { color: #ccc; }
    .tiptap-content .tiptap s { color: #888; }
    .tiptap-content .tiptap blockquote {
      border-left: 3px solid #00A7E1;
      padding-left: 16px;
      margin: 12px 0;
      color: #aaa;
    }
    .tiptap-content .tiptap code {
      background: #1a1a1a;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
      color: #DEC0F1;
      font-family: 'SF Mono', 'Fira Code', monospace;
    }
    .tiptap-content .tiptap pre {
      background: #0a0a0a;
      border: 1px solid #1a1a1a;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 12px 0;
    }
    .tiptap-content .tiptap pre code {
      background: none;
      padding: 0;
      color: #ddd;
    }
    .tiptap-content .tiptap hr {
      border: none;
      border-top: 1px solid #1a1a1a;
      margin: 20px 0;
    }
    .tiptap-content .tiptap a, .tiptap-content .tiptap .editor-link {
      color: #00A7E1;
      text-decoration: underline;
      cursor: pointer;
    }
    .tiptap-content .tiptap p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #444;
      pointer-events: none;
      height: 0;
    }
  `}</style>
);
