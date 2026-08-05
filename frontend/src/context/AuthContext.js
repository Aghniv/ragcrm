import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI, tenantAPI } from '../services/api';
import { apiErrorMessage } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const STORAGE_TOKEN = 'auth_token';
const STORAGE_USER = 'auth_user';
const STORAGE_TENANT = 'active_tenant_id';
const STORAGE_TENANTS = 'user_tenants';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);         // [{ id, slug, name, plan, role }]
  const [activeTenantId, setActiveTenantId] = useState(null);

  // ---- Hydrate from localStorage on mount ----
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const userJson = localStorage.getItem(STORAGE_USER);
    const tenantJson = localStorage.getItem(STORAGE_TENANTS);
    const active = localStorage.getItem(STORAGE_TENANT);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        setIsAuthenticated(true);
        if (tenantJson) setTenants(JSON.parse(tenantJson));
        if (active) setActiveTenantId(Number(active));
      } catch (e) {
        console.error('Failed to parse stored auth state:', e);
        clearAll();
      }
    }
    setLoading(false);
  }, []);

  // ---- Refresh the user's tenant list (called after creating a tenant) ----
  const refreshTenants = useCallback(async () => {
    try {
      const res = await tenantAPI.mine();
      const list = Array.isArray(res.data) ? res.data : [];
      setTenants(list);
      localStorage.setItem(STORAGE_TENANTS, JSON.stringify(list));
      return list;
    } catch (e) {
      console.error('Failed to load tenants:', e);
      return [];
    }
  }, []);

  // ---- Switch the active tenant (persists + mutates in-memory) ----
  const switchTenant = useCallback((tenantId) => {
    if (!tenantId) return;
    setActiveTenantId(tenantId);
    localStorage.setItem(STORAGE_TENANT, String(tenantId));
  }, []);

  // ---- Login: after success, fetch tenants and pick the right one ----
  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      const { token, user } = res.data || {};
      if (!token) return { success: false, message: 'Login failed: no token returned' };

      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);

      const list = await refreshTenants();
      if (list.length === 1) {
        switchTenant(list[0].id);
      } else if (list.length > 1) {
        // Don't auto-pick — let the user choose
        setActiveTenantId(null);
        localStorage.removeItem(STORAGE_TENANT);
      } else {
        setActiveTenantId(null);
        localStorage.removeItem(STORAGE_TENANT);
      }

      return { success: true, hasTenants: list.length > 0, tenantCount: list.length };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Login failed') };
    }
  };

  // ---- Register: same as login but route to tenant setup if no tenants yet ----
  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register(name, email, password);
      const { token, user } = res.data || {};
      if (!token) return { success: false, message: 'Registration failed' };

      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);
      // After register, /api/tenants/mine returns [] — frontend will route to setup
      setTenants([]);
      localStorage.removeItem(STORAGE_TENANTS);
      localStorage.removeItem(STORAGE_TENANT);
      setActiveTenantId(null);

      return { success: true };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Registration failed') };
    }
  };

  // ---- Create a tenant: response contains a new JWT scoped to that tenant ----
  const createTenant = async (slug, name) => {
    try {
      const res = await tenantAPI.create(slug, name);
      const { token, tenant } = res.data || {};
      if (token) {
        localStorage.setItem(STORAGE_TOKEN, token);
      }
      if (tenant?.id) {
        switchTenant(tenant.id);
      }
      await refreshTenants();
      return { success: true, tenant };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Failed to create tenant') };
    }
  };

  // ---- Logout: clear everything and bounce to login ----
  const logout = useCallback(() => {
    clearAll();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setTenants([]);
    setActiveTenantId(null);
  }, []);

  const clearAll = () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TENANT);
    localStorage.removeItem(STORAGE_TENANTS);
  };

  // ---- Derived helpers ----
  const isAdmin = currentUser?.role === 'ADMIN';
  const needsTenant = isAuthenticated && tenants.length === 0;
  const hasMultipleTenants = tenants.length > 1;
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || null;

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    isAdmin,
    tenants,
    activeTenant,
    activeTenantId,
    needsTenant,
    hasMultipleTenants,
    login,
    register,
    logout,
    createTenant,
    switchTenant,
    refreshTenants,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
