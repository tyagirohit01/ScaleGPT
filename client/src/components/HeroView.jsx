import { useState, useRef, useEffect } from "react";
import React from "react";
import ParticleCanvas from "./ParticleCanvas";
import { useAppContext } from "../context/Appcontext";
import axios from "axios";

const CHIPS = [
  { icon: "🏗", label: "System Design",  q: "Design a scalable API with rate limiting" },
  { icon: "💻", label: "Code",           q: "Write and debug Python code for me" },
  { icon: "📄", label: "Analyze Docs",   q: "Summarize and analyze a document" },
  { icon: "💡", label: "Brainstorm",     q: "Help me brainstorm startup ideas" },
  { icon: "🎯", label: "Interview Prep", q: "Explain system design interview topics" },
];

export default function HeroView({ onSend }) {
  const { token } = useAppContext();
  const [input, setInput]         = useState("");
  const [webOn, setWebOn]         = useState(false);
  const [memoryOn, setMemoryOn]   = useState(false);
  const [recording, setRecording] = useState(false);
  const [files, setFiles]         = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef              = useRef(null);
  const recognitionRef            = useRef(null);
  const textareaRef               = useRef(null);

  // ── Auto resize textarea as text grows ──
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
    // scroll to bottom so latest spoken text is always visible
    el.scrollTop = el.scrollHeight;
  }, [input]);

  // ── Voice recording setup ──
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    // ✅ continuous = true so it keeps listening until you stop
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (e) => {
      let interim = "";
      finalTranscript = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript + " ";
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      // ✅ Show final + interim together in real time
      setInput((finalTranscript + interim).trim());
    };

    recognition.onend = () => {
      setRecording(false);
    };
    recognition.onerror = () => {
      setRecording(false);
    };
    recognitionRef.current = recognition;
  }, []);

  function toggleVoice() {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Voice not supported on this browser. Try Chrome.");
      return;
    }
    if (recording) {
      recognition.stop();
      setRecording(false);
    } else {
      setInput("");
      recognition.start();
      setRecording(true);
    }
  }

  // ── File upload ──
  async function handleFileChange(e) {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of selected) {
      const preview = file.type.startsWith("image/")
        ? await new Promise(res => {
            const reader = new FileReader();
            reader.onload = ev => res(ev.target.result);
            reader.readAsDataURL(file);
          })
        : null;
      try {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await axios.post("/api/upload/file", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        if (data.success) {
          uploaded.push({ name: file.name, type: file.type, size: file.size, url: data.url, preview });
        }
      } catch (err) {
        console.error("Upload failed:", err.message);
      }
    }
    setFiles(prev => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function fire(text) {
    const val = text || input.trim();
    if (!val && files.length === 0) return;
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
    }
    onSend(val, files);
    setInput("");
    setFiles([]);
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
          color: "#9090b0", marginBottom: 24,
          animation: "heroRise .8s .1s cubic-bezier(.16,1,.3,1) both",
          padding: "0 8px",
        }}>
          Your intelligent AI workspace — ask anything, build anything.
        </p>

        {/* Main input box */}
        <div style={{
          width: "100%",
          animation: "heroRise .8s .18s cubic-bezier(.16,1,.3,1) both",
        }}>

          {/* File previews */}
          {files.length > 0 && (
            <div style={{
              display: "flex", gap: 8, flexWrap: "wrap",
              marginBottom: 8, justifyContent: "flex-start",
            }}>
              {files.map((f, i) => (
                <div key={i} style={{
                  position: "relative", background: "#13131f",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "6px 10px",
                  fontSize: 11, color: "#9090b0",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {f.preview
                    ? <img src={f.preview} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }} />
                    : <span>📄</span>
                  }
                  <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <button onClick={() => removeFile(i)} style={{
                    background: "none", border: "none", color: "#5a5a7a",
                    cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1,
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* ✅ Input box with textarea so it grows as voice input fills */}
          <div style={{
            display: "flex", alignItems: "flex-end",
            background: "#10101f",
            border: recording
              ? "1px solid rgba(240,103,166,0.5)"
              : "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14, padding: "8px 8px 8px 14px",
            marginBottom: 10, gap: 6,
            transition: "border-color .3s",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  fire();
                }
              }}
              placeholder={recording ? "🎙 Listening — speak now…" : "Ask anything…"}
              rows={1}
              style={{
                flex: 1, background: "none", border: "none",
                color: recording ? "#f0c0d8" : "#f0f0ff",
                fontSize: "clamp(12px, 3.5vw, 14px)",
                outline: "none", padding: "6px 0",
                minWidth: 0, resize: "none",
                lineHeight: 1.6,
                fontFamily: "'Outfit', sans-serif",
                // ✅ grows up to 200px then scrolls
                minHeight: 32,
                maxHeight: 200,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                transition: "color .3s",
              }}
            />
            <button
              onClick={() => fire()}
              style={{
                padding: "9px 14px",
                background: "linear-gradient(135deg,#7b5ea7,#f067a6)",
                border: "none", borderRadius: 9, color: "#fff",
                fontSize: "clamp(11px, 3vw, 12px)", fontWeight: 700,
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                // ✅ stays at bottom of box when textarea grows
                alignSelf: "flex-end",
                marginBottom: 2,
              }}
              onMouseOver={e => e.currentTarget.style.opacity = ".88"}
              onMouseOut={e  => e.currentTarget.style.opacity = "1"}
            >Start Chatting</button>
          </div>

          {/* Tools row */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: 6, flexWrap: "wrap", justifyContent: "center",
            marginBottom: 6,
          }}>

            {/* Web */}
            <button
              onClick={() => setWebOn(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "all .2s",
                background: webOn ? "rgba(165,112,247,.1)" : "#13131f",
                border: webOn ? "1px solid rgba(165,112,247,.35)" : "1px solid rgba(255,255,255,0.07)",
                color: webOn ? "#a370f7" : "#5a5a7a",
              }}
            >🌐 Web</button>

            {/* Attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "all .2s",
                background: files.length > 0 ? "rgba(165,112,247,.1)" : "#13131f",
                border: files.length > 0 ? "1px solid rgba(165,112,247,.35)" : "1px solid rgba(255,255,255,0.07)",
                color: files.length > 0 ? "#a370f7" : "#5a5a7a",
                position: "relative",
              }}
            >
              {uploading ? "⏳" : "📎"} Attach
              {files.length > 0 && !uploading && (
                <span style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: "#a370f7", color: "#fff",
                  fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{files.length}</span>
              )}
            </button>

            {/* Voice */}
            <button
              onClick={toggleVoice}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "all .2s",
                background: recording ? "rgba(240,103,166,.15)" : "#13131f",
                border: recording ? "1px solid rgba(240,103,166,.5)" : "1px solid rgba(255,255,255,0.07)",
                color: recording ? "#f067a6" : "#5a5a7a",
              }}
            >
              {recording ? (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#f067a6",
                    display: "inline-block",
                    animation: "pulse 1s ease-in-out infinite",
                  }}/>
                  Stop
                </span>
              ) : "🎙 Voice"}
            </button>

            {/* Memory */}
            <button
              onClick={() => setMemoryOn(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "all .2s",
                background: memoryOn ? "rgba(165,112,247,.1)" : "#13131f",
                border: memoryOn ? "1px solid rgba(165,112,247,.35)" : "1px solid rgba(255,255,255,0.07)",
                color: memoryOn ? "#a370f7" : "#5a5a7a",
              }}
            >🧠 Memory</button>

          </div>

          {/* Recording live indicator */}
          {recording && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, marginTop: 6,
              color: "#f067a6", fontSize: 11, fontWeight: 500,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#f067a6",
                animation: "pulse 1s ease-in-out infinite",
              }}/>
              Recording — tap Stop or Start Chatting when done
            </div>
          )}
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}