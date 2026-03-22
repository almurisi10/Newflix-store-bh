import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useListProducts, useListCategories } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Shop() {
  const { t, lang, dir } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Simplified params for demo, real implementation would use useSearchParams
  const { data: productsData, isLoading } = useListProducts({ 
    search: search || undefined,
    category: activeCategory || undefined,
    limit: 20 
  });
  
  const { data: categories } = useListCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Page Header */}
      <div className="bg-primary/5 rounded-3xl p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-primary/10">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('shop')}</h1>
          <p className="text-muted-foreground">{lang === 'ar' ? 'تصفح جميع منتجاتنا الرقمية' : 'Browse all our digital products'}</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-4' : 'left-4'} text-muted-foreground w-5 h-5`} />
          <Input 
            className={`h-14 rounded-full bg-background border-border shadow-sm pl-12 pr-4 rtl:pr-12 rtl:pl-4 text-lg`}
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              {t('categories')}
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveCategory('')}
                className={`w-full text-start px-4 py-2 rounded-lg transition-colors ${!activeCategory ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'}`}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              {categories?.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id.toString())}
                  className={`w-full text-start px-4 py-2 rounded-lg transition-colors ${activeCategory === cat.id.toString() ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  {lang === 'ar' ? cat.nameAr : cat.nameEn}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              {lang === 'ar' ? 'تصفية' : 'Filters'}
            </h3>
            {/* Price filter placeholder */}
            <div className="space-y-4">
              <p className="text-sm font-medium">{t('price')}</p>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" className="h-10" />
                <span className="text-muted-foreground">-</span>
                <Input type="number" placeholder="Max" className="h-10" />
              </div>
              <Button className="w-full mt-4" variant="secondary">{lang === 'ar' ? 'تطبيق' : 'Apply'}</Button>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <p className="text-muted-foreground">{productsData?.total || 0} {lang === 'ar' ? 'منتج' : 'Products'}</p>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => setIsFilterOpen(true)}>
            <Filter className="w-4 h-4" />
            {lang === 'ar' ? 'تصفية' : 'Filter'}
          </Button>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card rounded-2xl border border-border h-[400px] animate-pulse">
                  <div className="h-[250px] bg-muted/50 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-muted/50 rounded w-3/4"></div>
                    <div className="h-4 bg-muted/50 rounded w-full"></div>
                    <div className="h-8 bg-muted/50 rounded w-1/3 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border">
              <Search className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">{lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</h3>
              <p>{lang === 'ar' ? 'جرب بحث مختلف أو ازالة الفلاتر' : 'Try a different search or remove filters'}</p>
              <Button variant="outline" className="mt-6" onClick={() => {setSearch(''); setActiveCategory('');}}>
                {lang === 'ar' ? 'إزالة الفلاتر' : 'Clear Filters'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {productsData?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
