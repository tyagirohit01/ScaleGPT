import { useState } from "react";
import React from "react";
import ParticleCanvas from "./ParticleCanvas";

const MODES = ["Chat", "Image", "Video", "Music"];
const MODE_HINTS = {
  Chat:  "Answering questions, writing code, solving problems — all in one place.",
  Image: "Generate stunning images from text prompts using AI.",
  Video: "Create and edit videos with AI assistance.",
  Music: "Compose and generate music with AI.",
};
const CHIPS = [
  { icon: "🏗", label: "System Design",  q: "Design a scalable API with rate limiting" },
  { icon: "💻", label: "Code",           q: "Write and debug Python code for me" },
  { icon: "📄", label: "Analyze Docs",   q: "Summarize and analyze a document" },
  { icon: "💡", label: "Brainstorm",     q: "Help me brainstorm startup ideas" },
  { icon: "🎯", label: "Interview Prep", q: "Explain system design interview topics" },
];
const MODELS = ["Scale Fast", "Scale Pro", "Scale Research", "Scale Vision"];

export default function HeroView({ onSend }) {
  const [mode, setMode]   = useState("Chat");
  const [input, setInput] = useState("");
  const [model, setModel] = useState("Scale Fast");

  function fire(text) {
    const val = text || input.trim();
    if (!val) return;
    onSend(val, model);
    setInput("");
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100%", position: "relative", overflow: "hidden",
      background: "#06060e", padding: "20px 16px",
    }}>
      <ParticleCanvas />

      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center",
        width: "100%", maxWidth: 580,
      }}>

        {/* Wordmark */}
        <h1 style={{
          fontSize: "clamp(42px, 10vw, 68px)",
          fontWeight: 900, letterSpacing: "-4px",
          lineHeight: 1, marginBottom: 8,
          background: "linear-gradient(135deg,#ffffff 0%,#c9a8ff 45%,#f067a6 85%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "heroRise .8s cubic-bezier(.16,1,.3,1) both",
        }}>scale</h1>

        <p style={{
          fontSize: "clamp(12px, 3vw, 13px)",
          color: "#9090b0", marginBottom: 20,
          animation: "heroRise .8s .1s cubic-bezier(.16,1,.3,1) both",
          padding: "0 8px",
        }}>
          Your intelligent AI workspace — ask anything, build anything.
        </p>

        {/* Mode pills */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap",
          justifyContent: "center",
          animation: "heroRise .8s .18s cubic-bezier(.16,1,.3,1) both",
        }}>
          {MODES.map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "8px 16px", borderRadius: 30,
                fontSize: "clamp(11px, 3vw, 13px)", fontWeight: 600,
                cursor: "pointer", transition: "all .2s",
                background: mode === m ? "#7b5ea7" : "#10101f",
                border: mode === m ? "1px solid #a370f7" : "1px solid rgba(255,255,255,0.1)",
                color: mode === m ? "#fff" : "#9090b0",
                boxShadow: mode === m ? "0 0 22px rgba(123,94,167,.45)" : "none",
              }}
            >{m}</button>
          ))}
        </div>

        {/* Big input */}
        <div style={{
          width: "100%",
          animation: "heroRise .8s .26s cubic-bezier(.16,1,.3,1) both",
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            background: "#10101f",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14, padding: "6px 6px 6px 14px",
            marginBottom: 10, flexWrap: "nowrap",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fire()}
              placeholder={mode === "Chat" ? "Ask anything…" : `Describe the ${mode.toLowerCase()} you want…`}
              style={{
                flex: 1, background: "none", border: "none",
                color: "#f0f0ff", fontSize: "clamp(12px, 3.5vw, 14px)",
                outline: "none", padding: "6px 8px 6px 0",
                minWidth: 0,
              }}
            />
            {/* hide model select on very small screens */}
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="hidden sm:block"
              style={{
                background: "#161628",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#9090b0", fontSize: 11,
                padding: "7px 10px", outline: "none", cursor: "pointer",
                marginRight: 6, appearance: "none", flexShrink: 0,
              }}
            >
              {MODELS.map(m => (
                <option key={m} style={{ background: "#10101f" }}>{m}</option>
              ))}
            </select>
            <button
              onClick={() => fire()}
              style={{
                padding: "9px 14px",
                background: "linear-gradient(135deg,#7b5ea7,#f067a6)",
                border: "none", borderRadius: 9, color: "#fff",
                fontSize: "clamp(11px, 3vw, 12px)", fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}
              onMouseOver={e => e.currentTarget.style.opacity = ".88"}
              onMouseOut={e  => e.currentTarget.style.opacity = "1"}
            >Start Chatting</button>
          </div>
          <p style={{ fontSize: 11, color: "#5a5a7a", textAlign: "center" }}>
            {MODE_HINTS[mode]}
          </p>
        </div>

        {/* Chips */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap",
          justifyContent: "center", marginTop: 16,
          animation: "heroRise .8s .34s cubic-bezier(.16,1,.3,1) both",
        }}>
          {CHIPS.map(c => (
            <button
              key={c.label}
              onClick={() => fire(c.q)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 11px", borderRadius: 8,
                background: "#10101f",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#9090b0", fontSize: "clamp(10px, 2.5vw, 11px)",
                fontWeight: 500, cursor: "pointer", transition: "all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(165,112,247,.4)"; e.currentTarget.style.color = "#f0f0ff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#9090b0"; }}
            >
              <span style={{ fontSize: 13 }}>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}