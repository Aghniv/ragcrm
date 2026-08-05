import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { opportunityAPI, customerAPI } from '../services/api';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import { Eye, Trash2 } from 'lucide-react';

const STAGES = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

const STAGE_COLORS = {
  PROSPECTING: '#3b82f6',
  QUALIFICATION: '#10b981',
  PROPOSAL: '#8b5cf6',
  NEGOTIATION: '#f59e0b',
  WON: '#059669',
  LOST: '#f43f5e',
};

function OpportunitiesPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    name: '', customerId: '', contactId: '', stage: 'PROSPECTING',
    amount: '', currency: 'USD', expectedCloseDate: '', probabilityPct: '50',
  });

  useEffect(() => {
    customerAPI.list({ size: 200 }).then((r) => setCustomers(r.data?.content || r.data || []));
    if (params.get('customerId')) setForm((f) => ({ ...f, customerId: params.get('customerId') }));
  }, [params]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await opportunityAPI.list(filter ? { stage: filter } : {});
      setList(r.data?.content || r.data || []);
    } catch (e) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: form.amount ? Number(form.amount) : null, probabilityPct: Number(form.probabilityPct) };
      await opportunityAPI.create(payload);
      setShowModal(false);
      toast.success('Opportunity created');
      load();
    } catch (err) {
      toast.error('Failed to create');
    }
  };

  const confirmDelete = async () => {
    try {
      await opportunityAPI.remove(showDelete.id);
      setShowDelete(null);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1 className="page-title">💼 Pipeline</h1>
          <p className="page-subtitle">Track your deals</p>
        </div>
        <button
          type="button"
          className="btn-add"
          onClick={() => setShowModal(true)}
          aria-label="New opportunity"
        >
          ➕ New Opportunity
        </button>
      </div>

      <div className="leads-filters">
        <label>Stage:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Customer</th>
              <th>Stage</th>
              <th>Amount</th>
              <th>Probability</th>
              <th>Close date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="no-data">Loading...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan="7" className="no-data">No opportunities yet</td></tr>
            ) : list.map((o) => (
              <tr key={o.id}>
                <td><Link to={`/opportunities/${o.id}`}>{o.name}</Link></td>
                <td>{o.customerName || `Customer #${o.customerId}`}</td>
                <td>
                  <span className={`stage-badge ${o.stage}`}>{o.stage}</span>
                </td>
                <td>{o.amount ? `${o.currency || '$'} ${o.amount}` : '—'}</td>
                <td>{o.probabilityPct ?? '—'}%</td>
                <td>{o.expectedCloseDate ? new Date(o.expectedCloseDate).toLocaleDateString() : '—'}</td>
                <td className="actions">
                  <button className="btn-action view" onClick={() => navigate(`/opportunities/${o.id}`)} title="View" aria-label="View">
                    <Eye size={14} />
                  </button>
                  <button className="btn-action danger" onClick={() => setShowDelete(o)} title="Delete" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- CREATE OPPORTUNITY MODAL ---- */}
      {showModal && (
        <div
          className="crm-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="crm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>➕ New Opportunity</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Deal name" />
              </div>
              <div className="form-group">
                <label>Customer *</label>
                <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
                  <option value="">Select...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Stage</label>
                <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Probability %</label>
                  <input type="number" min="0" max="100" value={form.probabilityPct} onChange={(e) => setForm({ ...form, probabilityPct: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Expected close date</label>
                <input type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <ConfirmModal
          title="Delete Opportunity"
          message={`Delete "${showDelete.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(null)}
        />
      )}
    </div>
  );
}

export default OpportunitiesPage;