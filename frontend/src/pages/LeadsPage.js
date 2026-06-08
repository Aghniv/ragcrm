import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { leadAPI } from '../services/api';
import { toast } from 'react-toastify';
import SearchBar from '../components/SearchBar';
import PaginationControls from '../components/PaginationControls';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonTable } from '../components/SkeletonLoader';

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
    <span
      className="status-badge"
      style={{ backgroundColor: colors[status] || '#666' }}
      role="status"
      aria-label={`Status: ${status}`}
    >
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
    <span
      className="urgency-badge"
      style={{ backgroundColor: colors[urgency] }}
      role="status"
      aria-label={`Urgency: ${urgency}`}
    >
      {urgency}
    </span>
  );
}

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalLeads, setTotalLeads] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('DESC');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      source: '',
      status: 'NEW',
      notes: ''
    }
  });

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: Math.min(pageSize, 100),
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus }),
        sortBy,
        sortDirection,
      };

      const response = await leadAPI.getAll(params);
      setLeads(response.data.content || response.data);
      setTotalLeads(response.data.totalElements || response.data.length);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, filterStatus, sortBy, sortDirection]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Check URL for action=new to open modal automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      openNewModal();
      // Clear the URL parameter
      window.history.replaceState({}, '', '/leads');
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingLead) {
        await leadAPI.update(editingLead.id, data);
        toast.success('Lead updated successfully!');
      } else {
        await leadAPI.create(data);
        toast.success('Lead created successfully!');
      }
      setShowModal(false);
      setEditingLead(null);
      reset();
      setCurrentPage(0);
      loadLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error(error.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setValue('name', lead.name);
    setValue('email', lead.email);
    setValue('phone', lead.phone || '');
    setValue('company', lead.company || '');
    setValue('source', lead.source || '');
    setValue('status', lead.status);
    setValue('notes', lead.notes || '');
    setShowModal(true);
  };

  const handleDeleteClick = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      await leadAPI.delete(leadToDelete.id);
      toast.success('Lead deleted successfully!');
      setShowDeleteConfirm(false);
      setLeadToDelete(null);
      setCurrentPage(0);
      loadLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const handleAnalyze = async (id) => {
    try {
      await leadAPI.analyze(id);
      toast.success('Lead analyzed successfully!');
      loadLeads();
    } catch (error) {
      console.error('Error analyzing lead:', error);
      toast.error('Failed to analyze lead');
    }
  };

  const handleViewDetail = (leadId) => {
    window.location.href = `/leads/${leadId}`;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortDirection('ASC');
    }
  };

  const openNewModal = () => {
    setEditingLead(null);
    reset();
    setShowModal(true);
  };

  const totalPages = Math.ceil(totalLeads / pageSize);

  if (loading && leads.length === 0) {
    return (
      <div className="leads-page">
        <div className="leads-header">
          <div>
            <h1 className="page-title">👥 Leads</h1>
            <p className="page-subtitle">Manage your sales leads</p>
          </div>
          <button className="btn-primary" onClick={openNewModal} aria-label="Add new lead">
            ➕ Add Lead
          </button>
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1 className="page-title">👥 Leads</h1>
          <p className="page-subtitle">Manage your sales leads</p>
        </div>
        <button className="btn-primary" onClick={openNewModal} aria-label="Add new lead">
          ➕ Add Lead
        </button>
      </div>

      <div className="leads-filters">
        <SearchBar onSearch={setSearchTerm} />

        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="">All</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="leads-info">
        <span>Showing {leads.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalLeads)} of {totalLeads} leads</span>
      </div>

      <div className="leads-table-container">
        <table className="leads-table" role="grid" aria-label="Leads table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }} aria-sort={sortBy === 'name' ? (sortDirection === 'ASC' ? 'ascending' : 'descending') : 'none'}>
                Name {sortBy === 'name' && (sortDirection === 'ASC' ? '↑' : '↓')}
              </th>
              <th>Email</th>
              <th onClick={() => handleSort('company')} style={{ cursor: 'pointer' }} aria-sort={sortBy === 'company' ? (sortDirection === 'ASC' ? 'ascending' : 'descending') : 'none'}>
                Company {sortBy === 'company' && (sortDirection === 'ASC' ? '↑' : '↓')}
              </th>
              <th>Source</th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }} aria-sort={sortBy === 'status' ? (sortDirection === 'ASC' ? 'ascending' : 'descending') : 'none'}>
                Status {sortBy === 'status' && (sortDirection === 'ASC' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }} aria-sort={sortBy === 'score' ? (sortDirection === 'ASC' ? 'ascending' : 'descending') : 'none'}>
                Score {sortBy === 'score' && (sortDirection === 'ASC' ? '↑' : '↓')}
              </th>
              <th>Urgency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No leads found</td>
              </tr>
            ) : (
              leads.map(lead => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.company || '-'}</td>
                  <td>{lead.source || '-'}</td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><ScoreBadge score={lead.score} /></td>
                  <td><UrgencyBadge urgency={lead.urgency} /></td>
                  <td className="actions">
                    <button
                      className="btn-action view"
                      onClick={() => handleViewDetail(lead.id)}
                      title="View Details"
                      aria-label={`View details for ${lead.name}`}
                    >
                      👁️
                    </button>
                    <button
                      className="btn-action analyze"
                      onClick={() => handleAnalyze(lead.id)}
                      title="AI Analyze"
                      aria-label={`Analyze ${lead.name}`}
                    >
                      🤖
                    </button>
                    <button
                      className="btn-action edit"
                      onClick={() => handleEdit(lead)}
                      title="Edit"
                      aria-label={`Edit ${lead.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => handleDeleteClick(lead)}
                      title="Delete"
                      aria-label={`Delete ${lead.name}`}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {leads.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="modal-title">{editingLead ? '✏️ Edit Lead' : '➕ New Lead'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required', maxLength: { value: 255, message: 'Name must not exceed 255 characters' } })}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message" role="alert">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
                  })}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message" role="alert">{errors.email.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', { maxLength: { value: 50, message: 'Phone must not exceed 50 characters' } })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  {...register('company', { maxLength: { value: 255, message: 'Company must not exceed 255 characters' } })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="source">Source</label>
                <input
                  id="source"
                  type="text"
                  {...register('source', { maxLength: { value: 100, message: 'Source must not exceed 100 characters' } })}
                  placeholder="Website, Referral, LinkedIn, etc."
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" {...register('status')}>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  {...register('notes', { maxLength: { value: 5000, message: 'Notes must not exceed 5000 characters' } })}
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

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Lead"
          message={`Are you sure you want to delete "${leadToDelete?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setLeadToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default LeadsPage;