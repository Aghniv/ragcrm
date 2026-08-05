import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { opportunityAPI, aiAPI, noteAPI } from '../services/api';
import { toast } from 'react-toastify';

const STAGES = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [proposal, setProposal] = useState(null);
  const [generating, setGenerating] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      const [o, n] = await Promise.all([
        opportunityAPI.get(id),
        noteAPI.forEntity('opportunity', id),
      ]);
      setOpp(o.data);
      setNotes(n.data || []);
    } catch (e) {
      toast.error('Failed to load');
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (stage) => {
    try {
      await opportunityAPI.update(id, { ...opp, stage });
      setOpp({ ...opp, stage });
      toast.success('Stage updated');
    } catch (e) {
      toast.error('Failed to update stage');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await noteAPI.create({ entityType: 'opportunity', entityId: Number(id), body: newNote });
      setNewNote('');
      const r = await noteAPI.forEntity('opportunity', id);
      setNotes(r.data || []);
      toast.success('Note added');
    } catch (e) {
      toast.error('Failed');
    }
  };

  const handleProposal = async () => {
    setGenerating(true);
    setProposal(null);
    try {
      const r = await aiAPI.proposal(id);
      setProposal(r.data);
    } catch (e) {
      toast.error('Failed to generate proposal');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!opp) return <div className="error-screen">Not found</div>;

  return (
    <div className="lead-detail-page">
      <div className="lead-detail-header">
        <div>
          <h1>{opp.name}</h1>
          <p className="lead-email">{opp.customerName || `Customer #${opp.customerId}`}</p>
        </div>
        <div className="header-actions">
          <select value={opp.stage} onChange={(e) => handleStageChange(e.target.value)} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '14px' }}>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="lead-detail-content">
        <div className="lead-info-grid">
          <div className="lead-info-section">
            <h2>Deal details</h2>
            <div className="info-item"><label>Amount</label><div>{opp.currency || '$'} {opp.amount || '—'}</div></div>
            <div className="info-item"><label>Probability</label><div>{opp.probabilityPct ?? '—'}%</div></div>
            <div className="info-item"><label>Expected close</label><div>{opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : '—'}</div></div>
            {opp.lostReason && (
              <div className="info-item"><label>Lost reason</label><div>{opp.lostReason}</div></div>
            )}
          </div>

          <div className="lead-info-section">
            <h2>🤖 AI Tools</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Draft a customized sales proposal document for this deal based on current status and details.
            </p>
            <button className="btn-primary" onClick={handleProposal} disabled={generating} style={{ width: '100%' }}>
              {generating ? '🤔 Generating proposal...' : '📄 Generate Proposal'}
            </button>
            {proposal && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '14px' }}>
                {typeof proposal === 'string' ? proposal : (proposal.proposal || proposal.body || JSON.stringify(proposal, null, 2))}
              </div>
            )}
          </div>

          <div className="lead-info-section">
            <h2>📝 Notes ({notes.length})</h2>
            <div className="form-group">
              <textarea rows="3" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add note..." />
              <button className="btn-primary" style={{ marginTop: '12px' }} onClick={handleAddNote}>Add note</button>
            </div>
            <div style={{ marginTop: '20px' }}>
              {notes.map((n) => (
                <div key={n.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</div>
                  <div style={{ marginTop: '6px', color: 'var(--text-primary)' }}>{n.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpportunityDetailPage;