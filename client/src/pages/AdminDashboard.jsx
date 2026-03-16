import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

// ── Particle canvas (same as HeroView) ──────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const ptsRef    = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      spawn();
    }
    function spawn() {
      ptsRef.current = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.4,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        a: Math.random() * 0.65 + 0.15,
        pulse: Math.random() * Math.PI * 2,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = ptsRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 95) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(163,112,247,${0.13 * (1 - d / 95)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        p.pulse += 0.018;
        const a = p.a * (0.55 + 0.45 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = Math.sin(p.pulse) > 0
          ? `rgba(163,112,247,${a})`
          : `rgba(240,103,166,${a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      rafRef.current = requestAnimationFrame(draw);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();
    return () => { ro.disconnect(); cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0,
      width: "100%", height: "100%",
      pointerEvents: "none",
    }}/>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, grad, delay }) => (
  <div
    style={{
      background: "linear-gradient(135deg,rgba(123,94,167,0.12),rgba(240,103,166,0.08))",
      border: "1px solid rgba(163,112,247,0.2)",
      borderRadius: 14, padding: "20px 22px",
      display: "flex", alignItems: "center", gap: 14,
      animation: `fadeUp 0.5s ease ${delay} both`,
      transition: "border-color .2s, transform .2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(163,112,247,0.45)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(163,112,247,0.2)";  e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{
      width: 46, height: 46, borderRadius: 12, flexShrink: 0,
      background: grad, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 20,
    }}>{icon}</div>
    <div>
      <div style={{
        fontSize: 10, color: "#5a5a7a", letterSpacing: "1px",
        textTransform: "uppercase", fontWeight: 700, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: 26, fontWeight: 800, color: "#f0f0ff",
        letterSpacing: "-0.02em", fontFamily: "'Outfit', sans-serif",
      }}>{value ?? 0}</div>
    </div>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, token } = useAppContext();
  const navigate = useNavigate();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user && !user.isAdmin) navigate("/");
  }, [user]);

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error("Dashboard error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#06060e", fontFamily: "'Outfit', sans-serif", gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "3px solid rgba(163,112,247,0.2)",
        borderTopColor: "#a370f7",
        animation: "spin 0.8s linear infinite",
      }}/>
      <p style={{ fontSize: 14, color: "#5a5a7a" }}>Loading dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#06060e",
      color: "#5a5a7a", fontFamily: "'Outfit', sans-serif",
    }}>No data found</div>
  );

  const totals = data.totals[0] || {};

  const cardStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: 24,
    animation: "fadeUp 0.5s ease both",
  };

  const tooltipStyle = {
    background: "#13131f",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, fontFamily: "'Outfit', sans-serif", color: "#f0f0ff",
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes heroRise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .dash-table th {
          text-align: left; padding: 10px 16px; color: #5a5a7a;
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-family: 'Outfit', sans-serif;
        }
        .dash-table td {
          padding: 13px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: #9090b0; font-family: 'Outfit', sans-serif;
        }
        .dash-table tr:hover td { background: rgba(255,255,255,0.02); }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line { stroke: rgba(255,255,255,0.05); }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#06060e",
        color: "#f0f0ff", fontFamily: "'Outfit', sans-serif",
      }}>

        {/* ── HERO HEADER with particles ── */}
        <div style={{
          position: "relative", overflow: "hidden",
          height: 220, display: "flex",
          flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <ParticleCanvas />

          {/* Back button top-left */}
          <button
            onClick={() => navigate("/")}
            style={{
              position: "absolute", top: 18, left: 24, zIndex: 2,
              background: "#13131f",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#9090b0", fontFamily: "'Outfit', sans-serif",
              fontSize: 12, padding: "7px 14px", borderRadius: 8,
              cursor: "pointer", transition: "all .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(163,112,247,0.4)"; e.currentTarget.style.color = "#f0f0ff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#9090b0"; }}
          >← Back</button>

          {/* Big wordmark — same as chatbox hero */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 6,
          }}>
            <h1 style={{
              fontSize: 64, fontWeight: 900, letterSpacing: "-4px",
              lineHeight: 1, margin: 0,
              background: "linear-gradient(135deg,#ffffff 0%,#c9a8ff 45%,#f067a6 85%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "heroRise .8s cubic-bezier(.16,1,.3,1) both",
            }}>scale</h1>
            <span style={{
              fontSize: 12, color: "#5a5a7a", letterSpacing: "3px",
              textTransform: "uppercase", fontWeight: 600,
              animation: "heroRise .8s .1s cubic-bezier(.16,1,.3,1) both",
            }}>Admin Dashboard</span>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <main style={{ padding: "32px 40px", maxWidth: 1300, margin: "0 auto" }}>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, padding: 4,
            width: "fit-content", marginBottom: 28,
          }}>
            {["overview", "users", "routes"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "7px 18px", borderRadius: 7, cursor: "pointer",
                border: activeTab === tab
                  ? "1px solid rgba(163,112,247,0.35)"
                  : "1px solid transparent",
                background: activeTab === tab
                  ? "rgba(123,94,167,0.15)"
                  : "transparent",
                color: activeTab === tab ? "#a370f7" : "#5a5a7a",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12, fontWeight: 600,
                transition: "all .2s", textTransform: "capitalize",
              }}>{tab}</button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                gap: 14, marginBottom: 24,
              }}>
                <StatCard label="Total Requests" value={totals.total_requests} icon="⚡" grad="linear-gradient(135deg,#7b5ea7,#a370f7)" delay="0s"/>
                <StatCard label="Unique Users"   value={totals.unique_users}   icon="👥" grad="linear-gradient(135deg,#0f6e56,#22d3a5)" delay="0.05s"/>
                <StatCard label="Chats Created"  value={totals.total_chats}    icon="💬" grad="linear-gradient(135deg,#854f0b,#f5a623)" delay="0.1s"/>
                <StatCard label="Messages Sent"  value={totals.total_messages} icon="📨" grad="linear-gradient(135deg,#993556,#f067a6)" delay="0.15s"/>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 20,
                      background: "rgba(163,112,247,0.12)",
                      border: "1px solid rgba(163,112,247,0.25)",
                      color: "#a370f7", fontWeight: 700,
                      letterSpacing: "0.5px", textTransform: "uppercase",
                    }}>Live</span>
                    Daily Activity
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis dataKey="_id" tick={{ fill: "#5a5a7a", fontSize: 11, fontFamily: "Outfit" }}/>
                      <YAxis tick={{ fill: "#5a5a7a", fontSize: 11, fontFamily: "Outfit" }}/>
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#f0f0ff" }}/>
                      <Legend wrapperStyle={{ fontFamily: "Outfit", fontSize: 12 }}/>
                      <Line type="monotone" dataKey="requests" stroke="#a370f7" strokeWidth={2} dot={{ r: 3, fill: "#a370f7" }}/>
                      <Line type="monotone" dataKey="chats"    stroke="#22d3a5" strokeWidth={2} dot={{ r: 3, fill: "#22d3a5" }}/>
                      <Line type="monotone" dataKey="messages" stroke="#f067a6" strokeWidth={2} dot={{ r: 3, fill: "#f067a6" }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff", marginBottom: 20 }}>Top Routes</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.routeStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis type="number" tick={{ fill: "#5a5a7a", fontSize: 11, fontFamily: "Outfit" }}/>
                      <YAxis dataKey="_id" type="category" tick={{ fill: "#9090b0", fontSize: 11, fontFamily: "Outfit" }} width={160}/>
                      <Tooltip contentStyle={tooltipStyle}/>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#7b5ea7"/>
                          <stop offset="100%" stopColor="#f067a6"/>
                        </linearGradient>
                      </defs>
                      <Bar dataKey="total" fill="url(#barGrad)" radius={[0, 6, 6, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <div style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff", marginBottom: 20 }}>User Activity</div>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>User ID</th><th>Requests</th><th>Chats</th><th>Messages</th><th>Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.userStats.map((u, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "Space Mono,monospace", fontSize: 11, color: "#5a5a7a" }}>{u._id}</td>
                      <td><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(163,112,247,0.12)", color: "#a370f7" }}>{u.total_requests}</span></td>
                      <td><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(34,211,165,0.1)", color: "#22d3a5" }}>{u.total_chats}</span></td>
                      <td><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(240,103,166,0.1)", color: "#f067a6" }}>{u.total_messages}</span></td>
                      <td style={{ fontFamily: "Space Mono,monospace", fontSize: 11, color: "#5a5a7a" }}>{u.last_seen ? new Date(u.last_seen).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ROUTES ── */}
          {activeTab === "routes" && (
            <div style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff", marginBottom: 20 }}>All Routes</div>
              <table className="dash-table">
                <thead>
                  <tr><th>Route</th><th>Total Hits</th></tr>
                </thead>
                <tbody>
                  {data.routeStats.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "Space Mono,monospace", fontSize: 11, color: "#5a5a7a" }}>{r._id}</td>
                      <td><span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "rgba(163,112,247,0.12)", color: "#a370f7" }}>{r.total}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default AdminDashboard;