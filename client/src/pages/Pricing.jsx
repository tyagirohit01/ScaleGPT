import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const ptsRef    = useRef([]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; spawn(); }
    function spawn() {
      ptsRef.current = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.4, vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35, a: Math.random() * 0.6 + 0.15,
        pulse: Math.random() * Math.PI * 2,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = ptsRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 90) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(163,112,247,${0.12*(1-d/90)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        p.pulse += 0.018;
        const a = p.a * (0.55 + 0.45 * Math.sin(p.pulse));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = Math.sin(p.pulse) > 0 ? `rgba(163,112,247,${a})` : `rgba(240,103,166,${a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      rafRef.current = requestAnimationFrame(draw);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas); resize(); draw();
    return () => { ro.disconnect(); cancelAnimationFrame(rafRef.current); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}/>;
}

const PLANS = [
  {
    id: "free", name: "Free", price: 0, tagline: "Start exploring",
    emoji: "🌱", color: "#9090b0", glow: "rgba(144,144,176,0.3)",
    grad: "linear-gradient(135deg,#2a2a3f,#1a1a2e)",
    features: ["20 messages / day","Basic AI model","Limited chat history","Community support"],
  },
  {
    id: "starter", name: "Beginner", price: 9, tagline: "Best for learners",
    emoji: "⚡", popular: true, color: "#a370f7", glow: "rgba(163,112,247,0.4)",
    grad: "linear-gradient(135deg,#3d2a6e,#1e1040)",
    features: ["Unlimited chats","Faster responses","Full chat history","Prompt library","Email support"],
  },
  {
    id: "pro", name: "Advanced", price: 19, tagline: "Power users & devs",
    emoji: "🚀", color: "#f067a6", glow: "rgba(240,103,166,0.4)",
    grad: "linear-gradient(135deg,#5a1a3a,#1e1040)",
    features: ["GPT-4 class model","File uploads","Image generation","Priority GPU access","Long-term memory","API access"],
  },
  {
    id: "enterprise", name: "Enterprise", price: null, tagline: "Teams & companies",
    emoji: "🏢", color: "#22d3a5", glow: "rgba(34,211,165,0.35)",
    grad: "linear-gradient(135deg,#0d3d2e,#0a1a14)",
    features: ["Custom AI models","Dedicated infrastructure","Team workspace","SSO & SAML","SLA support","Custom integrations"],
  },
];

export default function Pricing() {
  const [selected, setSelected]   = useState(PLANS[1]);
  const [prev, setPrev]           = useState(null);
  const [animating, setAnimating] = useState(false);
  const navigate                  = useNavigate();

  function select(plan) {
    if (plan.id === selected.id || animating) return;
    setPrev(selected);
    setAnimating(true);
    setTimeout(() => {
      setSelected(plan);
      setTimeout(() => { setAnimating(false); setPrev(null); }, 400);
    }, 180);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#06060e",
      fontFamily: "'Outfit', sans-serif", color: "#f0f0ff",
      position: "relative", overflow: "hidden",
    }}>
      <ParticleCanvas />

      {/* Orbs */}
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", top:-200, left:-150, pointerEvents:"none", background:"radial-gradient(circle,rgba(123,94,167,0.12) 0%,transparent 70%)" }}/>
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", bottom:-100, right:0, pointerEvents:"none", background:"radial-gradient(circle,rgba(240,103,166,0.08) 0%,transparent 70%)" }}/>

      {/* Nav */}
      <div style={{ position:"relative", zIndex:2, padding:"20px 32px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => navigate("/")}
          style={{ background:"#13131f", border:"1px solid rgba(255,255,255,0.08)", color:"#9090b0", fontFamily:"'Outfit',sans-serif", fontSize:12, padding:"7px 14px", borderRadius:8, cursor:"pointer", transition:"all .2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(163,112,247,0.4)"; e.currentTarget.style.color="#f0f0ff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="#9090b0"; }}
        >← Back</button>
        <div style={{ fontSize:10, color:"#5a5a7a", letterSpacing:"1px", textTransform:"uppercase", fontWeight:600 }}>
          🔒 Secure payments · Cancel anytime
        </div>
      </div>

      {/* Hero */}
      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"44px 24px 52px", animation:"pRise .8s cubic-bezier(.16,1,.3,1) both" }}>
        <div style={{
          fontSize:58, fontWeight:900, letterSpacing:"-3.5px", lineHeight:1, marginBottom:10,
          background:"linear-gradient(135deg,#ffffff 0%,#c9a8ff 45%,#f067a6 85%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
        }}>scale</div>
        <div style={{ fontSize:22, fontWeight:700, color:"#f0f0ff", letterSpacing:"-0.5px", marginBottom:6 }}>
          Choose your plan
        </div>
        <div style={{ fontSize:13, color:"#5a5a7a" }}>
          Simple pricing that grows with you
        </div>
      </div>

      {/* Cards grid */}
      <div style={{
        position:"relative", zIndex:2,
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
        gap:16, padding:"0 32px 80px",
        maxWidth:1060, margin:"0 auto",
      }}>
        {PLANS.map((plan, i) => {
          const isSelected = selected.id === plan.id;
          const isPrev     = prev?.id === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => select(plan)}
              style={{
                background: isSelected ? plan.grad : "rgba(255,255,255,0.02)",
                border: `1px solid ${isSelected ? plan.color + "60" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 20,
                padding: "28px 24px",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s, border-color .3s, background .3s",
                transform: isSelected ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: isSelected ? `0 20px 60px ${plan.glow}, 0 0 0 1px ${plan.color}30` : "none",
                animation: `pRise .6s ${0.1 + i * 0.08}s cubic-bezier(.16,1,.3,1) both`,
              }}
              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = plan.color + "40"; }}}
              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}}
            >
              {/* Glow blob */}
              {isSelected && (
                <div style={{
                  position:"absolute", top:-40, right:-40, width:150, height:150,
                  borderRadius:"50%", background:`radial-gradient(circle,${plan.glow} 0%,transparent 70%)`,
                  pointerEvents:"none",
                }}/>
              )}

              {/* Popular badge */}
              {plan.popular && (
                <div style={{
                  position:"absolute", top:14, right:14,
                  fontSize:9, padding:"3px 8px", borderRadius:20, fontWeight:700,
                  background:"rgba(163,112,247,0.2)", border:"1px solid rgba(163,112,247,0.4)",
                  color:"#a370f7", letterSpacing:"0.5px",
                }}>POPULAR</div>
              )}

              {/* Emoji icon */}
              <div style={{
                width:46, height:46, borderRadius:14, marginBottom:16,
                background: isSelected ? `${plan.color}20` : "rgba(255,255,255,0.05)",
                border: `1px solid ${isSelected ? plan.color + "40" : "rgba(255,255,255,0.08)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22, transition:"all .3s",
              }}>{plan.emoji}</div>

              {/* Plan name */}
              <div style={{
                fontSize:17, fontWeight:800, marginBottom:4, letterSpacing:"-0.3px",
                color: isSelected ? plan.color : "#f0f0ff",
                transition:"color .3s",
              }}>{plan.name}</div>
              <div style={{ fontSize:11, color:"#5a5a7a", marginBottom:20 }}>{plan.tagline}</div>

              {/* Price */}
              {plan.price !== null ? (
                <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:20 }}>
                  <span style={{
                    fontSize:36, fontWeight:900, letterSpacing:"-1.5px",
                    color: isSelected ? plan.color : "#f0f0ff",
                    transition:"color .3s",
                  }}>${plan.price}</span>
                  <span style={{ fontSize:11, color:"#5a5a7a" }}>/mo</span>
                </div>
              ) : (
                <div style={{ fontSize:20, fontWeight:800, color: isSelected ? plan.color : "#f0f0ff", marginBottom:20, transition:"color .3s" }}>
                  Custom
                </div>
              )}

              {/* Features */}
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{
                      width:16, height:16, borderRadius:"50%", flexShrink:0,
                      background: isSelected ? `${plan.color}20` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isSelected ? plan.color + "50" : "rgba(255,255,255,0.1)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:9, color: isSelected ? plan.color : "#5a5a7a",
                      transition:"all .3s",
                    }}>✓</div>
                    <span style={{ fontSize:12, color: isSelected ? "#d0d0e8" : "#6a6a8a", transition:"color .3s" }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={e => { e.stopPropagation(); select(plan); }}
                style={{
                  width:"100%", padding:"11px 0", borderRadius:10, border:"none",
                  background: isSelected
                    ? `linear-gradient(135deg,${plan.color},${plan.id==="enterprise"?"#22d3a5":"#f067a6"})`
                    : "rgba(255,255,255,0.06)",
                  color: isSelected ? "#fff" : "#5a5a7a",
                  fontSize:12, fontWeight:700,
                  fontFamily:"'Outfit',sans-serif",
                  cursor:"pointer", transition:"all .3s",
                  letterSpacing:"0.3px",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity=".88"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}
              >
                {plan.price === 0 ? "Start Free →" : plan.price !== null ? "Upgrade →" : "Contact Sales →"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom comparison note */}
      <div style={{
        position:"relative", zIndex:2,
        textAlign:"center", paddingBottom:40,
        animation:"pRise .8s .5s cubic-bezier(.16,1,.3,1) both",
      }}>
        <div style={{ fontSize:12, color:"#5a5a7a" }}>
          All plans include · SSL encryption · 99.9% uptime · GDPR compliant
        </div>
      </div>

      <style>{`
        @keyframes pRise {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}