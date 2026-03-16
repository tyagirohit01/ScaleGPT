import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/Appcontext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const ptsRef    = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      spawn();
    }
    function spawn() {
      ptsRef.current = Array.from({ length: 55 }, () => ({
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
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
    }}/>
  );
}

const Login = () => {
  const [state, setState]       = useState('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState('');
  const { setToken }            = useAppContext();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = state === 'login'
      ? 'https://scalegpt-production-c429.up.railway.app/api/user/login'
      : 'https://scalegpt-production-c429.up.railway.app/api/user/register';
    const payload = state === 'login'
      ? { email, password }
      : { name, email, password };

    try {
      const { data } = await axios.post(url, payload);
      if (!data.success) { toast.error(data.message); return; }
      if (state === 'login') {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        toast.success('Welcome back!');
        navigate('/');
      }
      if (state === 'register') {
        toast.success('Account created! Please log in.');
        setState('login');
        setName(''); setEmail(''); setPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    background: focused === field ? '#1e1e32' : '#13131f',
    border: focused === field
      ? '1px solid rgba(163,112,247,0.5)'
      : '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#f0f0ff',
    fontSize: 13,
    padding: '11px 14px',
    outline: 'none',
    fontFamily: "'Outfit', sans-serif",
    transition: 'all .2s',
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06060e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ParticleCanvas />

      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(123,94,167,0.15) 0%,transparent 70%)',
        top: -150, left: -100, pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(240,103,166,0.1) 0%,transparent 70%)',
        bottom: -100, right: -50, pointerEvents: 'none',
      }}/>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 400,
        margin: '0 16px',
        background: 'rgba(12,12,26,0.85)',
        border: '1px solid rgba(163,112,247,0.2)',
        borderRadius: 20,
        padding: '40px 36px',
        backdropFilter: 'blur(20px)',
        animation: 'loginRise .7s cubic-bezier(.16,1,.3,1) both',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 42, fontWeight: 900, letterSpacing: '-3px',
            lineHeight: 1, marginBottom: 6,
            background: 'linear-gradient(135deg,#ffffff 0%,#c9a8ff 45%,#f067a6 85%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>scale</div>
          <div style={{ fontSize: 13, color: '#5a5a7a', fontWeight: 500 }}>
            {state === 'login' ? 'Welcome back' : 'Create your account'}
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10, padding: 4, marginBottom: 24,
        }}>
          {['login', 'register'].map(tab => (
            <button key={tab} onClick={() => setState(tab)} style={{
              flex: 1, padding: '8px 0', borderRadius: 7,
              border: state === tab
                ? '1px solid rgba(163,112,247,0.35)'
                : '1px solid transparent',
              background: state === tab ? 'rgba(123,94,167,0.15)' : 'transparent',
              color: state === tab ? '#a370f7' : '#5a5a7a',
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all .2s', textTransform: 'capitalize',
            }}>{tab === 'login' ? 'Sign In' : 'Sign Up'}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name — register only */}
          {state === 'register' && (
            <div style={{ animation: 'loginRise .4s ease both' }}>
              <label style={{ fontSize: 11, color: '#5a5a7a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Name
              </label>
              <input
                type="text" required
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
                placeholder=""
                style={inputStyle('name')}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ fontSize: 11, color: '#5a5a7a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              placeholder=""
              style={inputStyle('email')}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 11, color: '#5a5a7a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" required
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              placeholder=""
              style={inputStyle('password')}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 10,
              background: loading
                ? 'rgba(123,94,167,0.4)'
                : 'linear-gradient(135deg,#7b5ea7,#f067a6)',
              border: 'none', color: '#fff',
              fontSize: 13, fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4, transition: 'opacity .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin .7s linear infinite',
                }}/>
                {state === 'login' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : (
              state === 'login' ? 'Sign In →' : 'Create Account →'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#5a5a7a' }}>
          {state === 'login' ? (
            <>Don't have an account?{' '}
              <span onClick={() => setState('register')} style={{ color: '#a370f7', cursor: 'pointer', fontWeight: 600 }}>
                Sign up
              </span>
            </>
          ) : (
            <>Already have an account?{' '}
              <span onClick={() => setState('login')} style={{ color: '#a370f7', cursor: 'pointer', fontWeight: 600 }}>
                Sign in
              </span>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loginRise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;