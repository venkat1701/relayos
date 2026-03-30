interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger }: Props) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14,
        padding: "24px 28px", maxWidth: 420, width: "90%",
      }}>
        <h3 style={{ color: "#ECE4B7", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>{title}</h3>
        <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.5, margin: "0 0 20px" }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "8px 18px", borderRadius: 8, border: "1px solid #333",
            background: "transparent", color: "#ECE4B7", fontSize: 13, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: "8px 18px", borderRadius: 8, border: "none",
            background: danger ? "#CC2936" : "#00A7E1", color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
