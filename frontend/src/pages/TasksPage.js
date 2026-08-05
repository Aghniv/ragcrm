import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

function TasksPage() {
  const location = useLocation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(() => {
    // Honor ?status=OPEN|IN_PROGRESS|DONE|CANCELLED from dashboard quick actions.
    const params = new URLSearchParams(window.location.search);
    const s = params.get('status');
    return STATUSES.includes(s) ? s : '';
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueAt: '', priority: 'MEDIUM' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await taskAPI.list(filter ? { status: filter } : {});
      setList(r.data?.content || r.data || []);
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // Re-seed the filter when dashboard quick actions navigate here with a
  // different ?status=… (e.g. user clicks the "New Leads" tile after a
  // pipeline action and then comes back).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('status');
    setFilter(STATUSES.includes(s) ? s : '');
  }, [location.search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Backend expects LocalDateTime for dueAt. The <input type="date"> only
      // gives us a YYYY-MM-DD string, which Jackson can't auto-parse into
      // LocalDateTime (used to surface as a 500). Convert to a full ISO
      // datetime, or drop the field if empty.
      const payload = { ...form };
      if (payload.dueAt) {
        payload.dueAt = `${payload.dueAt}T00:00:00`;
      } else {
        delete payload.dueAt;
      }
      await taskAPI.create(payload);
      setForm({ title: '', description: '', dueAt: '', priority: 'MEDIUM' });
      setShowModal(false);
      toast.success('Task created');
      load();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create';
      toast.error(msg);
    }
  };

  const toggleDone = async (t) => {
    try {
      const next = t.status === 'DONE' ? 'OPEN' : 'DONE';
      await taskAPI.update(t.id, { ...t, status: next });
      load();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const [showDelete, setShowDelete] = useState(null);

  const handleDelete = async () => {
    if (!showDelete) return;
    try {
      await taskAPI.remove(showDelete.id);
      toast.success('Task deleted');
      setShowDelete(null);
      load();
    } catch (e) { toast.error('Failed'); }
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1 className="page-title">✅ Tasks</h1>
          <p className="page-subtitle">To-dos across your CRM</p>
        </div>
        <button
          type="button"
          className="btn-add"
          onClick={() => setShowModal(true)}
          aria-label="New task"
        >
          ➕ New Task
        </button>
      </div>

      <div className="leads-filters">
        <label>Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Done</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="no-data">Loading...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan="6" className="no-data">No tasks</td></tr>
            ) : list.map((t) => (
              <tr key={t.id}>
                <td>
                  <input type="checkbox" checked={t.status === 'DONE'} onChange={() => toggleDone(t)} />
                </td>
                <td style={{ textDecoration: t.status === 'DONE' ? 'line-through' : 'none' }}>{t.title}</td>
                <td>
                  {t.priority && <span className={`urgency-badge ${t.priority}`}>{t.priority}</span>}
                </td>
                <td>{t.dueAt ? new Date(t.dueAt).toLocaleDateString() : '—'}</td>
                <td>
                  <span className={`status-badge ${t.status}`}>{t.status}</span>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn-action danger" onClick={() => setShowDelete(t)} title="Delete" aria-label="Delete task">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="crm-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="crm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>➕ New Task</h2>
            <p className="modal-subtitle">Tasks are scoped to you within this workspace.</p>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due</label>
                  <input type="date" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
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
          title="Delete task"
          message={`Delete "${showDelete.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(null)}
        />
      )}
    </div>
  );
}

export default TasksPage;