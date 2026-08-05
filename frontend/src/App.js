import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TenantSetupPage from './pages/TenantSetupPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import TasksPage from './pages/TasksPage';
import SearchPage from './pages/SearchPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/Auth.css';

// Wrap a protected route inside the new AppShell so it gets sidebar + topbar.
const Shell = ({ children }) => <ProtectedRoute><AppShell>{children}</AppShell></ProtectedRoute>;
const ShellNoTenant = ({ children }) => <ProtectedRoute requireTenant={false}><AppShell>{children}</AppShell></ProtectedRoute>;

function AppContent() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes — full-page, no shell */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Tenant setup: authenticated but not yet a tenant member */}
        <Route path="/setup" element={<ShellNoTenant><TenantSetupPage /></ShellNoTenant>} />

        {/* Protected routes (require tenant) — wrapped in AppShell */}
        <Route path="/dashboard" element={<Shell><DashboardPage /></Shell>} />
        <Route path="/leads" element={<Shell><LeadsPage /></Shell>} />
        <Route path="/leads/:id" element={<Shell><LeadDetailPage /></Shell>} />
        <Route path="/customers" element={<Shell><CustomersPage /></Shell>} />
        <Route path="/customers/:id" element={<Shell><CustomerDetailPage /></Shell>} />
        <Route path="/opportunities" element={<Shell><OpportunitiesPage /></Shell>} />
        <Route path="/opportunities/:id" element={<Shell><OpportunityDetailPage /></Shell>} />
        <Route path="/tasks" element={<Shell><TasksPage /></Shell>} />
        <Route path="/search" element={<Shell><SearchPage /></Shell>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppContent />
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;