import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadAPI } from '../services/api';
import { toast } from 'react-toastify';
import LeadAnalysisDisplay from '../components/LeadAnalysisDisplay';
import ActivityTimeline from '../components/ActivityTimeline';
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

  useEffect(() => {
    loadLead();
  }, [id]);

  const loadLead = async () => {
    try {
      const response = await leadAPI.getById(id);
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await leadAPI.update(id, formData);
      setLead({ ...lead, ...formData });
      setIsEditMode(false);
      toast.success('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
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
      console.error('Error analyzing lead:', error);
      toast.error('Failed to analyze lead');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await leadAPI.delete(id);
      toast.success('Lead deleted successfully!');
      navigate('/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
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
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
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
                      'NEW': '#4285f4',
                      'CONTACTED': '#fbbc04',
                      'QUALIFIED': '#34a853',
                      'PROPOSAL': '#9334e6',
                      'WON': '#0d652d',
                      'LOST': '#ea4335',
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

              <div className="lead-info-section">
                <h2>Notes</h2>
                <div className="notes-content">
                  {lead.notes || 'No notes added'}
                </div>
              </div>
            </div>
          )}

          <LeadAnalysisDisplay
            lead={lead}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="lead-detail-content">
          <ActivityTimeline lead={lead} />
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
