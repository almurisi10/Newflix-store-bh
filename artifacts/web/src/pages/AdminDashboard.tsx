import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { useListProducts, useListCategories, useGetAdminStats, useListHomepageSections } from '@workspace/api-client-react';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, Settings, Activity, Home, Store,
  Info, Phone, MessageSquare, Menu as MenuIcon, LogOut,
  ChevronDown, ChevronUp, GripVertical, Eye, EyeOff,
  Save, Package, ShoppingCart, DollarSign, Users, Shield
} from 'lucide-react';

type AdminTab = 'overview' | 'pages' | 'homepage' | 'content' | 'products' | 'orders' | 'activity' | 'settings';

export default function AdminDashboard() {
  const { admin, isAdminAuthenticated, loading: authLoading, logout, token } = useAdminAuth();
  const { lang } = useLanguage();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdminAuthenticated) {
      navigate('/Newflix-login');
    }
  }, [authLoading, isAdminAuthenticated, navigate]);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!isAdminAuthenticated) return null;

  const tabs: { key: AdminTab; icon: any; labelAr: string; labelEn: string }[] = [
    { key: 'overview', icon: LayoutDashboard, labelAr: 'نظرة عامة', labelEn: 'Overview' },
    { key: 'pages', icon: FileText, labelAr: 'إدارة الصفحات', labelEn: 'Page Management' },
    { key: 'homepage', icon: Home, labelAr: 'ترتيب الرئيسية', labelEn: 'Homepage Sections' },
    { key: 'content', icon: MessageSquare, labelAr: 'إدارة المحتوى', labelEn: 'Content (CMS)' },
    { key: 'products', icon: Package, labelAr: 'المنتجات', labelEn: 'Products' },
    { key: 'orders', icon: ShoppingCart, labelAr: 'الطلبات', labelEn: 'Orders' },
    { key: 'activity', icon: Activity, labelAr: 'سجل النشاط', labelEn: 'Activity Log' },
    { key: 'settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-e border-border flex flex-col transition-all shrink-0`}>
        <div className="p-4 border-b border-border flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
            <MenuIcon className="w-5 h-5" />
          </button>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm">{lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}</p>
              <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={() => { logout(); navigate('/Newflix-login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'pages' && <PagesTab />}
        {activeTab === 'homepage' && <HomepageTab token={token} lang={lang} />}
        {activeTab === 'content' && <ContentTab token={token} lang={lang} />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'activity' && <ActivityTab token={token} lang={lang} />}
        {activeTab === 'settings' && <SettingsTab token={token} lang={lang} />}
      </main>
    </div>
  );
}

function OverviewTab() {
  const { lang } = useLanguage();
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-muted rounded-2xl" /><div className="h-32 bg-muted rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'نظرة عامة' : 'Overview'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: lang === 'ar' ? 'الإيرادات' : 'Revenue', value: `${stats?.totalRevenue || 0} BHD`, icon: DollarSign, color: 'text-green-500' },
          { label: lang === 'ar' ? 'الطلبات' : 'Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-500' },
          { label: lang === 'ar' ? 'المنتجات' : 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-purple-500' },
          { label: lang === 'ar' ? 'مخزون منخفض' : 'Low Stock', value: stats?.lowStockProducts || 0, icon: Activity, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold mb-4">{lang === 'ar' ? 'أحدث الطلبات' : 'Recent Orders'}</h3>
          <div className="space-y-3">
            {stats.recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex justify-between items-center border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-end">
                  <p className="font-bold">{order.total} BHD</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PagesTab() {
  const { lang } = useLanguage();
  const pages = [
    { nameAr: 'الصفحة الرئيسية', nameEn: 'Homepage', path: '/', sections: ['hero', 'features', 'categories', 'products', 'CTA'] },
    { nameAr: 'المتجر', nameEn: 'Shop', path: '/shop', sections: ['filters', 'grid', 'search'] },
    { nameAr: 'من نحن', nameEn: 'About', path: '/about', sections: ['content'] },
    { nameAr: 'اتصل بنا', nameEn: 'Contact', path: '/contact', sections: ['details'] },
    { nameAr: 'الأسئلة الشائعة', nameEn: 'FAQ', path: '/faq', sections: ['questions'] },
    { nameAr: 'الشروط والأحكام', nameEn: 'Terms', path: '/terms', sections: ['content'] },
    { nameAr: 'سياسة الخصوصية', nameEn: 'Privacy', path: '/privacy', sections: ['content'] },
    { nameAr: 'سياسة الاسترجاع', nameEn: 'Refund', path: '/refund-policy', sections: ['content'] },
    { nameAr: 'شريط التنقل', nameEn: 'Navbar', path: 'global', sections: ['logo', 'links', 'actions'] },
    { nameAr: 'تذييل الصفحة', nameEn: 'Footer', path: 'global', sections: ['columns', 'copyright'] },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'إدارة الصفحات' : 'Page Management'}</h2>
      <p className="text-muted-foreground text-sm">{lang === 'ar' ? 'كل صفحة في الموقع لها منطقة تحكم في لوحة الإدارة. استخدم وضع التحرير المباشر لتعديل المحتوى مباشرة.' : 'Every page has a management area. Use inline Edit Mode for direct content editing.'}</p>
      <div className="grid gap-4">
        {pages.map((page, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold">{lang === 'ar' ? page.nameAr : page.nameEn}</h3>
              <p className="text-xs text-muted-foreground mt-1">{page.path}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {page.sections.map(s => (
                  <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <a href={page.path === 'global' ? '/' : page.path} target="_blank" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                {lang === 'ar' ? 'عرض' : 'View'}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomepageTab({ token, lang }: { token: string | null; lang: string }) {
  const { data: sections, isLoading, refetch } = useListHomepageSections();
  const [localSections, setLocalSections] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (sections) {
      setLocalSections([...sections].sort((a: any, b: any) => a.sortOrder - b.sortOrder));
    }
  }, [sections]);

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= localSections.length) return;
    const updated = [...localSections];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setLocalSections(updated.map((s, i) => ({ ...s, sortOrder: i + 1 })));
  };

  const toggleSection = (index: number) => {
    setLocalSections(prev => prev.map((s, i) => i === index ? { ...s, active: !s.active } : s));
  };

  const saveOrder = async () => {
    if (!token) return;
    setSaving(true);
    const apiBase = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';
    try {
      await fetch(`${apiBase}/homepage/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localSections.map((s, i) => ({
          id: s.id,
          sortOrder: i + 1,
          active: s.active,
          titleAr: s.titleAr,
          titleEn: s.titleEn,
          subtitleAr: s.subtitleAr,
          subtitleEn: s.subtitleEn,
          config: s.config,
        }))),
      });
      toast.success(lang === 'ar' ? 'تم حفظ الترتيب' : 'Order saved');
      refetch();
    } catch {
      toast.error(lang === 'ar' ? 'فشل الحفظ' : 'Save failed');
    }
    setSaving(false);
  };

  const handleDragStart = (index: number) => { setDragIndex(index); };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      moveSection(dragIndex, index);
      setDragIndex(index);
    }
  };
  const handleDragEnd = () => { setDragIndex(null); };

  if (isLoading) return <div className="animate-pulse h-64 bg-muted rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'ترتيب أقسام الصفحة الرئيسية' : 'Homepage Section Order'}</h2>
        <button onClick={saveOrder} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? '...' : (lang === 'ar' ? 'حفظ الترتيب' : 'Save Order')}
        </button>
      </div>

      <div className="space-y-2">
        {localSections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-card border rounded-xl p-4 flex items-center gap-4 transition-all ${
              dragIndex === index ? 'border-primary shadow-lg scale-[1.02]' : 'border-border'
            } ${!section.active ? 'opacity-50' : ''}`}
          >
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
              <GripVertical className="w-5 h-5" />
            </div>
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{lang === 'ar' ? section.titleAr : section.titleEn}</p>
              <p className="text-xs text-muted-foreground">{section.sectionType}</p>
            </div>
            <button onClick={() => toggleSection(index)} className={`p-2 rounded-lg transition-colors ${section.active ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-muted-foreground hover:bg-muted'}`}>
              {section.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveSection(index, index - 1)} disabled={index === 0} className="p-1 hover:bg-muted rounded disabled:opacity-30">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => moveSection(index, index + 1)} disabled={index === localSections.length - 1} className="p-1 hover:bg-muted rounded disabled:opacity-30">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentTab({ token, lang }: { token: string | null; lang: string }) {
  const { content, updateContent, refreshContent } = useSiteContent();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValueAr, setEditValueAr] = useState('');
  const [editValueEn, setEditValueEn] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterPage, setFilterPage] = useState<string>('all');

  const allItems = Object.values(content);
  const pages = [...new Set(allItems.map(i => i.page))];
  const filtered = filterPage === 'all' ? allItems : allItems.filter(i => i.page === filterPage);
  const grouped: Record<string, typeof allItems> = {};
  for (const item of filtered) {
    const group = `${item.page} / ${item.section}`;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(item);
  }

  const startEdit = (item: any) => {
    setEditingKey(item.contentKey);
    setEditValueAr(item.valueAr);
    setEditValueEn(item.valueEn);
  };

  const saveEdit = async () => {
    if (!editingKey) return;
    setSaving(true);
    const success = await updateContent(editingKey, { valueAr: editValueAr, valueEn: editValueEn });
    setSaving(false);
    if (success) {
      toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved');
      setEditingKey(null);
    } else {
      toast.error(lang === 'ar' ? 'فشل الحفظ' : 'Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'إدارة المحتوى' : 'Content Management'}</h2>
        <select
          value={filterPage}
          onChange={(e) => setFilterPage(e.target.value)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-sm"
        >
          <option value="all">{lang === 'ar' ? 'كل الصفحات' : 'All Pages'}</option>
          {pages.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-muted/50 border-b border-border">
            <h3 className="font-bold text-sm">{group}</h3>
          </div>
          <div className="divide-y divide-border">
            {items.map(item => (
              <div key={item.contentKey} className="p-4">
                {editingKey === item.contentKey ? (
                  <div className="space-y-3">
                    <p className="text-xs font-mono text-muted-foreground">{item.contentKey}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium block mb-1">العربية</label>
                        <textarea value={editValueAr} onChange={(e) => setEditValueAr(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={3} dir="rtl" />
                      </div>
                      <div>
                        <label className="text-xs font-medium block mb-1">English</label>
                        <textarea value={editValueEn} onChange={(e) => setEditValueEn(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={3} dir="ltr" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={saving} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                        {saving ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
                      </button>
                      <button onClick={() => setEditingKey(null)} className="bg-muted px-4 py-1.5 rounded-lg text-sm hover:bg-muted/80">
                        {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/30 -m-4 p-4 rounded-lg transition-colors" onClick={() => startEdit(item)}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground mb-1">{item.contentKey}</p>
                      <p className="text-sm" dir="rtl">{item.valueAr}</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">{item.valueEn}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{lang === 'ar' ? 'تحرير' : 'Edit'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsTab() {
  const { lang } = useLanguage();
  const { data: productsData } = useListProducts({ limit: 100 });
  const { data: categories } = useListCategories();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'المنتجات' : 'Products'}</h2>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start px-4 py-3 font-medium">ID</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productsData?.products.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3 font-medium">{lang === 'ar' ? p.titleAr : p.titleEn}</td>
                  <td className="px-4 py-3">{p.price} BHD</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                      {p.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Inactive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { lang } = useLanguage();
  const { data: stats } = useGetAdminStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'الطلبات' : 'Orders'}</h2>

      {stats?.ordersByStatus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.ordersByStatus.map((item: any) => (
            <div key={item.status} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-sm text-muted-foreground capitalize">{item.status}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl">
        <div className="divide-y divide-border">
          {stats?.recentOrders?.map((order: any) => (
            <div key={order.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">{order.customerEmail} • {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-end">
                <p className="font-bold">{order.total} BHD</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityTab({ token, lang }: { token: string | null; lang: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const apiBase = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';
    fetch(`${apiBase}/admin-activity-logs?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-2xl" />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'سجل النشاط' : 'Activity Log'}</h2>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">{lang === 'ar' ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log: any) => (
              <div key={log.id} className="p-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.adminEmail}</span>
                    {' '}
                    <span className="text-muted-foreground">{log.action}</span>
                    {' '}
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{log.entityType}</span>
                    {log.entityId && <span className="text-xs text-muted-foreground"> #{log.entityId}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab({ token, lang }: { token: string | null; lang: string }) {
  const [signupDisabled, setSignupDisabled] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const apiBase = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';
    fetch(`${apiBase}/admin-settings`)
      .then(r => r.json())
      .then(data => {
        if (data.admin_signup_disabled?.value) setSignupDisabled(true);
        if (data.maintenance_mode?.value) setMaintenanceMode(true);
      })
      .catch(() => {});
  }, []);

  const updateSetting = async (key: string, value: any) => {
    if (!token) return;
    setSaving(key);
    const apiBase = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';
    try {
      await fetch(`${apiBase}/admin-settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value }),
      });
      toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved');
    } catch {
      toast.error(lang === 'ar' ? 'فشل الحفظ' : 'Save failed');
    }
    setSaving(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</h2>

      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="font-medium">{lang === 'ar' ? 'تعطيل تسجيل المدراء' : 'Disable Admin Signup'}</p>
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إخفاء زر إنشاء حساب مدير جديد' : 'Hide the create admin account button'}</p>
          </div>
          <button
            onClick={() => { const newVal = !signupDisabled; setSignupDisabled(newVal); updateSetting('admin_signup_disabled', { value: newVal }); }}
            className={`w-12 h-6 rounded-full transition-colors relative ${signupDisabled ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${signupDisabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0.5 rtl:-translate-x-0.5'}`} />
          </button>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="font-medium">{lang === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}</p>
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إظهار صفحة صيانة للزوار' : 'Show maintenance page to visitors'}</p>
          </div>
          <button
            onClick={() => { const newVal = !maintenanceMode; setMaintenanceMode(newVal); updateSetting('maintenance_mode', { value: newVal }); }}
            className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${maintenanceMode ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0.5 rtl:-translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
