import React, { useState, useEffect } from 'react';
import { leadAPI } from '../services/api';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

function StatusBadge({ status }) {
  const colors = {
    NEW: '#4285f4',
    CONTACTED: '#fbbc04',
    QUALIFIED: '#34a853',
    PROPOSAL: '#9334e6',
    WON: '#0d652d',
    LOST: '#ea4335',
  };

  return (
    <span className="status-badge" style={{ backgroundColor: colors[status] || '#666' }}>
      {status}
    </span>
  );
}

function ScoreBadge({ score }) {
  if (!score) return <span className="score-badge none">Not analyzed</span>;

  const getColor = (s) => {
    if (s >= 70) return '#34a853';
    if (s >= 40) return '#fbbc04';
    return '#ea4335';
  };

  return (
    <span className="score-badge" style={{ color: getColor(score) }}>
      {score}/100
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  const colors = {
    LOW: '#9e9e9e',
    MEDIUM: '#f57c00',
    HIGH: '#d32f2f',
  };

  if (!urgency) return null;

  return (
    <span className="urgency-badge" style={{ backgroundColor: colors[urgency] }}>
      {urgency}
    </span>
  );
}

function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: 'NEW',
    notes: '',
  });

  useEffect(() => {
    loadLeads();
  }, []);

  // Check URL for action=new to open modal automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      openNewModal();
      window.history.replaceState({}, '', '/leads');
    }
  }, []);

  const loadLeads = async () => {
    try {
      const response = await leadAPI.getAll();
      setLeads(response.data.content || response.data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await leadAPI.update(editingLead.id, formData);
      } else {
        await leadAPI.create(formData);
      }
      setShowModal(false);
      setEditingLead(null);
      resetForm();
      loadLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || '',
      status: lead.status,
      notes: lead.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadAPI.delete(id);
        loadLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleAnalyze = async (id) => {
    try {
      await leadAPI.analyze(id);
      loadLeads();
    } catch (error) {
      console.error('Error analyzing lead:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      source: '',
      status: 'NEW',
      notes: '',
    });
  };

  const openNewModal = () => {
    setEditingLead(null);
    resetForm();
    setShowModal(true);
  };

  const filteredLeads = filterStatus
    ? leads.filter(l => l.status === filterStatus)
    : leads;

  if (loading) {
    return <div className="leads-loading">Loading leads...</div>;
  }

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1 className="page-title">👥 Leads</h1>
          <p className="page-subtitle">Manage your sales leads</p>
        </div>
        <button className="btn-primary" onClick={openNewModal}>
          ➕ Add Lead
        </button>
      </div>

      <div className="filters">
        <label>Filter by status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Source</th>
              <th>Status</th>
              <th>Score</th>
              <th>Urgency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No leads found</td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.company || '-'}</td>
                  <td>{lead.source || '-'}</td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><ScoreBadge score={lead.score} /></td>
                  <td><UrgencyBadge urgency={lead.urgency} /></td>
                  <td className="actions">
                    <button className="btn-action analyze" onClick={() => handleAnalyze(lead.id)} title="AI Analyze">
                      🤖
                    </button>
                    <button className="btn-action edit" onClick={() => handleEdit(lead)} title="Edit">
                      ✏️
                    </button>
                    <button className="btn-action delete" onClick={() => handleDelete(lead.id)} title="Delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingLead ? '✏️ Edit Lead' : '➕ New Lead'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder="Website, Referral, LinkedIn, etc."
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingLead ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;