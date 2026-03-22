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
  Save, Package, ShoppingCart, DollarSign, Users, Shield, Upload, Tag,
  Palette, Type, FolderTree, Layers, Copy
} from 'lucide-react';

const API = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

function adminHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function adminFetch(url: string, token: string | null, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...adminHeaders(token), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `Request failed: ${res.status}`);
  }
  return res;
}

type AdminTab = 'overview' | 'pages' | 'homepage' | 'content' | 'products' | 'orders' | 'coupons' | 'users' | 'loyalty' | 'payment' | 'activity' | 'settings' | 'categories' | 'design' | 'sliders';

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
    { key: 'categories', icon: FolderTree, labelAr: 'التصنيفات', labelEn: 'Categories' },
    { key: 'orders', icon: ShoppingCart, labelAr: 'الطلبات', labelEn: 'Orders' },
    { key: 'coupons', icon: Tag, labelAr: 'الكوبونات', labelEn: 'Coupons' },
    { key: 'users', icon: Users, labelAr: 'المستخدمين', labelEn: 'Users' },
    { key: 'loyalty', icon: Gift, labelAr: 'الولاء', labelEn: 'Loyalty' },
    { key: 'payment', icon: CreditCard, labelAr: 'الدفع', labelEn: 'Payment' },
    { key: 'homepage', icon: Home, labelAr: 'الرئيسية', labelEn: 'Homepage' },
    { key: 'sliders', icon: Layers, labelAr: 'السلايدر', labelEn: 'Sliders' },
    { key: 'design', icon: Palette, labelAr: 'التنسيق', labelEn: 'Design' },
    { key: 'content', icon: FileText, labelAr: 'المحتوى', labelEn: 'Content' },
    { key: 'pages', icon: Store, labelAr: 'الصفحات', labelEn: 'Pages' },
    { key: 'activity', icon: Activity, labelAr: 'النشاط', labelEn: 'Activity' },
    { key: 'settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-muted rounded-xl"><MenuIcon className="w-5 h-5" /></button>
              <h1 className="font-bold text-lg">{lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:block">{admin?.email}</span>
              <button onClick={logout} className="p-2 hover:bg-destructive/10 text-destructive rounded-xl"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="hidden md:flex gap-1 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <tab.icon className="w-4 h-4" />
                {lang === 'ar' ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute start-0 top-0 bottom-0 w-72 bg-card border-e border-border p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold">{lang === 'ar' ? 'القائمة' : 'Menu'}</h2>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-1">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                  <tab.icon className="w-4 h-4" />
                  {lang === 'ar' ? tab.labelAr : tab.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && <OverviewTab token={token} lang={lang} />}
        {activeTab === 'products' && <ProductsTab token={token} lang={lang} />}
        {activeTab === 'categories' && <CategoriesTab token={token} lang={lang} />}
        {activeTab === 'orders' && <OrdersTab token={token} lang={lang} />}
        {activeTab === 'coupons' && <CouponsTab lang={lang} token={token} />}
        {activeTab === 'users' && <UsersTab lang={lang} token={token} />}
        {activeTab === 'loyalty' && <LoyaltyTab lang={lang} />}
        {activeTab === 'payment' && <PaymentTab lang={lang} token={token} />}
        {activeTab === 'homepage' && <HomepageTab token={token} lang={lang} />}
        {activeTab === 'sliders' && <SlidersTab token={token} lang={lang} />}
        {activeTab === 'design' && <DesignTab token={token} lang={lang} />}
        {activeTab === 'content' && <ContentTab token={token} lang={lang} />}
        {activeTab === 'pages' && <PagesTab />}
        {activeTab === 'activity' && <ActivityTab token={token} lang={lang} />}
        {activeTab === 'settings' && <SettingsTab token={token} lang={lang} />}
      </div>
    </div>
  );
}

function OverviewTab({ token, lang }: { token: string | null; lang: string }) {
  const { data: ordersData } = useQuery({
    queryKey: ['admin-overview-orders'],
    queryFn: async () => { const r = await adminFetch(`${API}/orders?limit=500`, token); return r.json(); },
  });
  const { data: productsData } = useQuery({
    queryKey: ['admin-overview-products'],
    queryFn: async () => { const r = await adminFetch(`${API}/products?limit=500&admin=true`, token); return r.json(); },
  });

  const orders = ordersData?.orders || ordersData || [];
  const products = productsData?.products || [];
  const revenue = orders.filter((o: any) => o.status === 'paid' || o.status === 'delivered').reduce((sum: number, o: any) => sum + o.total, 0);
  const lowStock = products.filter((p: any) => p.stock < 3 && p.active).length;

  const stats = [
    { labelAr: 'الإيرادات', labelEn: 'Revenue', value: `${revenue.toFixed(2)} BHD`, icon: DollarSign, color: 'text-green-500' },
    { labelAr: 'الطلبات', labelEn: 'Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-500' },
    { labelAr: 'المنتجات', labelEn: 'Products', value: products.length, icon: Package, color: 'text-purple-500' },
    { labelAr: 'مخزون منخفض', labelEn: 'Low Stock', value: lowStock, icon: Shield, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{lang === 'ar' ? 'نظرة عامة' : 'Overview'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{lang === 'ar' ? stat.labelAr : stat.labelEn}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
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
  const [newFeatureAr, setNewFeatureAr] = useState('');
  const [newFeatureEn, setNewFeatureEn] = useState('');

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
    setNewFeatureAr('');
    setNewFeatureEn('');
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

  const addFeature = (type: 'ar' | 'en') => {
    if (type === 'ar' && newFeatureAr.trim()) {
      setForm(f => ({ ...f, featuresAr: [...f.featuresAr, newFeatureAr.trim()] }));
      setNewFeatureAr('');
    }
    if (type === 'en' && newFeatureEn.trim()) {
      setForm(f => ({ ...f, featuresEn: [...f.featuresEn, newFeatureEn.trim()] }));
      setNewFeatureEn('');
    }
  };

  const removeFeature = (type: 'ar' | 'en', idx: number) => {
    if (type === 'ar') setForm(f => ({ ...f, featuresAr: f.featuresAr.filter((_, i) => i !== idx) }));
    else setForm(f => ({ ...f, featuresEn: f.featuresEn.filter((_, i) => i !== idx) }));
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
      let productId = editProduct?.id;
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
        productId = newProduct.id;
      }
      if (inventoryCodes.trim() && form.deliveryMode === 'multi_code' && productId) {
        const codes = inventoryCodes.split('\n').map(c => c.trim()).filter(Boolean);
        await adminFetch(`${API}/inventory/${productId}`, token, {
          method: 'POST',
          body: JSON.stringify({ items: codes }),
        });
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">{lang === 'ar' ? 'المميزات (عربي)' : 'Features (AR)'}</label>
              <div className="space-y-2 mb-2">
                {form.featuresAr.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1.5">
                    <Check className="w-3 h-3 text-success shrink-0" />
                    <span className="flex-1 text-sm" dir="rtl">{f}</span>
                    <button onClick={() => removeFeature('ar', idx)} className="text-destructive hover:bg-destructive/10 rounded p-0.5"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newFeatureAr} onChange={e => setNewFeatureAr(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature('ar'))} placeholder={lang === 'ar' ? 'أضف ميزة...' : 'Add feature...'} className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm" dir="rtl" />
                <button onClick={() => addFeature('ar')} className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm hover:bg-primary/20"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">{lang === 'ar' ? 'المميزات (إنجليزي)' : 'Features (EN)'}</label>
              <div className="space-y-2 mb-2">
                {form.featuresEn.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1.5">
                    <Check className="w-3 h-3 text-success shrink-0" />
                    <span className="flex-1 text-sm">{f}</span>
                    <button onClick={() => removeFeature('en', idx)} className="text-destructive hover:bg-destructive/10 rounded p-0.5"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newFeatureEn} onChange={e => setNewFeatureEn(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature('en'))} placeholder="Add feature..." className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm" />
                <button onClick={() => addFeature('en')} className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm hover:bg-primary/20"><Plus className="w-4 h-4" /></button>
              </div>
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

          {form.deliveryMode === 'multi_code' && (
            <div>
              <label className="text-sm font-medium block mb-1">
                {editProduct ? (lang === 'ar' ? 'إضافة أكواد جديدة (كل كود في سطر)' : 'Add New Codes (one per line)') : (lang === 'ar' ? 'الأكواد (كل كود في سطر)' : 'Codes (one per line)')}
              </label>
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

function CategoriesTab({ token, lang }: { token: string | null; lang: string }) {
  const { data: categories, refetch } = useListCategories();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', image: '', icon: '', sortOrder: 0, active: true });
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setForm({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', image: '', icon: '', sortOrder: 0, active: true }); setEditCat(null); };

  const openEdit = (c: any) => {
    setForm({ nameAr: c.nameAr, nameEn: c.nameEn, descriptionAr: c.descriptionAr || '', descriptionEn: c.descriptionEn || '', image: c.image || '', icon: c.icon || '', sortOrder: c.sortOrder, active: c.active });
    setEditCat(c);
    setShowForm(true);
  };

  const saveCategory = async () => {
    if (!form.nameAr || !form.nameEn) { toast.error(lang === 'ar' ? 'الاسم مطلوب' : 'Name required'); return; }
    setSaving(true);
    try {
      if (editCat) {
        await adminFetch(`${API}/categories/${editCat.id}`, token, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await adminFetch(`${API}/categories`, token, { method: 'POST', body: JSON.stringify(form) });
      }
      toast.success(lang === 'ar' ? 'تم الحفظ' : 'Saved');
      resetForm(); setShowForm(false); refetch();
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  const deleteCategory = async (id: number) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    await adminFetch(`${API}/categories/${id}`, token, { method: 'DELETE' });
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
    refetch();
  };

  const emojiOptions = ['🎮', '🎬', '🎵', '📱', '💻', '🎁', '🛍️', '📺', '🎯', '⭐', '🔥', '💎', '🏷️', '📦', '🎲'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'التصنيفات' : 'Categories'}</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> {lang === 'ar' ? 'إضافة تصنيف' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">{editCat ? (lang === 'ar' ? 'تعديل التصنيف' : 'Edit Category') : (lang === 'ar' ? 'تصنيف جديد' : 'New Category')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الاسم بالعربي *' : 'Arabic Name *'}</label><input value={form.nameAr} onChange={e => setForm(f => ({...f, nameAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" dir="rtl" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الاسم بالإنجليزي *' : 'English Name *'}</label><input value={form.nameEn} onChange={e => setForm(f => ({...f, nameEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الوصف (عربي)' : 'Description (AR)'}</label><textarea value={form.descriptionAr} onChange={e => setForm(f => ({...f, descriptionAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm" rows={2} dir="rtl" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label><textarea value={form.descriptionEn} onChange={e => setForm(f => ({...f, descriptionEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm" rows={2} /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'رابط الصورة' : 'Image URL'}</label><input value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" placeholder="https://..." /></div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'الأيقونة' : 'Icon'}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {emojiOptions.map(emoji => (
                  <button key={emoji} onClick={() => setForm(f => ({...f, icon: emoji}))} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2 ${form.icon === emoji ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>{emoji}</button>
                ))}
              </div>
              <input value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" placeholder={lang === 'ar' ? 'أو اكتب إيموجي' : 'Or type emoji'} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm">{lang === 'ar' ? 'نشط' : 'Active'}</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm">{lang === 'ar' ? 'الترتيب' : 'Order'}</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({...f, sortOrder: parseInt(e.target.value) || 0}))} className="w-20 bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={saveCategory} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">{saving ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="bg-muted px-6 py-2.5 rounded-xl text-sm">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(categories || []).map((cat: any) => (
          <div key={cat.id} className={`bg-card border rounded-2xl p-5 ${cat.active ? 'border-border' : 'border-border opacity-50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">{cat.icon || '🛍️'}</div>
                <div>
                  <h3 className="font-bold">{lang === 'ar' ? cat.nameAr : cat.nameEn}</h3>
                  <p className="text-xs text-muted-foreground">{lang === 'ar' ? cat.nameEn : cat.nameAr}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-muted rounded-lg"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {(cat.descriptionAr || cat.descriptionEn) && (
              <p className="text-sm text-muted-foreground line-clamp-2">{lang === 'ar' ? cat.descriptionAr : cat.descriptionEn}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab({ token, lang }: { token: string | null; lang: string }) {
  const { data: orders, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => { const res = await adminFetch(`${API}/orders?limit=100`, token); return res.json(); },
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const handleAction = async (orderId: number, action: 'confirm' | 'reject') => {
    setConfirming(`${orderId}-${action}`);
    try {
      await adminFetch(`${API}/orders/${orderId}/admin-confirm`, token, { method: 'POST', body: JSON.stringify({ action }) });
      toast.success(action === 'confirm' ? (lang === 'ar' ? 'تم تأكيد الطلب' : 'Order confirmed') : (lang === 'ar' ? 'تم رفض الطلب' : 'Order rejected'));
      refetch(); setSelectedOrder(null);
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
                  <img src={selectedOrder.receiptImage.startsWith('http') ? selectedOrder.receiptImage : `${import.meta.env.BASE_URL.replace(/\/$/, '')}${selectedOrder.receiptImage}`} alt="Receipt" className="max-w-full max-h-96 rounded-xl border border-border" />
                </div>
              )}
              {selectedOrder.aiVerificationResult && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-sm font-medium mb-2">{lang === 'ar' ? 'نتيجة التحقق بالذكاء الاصطناعي:' : 'AI Verification Result:'}</p>
                  <div className="text-xs space-y-1">
                    <p>{lang === 'ar' ? 'مطابقة الاسم:' : 'Name Match:'} {selectedOrder.aiVerificationResult.nameMatch ? '✅' : '❌'} {selectedOrder.aiVerificationResult.nameFound || ''}</p>
                    <p>{lang === 'ar' ? 'مطابقة الرقم:' : 'Number Match:'} {selectedOrder.aiVerificationResult.numberMatch ? '✅' : '❌'}</p>
                    <p>{lang === 'ar' ? 'مطابقة المبلغ:' : 'Amount Match:'} {selectedOrder.aiVerificationResult.amountMatch ? '✅' : '❌'} {selectedOrder.aiVerificationResult.amountFound || ''}</p>
                    <p>{lang === 'ar' ? 'مطابقة التاريخ:' : 'Date Match:'} {selectedOrder.aiVerificationResult.dateMatch ? '✅' : '❌'} {selectedOrder.aiVerificationResult.dateFound || ''}</p>
                    <p>{lang === 'ar' ? 'الثقة:' : 'Confidence:'} {selectedOrder.aiVerificationResult.confidence || 0}%</p>
                    {selectedOrder.aiVerificationResult.isFraudulent && <p className="text-destructive font-medium">{lang === 'ar' ? 'تحذير: يحتمل تزوير!' : 'Warning: Possibly fraudulent!'}</p>}
                    <p>{selectedOrder.aiVerificationResult.reason}</p>
                  </div>
                </div>
              )}
              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => handleAction(selectedOrder.id, 'confirm')} disabled={confirming !== null}
                    className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> {confirming === `${selectedOrder.id}-confirm` ? '...' : (lang === 'ar' ? 'تأكيد الدفع وتسليم المنتج' : 'Confirm & Deliver')}
                  </button>
                  <button onClick={() => handleAction(selectedOrder.id, 'reject')} disabled={confirming !== null}
                    className="flex-1 bg-destructive text-white py-2.5 rounded-xl font-medium hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> {confirming === `${selectedOrder.id}-reject` ? '...' : (lang === 'ar' ? 'رفض الطلب' : 'Reject')}
                  </button>
                </div>
              )}
              {(selectedOrder.status === 'paid' || selectedOrder.status === 'delivered') && (
                <OrderDeliveryCodes orderId={selectedOrder.id} token={token} lang={lang} />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-start px-4 py-3 font-medium">#</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'المجموع' : 'Total'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الإيصال' : 'Receipt'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="text-start px-4 py-3 font-medium">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {ordersList.map((o: any) => (
                <tr key={o.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                  <td className="px-4 py-3">{o.id}</td>
                  <td className="px-4 py-3"><p className="font-medium">{o.customerName}</p><p className="text-xs text-muted-foreground">{o.customerEmail}</p></td>
                  <td className="px-4 py-3 font-bold">{o.total} BHD</td>
                  <td className="px-4 py-3">{o.receiptImage ? <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">{o.receiptStatus === 'verified' ? '✅' : o.receiptStatus === 'rejected' ? '❌' : '⏳'}</span> : <span className="text-xs text-muted-foreground">-</span>}</td>
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

function OrderDeliveryCodes({ orderId, token, lang }: { orderId: number; token: string | null; lang: string }) {
  const { data: codes, isLoading, refetch } = useQuery({
    queryKey: ['admin-delivery-codes', orderId],
    queryFn: async () => {
      const res = await adminFetch(`${API}/orders/${orderId}/delivery-codes`, token);
      return res.json();
    },
  });
  const [toggling, setToggling] = useState<number | null>(null);

  const toggleHidden = async (codeId: number) => {
    setToggling(codeId);
    try {
      await adminFetch(`${API}/orders/${orderId}/delivery-codes/${codeId}/toggle-hidden`, token, { method: 'PATCH' });
      toast.success(lang === 'ar' ? 'تم تحديث حالة الكود' : 'Code status updated');
      refetch();
    } catch { toast.error(lang === 'ar' ? 'خطأ' : 'Error'); }
    setToggling(null);
  };

  if (isLoading) return <div className="animate-pulse h-16 bg-muted rounded-xl" />;
  if (!codes || codes.length === 0) return null;

  return (
    <div className="bg-muted/30 rounded-xl p-4">
      <p className="text-sm font-medium mb-3">{lang === 'ar' ? 'أكواد التسليم:' : 'Delivery Codes:'}</p>
      <div className="space-y-2">
        {codes.map((code: any, idx: number) => (
          <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${code.hidden ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'}`}>
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground">{lang === 'ar' ? code.titleAr : code.titleEn}</p>
              <code className="font-mono text-sm break-all">{code.data}</code>
              {code.hidden && <span className="text-red-500 font-medium ms-2">{lang === 'ar' ? '(مخفي عن العميل)' : '(Hidden from customer)'}</span>}
            </div>
            {code.id !== null && (
              <button
                onClick={() => toggleHidden(code.id)}
                disabled={toggling === code.id}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${code.hidden ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'} disabled:opacity-50`}
              >
                {toggling === code.id ? '...' : code.hidden ? (lang === 'ar' ? 'إظهار' : 'Show') : (lang === 'ar' ? 'إخفاء' : 'Hide')}
              </button>
            )}
          </div>
        ))}
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
    setShowForm(false); refetch(); setSaving(false);
  };

  const toggleActive = async (coupon: any) => {
    await adminFetch(`${API}/coupons/${coupon.id}`, token, { method: 'PATCH', body: JSON.stringify({ active: !coupon.active }) });
    refetch();
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    await adminFetch(`${API}/coupons/${id}`, token, { method: 'DELETE' });
    toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); refetch();
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
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'نوع الخصم' : 'Discount Type'}</label>
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
          <button onClick={saveCoupon} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">{saving ? '...' : (lang === 'ar' ? 'حفظ الكوبون' : 'Save Coupon')}</button>
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
          <div className="bg-muted/30 rounded-xl p-4 text-center"><Gift className="w-8 h-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">1 BHD</p><p className="text-xs text-muted-foreground">{lang === 'ar' ? '= 1 نقطة' : '= 1 Point'}</p></div>
          <div className="bg-muted/30 rounded-xl p-4 text-center"><Star className="w-8 h-8 text-amber-500 mx-auto mb-2" /><p className="text-sm font-medium">{lang === 'ar' ? 'تُحسب تلقائياً' : 'Auto-calculated'}</p><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'عند تأكيد الدفع' : 'On payment confirmation'}</p></div>
          <div className="bg-muted/30 rounded-xl p-4 text-center"><Users className="w-8 h-8 text-blue-500 mx-auto mb-2" /><p className="text-sm font-medium">{lang === 'ar' ? 'مرتبطة بحساب العميل' : 'Tied to customer account'}</p><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'عبر Firebase UID' : 'Via Firebase UID'}</p></div>
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
          <div><h3 className="font-bold text-lg">BenefitPay</h3><p className="text-sm text-muted-foreground mt-1">{lang === 'ar' ? 'الدفع عبر تحويل بنفت باي' : 'Payment via BenefitPay transfer'}</p></div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"><span className="text-sm font-medium">{lang === 'ar' ? 'اسم المستلم' : 'Recipient Name'}</span><span className="font-bold">ESMAIL ALMURISI</span></div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"><span className="text-sm font-medium">{lang === 'ar' ? 'رقم الحساب' : 'Account Number'}</span><span className="font-bold font-mono">34490039</span></div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"><span className="text-sm font-medium">{lang === 'ar' ? 'التحقق بالذكاء الاصطناعي' : 'AI Verification'}</span><span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full font-medium">{lang === 'ar' ? 'مُفعّل' : 'Enabled'}</span></div>
        </div>
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400">{lang === 'ar' ? '⚠️ يتم التحقق من كل إيصال تلقائياً بالذكاء الاصطناعي للتأكد من مطابقة الاسم والرقم والمبلغ.' : '⚠️ Every receipt is automatically verified by AI to match name, number, and amount.'}</p>
        </div>
      </div>
    </div>
  );
}

function SlidersTab({ token, lang }: { token: string | null; lang: string }) {
  const { data: sections, refetch } = useListHomepageSections();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titleAr: '', titleEn: '', subtitleAr: '', subtitleEn: '', image: '', link: '' });
  const [saving, setSaving] = useState(false);

  const sliders = (sections || []).filter((s: any) => s.sectionType === 'slider');

  const addSlider = async () => {
    if (!form.titleAr && !form.titleEn) { toast.error(lang === 'ar' ? 'العنوان مطلوب' : 'Title required'); return; }
    setSaving(true);
    try {
      const allSections = sections || [];
      const maxOrder = allSections.reduce((max: number, s: any) => Math.max(max, s.sortOrder), 0);
      await adminFetch(`${API}/homepage/sections/create`, token, {
        method: 'POST',
        body: JSON.stringify({
          sectionType: 'slider',
          titleAr: form.titleAr,
          titleEn: form.titleEn,
          subtitleAr: form.subtitleAr,
          subtitleEn: form.subtitleEn,
          active: true,
          sortOrder: maxOrder + 1,
          config: { image: form.image, link: form.link },
        }),
      });
      toast.success(lang === 'ar' ? 'تم الإضافة' : 'Added');
      setForm({ titleAr: '', titleEn: '', subtitleAr: '', subtitleEn: '', image: '', link: '' });
      setShowForm(false); refetch();
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  const toggleSlider = async (slider: any) => {
    const allSections = sections || [];
    await adminFetch(`${API}/homepage/sections`, token, {
      method: 'PUT',
      body: JSON.stringify(allSections.map((s: any) => ({
        id: s.id, sortOrder: s.sortOrder, active: s.id === slider.id ? !s.active : s.active,
        titleAr: s.titleAr, titleEn: s.titleEn, subtitleAr: s.subtitleAr, subtitleEn: s.subtitleEn, config: s.config,
      }))),
    });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'السلايدرات' : 'Sliders'}</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> {lang === 'ar' ? 'إضافة سلايدر' : 'Add Slider'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'العنوان (عربي)' : 'Title (AR)'}</label><input value={form.titleAr} onChange={e => setForm(f => ({...f, titleAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" dir="rtl" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (EN)'}</label><input value={form.titleEn} onChange={e => setForm(f => ({...f, titleEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'العنوان الفرعي (عربي)' : 'Subtitle (AR)'}</label><input value={form.subtitleAr} onChange={e => setForm(f => ({...f, subtitleAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" dir="rtl" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (EN)'}</label><input value={form.subtitleEn} onChange={e => setForm(f => ({...f, subtitleEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'رابط الصورة' : 'Image URL'}</label><input value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" placeholder="https://..." /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'المسار / الرابط' : 'Link / Path'}</label><input value={form.link} onChange={e => setForm(f => ({...f, link: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" placeholder="/shop?category=1" /></div>
          </div>
          <button onClick={addSlider} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">{saving ? '...' : (lang === 'ar' ? 'إضافة' : 'Add')}</button>
        </div>
      )}

      <div className="grid gap-4">
        {sliders.map((slider: any) => (
          <div key={slider.id} className={`bg-card border rounded-2xl overflow-hidden ${slider.active ? 'border-border' : 'border-border opacity-50'}`}>
            <div className="flex items-center gap-4 p-4">
              {slider.config?.image && <img src={slider.config.image} alt="" className="w-24 h-16 rounded-xl object-cover" />}
              <div className="flex-1">
                <h3 className="font-bold">{lang === 'ar' ? slider.titleAr : slider.titleEn}</h3>
                {(slider.subtitleAr || slider.subtitleEn) && <p className="text-sm text-muted-foreground">{lang === 'ar' ? slider.subtitleAr : slider.subtitleEn}</p>}
                {slider.config?.link && <p className="text-xs text-primary font-mono mt-1">{slider.config.link}</p>}
              </div>
              <button onClick={() => toggleSlider(slider)} className={slider.active ? 'text-green-500' : 'text-muted-foreground'}>
                {slider.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ))}
        {sliders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">{lang === 'ar' ? 'لا يوجد سلايدرات بعد' : 'No sliders yet'}</div>
        )}
      </div>
    </div>
  );
}

function DesignTab({ token, lang }: { token: string | null; lang: string }) {
  const [settings, setSettings] = useState({
    fontFamily: 'Cairo',
    headingSize: '2rem',
    bodySize: '1rem',
    cardSize: 'medium',
    productsPerRow: 4,
    categoryColumns: 6,
    primaryColor: '#173E52',
    accentColor: '#1FB5AC',
    cardRadius: '16',
    productCardHeight: '400',
    categoryCardHeight: '160',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/admin-settings`).then(r => r.json()).then(data => {
      if (data.design_settings?.value) {
        setSettings(prev => ({ ...prev, ...data.design_settings.value }));
      }
    }).catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await adminFetch(`${API}/admin-settings/design_settings`, token, {
        method: 'PUT',
        body: JSON.stringify({ value: settings }),
      });
      toast.success(lang === 'ar' ? 'تم حفظ التنسيق' : 'Design saved');
    } catch { toast.error('Error'); }
    setSaving(false);
  };

  const arabicFonts = [
    { name: 'Cairo', label: 'القاهرة - Cairo' },
    { name: 'Tajawal', label: 'تجوال - Tajawal' },
    { name: 'Almarai', label: 'المراعي - Almarai' },
    { name: 'Changa', label: 'شنغا - Changa' },
    { name: 'El Messiri', label: 'المسيري - El Messiri' },
    { name: 'Amiri', label: 'أميري - Amiri' },
    { name: 'Lemonada', label: 'ليمونادا - Lemonada' },
    { name: 'Readex Pro', label: 'ريدكس برو - Readex Pro' },
    { name: 'IBM Plex Sans Arabic', label: 'IBM بلكس عربي' },
    { name: 'Noto Sans Arabic', label: 'نوتو سانس عربي' },
  ];

  const fontSizes = [
    { value: '0.75rem', label: '12px' },
    { value: '0.875rem', label: '14px' },
    { value: '1rem', label: '16px' },
    { value: '1.125rem', label: '18px' },
    { value: '1.25rem', label: '20px' },
  ];

  const headingSizes = [
    { value: '1.5rem', label: '24px' },
    { value: '1.75rem', label: '28px' },
    { value: '2rem', label: '32px' },
    { value: '2.5rem', label: '40px' },
    { value: '3rem', label: '48px' },
  ];

  const themes = [
    { name: lang === 'ar' ? 'الافتراضي' : 'Default', primary: '#173E52', accent: '#1FB5AC', bg: '#ffffff', bgDark: '#0a0a0a' },
    { name: lang === 'ar' ? 'أزرق ملكي' : 'Royal Blue', primary: '#1e3a5f', accent: '#4a90d9', bg: '#f8fafc', bgDark: '#0c1220' },
    { name: lang === 'ar' ? 'أخضر طبيعي' : 'Nature Green', primary: '#1b4332', accent: '#52b788', bg: '#f0fdf4', bgDark: '#0a1a10' },
    { name: lang === 'ar' ? 'بنفسجي فاخر' : 'Luxury Purple', primary: '#2d1b69', accent: '#7c3aed', bg: '#faf5ff', bgDark: '#0d0520' },
    { name: lang === 'ar' ? 'ذهبي أنيق' : 'Elegant Gold', primary: '#1a1a2e', accent: '#d4a373', bg: '#fdf8f0', bgDark: '#0a0a15' },
    { name: lang === 'ar' ? 'أحمر جريء' : 'Bold Red', primary: '#1a1a2e', accent: '#e63946', bg: '#fff5f5', bgDark: '#0a0a15' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'التنسيق والتصميم' : 'Design & Styling'}</h2>
        <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? '...' : (lang === 'ar' ? 'حفظ التنسيق' : 'Save Design')}
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><Type className="w-5 h-5 text-primary" /> {lang === 'ar' ? 'الخطوط' : 'Fonts'}</h3>
        <div>
          <label className="text-sm font-medium block mb-2">{lang === 'ar' ? 'الخط العربي' : 'Arabic Font'}</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {arabicFonts.map(font => (
              <button key={font.name} onClick={() => setSettings(s => ({...s, fontFamily: font.name}))}
                className={`p-3 rounded-xl border-2 text-sm text-center transition-all ${settings.fontFamily === font.name ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                <span className="block font-bold">{font.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'حجم العناوين' : 'Heading Size'}</label>
            <select value={settings.headingSize} onChange={e => setSettings(s => ({...s, headingSize: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
              {headingSizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'حجم النص' : 'Body Size'}</label>
            <select value={settings.bodySize} onChange={e => setSettings(s => ({...s, bodySize: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
              {fontSizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> {lang === 'ar' ? 'السمات والألوان' : 'Themes & Colors'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map(theme => (
            <button key={theme.name} onClick={() => setSettings(s => ({...s, primaryColor: theme.primary, accentColor: theme.accent}))}
              className={`p-4 rounded-xl border-2 text-start transition-all ${settings.primaryColor === theme.primary && settings.accentColor === theme.accent ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'}`}>
              <div className="flex gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.primary }} />
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.accent }} />
                <div className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: theme.bg }} />
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.bgDark }} />
              </div>
              <p className="text-sm font-bold">{theme.name}</p>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'اللون الرئيسي' : 'Primary Color'}</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.primaryColor} onChange={e => setSettings(s => ({...s, primaryColor: e.target.value}))} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
              <input value={settings.primaryColor} onChange={e => setSettings(s => ({...s, primaryColor: e.target.value}))} className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm font-mono" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'اللون المميز' : 'Accent Color'}</label>
            <div className="flex items-center gap-2">
              <input type="color" value={settings.accentColor} onChange={e => setSettings(s => ({...s, accentColor: e.target.value}))} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
              <input value={settings.accentColor} onChange={e => setSettings(s => ({...s, accentColor: e.target.value}))} className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm font-mono" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> {lang === 'ar' ? 'أبعاد الأشكال' : 'Layout Dimensions'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'عدد المنتجات في الصف' : 'Products Per Row'}</label>
            <select value={settings.productsPerRow} onChange={e => setSettings(s => ({...s, productsPerRow: parseInt(e.target.value)}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
              {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'عدد أعمدة التصنيفات' : 'Category Columns'}</label>
            <select value={settings.categoryColumns} onChange={e => setSettings(s => ({...s, categoryColumns: parseInt(e.target.value)}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
              {[3, 4, 5, 6, 8].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'استدارة البطاقات (px)' : 'Card Radius (px)'}</label>
            <input type="number" value={settings.cardRadius} onChange={e => setSettings(s => ({...s, cardRadius: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'ارتفاع بطاقة المنتج (px)' : 'Product Card Height (px)'}</label>
            <input type="number" value={settings.productCardHeight} onChange={e => setSettings(s => ({...s, productCardHeight: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'ارتفاع بطاقة التصنيف (px)' : 'Category Card Height (px)'}</label>
            <input type="number" value={settings.categoryCardHeight} onChange={e => setSettings(s => ({...s, categoryCardHeight: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HomepageTab({ token, lang }: { token: string | null; lang: string }) {
  const { data: sections, isLoading, refetch } = useListHomepageSections();
  const [localSections, setLocalSections] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState('banner');
  const [newSectionForm, setNewSectionForm] = useState({ titleAr: '', titleEn: '', subtitleAr: '', subtitleEn: '', image: '', link: '', couponCode: '', bgColor: '#173E52', columns: 4, limit: 8 });

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

  const sectionTypes = [
    { value: 'hero', labelAr: 'البانر الرئيسي', labelEn: 'Hero Banner' },
    { value: 'features', labelAr: 'المميزات', labelEn: 'Features' },
    { value: 'categories', labelAr: 'التصنيفات', labelEn: 'Categories' },
    { value: 'featured_products', labelAr: 'منتجات مميزة', labelEn: 'Featured Products' },
    { value: 'new_products', labelAr: 'منتجات جديدة', labelEn: 'New Products' },
    { value: 'cta', labelAr: 'دعوة للعمل / خصم', labelEn: 'CTA / Discount' },
    { value: 'banner', labelAr: 'بانر ترويجي', labelEn: 'Promo Banner' },
    { value: 'slider', labelAr: 'سلايدر', labelEn: 'Slider' },
  ];

  if (isLoading) return <div className="animate-pulse h-64 bg-muted rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'ترتيب الرئيسية' : 'Homepage Sections'}</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowAddSection(!showAddSection)} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" /> {lang === 'ar' ? 'إضافة قسم' : 'Add Section'}
          </button>
          <button onClick={saveOrder} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium"><Save className="w-4 h-4" />{saving ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}</button>
        </div>
      </div>

      {showAddSection && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'نوع القسم' : 'Section Type'}</label>
              <select value={newSectionType} onChange={e => setNewSectionType(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
                {sectionTypes.map(st => <option key={st.value} value={st.value}>{lang === 'ar' ? st.labelAr : st.labelEn}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'عدد الأعمدة' : 'Columns'}</label>
              <select value={newSectionForm.columns} onChange={e => setNewSectionForm(f => ({...f, columns: parseInt(e.target.value)}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm">
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'العنوان (عربي)' : 'Title (AR)'}</label><input value={newSectionForm.titleAr} onChange={e => setNewSectionForm(f => ({...f, titleAr: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" dir="rtl" /></div>
            <div><label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'العنوان (إنجليزي)' : 'Title (EN)'}</label><input value={newSectionForm.titleEn} onChange={e => setNewSectionForm(f => ({...f, titleEn: e.target.value}))} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" /></div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={async () => {
              setSaving(true);
              try {
                const maxOrder = localSections.reduce((max: number, s: any) => Math.max(max, s.sortOrder || 0), 0);
                await adminFetch(`${API}/homepage/sections/create`, token, {
                  method: 'POST',
                  body: JSON.stringify({
                    sectionType: newSectionType,
                    titleAr: newSectionForm.titleAr,
                    titleEn: newSectionForm.titleEn,
                    subtitleAr: newSectionForm.subtitleAr,
                    subtitleEn: newSectionForm.subtitleEn,
                    active: true,
                    sortOrder: maxOrder + 1,
                    config: { image: newSectionForm.image, link: newSectionForm.link, couponCode: newSectionForm.couponCode, bgColor: newSectionForm.bgColor, columns: newSectionForm.columns, limit: newSectionForm.limit },
                  }),
                });
                toast.success(lang === 'ar' ? 'تم إضافة القسم' : 'Section added');
                setNewSectionForm({ titleAr: '', titleEn: '', subtitleAr: '', subtitleEn: '', image: '', link: '', couponCode: '', bgColor: '#173E52', columns: 4, limit: 8 });
                setShowAddSection(false);
                refetch();
              } catch { toast.error('Error'); }
              setSaving(false);
            }} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
              {saving ? '...' : (lang === 'ar' ? 'إضافة' : 'Add')}
            </button>
            <button onClick={() => setShowAddSection(false)} className="bg-muted px-4 py-2 rounded-xl text-sm">{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          </div>
          <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'القسم الجديد سيُضاف في نهاية القائمة. يمكنك تغيير ترتيبه بعد الإضافة.' : 'New section will be added at the end. You can reorder after adding.'}</p>
        </div>
      )}

      <div className="space-y-2">
        {localSections.map((section, index) => (
          <div key={section.id} draggable onDragStart={() => setDragIndex(index)} onDragOver={e => { e.preventDefault(); if (dragIndex !== null && dragIndex !== index) { moveSection(dragIndex, index); setDragIndex(index); } }} onDragEnd={() => setDragIndex(null)}
            className={`bg-card border rounded-xl p-4 flex items-center gap-4 transition-all ${dragIndex === index ? 'border-primary shadow-lg' : 'border-border'} ${!section.active ? 'opacity-50' : ''}`}>
            <GripVertical className="w-5 h-5 cursor-grab text-muted-foreground" />
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{index + 1}</span>
            <div className="flex-1"><p className="font-medium text-sm">{lang === 'ar' ? section.titleAr : section.titleEn}</p><p className="text-xs text-muted-foreground">{section.sectionType}</p></div>
            <button onClick={() => toggleSection(index)} className={section.active ? 'text-green-500' : 'text-muted-foreground'}>{section.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
            <button onClick={async () => {
              if (!confirm(lang === 'ar' ? 'حذف هذا القسم؟' : 'Delete this section?')) return;
              await adminFetch(`${API}/homepage/sections/${section.id}`, token, { method: 'DELETE' });
              toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted');
              refetch();
            }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
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
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/admin-settings`).then(r => r.json()).then(data => {
      if (data.admin_signup_disabled?.value) setSignupDisabled(true);
      if (data.maintenance_mode?.value) setMaintenanceMode(true);
      if (data.logo_url?.value) setLogoUrl(data.logo_url.value.url || '');
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

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-bold">{lang === 'ar' ? 'الشعار' : 'Logo'}</h3>
        <div>
          <label className="text-sm font-medium block mb-1">{lang === 'ar' ? 'رابط الشعار' : 'Logo URL'}</label>
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm" placeholder="https://..." />
        </div>
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 object-contain rounded-lg border border-border p-2" />}
        <button onClick={() => updateSetting('logo_url', { url: logoUrl })} disabled={saving === 'logo_url'} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
          {saving === 'logo_url' ? '...' : (lang === 'ar' ? 'حفظ الشعار' : 'Save Logo')}
        </button>
      </div>
    </div>
  );
}
