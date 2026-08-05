import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import DemoCard from '../components/DemoCard';
import {
  Sparkles,
  TrendingUp,
  Bot,
  ShieldCheck,
} from 'lucide-react';
import '../styles/Auth.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const doLogin = async (e, emailArg, passwordArg) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalEmail = emailArg ?? email;
    const finalPassword = passwordArg ?? password;
    if (!finalEmail || !finalPassword) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(finalEmail, finalPassword);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(result.hasTenants ? '/dashboard' : '/setup');
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => doLogin(e);
  const handleFill = (e, p) => { setEmail(e); setPassword(p); setError(''); };
  const handleFillAndSubmit = (e, p) => doLogin(null, e, p);

  return (
    <div className="auth-page">
      {/* Brand panel — gradient background with value props */}
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-top">
          <div className="auth-brand-mark">S</div>
          <span>Sales<span style={{ opacity: 0.85 }}>Pilot</span></span>
        </div>

        <div className="auth-brand-content">
          <h1>The AI CRM that closes deals while you sleep.</h1>
          <p>
            Capture leads, score them with AI, and run your sales pipeline
            from a single dashboard. Built for small teams that want to look
            like a Fortune 500 sales org.
          </p>
          <div className="auth-brand-bullets">
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><TrendingUp size={14} /></div>
              Real-time pipeline value &amp; stage breakdown
            </div>
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><Bot size={14} /></div>
              AI lead scoring, summaries and proposal generation
            </div>
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><Sparkles size={14} /></div>
              RAG-powered search across your entire CRM
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">© SalesPilot CRM</div>
      </aside>

      {/* Form column */}
      <section className="auth-form-col">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2>Welcome back</h2>
          <p className="auth-form-subtitle">Sign in to your SalesPilot workspace.</p>

          {error && <div className="alert-danger" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', height: 44, marginTop: 6 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="auth-form-foot">
            New here? <Link to="/register">Create an account</Link>
          </div>
          <div className="auth-form-foot" style={{ marginTop: 6 }}>
            <Link to="/contact">Contact us</Link>
            <span style={{ marginLeft: 8, opacity: 0.6 }}>·</span>
            <span style={{ marginLeft: 8 }}>Forgot your password? Ask your admin.</span>
          </div>

          <div className="auth-divider">or</div>

          <DemoCard
            email={DemoCard.DEFAULT_EMAIL}
            password={DemoCard.DEFAULT_PASSWORD}
            onFill={handleFill}
            onFillAndSubmit={handleFillAndSubmit}
            loading={loading}
          />
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
