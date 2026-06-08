import React, { useState, useEffect } from 'react';
import { leadAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    won: 0,
    lost: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await leadAPI.getAll();
      const leads = response.data.content || response.data;

      setStats({
        total: leads.length,
        new: leads.filter(l => l.status === 'NEW').length,
        contacted: leads.filter(l => l.status === 'CONTACTED').length,
        qualified: leads.filter(l => l.status === 'QUALIFIED').length,
        proposal: leads.filter(l => l.status === 'PROPOSAL').length,
        won: leads.filter(l => l.status === 'WON').length,
        lost: leads.filter(l => l.status === 'LOST').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Leads', value: stats.total, color: '#1a73e8', icon: '👥' },
    { label: 'New', value: stats.new, color: '#4285f4', icon: '🆕' },
    { label: 'Contacted', value: stats.contacted, color: '#fbbc04', icon: '📞' },
    { label: 'Qualified', value: stats.qualified, color: '#34a853', icon: '✅' },
    { label: 'Proposal', value: stats.proposal, color: '#9334e6', icon: '📄' },
    { label: 'Won', value: stats.won, color: '#0d652d', icon: '🎉' },
    { label: 'Lost', value: stats.lost, color: '#ea4335', icon: '❌' },
  ];

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">📊 Dashboard</h1>
      <p className="page-subtitle">Your AI Sales Copilot at a glance</p>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="quick-actions">
          <h2>⚡ Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => window.location.href = '/leads?action=new'}>
              ➕ Add New Lead
            </button>
            <button className="action-btn secondary" onClick={() => window.location.href = '/leads'}>
              📋 View All Leads
            </button>
          </div>
        </div>

        <div className="ai-insights">
          <h2>🤖 AI Insights</h2>
          <div className="insight-card">
            <p>The AI analyzes each lead to determine quality score and urgency. Use the "Analyze" button on any lead to get AI-powered insights.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;