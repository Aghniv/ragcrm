import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Building2, Sparkles, TrendingUp, Bot } from 'lucide-react';
import '../styles/Auth.css';

function TenantSetupPage() {
  const navigate = useNavigate();
  const { createTenant } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const slugify = (str) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

  const onNameChange = (val) => {
    setName(val);
    if (!slug || slug === slugify(name)) setSlug(slugify(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !slug) {
      setError('Please provide both a name and a slug.');
      return;
    }
    setLoading(true);
    const result = await createTenant(slug, name);
    setLoading(false);
    if (result.success) {
      toast.success('Workspace created!');
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-top">
          <div className="auth-brand-mark">S</div>
          <span>Sales<span style={{ opacity: 0.85 }}>Pilot</span></span>
        </div>

        <div className="auth-brand-content">
          <h1>One workspace, one team, one source of truth.</h1>
          <p>
            A workspace is your isolated company account. Leads, customers and
            pipeline belong to the workspace — invite your team later from the
            dashboard.
          </p>
          <div className="auth-brand-bullets">
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><Building2 size={14} /></div>
              Tenant-isolated data — no cross-company leakage
            </div>
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><TrendingUp size={14} /></div>
              Unlimited leads &amp; deals on every plan
            </div>
            <div className="auth-brand-bullet">
              <div className="auth-brand-bullet-icon"><Bot size={14} /></div>
              AI features unlocked the moment you create the workspace
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">© SalesPilot CRM</div>
      </aside>

      <section className="auth-form-col">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2>Create your workspace</h2>
          <p className="auth-form-subtitle">
            A workspace is one company account — you can create more later from the dashboard.
          </p>

          {error && <div className="alert-danger" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="ws-name">Workspace name</label>
            <input id="ws-name" type="text" placeholder="Acme Corp" value={name}
                   onChange={(e) => onNameChange(e.target.value)} disabled={loading} required />
          </div>

          <div className="form-group">
            <label htmlFor="ws-slug">URL slug</label>
            <input id="ws-slug" type="text" placeholder="acme" value={slug}
                   onChange={(e) => setSlug(slugify(e.target.value))} disabled={loading} required />
            <small style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              Lowercase, letters, numbers and dashes. Used in URLs.
            </small>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', height: 44 }} disabled={loading}>
            {loading ? 'Creating…' : 'Create workspace'}
          </button>

          <div className="auth-form-foot">
            You can rename or delete your workspace later from settings.
          </div>
        </form>
      </section>
    </div>
  );
}

export default TenantSetupPage;
