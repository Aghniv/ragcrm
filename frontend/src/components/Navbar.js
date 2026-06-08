import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar className="custom-navbar" variant="dark" expand="lg" fixed="top">
      <Container fluid className="px-4">
        <LinkContainer to="/dashboard">
          <BootstrapNavbar.Brand className="d-flex align-items-center gap-2">
            <div className="brand-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="6" fill="url(#gradient)"/>
                <path d="M8 14C8 10.6863 10.6863 8 14 8V8C17.3137 8 20 10.6863 20 14V14C20 17.3137 17.3137 20 14 20V20C10.6863 20 8 17.3137 8 14V14Z" stroke="white" strokeWidth="2"/>
                <circle cx="14" cy="14" r="3" fill="white"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1"/>
                    <stop offset="1" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="brand-text">Sales<span className="brand-accent">CRM</span></span>
          </BootstrapNavbar.Brand>
        </LinkContainer>

        <BootstrapNavbar.Toggle aria-controls="custom-navbar-nav" className="border-0" />
        <BootstrapNavbar.Collapse id="custom-navbar-nav">
          <Nav className="me-auto gap-2">
            <LinkContainer to="/dashboard">
              <Nav.Link className="nav-item-custom">
                <LayoutDashboard className="nav-icon" size={18} />
                <span>Dashboard</span>
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/leads">
              <Nav.Link className="nav-item-custom">
                <Users className="nav-icon" size={18} />
                <span>Leads</span>
              </Nav.Link>
            </LinkContainer>
          </Nav>

          {isAuthenticated && (
            <Nav className="ms-auto">
              <Dropdown className="user-dropdown" show={showDropdown} onToggle={setShowDropdown}>
                <Dropdown.Toggle variant="link" className="nav-link user-menu d-flex align-items-center gap-2">
                  <div className="user-avatar">
                    <User size={16} />
                  </div>
                  <span className="user-name">{currentUser?.name || 'User'}</span>
                  <ChevronDown size={14} className={`dropdown-arrow ${showDropdown ? 'rotate' : ''}`} />
                </Dropdown.Toggle>
                <Dropdown.Menu align="end" className="user-menu-dropdown">
                  <div className="user-info px-3 py-2">
                    <div className="user-email">{currentUser?.email}</div>
                  </div>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="logout-item">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;