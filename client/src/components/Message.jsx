import React from "react";

function highlight(code) {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(
      /\b(def|return|if|import|for|in|class|raise|from|with|as|try|except|const|let|var|function|async|await|export|default|pass|yield|not|and|or|True|False|None)\b/g,
      '<span style="color:#f067a6">$1</span>'
    )
    .replace(
      /\b(redis|Redis|pipeline|incr|expire|execute|console|require|useState|useEffect|fetch|print|len|range)\b/g,
      '<span style="color:#a370f7">$1</span>'
    )
    .replace(/"([^"]*)"/g, '<span style="color:#22d3a5">"$1"</span>')
    .replace(/'([^']*)'/g, '<span style="color:#22d3a5">\'$1\'</span>')
    .replace(/#.*/g, '<span style="color:#3a3a5a">$&</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#f5a623">$1</span>');
}

function renderAttachments(attachments) {
  if (!attachments) return null;
  if (!Array.isArray(attachments)) return null;
  if (attachments.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
      {attachments.map(function(f, i) {
        if (!f) return null;
        const isImage = typeof f.type === "string" && f.type.startsWith("image/");

        if (isImage) {
          return (
            <img
              key={i}
              src={f.preview || f.url}
              alt={f.name || "image"}
              style={{
                maxWidth: 260, maxHeight: 200,
                borderRadius: 10, objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer", display: "block",
              }}
              onClick={function() { window.open(f.url || f.preview, "_blank"); }}
              onError={function(e) {
                if (f.url && e.target.src !== f.url) {
                  e.target.src = f.url;
                } else {
                  e.target.style.display = "none";
                }
              }}
            />
          );
        }

        return (
          <div
            key={i}
            onClick={function() { if (f.url) window.open(f.url, "_blank"); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#1e1e32",
              border: "1px solid rgba(163,112,247,0.3)",
              borderRadius: 8, padding: "7px 11px",
              cursor: f.url ? "pointer" : "default",
            }}
          >
            <span style={{ fontSize: 18 }}>📄</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#f0f0ff" }}>
                {f.name || "File"}
              </div>
              <div style={{ fontSize: 10, color: "#5a5a7a" }}>
                {f.size ? ((f.size / 1024).toFixed(0) + " KB · ") : ""}
                {f.url ? "Click to open" : "Uploading..."}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderContent(text) {
  if (!text) return null;

  const parts = text.split(/```(\w+)?\n?([\s\S]*?)```/);
  const nodes = [];
  let i = 0;

  while (i < parts.length) {
    if (i % 3 === 0) {
      if (parts[i]) {
        const html = parts[i]
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f0f0ff;font-weight:600">$1</strong>')
          .replace(
            /`([^`]+)`/g,
            '<code style="background:#161628;color:#22d3a5;padding:1px 6px;border-radius:4px;font-size:12px;font-family:Space Mono,monospace">$1</code>'
          )
          .replace(/\n/g, "<br/>");
        nodes.push(
          React.createElement("span", {
            key: i,
            dangerouslySetInnerHTML: { __html: html },
          })
        );
      }
    } else if (i % 3 === 2) {
      const lang = parts[i - 1] || "code";
      const code = parts[i];
      nodes.push(
        React.createElement(
          "div",
          {
            key: i,
            style: {
              background: "#080812",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 9, overflow: "hidden",
              margin: "8px 0",
              fontFamily: "Space Mono, monospace",
              fontSize: 11.5,
            },
          },
          React.createElement(
            "div",
            {
              style: {
                padding: "6px 12px", background: "#161628",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              },
            },
            React.createElement("span", {
              style: { color: "#22d3a5", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" },
            }, lang),
            React.createElement("button", {
              onClick: function() { navigator.clipboard && navigator.clipboard.writeText(code); },
              style: { background: "none", border: "none", color: "#5a5a7a", fontSize: 10, cursor: "pointer", fontFamily: "Space Mono, monospace" },
              onMouseEnter: function(e) { e.currentTarget.style.color = "#f0f0ff"; },
              onMouseLeave: function(e) { e.currentTarget.style.color = "#5a5a7a"; },
            }, "copy")
          ),
          React.createElement("pre", {
            style: { padding: 13, color: "#cdd5f3", lineHeight: 1.65, overflowX: "auto", whiteSpace: "pre" },
            dangerouslySetInnerHTML: { __html: highlight(code) },
          })
        )
      );
    }
    i++;
  }

  return nodes;
}

const Message = function({ message }) {
  if (!message) return null;
  if (!message.role) return null;

  const attachments = Array.isArray(message.attachments) ? message.attachments : null;
  const content     = typeof message.content === "string" ? message.content : "";

  if (!content && (!attachments || attachments.length === 0)) return null;

  const isUser = (message.role || message.sender) === "user";

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start",
      gap: 10, marginBottom: 16,
      animation: "msgFade .3s ease",
      alignSelf: isUser ? "flex-end" : "flex-start",
      maxWidth: isUser ? "70%" : "85%",
      width: isUser ? "auto" : "100%",
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: isUser ? "#1e1e32" : "linear-gradient(135deg,#7b5ea7,#f067a6)",
        border: isUser ? "1px solid rgba(165,112,247,0.3)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800,
        color: isUser ? "#a370f7" : "#fff",
        marginTop: 2,
      }}>
        {isUser ? "U" : "S"}
      </div>

      {/* Content */}
      <div style={{
        display: "flex", flexDirection: "column",
        gap: 3, flex: 1, minWidth: 0,
        alignItems: isUser ? "flex-end" : "flex-start",
      }}>
        <span style={{
          fontSize: 10, color: "#5a5a7a",
          letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 600,
        }}>
          {isUser ? "You" : "ScaleGPT"}
        </span>

        <div style={{
          padding: "11px 14px",
          fontSize: 13, lineHeight: 1.7, color: "#f0f0ff",
          background: isUser ? "rgba(123,94,167,0.2)" : "#13131f",
          border: isUser ? "1px solid rgba(165,112,247,0.3)" : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          borderTopRightRadius: isUser ? 4 : 14,
          borderTopLeftRadius:  isUser ? 14 : 4,
          wordBreak: "break-word", maxWidth: "100%",
        }}>
          {renderAttachments(attachments)}
          {content ? renderContent(content) : null}
        </div>

        {message.timestamp && (
          <span style={{ fontSize: 10, color: "#5a5a7a" }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default Message;