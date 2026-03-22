import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { useListProducts, useListCategories, useListHomepageSections } from '@workspace/api-client-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, Settings, Activity, Home, Store,
  MessageSquare, Menu as MenuIcon, LogOut, X, Plus, Trash2, Edit3, Check, Image as ImageIcon,
  ChevronDown, ChevronUp, GripVertical, Eye, EyeOff, Gift, CreditCard, Star,
  Save, Package, ShoppingCart, DollarSign, Users, Shield, Upload, Tag
} from 'lucide-react';

const API = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

function adminHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function adminFetch(url: string, token: string | null, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: { ...adminHeaders(token), ...(options.headers || {}) },
  });
}

type AdminTab = 'overview' | 'pages' | 'homepage' | 'content' | 'products' | 'orders' | 'coupons' | 'users' | 'loyalty' | 'payment' | 'activity' | 'settings';

export default function AdminDashboard() {
  const { admin, isAdminAuthenticated, loading: authLoading, logout, token } = useAdminAuth();
  const { lang } = useLanguage();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdminAuthenticated) navigate('/Newflix-login');
  }, [authLoading, isAdminAuthenticated, navigate]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdminAuthenticated) return null;

  const tabs: { key: AdminTab; icon: any; labelAr: string; labelEn: string }[] = [
    { key: 'overview', icon: LayoutDashboard, labelAr: 'نظرة عامة', labelEn: 'Overview' },
    { key: 'products', icon: Package, labelAr: 'المنتجات', labelEn: 'Products' },
    { key: 'orders', icon: ShoppingCart, labelAr: 'الطلبات', labelEn: 'Orders' },
    { key: 'coupons', icon: Tag, labelAr: 'كوبونات الخصم', labelEn: 'Coupons' },
    { key: 'users', icon: Users, labelAr: 'المستخدمين', labelEn: 'Users' },
    { key: 'loyalty', icon: Star, labelAr: 'نقاط الولاء', labelEn: 'Loyalty Points' },
    { key: 'payment', icon: CreditCard, labelAr: 'طرق الدفع', labelEn: 'Payment' },
    { key: 'homepage', icon: Home, labelAr: 'الرئيسية', labelEn: 'Homepage' },
    { key: 'content', icon: MessageSquare, labelAr: 'المحتوى', labelEn: 'CMS' },
    { key: 'pages', icon: FileText, labelAr: 'الصفحات', labelEn: 'Pages' },
    { key: 'activity', icon: Activity, labelAr: 'السجل', labelEn: 'Activity' },
    { key: 'settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-muted-foreground hover:text-foreground">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm hidden sm:block">{lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {lang === 'ar' ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{admin?.email}</span>
            <button onClick={() => { logout(); navigate('/Newflix-login'); }} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card p-2 grid grid-cols-3 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setMobileMenuOpen(false); }}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {lang === 'ar' ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {activeTab === 'overview' && <OverviewTab token={token} />}
        {activeTab === 'pages' && <PagesTab />}
        {activeTab === 'homepage' && <HomepageTab token={token} lang={lang} />}
        {activeTab === 'content' && <ContentTab token={token} lang={lang} />}
        {activeTab === 'products' && <ProductsTab token={token} lang={lang} />}
        {activeTab === 'orders' && <OrdersTab token={token} lang={lang} />}
        {activeTab === 'coupons' && <CouponsTab lang={lang} token={token} />}
        {activeTab === 'users' && <UsersTab lang={lang} token={token} />}
        {activeTab === 'loyalty' && <LoyaltyTab lang={lang} />}
        {activeTab === 'payment' && <PaymentTab lang={lang} token={token} />}
        {activeTab === 'activity' && <ActivityTab token={token} lang={lang} />}
        {activeTab === 'settings' && <SettingsTab token={token} lang={lang} />}
      </main>
    </div>
  );
}

