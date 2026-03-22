import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: { ar: string; en: string };
}

const translations: Translations = {
  home: { ar: 'الرئيسية', en: 'Home' },
  shop: { ar: 'المتجر', en: 'Shop' },
  categories: { ar: 'الأقسام', en: 'Categories' },
  about: { ar: 'من نحن', en: 'About Us' },
  contact: { ar: 'اتصل بنا', en: 'Contact' },
  cart: { ar: 'السلة', en: 'Cart' },
  search: { ar: 'بحث...', en: 'Search...' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Register' },
  myAccount: { ar: 'حسابي', en: 'My Account' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  addToCart: { ar: 'أضف للسلة', en: 'Add to Cart' },
  viewDetails: { ar: 'التفاصيل', en: 'View Details' },
  price: { ar: 'السعر', en: 'Price' },
  bhd: { ar: 'د.ب', en: 'BHD' },
  checkout: { ar: 'إتمام الطلب', en: 'Checkout' },
  total: { ar: 'المجموع', en: 'Total' },
  emptyCart: { ar: 'سلتك فارغة', en: 'Your cart is empty' },
  continueShopping: { ar: 'متابعة التسوق', en: 'Continue Shopping' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  orders: { ar: 'الطلبات', en: 'Orders' },
  products: { ar: 'المنتجات', en: 'Products' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  newArrivals: { ar: 'وصل حديثاً', en: 'New Arrivals' },
  bestSellers: { ar: 'الأكثر مبيعاً', en: 'Best Sellers' },
  featured: { ar: 'منتجات مميزة', en: 'Featured Products' },
  buyNow: { ar: 'اشتري الآن', en: 'Buy Now' },
  digitalDelivery: { ar: 'تسليم فوري رقمي', en: 'Instant Digital Delivery' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('newflix_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'ar';
  });

  useEffect(() => {
    localStorage.setItem('newflix_lang', lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string, fallback?: string) => {
    if (translations[key]) {
      return translations[key][lang];
    }
    return fallback || key;
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
