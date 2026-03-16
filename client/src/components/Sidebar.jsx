import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";

const MODELS = [
  { id: "fast",     label: "Scale Fast",     sub: "GPT-4o · Fast" },
  { id: "pro",      label: "Scale Pro",       sub: "Claude 3.5 · Smart" },
  { id: "research", label: "Scale Research",  sub: "o3 · Deep" },
  { id: "vision",   label: "Scale Vision",    sub: "GPT-4V · Visual" },
];

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const {
    chats, user, createNewChat, deleteChat, renameChat,
    selectedChat, setSelectedChat, logout,
    setShowHero,
  } = useAppContext();

  const [activeModel, setActiveModel] = useState(MODELS[0]);
  const [search, setSearch]           = useState("");
  const [menuOpen, setMenuOpen]       = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [renamingId, setRenamingId]   = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const menuRef    = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1);
  const week  = new Date(today); week.setDate(week.getDate() - 7);

  const bucket = (chat) => {
    const d = new Date(chat.updatedAt);
    if (d >= today) return "Today";
    if (d >= yest)  return "Yesterday";
    if (d >= week)  return "This week";
    return "Older";
  };

  const filtered = (chats || []).filter((c) => {
    const msg  = c.messages?.[0]?.content?.toLowerCase() || "";
    const name = c.name?.toLowerCase() || "";
    return msg.includes(search.toLowerCase()) || name.includes(search.toLowerCase());
  });

  const GROUPS  = ["Today", "Yesterday", "This week", "Older"];
  const grouped = GROUPS.reduce((acc, g) => {
    acc[g] = filtered.filter(c => bucket(c) === g);
    return acc;
  }, {});

  const submitRename = (chatId) => {
    if (renameValue.trim()) renameChat(chatId, renameValue.trim());
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <aside style={{
      width: 242, minWidth: 242, maxWidth: 242,
      height: "100%",
      display: "flex", flexDirection: "column",
      background: "#0c0c1a",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      overflow: "hidden", flexShrink: 0, position: "relative",
      fontFamily: "'Outfit', sans-serif",
    }}>

      {/* ── LOGO + NEW CHAT ── */}
      <div style={{
        padding: "16px 14px 13px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0, background: "#0c0c1a",
      }}>
        {/* Logo row with close button on mobile */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 13,
        }}>
          <div
            onClick={() => {
              setShowHero(true);
              setSelectedChat(null);
              navigate("/");
              onClose?.();
            }}
            style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg,#7b5ea7,#f067a6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 900, color: "#fff",
            }}>S</div>
            <span style={{
              fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px",
              background: "linear-gradient(90deg,#c9a8ff,#f067a6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>ScaleGPT</span>
            <span style={{
              fontSize: 9, padding: "2px 6px", borderRadius: 20, fontWeight: 700,
              background: "rgba(163,112,247,0.15)",
              border: "1px solid rgba(163,112,247,0.35)",
              color: "#a370f7", flexShrink: 0,
            }}>BETA</span>
          </div>

          {/* ── CLOSE BUTTON — mobile only ── */}
          <button
            onClick={onClose}
            className="md:hidden"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, color: "#9090b0",
              width: 30, height: 30, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14,
              transition: "all .2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#f0f0ff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#9090b0";
            }}
          >✕</button>
        </div>

        <button
          onClick={() => {
            if (!user) { navigate("/login"); return; }
            setShowHero(true);
            createNewChat();
            onClose?.();
          }}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 10,
            background: "linear-gradient(135deg,#7b5ea7,#f067a6)",
            border: "none", color: "#fff", fontSize: 13,
            fontWeight: 600, cursor: "pointer",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = ".85"}
          onMouseOut={e  => e.currentTarget.style.opacity = "1"}
        >+ New conversation</button>
      </div>

      {/* ── MODEL SELECTOR ── */}
      <div style={{
        padding: "10px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 10, color: "#5a5a7a", letterSpacing: "1.2px",
          textTransform: "uppercase", fontWeight: 700, marginBottom: 7,
        }}>Active model</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "#13131f", border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 9, padding: "8px 10px",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: "#22d3a5",
            flexShrink: 0, display: "block",
            boxShadow: "0 0 6px rgba(34,211,165,0.6)",
          }}/>
          <select
            value={activeModel.id}
            onChange={e => setActiveModel(MODELS.find(m => m.id === e.target.value))}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#f0f0ff", fontSize: 12, fontWeight: 600,
              outline: "none", appearance: "none", cursor: "pointer", minWidth: 0,
            }}
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}
                style={{ background: "#13131f", color: "#f0f0ff" }}>
                {m.label}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 10, color: "#5a5a7a", whiteSpace: "nowrap", flexShrink: 0 }}>
            {activeModel.sub}
          </span>
        </div>
      </div>

      {/* ── SEARCH ── */}
      <div style={{
        padding: "8px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div style={{ position: "relative" }}>
          <svg width="12" height="12" fill="none" stroke="#5a5a7a"
            strokeWidth="1.8" strokeLinecap="round"
            style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="5" cy="5" r="4"/><path d="M10 10l-2-2"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            style={{
              width: "100%", background: "#13131f",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8, color: "#f0f0ff", fontSize: 12,
              padding: "7px 10px 7px 28px", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* ── CHAT HISTORY ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {GROUPS.map(g => {
          const items = grouped[g];
          if (!items?.length) return null;
          return (
            <div key={g} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10, color: "#5a5a7a", letterSpacing: "1px",
                textTransform: "uppercase", fontWeight: 700,
                marginBottom: 5, padding: "0 4px",
              }}>{g}</div>

              {items.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => {
                    if (renamingId === chat._id) return;
                    setSelectedChat(chat);
                    setShowHero(false);
                    localStorage.setItem("last_chat_id", chat._id);
                    onClose?.(); // close sidebar on mobile when chat selected
                  }}
                  style={{
                    padding: "7px 8px", borderRadius: 8, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 7,
                    marginBottom: 2, transition: "all .15s",
                    background: selectedChat?._id === chat._id
                      ? "rgba(163,112,247,0.1)" : "transparent",
                    border: selectedChat?._id === chat._id
                      ? "1px solid rgba(163,112,247,0.22)"
                      : "1px solid transparent",
                    position: "relative",
                  }}
                  onMouseEnter={e => {
                    if (selectedChat?._id !== chat._id)
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={e => {
                    if (selectedChat?._id !== chat._id)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Active dot */}
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "#a370f7", flexShrink: 0, display: "block",
                    opacity: selectedChat?._id === chat._id ? 1 : 0,
                    transition: "opacity .2s",
                  }}/>

                  {/* Inline rename OR title */}
                  {renamingId === chat._id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") submitRename(chat._id);
                        if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
                      }}
                      onBlur={() => submitRename(chat._id)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        flex: 1, background: "#1e1e32",
                        border: "1px solid rgba(165,112,247,0.4)",
                        borderRadius: 5, color: "#f0f0ff",
                        fontSize: 12, padding: "2px 6px",
                        outline: "none", fontFamily: "'Outfit', sans-serif",
                        minWidth: 0,
                      }}
                    />
                  ) : (
                    <span style={{
                      fontSize: 12, flex: 1, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                      color: selectedChat?._id === chat._id ? "#f0f0ff" : "#9090b0",
                    }}>
                      {chat.name && chat.name !== "New chat"
                        ? chat.name
                        : chat.messages?.[0]?.content?.slice(0, 28) || "New Chat"}
                    </span>
                  )}

                  {/* 3-dot trigger */}
                  <span
                    onClick={e => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === chat._id ? null : chat._id);
                    }}
                    style={{
                      color: "#5a5a7a", cursor: "pointer", fontSize: 15,
                      lineHeight: 1, flexShrink: 0, padding: "0 2px",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f0f0ff"}
                    onMouseLeave={e => e.currentTarget.style.color = "#5a5a7a"}
                  >⋮</span>

                  {/* Dropdown */}
                  {menuOpen === chat._id && (
                    <div ref={menuRef} style={{
                      position: "absolute", right: 4, top: 30, zIndex: 50,
                      background: "#13131f",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 9, overflow: "hidden", width: 110,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setRenameValue(chat.name || "");
                          setRenamingId(chat._id);
                          setMenuOpen(null);
                        }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "8px 12px", fontSize: 12, color: "#9090b0",
                          background: "none", border: "none", cursor: "pointer",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >✏️ Rename</button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteChat(chat._id);
                          setMenuOpen(null);
                        }}
                        style={{
                          display: "block", width: "100%", textAlign: "left",
                          padding: "8px 12px", fontSize: 12, color: "#f87171",
                          background: "none", border: "none", cursor: "pointer",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >🗑️ Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "28px 0",
            color: "#5a5a7a", fontSize: 12, lineHeight: 1.6,
          }}>
            No conversations yet.<br/>
            <span style={{ fontSize: 11 }}>Start a new chat above.</span>
          </div>
        )}
      </div>

      {/* ── ADMIN ── */}
      {user?.isAdmin && (
        <div style={{ padding: "0 10px 6px", flexShrink: 0 }}>
          <div
            onClick={() => { navigate("/admin"); onClose?.(); }}
            style={{
              background: "linear-gradient(135deg,rgba(123,94,167,0.18),rgba(163,112,247,0.12))",
              border: "1px solid rgba(163,112,247,0.25)",
              borderRadius: 11, padding: "8px 12px", cursor: "pointer",
              transition: "border-color .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(163,112,247,0.5)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(163,112,247,0.25)"}
          >
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 2,
            }}>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: "linear-gradient(90deg,#a370f7,#c9a8ff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Analytics Dashboard</span>
              <span style={{ fontSize: 14 }}>📊</span>
            </div>
            <div style={{ fontSize: 10, color: "#5a5a7a", lineHeight: 1.45 }}>
              Monitor users & usage in real time
            </div>
          </div>
        </div>
      )}

      {/* ── UPGRADE CARD ── */}
      <div style={{ padding: "0 10px 6px", flexShrink: 0 }}>
        <div
          onClick={() => { navigate("/pricing"); onClose?.(); }}
          style={{
            background: "linear-gradient(135deg,rgba(123,94,167,0.18),rgba(240,103,166,0.12))",
            border: "1px solid rgba(163,112,247,0.25)",
            borderRadius: 11, padding: "8px 12px", cursor: "pointer",
            transition: "border-color .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(163,112,247,0.5)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(163,112,247,0.25)"}
        >
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 2,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 700,
              background: "linear-gradient(90deg,#a370f7,#f067a6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Upgrade to Scale Pro</span>
            <span style={{ fontSize: 14 }}>⚡</span>
          </div>
          <div style={{ fontSize: 10, color: "#5a5a7a", lineHeight: 1.3 }}>
            Unlimited context · Priority GPU
          </div>
        </div>
      </div>

      {/* ── PROFILE ── */}
      <div ref={profileRef} style={{
        padding: "10px 12px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 9,
            padding: "7px 8px", borderRadius: 8,
            background: "none", border: "none", cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#7b5ea7,#f067a6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#fff",
          }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: "#f0f0ff",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user ? user.name : "Sign in / Sign up"}
            </div>
            <div style={{ fontSize: 10, color: "#5a5a7a" }}>
              {user ? "Free plan" : "Get started"}
            </div>
          </div>
          <span style={{ color: "#5a5a7a", fontSize: 14, flexShrink: 0 }}>⚙</span>
        </button>

        {profileOpen && (
          <div style={{
            position: "absolute", bottom: 68, left: 10, right: 10,
            background: "#13131f",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 11, overflow: "hidden",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.5)", zIndex: 50,
          }}>
            <div style={{
              padding: "11px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0ff" }}>
                {user?.name || "Guest"}
              </div>
              <div style={{ fontSize: 11, color: "#5a5a7a" }}>
                {user?.email || "guest@email.com"}
              </div>
            </div>
            {[
              { label: user ? "Personalization" : "Sign In / Sign Up", fn: () => { navigate("/login"); onClose?.(); } },
              { label: "Upgrade Plan", fn: () => { navigate("/pricing"); onClose?.(); } },
            ].map(item => (
              <button key={item.label} onClick={item.fn}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "9px 14px", fontSize: 12, color: "#9090b0",
                  background: "none", border: "none", cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >{item.label}</button>
            ))}
            {user && (
              <button
                onClick={() => { logout(); onClose?.(); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "9px 14px", fontSize: 12, color: "#f87171",
                  background: "none", border: "none", cursor: "pointer",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >Log out</button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}