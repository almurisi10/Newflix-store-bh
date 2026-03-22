import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  isAdminAuthenticated: boolean;
  checkAdminStatus: (email: string, firebaseUid: string) => Promise<{ isAdmin: boolean; role: string | null }>;
  loginWithFirebase: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string, inviteCode: string, role: string, firebaseUid?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api' || '/api';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/admin-auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Invalid token');
        return r.json();
      })
      .then(data => {
        setAdmin(data.admin);
        setLoading(false);
      })
      .catch(() => {
        logout();
        setLoading(false);
      });
  }, [token, logout]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser && !token) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch(`${API_BASE}/admin-auth/firebase-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          if (res.ok) {
            const data = await res.json();
            setToken(data.token);
            setAdmin(data.admin);
            localStorage.setItem('admin_token', data.token);
          }
        } catch {
        }
      }
      if (!firebaseUser && !token) {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [token]);

  const checkAdminStatus = async (email: string, firebaseUid: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin-auth/check-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firebaseUid }),
      });
      const data = await res.json();
      return { isAdmin: data.isAdmin, role: data.role };
    } catch {
      return { isAdmin: false, role: null };
    }
  };

  const loginWithFirebase = async (idToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin-auth/firebase-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('admin_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Connection error' };
    }
  };

  const register = async (email: string, password: string, displayName: string, inviteCode: string, role: string, firebaseUid?: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, inviteCode, role, firebaseUid }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('admin_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Connection error' };
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, isAdminAuthenticated: !!admin, checkAdminStatus, loginWithFirebase, register, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
}
