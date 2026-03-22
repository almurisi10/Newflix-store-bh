import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, MapPin, Phone, Mail, CreditCard } from 'lucide-react';

export function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-6">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo-light.png`} 
              alt="NEWFLIX STORE" 
              className="h-12 hidden dark:block"
            />
            <img 
              src={`${import.meta.env.BASE_URL}images/logo-dark.png`} 
              alt="NEWFLIX STORE" 
              className="h-12 block dark:hidden"
            />
            <p className="text-muted-foreground leading-relaxed">
              {lang === 'ar' 
                ? 'نيوفلكس ستور هو وجهتك الأولى للمنتجات الرقمية والاشتراكات في البحرين. نقدم خدمة موثوقة وتسليم فوري.' 
                : 'Newflix Store is your premier destination for digital products and subscriptions in Bahrain. Offering reliable service and instant delivery.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">{t('shop')}</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">{t('about')}</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">{t('contact')}</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{lang === 'ar' ? 'السياسات' : 'Policies'}</h4>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">{lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
              <li><Link href="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors">{lang === 'ar' ? 'سياسة الاسترجاع' : 'Refund Policy'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>{lang === 'ar' ? 'مملكة البحرين' : 'Kingdom of Bahrain'}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <a href="https://wa.me/97337127483" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors dir-ltr block text-start">
                  +973 37127483
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <a href="https://instagram.com/NEWFLIX.ADS" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors dir-ltr block text-start">
                  @NEWFLIX.ADS
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-start">
            © {new Date().getFullYear()} NEWFLIX STORE. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="flex gap-2">
            <div className="w-12 h-8 rounded bg-muted/50 flex items-center justify-center border border-border"><CreditCard className="w-5 h-5 text-muted-foreground" /></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
