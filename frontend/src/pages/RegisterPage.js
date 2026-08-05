import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import DemoCard from '../components/DemoCard';
import { Sparkles, TrendingUp, Bot } from 'lucide-react';
import '../styles/Auth.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain uppercase letters';
    if (!/[a-z]/.test(pwd)) return 'Password must contain lowercase letters';
    if (!/[0-9]/.test(pwd)) return 'Password must contain numbers';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    setLoading(true);
    const result = await register(name, email, password);
    if (result.success) {
      toast.success("Account created! Let's set up your workspace.");
      navigate('/setup');
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-top">
          <div className="auth-brand-mark">S</div>
          <span>Sales<span style={{ opacity: 0.85 }}>Pilot</span></span>
        </div>

        <div className="auth-brand-content">
          <h1>Start closing more in less than a minute.</h1>
          <p>
            Create your free workspace, capture your first lead, and let the AI
            handle scoring, follow-ups and pipeline insights from day one.
          </p>
          <div className="auth-brand-bullets">
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><Sparkles size={14} /></div>
              Free forever for solo reps — no credit card
            </div>
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><TrendingUp size={14} /></div>
              Built-in pipeline, tasks and AI summaries
            </div>
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><Bot size={14} /></div>
              Bring your own API key, or use ours out of the box
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">© SalesPilot CRM</div>
      </aside>

      <section className="auth-form-col">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2>Create your account</h2>
          <p className="auth-form-subtitle">Already have one? <Link to="/login">Sign in</Link></p>

          {error && <div className="alert-danger" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" placeholder="Jane Doe" value={name}
                   onChange={(e) => setName(e.target.value)} disabled={loading} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@company.com" value={email}
                   onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="At least 8 characters" value={password}
                   onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
            <small style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              Must be 8+ characters with uppercase, lowercase and a number.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" type="password" placeholder="Re-enter your password" value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', height: 44 }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <div className="auth-form-foot">
            By signing up you agree to our terms. Want to peek first? Try the demo below.
          </div>

          <div className="auth-divider">or</div>

          <DemoCard
            email={DemoCard.DEFAULT_EMAIL}
            password={DemoCard.DEFAULT_PASSWORD}
            onFill={(e, p) => { setEmail(e); setPassword(p); setError(''); }}
            onFillAndSubmit={() => navigate('/login')}
            loading={false}
          />
        </form>
      </section>
    </div>
  );
}

export default RegisterPage;
