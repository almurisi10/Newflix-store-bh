import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './AdminAuthContext';

interface SiteContentItem {
  id: number;
  contentKey: string;
  page: string;
  section: string;
  valueAr: string;
  valueEn: string;
  contentType: string;
  styles: Record<string, any>;
  updatedAt: string;
  updatedBy: string | null;
}

interface SiteContentContextType {
  content: Record<string, SiteContentItem>;
  loading: boolean;
  getText: (key: string, lang: string) => string;
  getStyles: (key: string) => Record<string, any>;
  updateContent: (key: string, updates: { valueAr?: string; valueEn?: string; styles?: Record<string, any> }) => Promise<boolean>;
  refreshContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api' || '/api';

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Record<string, SiteContentItem>>({});
  const [loading, setLoading] = useState(true);
  const { token } = useAdminAuth();

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/site-content`);
      const data = await res.json();
      const mapped: Record<string, SiteContentItem> = {};
      for (const item of data) {
        mapped[item.contentKey] = item;
      }
      setContent(mapped);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getText = useCallback((key: string, lang: string) => {
    const item = content[key];
    if (!item) return '';
    return lang === 'ar' ? item.valueAr : item.valueEn;
  }, [content]);

  const getStyles = useCallback((key: string) => {
    return content[key]?.styles || {};
  }, [content]);

  const updateContent = useCallback(async (key: string, updates: { valueAr?: string; valueEn?: string; styles?: Record<string, any> }) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/site-content/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) return false;
      const updated = await res.json();
      setContent(prev => ({ ...prev, [key]: updated }));
      return true;
    } catch {
      return false;
    }
  }, [token]);

  return (
    <SiteContentContext.Provider value={{ content, loading, getText, getStyles, updateContent, refreshContent: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error('useSiteContent must be used within SiteContentProvider');
  return context;
}
