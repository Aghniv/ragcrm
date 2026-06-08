import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leadAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Users, UserPlus, Phone, CheckCircle, FileText, Trophy, XCircle,
  Plus, List, Lightbulb, TrendingUp, Clock
} from 'lucide-react';

function DashboardPage() {
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
  const [recentLeads, setRecentLeads] = useState([]);
  const [topLeads, setTopLeads] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await leadAPI.getAll({});
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

      const sorted = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentLeads(sorted.slice(0, 5));

      const topByScore = [...leads]
        .filter(l => l.score)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      setTopLeads(topByScore);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Leads', value: stats.total, color: '#1a73e8', icon: <Users className="h-4 w-4" /> },
    { label: 'New', value: stats.new, color: '#4285f4', icon: <UserPlus className="h-4 w-4" /> },
    { label: 'Contacted', value: stats.contacted, color: '#fbbc04', icon: <Phone className="h-4 w-4" /> },
    { label: 'Qualified', value: stats.qualified, color: '#34a853', icon: <CheckCircle className="h-4 w-4" /> },
    { label: 'Proposal', value: stats.proposal, color: '#9334e6', icon: <FileText className="h-4 w-4" /> },
    { label: 'Won', value: stats.won, color: '#0d652d', icon: <Trophy className="h-4 w-4" /> },
    { label: 'Lost', value: stats.lost, color: '#ea4335', icon: <XCircle className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 flex flex-col gap-4 md:gap-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl text-primary drop-shadow-lg">
          Active Sales Tracker
        </h1>
        <p className="text-center text-md md:text-lg text-muted-foreground mt-2">
          Your AI Sales Copilot at a glance
        </p>
      </div>

      {/* Stats Grid - Sales Dashboard Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className="flex-1 min-w-[120px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <span style={{ color: card.color }}>{card.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: card.color }}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Leads Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link
              to="/contact"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors font-medium"
            >
              <Plus className="h-4 w-4" /> Add New Lead
            </Link>
            <Link
              to="/leads"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors font-medium"
            >
              <List className="h-4 w-4" /> View All Leads
            </Link>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" /> Recent Leads
            </CardTitle>
            <CardDescription>Latest added leads</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[200px]">
              {recentLeads.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentLeads.map(lead => (
                    <Link
                      key={lead.id}
                      to={`/leads/${lead.id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors block"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{lead.name}</span>
                        <span className="text-sm text-muted-foreground">{lead.company || 'No company'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-muted-foreground">No recent leads</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Leads by Score */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Top Leads by Score
            </CardTitle>
            <CardDescription>Highest scored leads</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[200px]">
              {topLeads.length > 0 ? (
                <div className="divide-y divide-border">
                  {topLeads.map(lead => (
                    <Link
                      key={lead.id}
                      to={`/leads/${lead.id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors block"
                    >
                      <span className="font-medium">{lead.name}</span>
                      <span className="font-bold text-emerald-500">{lead.score}/100</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No analyzed leads yet.</p>
                  <p className="text-xs mt-1">Run AI analysis to get scores!</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" /> AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The AI analyzes each lead to determine quality score and urgency. Use the "Analyze" button on any lead to get AI-powered insights for personalized sales strategy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
