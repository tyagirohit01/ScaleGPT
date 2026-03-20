import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";
import toast from "react-hot-toast";

const TONES = ["Friendly", "Professional", "Concise", "Creative", "Technical"];
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Arabic", "Chinese"];
const FONT_SIZES = ["Small", "Default", "Large"];
const AI_PERSONAS = [
  { id: "default",  name: "ScaleGPT",    desc: "Balanced, helpful assistant",        emoji: "🤖" },
  { id: "mentor",   name: "The Mentor",  desc: "Patient, explains everything deeply", emoji: "🎓" },
  { id: "friend",   name: "The Friend",  desc: "Casual, fun, conversational",         emoji: "👋" },
  { id: "expert",   name: "The Expert",  desc: "Sharp, technical, no fluff",          emoji: "⚡" },
  { id: "creative", name: "The Creator", desc: "Imaginative, artistic, inspiring",    emoji: "🎨" },
];

const ACCENT_COLORS = [
  { name: "Purple",  value: "#a370f7" },
  { name: "Pink",    value: "#f067a6" },
  { name: "Teal",    value: "#22d3a5" },
  { name: "Blue",    value: "#60a5fa" },
  { name: "Orange",  value: "#fb923c" },
  { name: "Red",     value: "#f87171" },
];

const DEFAULTS = {
  aiName:       "ScaleGPT",
  persona:      "default",
  tone:         "Friendly",
  language:     "English",
  fontSize:     "Default",
  accentColor:  "#a370f7",
  memoryOn:     true,
  streamOn:     true,
  compactMode:  false,
  systemPrompt: "",
};

