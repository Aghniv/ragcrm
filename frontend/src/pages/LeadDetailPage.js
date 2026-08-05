import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leadAPI, noteAPI, taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: 'NEW',
    notes: '',
  });

  // Notes + Tasks state
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newTask, setNewTask] = useState({ title: '', dueAt: '', priority: 'MEDIUM' });

  useEffect(() => {
    loadLead();
    loadNotes();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadLead = async () => {
    try {
      const response = await leadAPI.get(id);
      setLead(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || '',
        company: response.data.company || '',
        source: response.data.source || '',
        status: response.data.status,
        notes: response.data.notes || '',
      });
    } catch (error) {
      console.error('Error loading lead:', error);
      toast.error('Failed to load lead');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const res = await noteAPI.forEntity('lead', id);
      setNotes(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch (e) { /* swallow — non-critical */ }
  };

  const loadTasks = async () => {
    try {
      const res = await taskAPI.forEntity('lead', id);
      setTasks(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch (e) { /* swallow */ }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await leadAPI.update(id, formData);
      setLead({ ...lead, ...formData });
      setIsEditMode(false);
      toast.success('Lead updated successfully!');
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      await leadAPI.analyze(id);
      toast.success('Lead analyzed successfully!');
      loadLead();
    } catch (error) {
      toast.error('Failed to analyze lead');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await leadAPI.remove(id);
      toast.success('Lead deleted successfully!');
      navigate('/leads');
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || '',
      status: lead.status,
      notes: lead.notes || '',
    });
  };

  const handleAddNote = async () => {
    if (!newNoteBody.trim()) return;
    try {
      await noteAPI.create({
        entityType: 'lead',
        entityId: Number(id),
        body: newNoteBody,
      });
      setNewNoteBody('');
      loadNotes();
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await taskAPI.create({
        title: newTask.title,
        relatedType: 'lead',
        relatedId: Number(id),
        dueAt: newTask.dueAt || null,
        priority: newTask.priority,
      });
      setNewTask({ title: '', dueAt: '', priority: 'MEDIUM' });
      loadTasks();
      toast.success('Task added');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading lead...</div>;
  }

  if (!lead) {
    return <div className="error-screen">Lead not found</div>;
  }

  return (
    <div className="lead-detail-page">
      <div className="lead-detail-header">
        <div>
          <h1>{lead.name}</h1>
          <p className="lead-email">{lead.email}</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? '❌ Cancel' : '✏️ Edit'}
          </button>
          <button
            className="btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="lead-detail-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI Tools
        </button>
        <button
          className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 Notes ({notes.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✅ Tasks ({tasks.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="lead-detail-content">
          {isEditMode ? (
            <form className="lead-edit-form" onSubmit={handleSave}>
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

              <div className="form-row">
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
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="lead-info-grid">
              <div className="lead-info-section">
                <h2>Contact Information</h2>
                <div className="info-item">
                  <label>Name</label>
                  <div>{lead.name}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div>{lead.email}</div>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <div>{lead.phone || 'Not provided'}</div>
                </div>
                <div className="info-item">
                  <label>Company</label>
                  <div>{lead.company || 'Not provided'}</div>
                </div>
              </div>

              <div className="lead-info-section">
                <h2>Sales Information</h2>
                <div className="info-item">
                  <label>Source</label>
                  <div>{lead.source || 'Not provided'}</div>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <div className="status-badge" style={{
                    backgroundColor: {
                      'NEW': '#3b82f6',
                      'CONTACTED': '#f59e0b',
                      'QUALIFIED': '#10b981',
                      'PROPOSAL': '#8b5cf6',
                      'WON': '#059669',
                      'LOST': '#f43f5e',
                    }[lead.status]
                  }}>
                    {lead.status}
                  </div>
                </div>
                <div className="info-item">
                  <label>Created</label>
                  <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="info-item">
                  <label>Updated</label>
                  <div>{new Date(lead.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="lead-detail-content">
          <div className="lead-info-section">
            <h2>🤖 AI Tools</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Analyze this lead's profile status, urgency, and generate a quality score.
            </p>

            <div className="form-actions" style={{ flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '🔄 Analyzing...' : (lead.score ? '🔄 Re-analyze Lead' : '🤖 Analyze Lead')}
              </button>

              {lead.score && (
                <div className="analysis-results" style={{ padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px' }}>
                  <div className="info-item" style={{ marginBottom: '16px' }}>
                    <label>Score</label>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: lead.score >= 70 ? 'var(--accent-emerald)' : lead.score >= 40 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>{lead.score}/100</div>
                  </div>
                  <div className="info-item" style={{ marginBottom: '16px' }}>
                    <label>Urgency</label>
                    <div style={{ display: 'inline-block' }} className="urgency-badge">{lead.urgency}</div>
                  </div>
                  {lead.notes && (
                    <div className="info-item">
                      <label>AI Summary & Notes</label>
                      <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{lead.notes}</div>
                    </div>
                  )}
                </div>
              )}

              <Link to="/customers" className="btn-secondary" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                Convert to Customer →
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="lead-detail-content">
          <div className="lead-info-section">
            <h2>📝 Notes</h2>
            <div className="form-group">
              <textarea
                value={newNoteBody}
                onChange={(e) => setNewNoteBody(e.target.value)}
                rows="3"
                placeholder="Add a note about this lead..."
              />
              <button className="btn-primary" style={{ marginTop: '12px' }} onClick={handleAddNote}>
                Add Note
              </button>
            </div>
            <div style={{ marginTop: '24px' }}>
              {notes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No notes yet</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                    <div style={{ marginTop: '6px', color: 'var(--text-primary)' }}>{n.body}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="lead-detail-content">
          <div className="lead-info-section">
            <h2>✅ Tasks</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                <label>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Follow up next week"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: '120px' }}>
                <label>Due</label>
                <input
                  type="date"
                  value={newTask.dueAt}
                  onChange={(e) => setNewTask({ ...newTask, dueAt: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: '100px' }}>
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                </select>
              </div>
              <button className="btn-primary" onClick={handleAddTask} style={{ height: '42px', padding: '0 20px' }}>
                Add
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              {tasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No tasks yet</p>
              ) : (
                tasks.map((t) => (
                  <div key={t.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {t.priority} • {t.dueAt ? `Due ${new Date(t.dueAt).toLocaleDateString()}` : 'No due date'}
                      </div>
                    </div>
                    <span className="status-badge" style={{ backgroundColor: t.status === 'DONE' ? 'var(--accent-emerald)' : 'var(--accent-indigo)' }}>
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Lead"
          message={`Are you sure you want to delete "${lead.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

export default LeadDetailPage;