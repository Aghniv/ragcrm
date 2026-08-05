import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, searchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import BerryCard from '../components/BerryCard';
import StatCard from '../components/StatCard';
import {
  Users, UserPlus, Phone, CheckCircle, FileText, Trophy, XCircle,
  Plus, Lightbulb, Clock, Search, Briefcase, ListChecks,
  StickyNote, Building2, Contact, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function DashboardPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [topLeads, setTopLeads] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search (RAG) state
  const [searchQ, setSearchQ] = useState('');
  const [searchAnswer, setSearchAnswer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardAPI.overview();
      const data = res.data || {};
      setStats(data);
      setRecentLeads(data.recentLeads || []);
      setTopLeads(data.topLeads || []);
      setUpcomingTasks(data.upcomingTasks || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setSearching(true);
    setSearchAnswer(null);
    setSearchResults([]);
    try {
      const res = await searchAPI.answer(searchQ);
      setSearchAnswer(res.data?.answer || '');
      setSearchResults(res.data?.sources || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const stageChartData = stats?.opportunityStageBreakdown
    ? Object.entries(stats.opportunityStageBreakdown).map(([k, v]) => ({ stage: k, count: v }))
    : [];

  const statCards = stats ? [
    { label: 'Total Leads', value: stats.totalLeads ?? 0, color: '#5e35d1', icon: <Users size={18} /> },
    { label: 'New', value: stats.leadsByStatus?.NEW ?? 0, color: '#1a73e8', icon: <UserPlus size={18} /> },
    { label: 'Contacted', value: stats.leadsByStatus?.CONTACTED ?? 0, color: '#f59e0b', icon: <Phone size={18} /> },
    { label: 'Qualified', value: stats.leadsByStatus?.QUALIFIED ?? 0, color: '#00a854', icon: <CheckCircle size={18} /> },
    { label: 'Proposal', value: stats.leadsByStatus?.PROPOSAL ?? 0, color: '#7c4dff', icon: <FileText size={18} /> },
    { label: 'Won', value: stats.leadsByStatus?.WON ?? 0, color: '#059669', icon: <Trophy size={18} /> },
    { label: 'Lost', value: stats.leadsByStatus?.LOST ?? 0, color: '#ff4d4f', icon: <XCircle size={18} /> },
    { label: 'Customers', value: stats.customersTotal ?? 0, color: '#0ea5e9', icon: <Building2 size={18} /> },
    { label: 'Contacts', value: stats.contactsTotal ?? 0, color: '#14b8a6', icon: <Contact size={18} /> },
    { label: 'Open Tasks', value: stats.tasksOpen ?? 0, color: '#ef4444', icon: <ListChecks size={18} /> },
    { label: 'Notes', value: stats.notesTotal ?? 0, color: '#a855f7', icon: <StickyNote size={18} /> },
  ] : [];

  const openTasks = stats?.tasksOpen ?? 0;
  const newLeads = stats?.leadsByStatus?.NEW ?? 0;
  const qualifiedLeads = stats?.leadsByStatus?.QUALIFIED ?? 0;
  const wonDeals = stats?.leadsByStatus?.WON ?? 0;
  const pipeline = stats?.openPipelineAmount || stats?.pipelineValue;

  const quickActions = [
    { to: '/leads?action=new', label: 'Add Lead', icon: <Plus size={16} />, variant: 'primary',
      hint: stats?.totalLeads ? `${stats.totalLeads} total` : 'Start your pipeline' },
    { to: '/leads?status=NEW', label: 'New Leads', icon: <UserPlus size={16} />,
      hint: newLeads ? `${newLeads} to follow up` : 'Inbox zero' },
    { to: '/opportunities', label: 'Open Pipeline', icon: <Briefcase size={16} />,
      hint: pipeline ? `$${Number(pipeline).toLocaleString()} in play` : 'No open deals' },
    { to: '/tasks?status=OPEN', label: 'Open Tasks', icon: <ListChecks size={16} />,
      hint: openTasks ? `${openTasks} pending` : 'All caught up' },
    { to: '/leads?status=QUALIFIED', label: 'Qualified', icon: <CheckCircle size={16} />,
      hint: qualifiedLeads ? `${qualifiedLeads} ready to close` : 'Nurture leads' },
    { to: '/leads?status=WON', label: 'Won Deals', icon: <Trophy size={16} />,
      hint: wonDeals ? `${wonDeals} closed` : 'Celebrate soon' },
    { to: '/customers', label: 'Customers', icon: <Building2 size={16} />,
      hint: stats?.customersTotal ? `${stats.customersTotal} accounts` : '' },
    { to: '/search', label: 'Ask AI', icon: <Search size={16} />, hint: 'Search your CRM' },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Clock size={18} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Greeting banner */}
      <div className="dashboard-greeting">
        <div>
          <h1>Welcome back{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''} 👋</h1>
          <p>Here's what's happening across your pipeline today.</p>
        </div>
        <Link to="/leads?action=new" className="btn-add" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
          <Plus size={16} /> New Lead
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="stats-grid">
        {statCards.map((c, i) => (
          <StatCard key={i} label={c.label} value={c.value} accent={c.color} icon={c.icon} />
        ))}
      </div>

      {/* Top row: pipeline chart + upcoming tasks + quick actions */}
      <div className="dashboard-grid-3">
        <BerryCard
          title={<><Briefcase size={16} style={{ color: '#5e35d1' }} /> Opportunities</>}
          subtitle={`${stats?.totalOpportunities ?? 0} open deals worth $${Number(pipeline || 0).toLocaleString()}`}
        >
          {stageChartData.length ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
                  <XAxis dataKey="stage" tick={{ fill: '#9aa0b4', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9aa0b4', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#fff', border: '1px solid #e0e0e0',
                      borderRadius: 8, color: '#1f2937', fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#5e35d1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="empty-state">No opportunities yet.</p>}
        </BerryCard>

        <BerryCard
          title={<><ListChecks size={16} style={{ color: '#00a854' }} /> Upcoming Tasks</>}
          subtitle="Next things to do"
        >
          {upcomingTasks.length === 0 ? (
            <p className="empty-state">No upcoming tasks.</p>
          ) : (
            <div>
              {upcomingTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="task-list-item">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">
                      {t.priority} · {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : 'No due date'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BerryCard>

        <BerryCard
          title={<><Sparkles size={16} style={{ color: '#5e35d1' }} /> Quick Actions</>}
          subtitle="Jump straight into your CRM"
        >
          <div className="quick-action-grid">
            {quickActions.map((a) => (
              <Link key={a.to} to={a.to} className={`quick-action-btn ${a.variant || ''}`}>
                <span className="quick-action-icon">{a.icon}</span>
                <span className="quick-action-body">
                  <span className="quick-action-label">{a.label}</span>
                  {a.hint && <span className="quick-action-hint">{a.hint}</span>}
                </span>
              </Link>
            ))}
          </div>
        </BerryCard>
      </div>

      {/* Recent + Top leads */}
      <div className="dashboard-grid-2">
        <BerryCard
          title={<><Users size={16} style={{ color: '#1a73e8' }} /> Recent Leads</>}
          subtitle="Latest added leads"
          bodyClassName="flush"
        >
          {recentLeads.length > 0 ? (
            <div>
              {recentLeads.map(lead => (
                <Link key={lead.id} to={`/leads/${lead.id}`} className="lead-list-item">
                  <div>
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-company">{lead.company || 'No company'}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p className="empty-state">No recent leads</p>}
        </BerryCard>

        <BerryCard
          title={<><Trophy size={16} style={{ color: '#f59e0b' }} /> Top Leads by Score</>}
          subtitle="Highest scored leads"
          bodyClassName="flush"
        >
          {topLeads.length > 0 ? (
            <div>
              {topLeads.map(lead => (
                <Link key={lead.id} to={`/leads/${lead.id}`} className="lead-list-item">
                  <span className="lead-name">{lead.name}</span>
                  <span className="lead-score">{lead.score}/100</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No analyzed leads yet.</p>
              <p className="empty-state-small">Run AI analysis on a lead to get a score.</p>
            </div>
          )}
        </BerryCard>
      </div>

      {/* AI Search (RAG) */}
      <BerryCard
        title={<><Search size={16} style={{ color: '#7c4dff' }} /> Ask Your CRM (RAG)</>}
        subtitle="Ask a question about your customers, deals, notes — answered with AI over your data."
      >
        <form onSubmit={handleAsk} className="rag-search-form">
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="e.g. Which deals are stuck in negotiation?"
            className="rag-search-input"
          />
          <button type="submit" className="btn-primary" disabled={searching}>
            {searching ? '🤔 Thinking…' : '🔍 Ask'}
          </button>
        </form>
        {searchAnswer && (
          <div className="rag-answer">
            <div className="rag-answer-label">Answer</div>
            <div className="rag-answer-text">{searchAnswer}</div>
            {searchResults.length > 0 && (
              <div className="rag-sources">Sources: {searchResults.length} chunks</div>
            )}
          </div>
        )}
      </BerryCard>

      {/* AI Insights */}
      <BerryCard
        title={<><Lightbulb size={16} style={{ color: '#f59e0b' }} /> AI Insights</>}
      >
        <div className="insight-card">
          Use the AI Tools tab on any lead to generate personalized emails, summaries, and follow-ups.
          Add notes to your records — they get embedded and become searchable via the search box above.
        </div>
      </BerryCard>
    </div>
  );
}

export default DashboardPage;