export default function Personalization() {
  const navigate   = useNavigate();
  const { user, logout } = useAppContext();
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("scalegpt_settings");
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });
  const [saved, setSaved] = useState(false);

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  function update(key, val) {
    setSettings(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem("scalegpt_settings", JSON.stringify(settings));
    setSaved(true);
    toast.success("Settings saved!");
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setSettings(DEFAULTS);
    localStorage.setItem("scalegpt_settings", JSON.stringify(DEFAULTS));
    toast.success("Settings reset to default!");
  }

  const Section = ({ title, children }) => (
    <div style={{
      background: "#0c0c1a",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, padding: "24px",
      marginBottom: 16,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: "#5a5a7a",
        letterSpacing: "1.2px", textTransform: "uppercase",
        marginBottom: 18,
      }}>{title}</div>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0ff", marginBottom: 2 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "#5a5a7a" }}>{desc}</div>}
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, cursor: "pointer",
          background: value
            ? "linear-gradient(135deg,#7b5ea7,#f067a6)"
            : "rgba(255,255,255,0.08)",
          position: "relative", transition: "all .3s",
          flexShrink: 0, marginLeft: 16,
          border: value ? "none" : "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{
          position: "absolute", top: 3,
          left: value ? 22 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff",
          transition: "left .3s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}/>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#06060e",
      fontFamily: "'Outfit', sans-serif", color: "#f0f0ff",
      overflowY: "auto", overflowX: "hidden",
    }}>

      {/* Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(6,6,14,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#13131f", border: "1px solid rgba(255,255,255,0.08)",
              color: "#9090b0", borderRadius: 8,
              fontSize: 12, padding: "6px 12px", cursor: "pointer",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#f0f0ff"}
            onMouseLeave={e => e.currentTarget.style.color = "#9090b0"}
          >← Back</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.5px" }}>Personalization</div>
            <div style={{ fontSize: 11, color: "#5a5a7a" }}>Customize your ScaleGPT experience</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleReset}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#9090b0", borderRadius: 8,
              fontSize: 12, padding: "8px 14px", cursor: "pointer",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#f0f0ff"}
            onMouseLeave={e => e.currentTarget.style.color = "#9090b0"}
          >Reset</button>
          <button
            onClick={handleSave}
            style={{
              background: saved
                ? "linear-gradient(135deg,#22d3a5,#22d3a5)"
                : "linear-gradient(135deg,#7b5ea7,#f067a6)",
              border: "none", color: "#fff", borderRadius: 8,
              fontSize: 12, fontWeight: 700,
              padding: "8px 20px", cursor: "pointer",
              transition: "all .3s",
            }}
          >{saved ? "✓ Saved" : "Save Changes"}</button>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Profile card */}
        <div style={{
          background: "linear-gradient(135deg,rgba(123,94,167,0.15),rgba(240,103,166,0.08))",
          border: "1px solid rgba(163,112,247,0.2)",
          borderRadius: 16, padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 16,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(135deg,#7b5ea7,#f067a6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0ff" }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: "#5a5a7a" }}>{user?.email}</div>
          </div>
          <div style={{
            fontSize: 11, padding: "4px 10px", borderRadius: 20,
            background: "rgba(163,112,247,0.15)",
            border: "1px solid rgba(163,112,247,0.3)",
            color: "#a370f7", fontWeight: 700,
          }}>Free Plan</div>
        </div>

        {/* AI Persona */}
        <Section title="AI Persona">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
            {AI_PERSONAS.map(p => (
              <div
                key={p.id}
                onClick={() => update("persona", p.id)}
                style={{
                  padding: "14px", borderRadius: 12, cursor: "pointer",
                  background: settings.persona === p.id
                    ? "rgba(163,112,247,0.12)" : "rgba(255,255,255,0.02)",
                  border: settings.persona === p.id
                    ? "1px solid rgba(163,112,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  transition: "all .2s",
                }}
                onMouseEnter={e => {
                  if (settings.persona !== p.id)
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={e => {
                  if (settings.persona !== p.id)
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{p.emoji}</div>
                <div style={{
                  fontSize: 13, fontWeight: 700, marginBottom: 3,
                  color: settings.persona === p.id ? "#a370f7" : "#f0f0ff",
                }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#5a5a7a", lineHeight: 1.4 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Custom AI name */}
        <Section title="Custom AI Name">
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "#9090b0", marginBottom: 10 }}>
              Give your AI assistant a custom name
            </div>
            <input
              value={settings.aiName}
              onChange={e => update("aiName", e.target.value)}
              placeholder="e.g. Aria, Max, Nova..."
              style={{
                width: "100%", background: "#13131f",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, color: "#f0f0ff", fontSize: 14,
                padding: "11px 14px", outline: "none",
                fontFamily: "'Outfit', sans-serif",
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(163,112,247,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>
        </Section>

        {/* Response Tone */}
        <Section title="Response Tone">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TONES.map(t => (
              <button
                key={t}
                onClick={() => update("tone", t)}
                style={{
                  padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                  fontSize: 12, fontWeight: 500, transition: "all .2s",
                  background: settings.tone === t
                    ? "rgba(163,112,247,0.15)" : "#13131f",
                  border: settings.tone === t
                    ? "1px solid rgba(163,112,247,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  color: settings.tone === t ? "#a370f7" : "#9090b0",
                }}
              >{t}</button>
            ))}
          </div>
        </Section>

        {/* Language */}
        <Section title="Language">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LANGUAGES.map(l => (
              <button
                key={l}
                onClick={() => update("language", l)}
                style={{
                  padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                  fontSize: 12, fontWeight: 500, transition: "all .2s",
                  background: settings.language === l
                    ? "rgba(163,112,247,0.15)" : "#13131f",
                  border: settings.language === l
                    ? "1px solid rgba(163,112,247,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  color: settings.language === l ? "#a370f7" : "#9090b0",
                }}
              >{l}</button>
            ))}
          </div>
        </Section>

        {/* Accent Color */}
        <Section title="Accent Color">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ACCENT_COLORS.map(c => (
              <div
                key={c.value}
                onClick={() => update("accentColor", c.value)}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 6, cursor: "pointer",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: c.value,
                  border: settings.accentColor === c.value
                    ? "3px solid #fff" : "3px solid transparent",
                  boxShadow: settings.accentColor === c.value
                    ? `0 0 12px ${c.value}` : "none",
                  transition: "all .2s",
                }}/>
                <span style={{ fontSize: 10, color: "#5a5a7a" }}>{c.name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Font Size */}
        <Section title="Chat Font Size">
          <div style={{ display: "flex", gap: 8 }}>
            {FONT_SIZES.map(f => (
              <button
                key={f}
                onClick={() => update("fontSize", f)}
                style={{
                  padding: "8px 20px", borderRadius: 20, cursor: "pointer",
                  fontSize: f === "Small" ? 11 : f === "Large" ? 15 : 13,
                  fontWeight: 500, transition: "all .2s",
                  background: settings.fontSize === f
                    ? "rgba(163,112,247,0.15)" : "#13131f",
                  border: settings.fontSize === f
                    ? "1px solid rgba(163,112,247,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  color: settings.fontSize === f ? "#a370f7" : "#9090b0",
                }}
              >{f}</button>
            ))}
          </div>
        </Section>

        {/* Custom System Prompt */}
        <Section title="Custom System Prompt">
          <div style={{ fontSize: 12, color: "#9090b0", marginBottom: 10 }}>
            Give the AI specific instructions it follows in every conversation
          </div>
          <textarea
            value={settings.systemPrompt}
            onChange={e => update("systemPrompt", e.target.value)}
            placeholder="e.g. Always respond in bullet points. Be concise. Never use jargon."
            rows={4}
            style={{
              width: "100%", background: "#13131f",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, color: "#f0f0ff", fontSize: 13,
              padding: "12px 14px", outline: "none",
              fontFamily: "'Outfit', sans-serif",
              resize: "vertical", lineHeight: 1.6,
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(163,112,247,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
        </Section>

        {/* Preferences toggles */}
        <Section title="Preferences">
          <Toggle
            label="Memory"
            desc="Remember context across conversations"
            value={settings.memoryOn}
            onChange={v => update("memoryOn", v)}
          />
          <Toggle
            label="Streaming Responses"
            desc="Show responses word by word as they generate"
            value={settings.streamOn}
            onChange={v => update("streamOn", v)}
          />
          <Toggle
            label="Compact Mode"
            desc="Reduce spacing for a denser chat view"
            value={settings.compactMode}
            onChange={v => update("compactMode", v)}
          />
        </Section>

        {/* Danger zone */}
        <Section title="Account">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => { navigate("/pricing"); }}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: "linear-gradient(135deg,#7b5ea7,#f067a6)",
                border: "none", color: "#fff", fontSize: 12,
                fontWeight: 700, cursor: "pointer",
              }}
            >⚡ Upgrade to Pro</button>
            <button
              onClick={() => { logout(); }}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: "transparent",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "#f87171", fontSize: 12,
                fontWeight: 600, cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >Log Out</button>
          </div>
        </Section>

      </div>
    </div>
  );
}