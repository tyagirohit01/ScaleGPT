import React from "react";

export default function FilePreview({ file, onRemove }) {
  const isImage = file.type?.startsWith("image/");
  const isPDF   = file.type === "application/pdf";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "#1e1e32",
      border: "1px solid rgba(163,112,247,0.3)",
      borderRadius: 8, padding: "6px 10px",
      maxWidth: 220,
    }}>
      {isImage && file.preview ? (
        <img
          src={file.preview}
          alt={file.name}
          style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 32, height: 32, borderRadius: 6, flexShrink: 0,
          background: isPDF ? "rgba(240,103,166,0.15)" : "rgba(163,112,247,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>
          {isPDF ? "📄" : "📎"}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: "#f0f0ff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{file.name}</div>
        <div style={{ fontSize: 10, color: "#5a5a7a" }}>
          {(file.size / 1024).toFixed(0)} KB
        </div>
      </div>

      <button
        onClick={onRemove}
        style={{
          background: "none", border: "none", color: "#5a5a7a",
          cursor: "pointer", fontSize: 14, flexShrink: 0,
          padding: "0 2px", lineHeight: 1,
          transition: "color .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
        onMouseLeave={e => e.currentTarget.style.color = "#5a5a7a"}
      >✕</button>
    </div>
  );
}