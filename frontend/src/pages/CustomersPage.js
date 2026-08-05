import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import { Eye, Trash2 } from 'lucide-react';

const EMPTY = { name: '', industry: '', size: '', website: '', billingAddress: '' };

function CustomersPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [showDelete, setShowDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await customerAPI.list({ search });
      setList(r.data?.content || r.data || []);
    } catch (e) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.create(form);
      setForm(EMPTY);
      setShowModal(false);
      toast.success('Customer created');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const confirmDelete = async () => {
    try {
      await customerAPI.remove(showDelete.id);
      toast.success('Customer deleted');
      setShowDelete(null);
      load();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1 className="page-title">🏢 Customers</h1>
          <p className="page-subtitle">Companies you sell to</p>
        </div>
        <button
          type="button"
          className="btn-add"
          onClick={() => setShowModal(true)}
          aria-label="Add customer"
        >
          ➕ Add Customer
        </button>
      </div>

      <div className="leads-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Size</th>
              <th>Website</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="no-data">Loading...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan="5" className="no-data">No customers yet</td></tr>
            ) : list.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/customers/${c.id}`}>{c.name}</Link>
                </td>
                <td>{c.industry || '-'}</td>
                <td>{c.size || '-'}</td>
                <td>{c.website ? <a href={c.website} target="_blank" rel="noreferrer">{c.website}</a> : '-'}</td>
                <td className="actions">
                  <button className="btn-action view" onClick={() => navigate(`/customers/${c.id}`)} title="View" aria-label="View">
                    <Eye size={14} />
                  </button>
                  <button className="btn-action danger" onClick={() => setShowDelete(c)} title="Delete" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- CREATE CUSTOMER MODAL ---- */}
      {showModal && (
        <div
          className="crm-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="crm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>➕ New Customer</h2>
            <form onSubmit={handleCreate}>
              {['name', 'industry', 'size', 'website', 'billingAddress'].map((k) => (
                <div className="form-group" key={k}>
                  <label>{k === 'billingAddress' ? 'Billing Address' : k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <input
                    type="text"
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    required={k === 'name'}
                    placeholder={k === 'name' ? 'Company name' : ''}
                  />
                </div>
              ))}
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
          title="Delete Customer"
          message={`Delete "${showDelete.name}"? Linked opportunities and contacts will be unaffected but orphaned.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(null)}
        />
      )}
    </div>
  );
}

export default CustomersPage;