function OverviewTab({ token }: { token: string | null }) {
  const { lang } = useLanguage();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const r = await adminFetch(`${API}/admin/stats`, token); return r.json(); },
  });
  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-muted rounded-2xl" /><div className="h-32 bg-muted rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'نظرة عامة' : 'Overview'}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-2xl font-bold">{stat.value}</p>
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
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    delivered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || 'bg-muted'}`}>{status}</span>;
}

function ProductsTab({ token, lang }: { token: string | null; lang: string }) {
  const { data: productsData, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => { const r = await adminFetch(`${API}/products?limit=200&admin=true`, token); return r.json(); },
  });
  const { data: categories } = useListCategories();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({
    titleAr: '', titleEn: '', shortDescriptionAr: '', shortDescriptionEn: '',
    fullDescriptionAr: '', fullDescriptionEn: '', featuresAr: [] as string[], featuresEn: [] as string[],
    mainImage: '', price: '', comparePrice: '', discount: '',
    sku: '', categoryIds: [] as number[], productType: 'code', deliveryType: 'instant',
    deliveryMode: 'multi_code', singleCodeValue: '', active: true, featured: false, bestseller: false,
    packages: [] as any[],
  });
  const [inventoryCodes, setInventoryCodes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({
      titleAr: '', titleEn: '', shortDescriptionAr: '', shortDescriptionEn: '',
      fullDescriptionAr: '', fullDescriptionEn: '', featuresAr: [], featuresEn: [],
      mainImage: '', price: '', comparePrice: '', discount: '',
      sku: '', categoryIds: [], productType: 'code', deliveryType: 'instant',
      deliveryMode: 'multi_code', singleCodeValue: '', active: true, featured: false, bestseller: false,
      packages: [],
    });
    setInventoryCodes('');
    setEditProduct(null);
  };

  const openEdit = (p: any) => {
    setForm({
      titleAr: p.titleAr, titleEn: p.titleEn,
      shortDescriptionAr: p.shortDescriptionAr || '', shortDescriptionEn: p.shortDescriptionEn || '',
      fullDescriptionAr: p.fullDescriptionAr || '', fullDescriptionEn: p.fullDescriptionEn || '',
      featuresAr: p.featuresAr || [], featuresEn: p.featuresEn || [],
      mainImage: p.mainImage, price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : '',
      discount: p.discount ? String(p.discount) : '',
      sku: p.sku, categoryIds: p.categoryIds || [], productType: p.productType, deliveryType: p.deliveryType,
      deliveryMode: p.deliveryMode || 'multi_code', singleCodeValue: p.singleCodeValue || '',
      active: p.active, featured: p.featured, bestseller: p.bestseller,
      packages: p.packages || [],
    });
    setEditProduct(p);
    setShowForm(true);
  };

  const generateDescription = async () => {
    setGenerating(true);
    try {
      const res = await adminFetch(`${API}/ai/generate-product-description`, token, {
        method: 'POST',
        body: JSON.stringify({ titleAr: form.titleAr, titleEn: form.titleEn, productType: form.productType }),
      });
      const data = await res.json();
      if (data.shortDescriptionAr) {
        setForm(f => ({
          ...f,
          shortDescriptionAr: data.shortDescriptionAr, shortDescriptionEn: data.shortDescriptionEn,
          fullDescriptionAr: data.fullDescriptionAr, fullDescriptionEn: data.fullDescriptionEn,
          featuresAr: data.featuresAr || [], featuresEn: data.featuresEn || [],
        }));
        toast.success(lang === 'ar' ? 'تم توليد الوصف' : 'Description generated');
      }
    } catch { toast.error('Failed'); }
    setGenerating(false);
  };

  const addPackage = () => {
    setForm(f => ({ ...f, packages: [...f.packages, { nameAr: '', nameEn: '', price: '', duration: '' }] }));
  };

  const updatePackage = (idx: number, field: string, value: string) => {
    setForm(f => ({
      ...f,
      packages: f.packages.map((p: any, i: number) => i === idx ? { ...p, [field]: value } : p),
    }));
  };

  const removePackage = (idx: number) => {
    setForm(f => ({ ...f, packages: f.packages.filter((_: any, i: number) => i !== idx) }));
  };

  const saveProduct = async () => {
    if (!form.titleAr || !form.titleEn || !form.price || !form.sku) {
      toast.error(lang === 'ar' ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill required fields');
      return;
    }
    setSaving(true);
    const body = {
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      discount: form.discount ? parseFloat(form.discount) : null,
      gallery: [], tags: [], badges: [], stock: 0,
    };

    try {
      if (editProduct) {
        await adminFetch(`${API}/products/${editProduct.id}`, token, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        const res = await adminFetch(`${API}/products`, token, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        const newProduct = await res.json();
        if (inventoryCodes.trim() && form.deliveryMode === 'multi_code') {
          const codes = inventoryCodes.split('\n').map(c => c.trim()).filter(Boolean);
          for (const code of codes) {
            await adminFetch(`${API}/inventory/${newProduct.id}`, token, {
              method: 'POST',
              body: JSON.stringify({ items: [code] }),
            });
          }
        }
      }
      toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved');
      resetForm();
      setShowForm(false);
      refetch();
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  const deleteProduct = async (id: number) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    await adminFetch(`${API}/products/${id}`, token, { method: 'DELETE' });
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    refetch();
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{editProduct ? (lang === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (lang === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}</h2>
          <button onClick={() => { setShowForm(false); resetForm(); }} className="text-sm text-muted-foreground hover:text-foreground">✕ {lang === 'ar' ? 'إغلاق' : 'Close'}</button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الاسم بالعربي *' : 'Arabic Title *'}</label>
              <input value={form.titleAr} onChange={e => setForm(f => ({...f, titleAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الاسم بالإنجليزي *' : 'English Title *'}</label>
              <input value={form.titleEn} onChange={e => setForm(f => ({...f, titleEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" />
            </div>
          </div>

          <button onClick={generateDescription} disabled={generating || (!form.titleAr && !form.titleEn)} className="flex items-center gap-2 bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-600 disabled:opacity-50">
            <Star className="w-4 h-4" />
            {generating ? '...' : (lang === 'ar' ? 'توليد الوصف والمميزات بالذكاء الاصطناعي' : 'AI Generate Description & Features')}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'وصف قصير (عربي)' : 'Short Desc (AR)'}</label>
              <textarea value={form.shortDescriptionAr} onChange={e => setForm(f => ({...f, shortDescriptionAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm" rows={2} dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'وصف قصير (إنجليزي)' : 'Short Desc (EN)'}</label>
              <textarea value={form.shortDescriptionEn} onChange={e => setForm(f => ({...f, shortDescriptionEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm" rows={2} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'وصف كامل (عربي)' : 'Full Desc (AR)'}</label>
              <textarea value={form.fullDescriptionAr} onChange={e => setForm(f => ({...f, fullDescriptionAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm" rows={4} dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'وصف كامل (إنجليزي)' : 'Full Desc (EN)'}</label>
              <textarea value={form.fullDescriptionEn} onChange={e => setForm(f => ({...f, fullDescriptionEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm" rows={4} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'السعر * (د.ب)' : 'Price * (BHD)'}</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'سعر المقارنة' : 'Compare Price'}</label>
              <input type="number" step="0.01" value={form.comparePrice} onChange={e => setForm(f => ({...f, comparePrice: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الخصم %' : 'Discount %'}</label>
              <input type="number" step="1" value={form.discount} onChange={e => setForm(f => ({...f, discount: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">SKU *</label>
              <input value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'رابط الصورة الرئيسية' : 'Main Image URL'}</label>
            <input value={form.mainImage} onChange={e => setForm(f => ({...f, mainImage: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'نوع المنتج' : 'Product Type'}</label>
              <select value={form.productType} onChange={e => setForm(f => ({...f, productType: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
                <option value="code">{lang === 'ar' ? 'كود' : 'Code'}</option>
                <option value="account">{lang === 'ar' ? 'حساب' : 'Account'}</option>
                <option value="subscription">{lang === 'ar' ? 'اشتراك' : 'Subscription'}</option>
                <option value="link">{lang === 'ar' ? 'رابط' : 'Link'}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'طريقة التسليم' : 'Delivery Mode'}</label>
              <select value={form.deliveryMode} onChange={e => setForm(f => ({...f, deliveryMode: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
                <option value="multi_code">{lang === 'ar' ? 'أكواد متعددة (كود مختلف لكل عميل)' : 'Multiple Codes (unique per customer)'}</option>
                <option value="single_code">{lang === 'ar' ? 'كود واحد (نفس الكود لكل العملاء)' : 'Single Code (same for all)'}</option>
                <option value="whatsapp_manual">{lang === 'ar' ? 'تسليم يدوي عبر واتساب' : 'Manual WhatsApp Delivery'}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'التصنيف' : 'Category'}</label>
              <select value={form.categoryIds[0] || ''} onChange={e => setForm(f => ({...f, categoryIds: e.target.value ? [parseInt(e.target.value)] : []}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
                <option value="">{lang === 'ar' ? 'اختر' : 'Select'}</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>)}
              </select>
            </div>
          </div>

          {form.deliveryMode === 'single_code' && (
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الكود الثابت (يُسلّم لكل العملاء)' : 'Fixed Code (delivered to all customers)'}</label>
              <input value={form.singleCodeValue} onChange={e => setForm(f => ({...f, singleCodeValue: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm font-mono" />
            </div>
          )}

          {form.deliveryMode === 'multi_code' && !editProduct && (
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الأكواد (كل كود في سطر)' : 'Codes (one per line)'}</label>
              <textarea value={inventoryCodes} onChange={e => setInventoryCodes(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm font-mono" rows={5} placeholder={lang === 'ar' ? 'CODE-1234\nCODE-5678\nCODE-9012' : 'CODE-1234\nCODE-5678\nCODE-9012'} />
              <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'عدد الأكواد: ' : 'Codes count: '}{inventoryCodes.split('\n').filter(Boolean).length}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">{lang === 'ar' ? 'الباقات / المدد' : 'Packages / Plans'}</label>
              <button onClick={addPackage} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20">
                <Plus className="w-3 h-3 inline me-1" />{lang === 'ar' ? 'إضافة باقة' : 'Add Package'}
              </button>
            </div>
            {form.packages.map((pkg: any, idx: number) => (
              <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
                <input value={pkg.nameAr} onChange={e => updatePackage(idx, 'nameAr', e.target.value)} placeholder={lang === 'ar' ? 'اسم عربي' : 'Name AR'} className="bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-sm" dir="rtl" />
                <input value={pkg.nameEn} onChange={e => updatePackage(idx, 'nameEn', e.target.value)} placeholder={lang === 'ar' ? 'اسم إنجليزي' : 'Name EN'} className="bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-sm" />
                <input value={pkg.price} onChange={e => updatePackage(idx, 'price', e.target.value)} placeholder={lang === 'ar' ? 'السعر' : 'Price'} type="number" step="0.01" className="bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-sm" />
                <input value={pkg.duration} onChange={e => updatePackage(idx, 'duration', e.target.value)} placeholder={lang === 'ar' ? 'المدة' : 'Duration'} className="bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-sm" />
                <button onClick={() => removePackage(idx)} className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { key: 'active', label: lang === 'ar' ? 'نشط' : 'Active' },
              { key: 'featured', label: lang === 'ar' ? 'مميز' : 'Featured' },
              { key: 'bestseller', label: lang === 'ar' ? 'الأكثر مبيعاً' : 'Bestseller' },
            ].map(toggle => (
              <label key={toggle.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any)[toggle.key]} onChange={e => setForm(f => ({...f, [toggle.key]: e.target.checked}))} className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm">{toggle.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={saveProduct} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? '...' : (lang === 'ar' ? 'حفظ المنتج' : 'Save Product')}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="bg-muted px-6 py-2.5 rounded-xl text-sm hover:bg-muted/80">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'المنتجات' : 'Products'}</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> {lang === 'ar' ? 'إضافة منتج' : 'Add Product'}
        </button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start px-4 py-3 font-medium">ID</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'السعر' : 'Price'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'التسليم' : 'Delivery'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productsData?.products.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.mainImage && <img src={p.mainImage} className="w-8 h-8 rounded-lg object-cover" />}
                      <span className="font-medium">{lang === 'ar' ? p.titleAr : p.titleEn}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.price} BHD</td>
                  <td className="px-4 py-3"><span className="text-xs bg-muted px-2 py-0.5 rounded-full">{p.deliveryMode || 'multi_code'}</span></td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                      {p.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-muted rounded-lg"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
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

function OrdersTab({ token, lang }: { token: string | null; lang: string }) {
  const { data: orders, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await adminFetch(`${API}/orders?limit=100`, token);
      return res.json();
    },
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const handleAction = async (orderId: number, action: 'confirm' | 'reject') => {
    setConfirming(`${orderId}-${action}`);
    try {
      await adminFetch(`${API}/orders/${orderId}/admin-confirm`, token, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      toast.success(action === 'confirm' ? (lang === 'ar' ? 'تم تأكيد الطلب' : 'Order confirmed') : (lang === 'ar' ? 'تم رفض الطلب' : 'Order rejected'));
      refetch();
      setSelectedOrder(null);
    } catch { toast.error('Error'); }
    setConfirming(null);
  };

  const ordersList = orders?.orders || orders || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'الطلبات' : 'Orders'}</h2>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{lang === 'ar' ? 'العميل:' : 'Customer:'}</span><p className="font-medium">{selectedOrder.customerName}</p></div>
                <div><span className="text-muted-foreground">{lang === 'ar' ? 'البريد:' : 'Email:'}</span><p className="font-medium">{selectedOrder.customerEmail}</p></div>
                <div><span className="text-muted-foreground">{lang === 'ar' ? 'الهاتف:' : 'Phone:'}</span><p className="font-medium">{selectedOrder.customerPhone || '-'}</p></div>
                <div><span className="text-muted-foreground">{lang === 'ar' ? 'المجموع:' : 'Total:'}</span><p className="font-bold text-primary">{selectedOrder.total} BHD</p></div>
                <div><span className="text-muted-foreground">{lang === 'ar' ? 'الحالة:' : 'Status:'}</span><p><StatusBadge status={selectedOrder.status} /></p></div>
                <div><span className="text-muted-foreground">{lang === 'ar' ? 'التاريخ:' : 'Date:'}</span><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div>
              </div>

              {selectedOrder.receiptImage && (
                <div>
                  <p className="text-sm font-medium mb-2">{lang === 'ar' ? 'إيصال الدفع:' : 'Payment Receipt:'}</p>
                  <img src={selectedOrder.receiptImage} alt="Receipt" className="max-w-full max-h-96 rounded-xl border border-border" />
                </div>
              )}

              {selectedOrder.aiVerificationResult && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-sm font-medium mb-2">{lang === 'ar' ? 'نتيجة التحقق بالذكاء الاصطناعي:' : 'AI Verification Result:'}</p>
                  <div className="text-xs space-y-1">
                    <p>{lang === 'ar' ? 'مطابقة الاسم:' : 'Name Match:'} {selectedOrder.aiVerificationResult.nameMatch ? '✅' : '❌'} {selectedOrder.aiVerificationResult.nameFound || ''}</p>
                    <p>{lang === 'ar' ? 'مطابقة الرقم:' : 'Number Match:'} {selectedOrder.aiVerificationResult.numberMatch ? '✅' : '❌'}</p>
                    <p>{lang === 'ar' ? 'مطابقة المبلغ:' : 'Amount Match:'} {selectedOrder.aiVerificationResult.amountMatch ? '✅' : '❌'} {selectedOrder.aiVerificationResult.amountFound || ''}</p>
                    <p>{lang === 'ar' ? 'الثقة:' : 'Confidence:'} {selectedOrder.aiVerificationResult.confidence || 0}%</p>
                    {selectedOrder.aiVerificationResult.isFraudulent && (
                      <p className="text-destructive font-medium">{lang === 'ar' ? 'تحذير: يحتمل تزوير!' : 'Warning: Possibly fraudulent!'}</p>
                    )}
                    <p>{selectedOrder.aiVerificationResult.reason}</p>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(selectedOrder.id, 'confirm')}
                    disabled={confirming !== null}
                    className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> {confirming === `${selectedOrder.id}-confirm` ? '...' : (lang === 'ar' ? 'تأكيد الدفع وتسليم المنتج' : 'Confirm & Deliver')}
                  </button>
                  <button
                    onClick={() => handleAction(selectedOrder.id, 'reject')}
                    disabled={confirming !== null}
                    className="flex-1 bg-destructive text-white py-2.5 rounded-xl font-medium hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> {confirming === `${selectedOrder.id}-reject` ? '...' : (lang === 'ar' ? 'رفض الطلب' : 'Reject')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start px-4 py-3 font-medium">#</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'المجموع' : 'Total'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الإيصال' : 'Receipt'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ordersList.map((o: any) => (
                <tr key={o.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                  <td className="px-4 py-3">{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{o.total} BHD</td>
                  <td className="px-4 py-3">
                    {o.receiptImage ? (
                      <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        {o.receiptStatus === 'verified' ? '✅' : o.receiptStatus === 'rejected' ? '❌' : '⏳'}
                      </span>
                    ) : <span className="text-xs text-muted-foreground">-</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CouponsTab({ lang, token }: { lang: string; token: string | null }) {
  const { data: coupons, refetch } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => { const r = await adminFetch(`${API}/coupons`, token); return r.json(); },
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', descriptionAr: '', descriptionEn: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '' });
  const [saving, setSaving] = useState(false);

  const saveCoupon = async () => {
    if (!form.code || !form.discountValue) { toast.error(lang === 'ar' ? 'كود الخصم والقيمة مطلوبة' : 'Code and value required'); return; }
    setSaving(true);
    await adminFetch(`${API}/coupons`, token, { method: 'POST', body: JSON.stringify(form) });
    toast.success(lang === 'ar' ? 'تم إنشاء الكوبون' : 'Coupon created');
    setForm({ code: '', descriptionAr: '', descriptionEn: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '' });
    setShowForm(false);
    refetch();
    setSaving(false);
  };

  const toggleActive = async (coupon: any) => {
    await adminFetch(`${API}/coupons/${coupon.id}`, token, { method: 'PATCH', body: JSON.stringify({ active: !coupon.active }) });
    refetch();
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    await adminFetch(`${API}/coupons/${id}`, token, { method: 'DELETE' });
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'كوبونات الخصم' : 'Coupons'}</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> {lang === 'ar' ? 'إضافة كوبون' : 'Add Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'كود الخصم *' : 'Coupon Code *'}</label><input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm font-mono" placeholder="SALE20" /></div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'نوع الخصم' : 'Discount Type'}</label>
              <select value={form.discountType} onChange={e => setForm(f => ({...f, discountType: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
                <option value="percentage">{lang === 'ar' ? 'نسبة مئوية %' : 'Percentage %'}</option>
                <option value="fixed">{lang === 'ar' ? 'مبلغ ثابت (د.ب)' : 'Fixed Amount (BHD)'}</option>
              </select>
            </div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'قيمة الخصم *' : 'Discount Value *'}</label><input type="number" value={form.discountValue} onChange={e => setForm(f => ({...f, discountValue: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الحد الأدنى للطلب' : 'Min Order Amount'}</label><input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({...f, minOrderAmount: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'عدد الاستخدامات الأقصى' : 'Max Uses'}</label><input type="number" value={form.maxUses} onChange={e => setForm(f => ({...f, maxUses: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</label><input type="date" value={form.expiresAt} onChange={e => setForm(f => ({...f, expiresAt: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'وصف (عربي)' : 'Description (AR)'}</label><input value={form.descriptionAr} onChange={e => setForm(f => ({...f, descriptionAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" dir="rtl" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'وصف (إنجليزي)' : 'Description (EN)'}</label><input value={form.descriptionEn} onChange={e => setForm(f => ({...f, descriptionEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
          </div>
          <button onClick={saveCoupon} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? '...' : (lang === 'ar' ? 'حفظ الكوبون' : 'Save Coupon')}</button>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الكود' : 'Code'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الخصم' : 'Discount'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الاستخدام' : 'Used'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {(coupons || []).map((c: any) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-4 py-3">{c.discountValue}{c.discountType === 'percentage' ? '%' : ' BHD'}</td>
                  <td className="px-4 py-3">{c.usedCount}/{c.maxUses || '∞'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c)} className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${c.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                      {c.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3"><button onClick={() => deleteCoupon(c.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ lang, token }: { lang: string; token: string | null }) {
  const { data: orders } = useQuery({
    queryKey: ['admin-users-orders'],
    queryFn: async () => { const r = await adminFetch(`${API}/orders?limit=500`, token); return r.json(); },
  });

  const ordersList = orders?.orders || orders || [];
  const usersMap: Record<string, { name: string; email: string; phone: string; orders: number; totalSpent: number; lastOrder: string }> = {};
  for (const o of ordersList) {
    if (!usersMap[o.firebaseUid]) {
      usersMap[o.firebaseUid] = { name: o.customerName, email: o.customerEmail, phone: o.customerPhone || '', orders: 0, totalSpent: 0, lastOrder: o.createdAt };
    }
    usersMap[o.firebaseUid].orders++;
    usersMap[o.firebaseUid].totalSpent += o.total;
    if (new Date(o.createdAt) > new Date(usersMap[o.firebaseUid].lastOrder)) usersMap[o.firebaseUid].lastOrder = o.createdAt;
  }
  const users = Object.entries(usersMap).sort((a, b) => b[1].totalSpent - a[1].totalSpent);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'المستخدمين' : 'Users'}</h2>
      <p className="text-sm text-muted-foreground">{lang === 'ar' ? `عدد العملاء: ${users.length}` : `Total customers: ${users.length}`}</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الطلبات' : 'Orders'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'المصروف' : 'Total Spent'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'آخر طلب' : 'Last Order'}</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {users.map(([uid, u]) => (
                <tr key={uid} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
                  <td className="px-4 py-3">{u.orders}</td>
                  <td className="px-4 py-3 font-bold">{u.totalSpent.toFixed(2)} BHD</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.lastOrder).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LoyaltyTab({ lang }: { lang: string }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}</h2>
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20 mb-4">
          <Star className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">{lang === 'ar' ? 'نظام نقاط الولاء' : 'Loyalty Points System'}</h3>
            <p className="text-sm text-muted-foreground mt-1">{lang === 'ar' ? 'كل دينار يدفعه العميل = نقطة واحدة. يتم احتساب النقاط تلقائياً بعد تأكيد الدفع.' : 'Every 1 BHD spent = 1 point. Points are automatically calculated after payment confirmation.'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">1 BHD</p>
            <p className="text-xs text-muted-foreground">{lang === 'ar' ? '= 1 نقطة' : '= 1 Point'}</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium">{lang === 'ar' ? 'تُحسب تلقائياً' : 'Auto-calculated'}</p>
            <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'عند تأكيد الدفع' : 'On payment confirmation'}</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium">{lang === 'ar' ? 'مرتبطة بحساب العميل' : 'Tied to customer account'}</p>
            <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'عبر Firebase UID' : 'Via Firebase UID'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentTab({ lang, token }: { lang: string; token: string | null }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'طرق الدفع' : 'Payment Methods'}</h2>
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 mb-4">
          <CreditCard className="w-8 h-8 text-blue-500 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">BenefitPay</h3>
            <p className="text-sm text-muted-foreground mt-1">{lang === 'ar' ? 'الدفع عبر تحويل بنفت باي' : 'Payment via BenefitPay transfer'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <span className="text-sm font-medium">{lang === 'ar' ? 'اسم المستلم' : 'Recipient Name'}</span>
            <span className="font-bold">ESMAIL ALMURISI</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <span className="text-sm font-medium">{lang === 'ar' ? 'رقم الحساب' : 'Account Number'}</span>
            <span className="font-bold font-mono">34490039</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <span className="text-sm font-medium">{lang === 'ar' ? 'التحقق بالذكاء الاصطناعي' : 'AI Verification'}</span>
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full font-medium">{lang === 'ar' ? 'مُفعّل' : 'Enabled'}</span>
          </div>
        </div>
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {lang === 'ar'
              ? '⚠️ يتم التحقق من كل إيصال تلقائياً بالذكاء الاصطناعي للتأكد من مطابقة الاسم والرقم والمبلغ. الإيصالات المعدلة أو المزيفة يتم رفضها تلقائياً.'
              : '⚠️ Every receipt is automatically verified by AI to match name, number, and amount. Edited or fake receipts are automatically rejected.'}
          </p>
        </div>
      </div>
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
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'إدارة الصفحات' : 'Page Management'}</h2>
      <div className="grid gap-4">
        {pages.map((page, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold">{lang === 'ar' ? page.nameAr : page.nameEn}</h3>
              <p className="text-xs text-muted-foreground mt-1">{page.path}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {page.sections.map(s => <span key={s} className="text-xs bg-muted px-2 py-0.5 rounded-full">{s}</span>)}
              </div>
            </div>
            <a href={page.path} target="_blank" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20">{lang === 'ar' ? 'عرض' : 'View'}</a>
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
    if (sections) setLocalSections([...sections].sort((a: any, b: any) => a.sortOrder - b.sortOrder));
  }, [sections]);

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= localSections.length) return;
    const updated = [...localSections];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setLocalSections(updated.map((s, i) => ({ ...s, sortOrder: i + 1 })));
  };

  const toggleSection = (index: number) => setLocalSections(prev => prev.map((s, i) => i === index ? { ...s, active: !s.active } : s));

  const saveOrder = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await adminFetch(`${API}/homepage/sections`, token, {
        method: 'PUT',
        body: JSON.stringify(localSections.map((s, i) => ({ id: s.id, sortOrder: i + 1, active: s.active, titleAr: s.titleAr, titleEn: s.titleEn, subtitleAr: s.subtitleAr, subtitleEn: s.subtitleEn, config: s.config }))),
      });
      toast.success(lang === 'ar' ? 'تم حفظ الترتيب' : 'Order saved');
      refetch();
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  if (isLoading) return <div className="animate-pulse h-64 bg-muted rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'ترتيب الرئيسية' : 'Homepage Sections'}</h2>
        <button onClick={saveOrder} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium"><Save className="w-4 h-4" />{saving ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}</button>
      </div>
      <div className="space-y-2">
        {localSections.map((section, index) => (
          <div key={section.id} draggable onDragStart={() => setDragIndex(index)} onDragOver={e => { e.preventDefault(); if (dragIndex !== null && dragIndex !== index) { moveSection(dragIndex, index); setDragIndex(index); } }} onDragEnd={() => setDragIndex(null)}
            className={`bg-card border rounded-xl p-4 flex items-center gap-4 transition-all ${dragIndex === index ? 'border-primary shadow-lg' : 'border-border'} ${!section.active ? 'opacity-50' : ''}`}>
            <GripVertical className="w-5 h-5 cursor-grab text-muted-foreground" />
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{index + 1}</span>
            <div className="flex-1"><p className="font-medium text-sm">{lang === 'ar' ? section.titleAr : section.titleEn}</p><p className="text-xs text-muted-foreground">{section.sectionType}</p></div>
            <button onClick={() => toggleSection(index)} className={section.active ? 'text-green-500' : 'text-muted-foreground'}>{section.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveSection(index, index - 1)} disabled={index === 0} className="p-1 hover:bg-muted rounded disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
              <button onClick={() => moveSection(index, index + 1)} disabled={index === localSections.length - 1} className="p-1 hover:bg-muted rounded disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentTab({ token, lang }: { token: string | null; lang: string }) {
  const { content, updateContent } = useSiteContent();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValueAr, setEditValueAr] = useState('');
  const [editValueEn, setEditValueEn] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterPage, setFilterPage] = useState('all');

  const allItems = Object.values(content);
  const pages = [...new Set(allItems.map(i => i.page))];
  const filtered = filterPage === 'all' ? allItems : allItems.filter(i => i.page === filterPage);
  const grouped: Record<string, typeof allItems> = {};
  for (const item of filtered) { const g = `${item.page} / ${item.section}`; if (!grouped[g]) grouped[g] = []; grouped[g].push(item); }

  const startEdit = (item: any) => { setEditingKey(item.contentKey); setEditValueAr(item.valueAr); setEditValueEn(item.valueEn); };
  const saveEdit = async () => {
    if (!editingKey) return;
    setSaving(true);
    const success = await updateContent(editingKey, { valueAr: editValueAr, valueEn: editValueEn });
    setSaving(false);
    if (success) { toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved'); setEditingKey(null); }
    else toast.error('Failed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'إدارة المحتوى' : 'Content Management'}</h2>
        <select value={filterPage} onChange={e => setFilterPage(e.target.value)} className="bg-card border border-border rounded-xl px-3 py-2 text-sm">
          <option value="all">{lang === 'ar' ? 'كل الصفحات' : 'All'}</option>
          {pages.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-muted/50 border-b border-border"><h3 className="font-bold text-sm">{group}</h3></div>
          <div className="divide-y divide-border">
            {items.map(item => (
              <div key={item.contentKey} className="p-4">
                {editingKey === item.contentKey ? (
                  <div className="space-y-3">
                    <p className="text-xs font-mono text-muted-foreground">{item.contentKey}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="text-xs font-medium block mb-1">العربية</label><textarea value={editValueAr} onChange={e => setEditValueAr(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={3} dir="rtl" /></div>
                      <div><label className="text-xs font-medium block mb-1">English</label><textarea value={editValueEn} onChange={e => setEditValueEn(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={3} dir="ltr" /></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={saving} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}</button>
                      <button onClick={() => setEditingKey(null)} className="bg-muted px-4 py-1.5 rounded-lg text-sm">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/30 -m-4 p-4 rounded-lg" onClick={() => startEdit(item)}>
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

function ActivityTab({ token, lang }: { token: string | null; lang: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/admin-activity-logs?limit=100`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { setLogs(data); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-2xl" />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'سجل النشاط' : 'Activity Log'}</h2>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {logs.length === 0 ? <p className="p-8 text-center text-muted-foreground">{lang === 'ar' ? 'لا يوجد نشاط' : 'No activity'}</p> : (
          <div className="divide-y divide-border">
            {logs.map((log: any) => (
              <div key={log.id} className="p-4 flex items-start gap-3">
                <Activity className="w-4 h-4 text-primary mt-1 shrink-0" />
                <div>
                  <p className="text-sm"><span className="font-medium">{log.adminEmail}</span> <span className="text-muted-foreground">{log.action}</span> <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{log.entityType}</span></p>
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
    fetch(`${API}/admin-settings`).then(r => r.json()).then(data => {
      if (data.admin_signup_disabled?.value) setSignupDisabled(true);
      if (data.maintenance_mode?.value) setMaintenanceMode(true);
    }).catch(() => {});
  }, []);

  const updateSetting = async (key: string, value: any) => {
    if (!token) return;
    setSaving(key);
    try {
      await adminFetch(`${API}/admin-settings/${key}`, token, { method: 'PUT', body: JSON.stringify({ value }) });
      toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved');
    } catch { toast.error('Failed'); }
    setSaving(null);
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-primary' : 'bg-muted'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0.5 rtl:-translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</h2>
      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        <div className="p-5 flex items-center justify-between">
          <div><p className="font-medium">{lang === 'ar' ? 'تعطيل تسجيل المدراء' : 'Disable Admin Signup'}</p><p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إخفاء زر إنشاء حساب مدير' : 'Hide admin signup button'}</p></div>
          <ToggleSwitch enabled={signupDisabled} onToggle={() => { const v = !signupDisabled; setSignupDisabled(v); updateSetting('admin_signup_disabled', { value: v }); }} />
        </div>
        <div className="p-5 flex items-center justify-between">
          <div><p className="font-medium">{lang === 'ar' ? 'وضع الصيانة' : 'Maintenance Mode'}</p><p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إظهار صفحة صيانة' : 'Show maintenance page'}</p></div>
          <ToggleSwitch enabled={maintenanceMode} onToggle={() => { const v = !maintenanceMode; setMaintenanceMode(v); updateSetting('maintenance_mode', { value: v }); }} />
        </div>
      </div>
    </div>
  );
}
