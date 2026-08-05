import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customerAPI, contactAPI, opportunityAPI } from '../services/api';
import { toast } from 'react-toastify';

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', title: '' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      const [c, ct, op] = await Promise.all([
        customerAPI.get(id),
        contactAPI.byCustomer(id),
        opportunityAPI.byCustomer(id),
      ]);
      setCustomer(c.data);
      setContacts(ct.data || []);
      setOpps(op.data || []);
    } catch (e) {
      toast.error('Failed to load customer');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await contactAPI.create({ ...newContact, customerId: Number(id) });
      setNewContact({ name: '', email: '', phone: '', title: '' });
      toast.success('Contact added');
      const ct = await contactAPI.byCustomer(id);
      setContacts(ct.data || []);
    } catch (err) {
      toast.error('Failed to add contact');
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!customer) return <div className="error-screen">Customer not found</div>;

  return (
    <div className="lead-detail-page">
      <div className="lead-detail-header">
        <div>
          <h1>{customer.name}</h1>
          <p className="lead-email">{customer.industry} {customer.size ? `· ${customer.size}` : ''}</p>
        </div>
        <Link to="/opportunities?customerId=" className="btn-primary" onClick={(e) => { e.preventDefault(); navigate(`/opportunities?customerId=${id}`); }} style={{ textDecoration: 'none' }}>
          ➕ New Opportunity
        </Link>
      </div>

      <div className="lead-detail-content">
        <div className="lead-info-grid">
          <div className="lead-info-section">
            <h2>Company Details</h2>
            <div className="info-item"><label>Website</label><div>{customer.website || '—'}</div></div>
            <div className="info-item"><label>Billing address</label><div>{customer.billingAddress || '—'}</div></div>
            <div className="info-item"><label>Created</label><div>{new Date(customer.createdAt).toLocaleDateString()}</div></div>
          </div>

          <div className="lead-info-section">
            <h2>📇 Contacts ({contacts.length})</h2>
            <form onSubmit={handleAddContact} className="contact-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="text" placeholder="Name *" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="email" placeholder="Email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="tel" placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="text" placeholder="Title" value={newContact.title} onChange={(e) => setNewContact({ ...newContact, title: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', height: '42px' }}>Add contact</button>
            </form>
            <div style={{ marginTop: '20px' }}>
              {contacts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No contacts yet</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {contacts.map((ct) => (
                    <div key={ct.id} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{ct.name}</strong> 
                        {ct.title && <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}> · {ct.title}</span>}
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{ct.email || 'No email'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lead-info-section">
            <h2>💼 Opportunities ({opps.length})</h2>
            {opps.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No opportunities yet</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {opps.map((o) => (
                  <div key={o.id} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/opportunities/${o.id}`} style={{ fontWeight: 600 }}>{o.name}</Link>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className="status-badge" style={{ backgroundColor: 'var(--accent-indigo)' }}>{o.stage}</span>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>${o.amount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailPage;