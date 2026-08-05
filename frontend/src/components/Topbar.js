import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search as SearchIcon,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Building2,
} from 'lucide-react';

const PAGE_TITLES = [
  { test: /^\/dashboard/, title: 'Dashboard' },
  { test: /^\/leads\/\d+/, title: 'Lead Detail' },
  { test: /^\/leads/, title: 'Leads' },
  { test: /^\/customers\/\d+/, title: 'Customer' },
  { test: /^\/customers/, title: 'Customers' },
  { test: /^\/opportunities\/\d+/, title: 'Opportunity' },
  { test: /^\/opportunities/, title: 'Pipeline' },
  { test: /^\/tasks/, title: 'Tasks' },
  { test: /^\/search/, title: 'Ask AI' },
  { test: /^\/contact/, title: 'Contact' },
  { test: /^\/setup/, title: 'Workspace setup' },
];

function resolveTitle(pathname) {
  const match = PAGE_TITLES.find((p) => p.test.test(pathname));
  return match ? match.title : 'SalesPilot';
}

function initials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0][0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function Topbar() {
  const { currentUser, tenants, activeTenant, switchTenant, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null); // 'user' | 'tenants' | null
  const [searchValue, setSearchValue] = useState('');
  const rootRef = useRef(null);

  // Close any open menu when clicking outside the topbar.
  useEffect(() => {
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    if (openMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  };

  const handleLogout = () => {
    setOpenMenu(null);
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar" ref={rootRef}>
      <div className="topbar-left">
        <span className="topbar-title">{resolveTitle(window.location.pathname)}</span>
      </div>

      <div className="topbar-right">
        <form className="topbar-search" onSubmit={handleSearch}>
          <SearchIcon size={16} />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search leads, customers, deals…"
            aria-label="Global search"
          />
        </form>

        <button
          type="button"
          className="topbar-icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="badge" aria-hidden="true" />
        </button>

        {/* Tenant switcher */}
        <button
          type="button"
          className="topbar-icon-btn"
          aria-label="Workspaces"
          title="Switch workspace"
          onClick={() => setOpenMenu(openMenu === 'tenants' ? null : 'tenants')}
        >
          <Building2 size={18} />
        </button>
        {openMenu === 'tenants' && (
          <div className="topbar-menu" role="menu" aria-label="Workspaces">
            <div className="topbar-menu-section">Your workspaces</div>
            {tenants.length === 0 && (
              <button type="button" className="topbar-menu-item" disabled>
                No workspaces yet
              </button>
            )}
            {tenants.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`topbar-menu-item ${activeTenant?.id === t.id ? 'active' : ''}`}
                onClick={() => {
                  switchTenant(t.id);
                  setOpenMenu(null);
                }}
              >
                <Building2 size={14} /> {t.name} <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: 12 }}>{t.plan || 'free'}</span>
              </button>
            ))}
            <div className="topbar-menu-divider" />
            <button
              type="button"
              className="topbar-menu-item"
              onClick={() => {
                setOpenMenu(null);
                navigate('/setup');
              }}
            >
              ➕ New workspace
            </button>
          </div>
        )}

        {/* User menu */}
        <button
          type="button"
          className="topbar-user"
          onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
          aria-haspopup="menu"
          aria-expanded={openMenu === 'user'}
        >
          <span className="topbar-avatar">{initials(currentUser?.name || currentUser?.email)}</span>
          <span style={{ display: window.innerWidth < 768 ? 'none' : 'inline' }}>
            {currentUser?.name || 'You'}
          </span>
          <ChevronDown size={14} />
        </button>
        {openMenu === 'user' && (
          <div className="topbar-menu" role="menu" aria-label="Account">
            <div className="topbar-menu-section">Signed in as</div>
            <button type="button" className="topbar-menu-item" disabled style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 600 }}>{currentUser?.name || 'You'}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentUser?.email}</span>
            </button>
            <div className="topbar-menu-divider" />
            <button type="button" className="topbar-menu-item" onClick={() => { setOpenMenu(null); navigate('/dashboard'); }}>
              <User size={14} /> Dashboard
            </button>
            <button type="button" className="topbar-menu-item danger" onClick={handleLogout}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
