import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

/**
 * "Try the demo" card shown on Login + Register. Clicking either button fills
 * the form with the demo credentials; clicking "Sign in" also submits. The
 * parent page passes a setter so the card lives inside the page's form state.
 */
function DemoCard({ email, password, onFill, onFillAndSubmit, loading }) {
  return (
    <div className="demo-card">
      <div className="demo-card-title">
        <Sparkles size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Try the demo
      </div>
      <p className="demo-card-desc">
        Click below to fill the form with the pre-seeded demo workspace. The
        account already contains sample leads, customers, pipeline and tasks so
        the dashboard isn't empty.
      </p>
      <div className="demo-card-row">
        <span>Email</span>
        <code>{email}</code>
      </div>
      <div className="demo-card-row">
        <span>Password</span>
        <code>{password}</code>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onFill(email, password)}
          disabled={loading}
        >
          Fill credentials
        </button>
        <button
          type="button"
          className="btn-primary demo-card-cta"
          onClick={() => onFillAndSubmit(email, password)}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in as demo'} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Public defaults so callers don't need to know the credentials.
DemoCard.DEFAULT_EMAIL = 'demo@salespilot.app';
DemoCard.DEFAULT_PASSWORD = 'Demo1234';

export default DemoCard;
