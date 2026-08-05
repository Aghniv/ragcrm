import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  ListChecks,
  Search,
  LogOut,
  Sparkles,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'CRM',
    items: [
      { to: '/leads', label: 'Leads', icon: Users },
      { to: '/customers', label: 'Customers', icon: Building2 },
      { to: '/opportunities', label: 'Pipeline', icon: Briefcase },
      { to: '/tasks', label: 'Tasks', icon: ListChecks },
    ],
  },
  {
    label: 'AI',
    items: [
      { to: '/search', label: 'Ask AI', icon: Search },
    ],
  },
];

function initials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return nameOrEmail.charAt(0).toUpperCase();
  return ((parts[0][0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function Sidebar() {
  const { currentUser, activeTenant, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark" aria-hidden="true">S</div>
        <span>
          Sales<span className="sidebar-brand-accent">Pilot</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="sidebar-icon" size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Public Contact link so visitors can always get in touch */}
        <div>
          <div className="sidebar-section-label">Help</div>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Sparkles className="sidebar-icon" size={18} />
            <span>Contact</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        {activeTenant && (
          <div
            className="sidebar-user"
            title={`${activeTenant.name} (${activeTenant.plan || 'free'})`}
          >
            <div className="sidebar-user-avatar">
              {(activeTenant.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{activeTenant.name}</div>
              <div className="sidebar-user-email">
                {isAdmin ? 'Admin' : currentUser?.role || 'Member'} · {activeTenant.plan || 'free'}
              </div>
            </div>
          </div>
        )}

        {currentUser && (
          <div className="sidebar-user" title={currentUser.email}>
            <div className="sidebar-user-avatar">{initials(currentUser.name || currentUser.email)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser.name || 'You'}</div>
              <div className="sidebar-user-email">{currentUser.email}</div>
            </div>
          </div>
        )}

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
