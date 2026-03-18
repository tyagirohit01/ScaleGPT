import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/Appcontext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const ptsRef    = useRef([]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; spawn(); }
    function spawn() {
      ptsRef.current = Array.from({ length: 55 }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.4, vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38, a: Math.random() * 0.65 + 0.15,
        pulse: Math.random() * Math.PI * 2,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = ptsRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 95) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(163,112,247,${0.13 * (1 - d / 95)})`; ctx.lineWidth = 0.5; ctx.stroke();
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
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}/>;
}

const BASE = 'https://scalegpt-production-c429.up.railway.app';

const Login = () => {
  const [state, setState]         = useState('login');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState('');
  const [searchParams]            = useSearchParams();
  const { loginSuccess }          = useAppContext();
  const navigate                  = useNavigate();

  // ✅ Auto-detect verify-email and reset-password flows from URL
  useEffect(() => {
    const verifyToken = searchParams.get('token');
    const path = window.location.pathname;
    if (path === '/verify-email' && verifyToken) {
      handleVerifyEmail(verifyToken);
    }
    if (path === '/reset-password' && verifyToken) {
      setState('resetPassword');
    }
  }, []);

  const handleVerifyEmail = async (token) => {
    try {
      const { data } = await axios.get(`${BASE}/api/user/verify-email?token=${token}`);
      if (data.success) {
        toast.success('Email verified! You can now log in.');
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Verification failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (state === 'login') {
        const { data } = await axios.post(`${BASE}/api/user/login`, { email, password });
        if (!data.success) { toast.error(data.message); return; }
        loginSuccess(data.token);
        toast.success('Welcome back!');
        navigate('/');
      }

      if (state === 'register') {
        const { data } = await axios.post(`${BASE}/api/user/register`, { name, email, password });
        if (!data.success) { toast.error(data.message); return; }
        toast.success('Account created! Check your email to verify your account.');
        setState('login');
        setName(''); setEmail(''); setPassword('');
      }

      if (state === 'forgotPassword') {
        const { data } = await axios.post(`${BASE}/api/user/forgot-password`, { email });
        toast.success(data.message || 'Reset link sent if email exists.');
        setState('login');
      }

      if (state === 'resetPassword') {
        const token = searchParams.get('token');
        const { data } = await axios.post(`${BASE}/api/user/reset-password`, { token, password: newPassword });
        if (!data.success) { toast.error(data.message); return; }
        toast.success('Password reset! You can now log in.');
        navigate('/login');
        setState('login');
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
    border: focused === field ? '1px solid rgba(163,112,247,0.5)' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, color: '#f0f0ff', fontSize: 16,
    padding: '11px 14px', outline: 'none',
    fontFamily: "'Outfit', sans-serif", transition: 'all .2s',
  });

  const getTitle = () => {
    if (state === 'forgotPassword') return 'Reset your password';
    if (state === 'resetPassword')  return 'Set new password';
    if (state === 'register')       return 'Create your account';
    return 'Welcome back';
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#06060e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      <ParticleCanvas />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,94,167,0.15) 0%,transparent 70%)', top: -150, left: -100, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,103,166,0.1) 0%,transparent 70%)', bottom: -100, right: -50, pointerEvents: 'none' }}/>

      <div style={{
        position: 'relative', zIndex: 2, width: '100%', maxWidth: 400,
        margin: '0 16px', background: 'rgba(12,12,26,0.85)',
        border: '1px solid rgba(163,112,247,0.2)', borderRadius: 20,
        padding: '40px 36px', backdropFilter: 'blur(20px)',
        animation: 'loginRise .7s cubic-bezier(.16,1,.3,1) both',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 42, fontWeight: 900, letterSpacing: '-3px', lineHeight: 1, marginBottom: 6,
            background: 'linear-gradient(135deg,#ffffff 0%,#c9a8ff 45%,#f067a6 85%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>scale</div>
          <div style={{ fontSize: 13, color: '#5a5a7a', fontWeight: 500 }}>{getTitle()}</div>
        </div>

        {/* Toggle — only show for login/register */}
        {(state === 'login' || state === 'register') && (
          <div style={{
            display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4, marginBottom: 24,
          }}>
            {['login', 'register'].map(tab => (
              <button key={tab} onClick={() => setState(tab)} style={{
                flex: 1, padding: '8px 0', borderRadius: 7,
                border: state === tab ? '1px solid rgba(163,112,247,0.35)' : '1px solid transparent',
                background: state === tab ? 'rgba(123,94,167,0.15)' : 'transparent',
                color: state === tab ? '#a370f7' : '#5a5a7a',
                fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all .2s',
              }}>{tab === 'login' ? 'Sign In' : 'Sign Up'}</button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name — register only */}
          {state === 'register' && (
            <div style={{ animation: 'loginRise .4s ease both' }}>
              <label style={{ fontSize: 11, color: '#5a5a7a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')} style={inputStyle('name')} />
            </div>
          )}

          {/* Email */}
          {state !== 'resetPassword' && (
            <div>
              <label style={{ fontSize: 11, color: '#5a5a7a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')} style={inputStyle('email')} />
            </div>
          )}

          {/* Password — login and register */}
          {(state === 'login' || state === 'register') && (
            <div>
              <label style={{ fontSize: 11, color: '#5a5a7a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')} onBlur={() => setFocused('')} style={inputStyle('password')} />
            </div>
          )}

          {/* New password — reset only */}
          {state === 'resetPassword' && (
            <div>
              <label style={{ fontSize: 11, color: '#5a5a7a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>New Password</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                onFocus={() => setFocused('newPassword')} onBlur={() => setFocused('')} style={inputStyle('newPassword')} />
            </div>
          )}

          {/* Forgot password link */}
          {state === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <span onClick={() => setState('forgotPassword')}
                style={{ fontSize: 11, color: '#a370f7', cursor: 'pointer', fontWeight: 600 }}>
                Forgot password?
              </span>
            </div>
          )}

          {/* Submit button */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 0', borderRadius: 10,
            background: loading ? 'rgba(123,94,167,0.4)' : 'linear-gradient(135deg,#7b5ea7,#f067a6)',
            border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
            fontFamily: "'Outfit', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 4, transition: 'opacity .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }}/>
                Processing…
              </>
            ) : (
              state === 'login'           ? 'Sign In →' :
              state === 'register'        ? 'Create Account →' :
              state === 'forgotPassword'  ? 'Send Reset Link →' :
              'Reset Password →'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#5a5a7a' }}>
          {state === 'login' && (
            <>Don't have an account?{' '}
              <span onClick={() => setState('register')} style={{ color: '#a370f7', cursor: 'pointer', fontWeight: 600 }}>Sign up</span>
            </>
          )}
          {state === 'register' && (
            <>Already have an account?{' '}
              <span onClick={() => setState('login')} style={{ color: '#a370f7', cursor: 'pointer', fontWeight: 600 }}>Sign in</span>
            </>
          )}
          {(state === 'forgotPassword' || state === 'resetPassword') && (
            <span onClick={() => setState('login')} style={{ color: '#a370f7', cursor: 'pointer', fontWeight: 600 }}>← Back to Sign In</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loginRise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;