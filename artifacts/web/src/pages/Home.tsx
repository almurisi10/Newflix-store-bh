import { useLanguage } from '@/contexts/LanguageContext';
import { useListProducts, useListCategories, useListHomepageSections } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, ArrowLeft, Zap, Shield, Clock, Gift, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { EditableText } from '@/components/InlineEditor';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useEditMode } from '@/contexts/EditModeContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

function HeroSlider({ sections, lang }: { sections: any[]; lang: string }) {
  const sliderSections = sections.filter((s: any) => s.sectionType === 'slider' && s.active);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (sliderSections.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % sliderSections.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [sliderSections.length]);

  if (sliderSections.length === 0) return null;

  const goTo = (idx: number) => {
    setCurrent(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % sliderSections.length), 5000);
  };

  return (
    <section className="relative w-full overflow-hidden rounded-3xl mx-auto container px-4">
      <div className="relative aspect-[21/9] md:aspect-[3/1] rounded-3xl overflow-hidden">
        {sliderSections.map((slide: any, idx: number) => {
          const config = slide.config || {};
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ${idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            >
              {config.image && (
                <img src={config.image} alt={lang === 'ar' ? slide.titleAr : slide.titleEn} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 start-0 p-6 md:p-10 text-white max-w-2xl">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  {lang === 'ar' ? slide.titleAr : slide.titleEn}
                </h2>
                {(slide.subtitleAr || slide.subtitleEn) && (
                  <p className="text-sm md:text-lg text-white/80 mb-4">
                    {lang === 'ar' ? slide.subtitleAr : slide.subtitleEn}
                  </p>
                )}
                {config.link && (
                  <Link href={config.link}>
                    <Button className="rounded-xl">{lang === 'ar' ? 'تسوق الآن' : 'Shop Now'}</Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {sliderSections.length > 1 && (
          <>
            <button onClick={() => goTo((current - 1 + sliderSections.length) % sliderSections.length)} className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => goTo((current + 1) % sliderSections.length)} className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 start-1/2 -translate-x-1/2 flex gap-2">
              {sliderSections.map((_: any, idx: number) => (
                <button key={idx} onClick={() => goTo(idx)} className={`w-2.5 h-2.5 rounded-full transition-all ${idx === current ? 'bg-white w-8' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(lang === 'ar' ? 'تم نسخ الكود!' : 'Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors">
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الكود' : 'Copy Code')}
    </button>
  );
}

export default function Home() {
  const { t, lang, dir } = useLanguage();
  const { data: productsData, isLoading: productsLoading } = useListProducts({ limit: 12, featured: true });
  const { data: allProductsData } = useListProducts({ limit: 12 });
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: homepageSections } = useListHomepageSections();
  const { getText } = useSiteContent();
  const { editMode } = useEditMode();
  const scrollRef = useRef<HTMLDivElement>(null);

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const heroBadge = getText('hero.badge', lang) || (lang === 'ar' ? 'أفضل متجر للمنتجات الرقمية' : 'Premium Digital Store');
  const heroLine1 = getText('hero.title.line1', lang) || (lang === 'ar' ? 'عالم من الترفيه' : 'A World of Entertainment');
  const heroLine2 = getText('hero.title.line2', lang) || (lang === 'ar' ? 'بين يديك' : 'At Your Fingertips');
  const heroSubtitle = getText('hero.subtitle', lang) || (lang === 'ar' ? 'اشتراكات، بطاقات هدايا، وألعاب. تسليم فوري وآمن وبأفضل الأسعار في البحرين.' : 'Subscriptions, gift cards, and games. Instant secure delivery with the best prices in Bahrain.');

  const sections = homepageSections || [];
  const activeSections = [...sections].filter((s: any) => s.active).sort((a: any, b: any) => a.sortOrder - b.sortOrder);

  const renderSection = (section: any) => {
    switch (section.sectionType) {
      case 'hero':
        return (
          <section key={section.id} className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-primary/5">
            <div className="absolute inset-0 z-0">
              <img 
                src={section.config?.image || `${import.meta.env.BASE_URL}images/hero-abstract.png`}
                alt="Hero Background" 
                className="w-full h-full object-cover opacity-30 dark:opacity-20 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
            <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6 border border-primary/20 backdrop-blur-md">
                  <Zap className="w-4 h-4 fill-current" />
                  <EditableText contentKey="hero.badge" fallback={heroBadge} />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight tracking-tight">
                  <EditableText contentKey="hero.title.line1" fallback={heroLine1} /> <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    <EditableText contentKey="hero.title.line2" fallback={heroLine2} />
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                  <EditableText contentKey="hero.subtitle" fallback={heroSubtitle} />
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/shop" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto rounded-xl text-lg h-14 px-8 shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform">
                      <EditableText contentKey="hero.cta.primary" fallback={lang === 'ar' ? 'تسوق الآن' : 'Shop Now'} />
                      <Arrow className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        );

      case 'features':
        return (
          <section key={section.id} className="container mx-auto px-4 -mt-16 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Zap, titleKey: 'features.instant.title', descKey: 'features.instant.desc', titleFallback: lang === 'ar' ? 'تسليم فوري' : 'Instant Delivery', descFallback: lang === 'ar' ? 'استلم طلبك رقمياً فور الدفع' : 'Get your order digitally right after payment' },
                { icon: Shield, titleKey: 'features.secure.title', descKey: 'features.secure.desc', titleFallback: lang === 'ar' ? 'دفع آمن' : 'Secure Payment', descFallback: lang === 'ar' ? 'بوابات دفع مشفرة وموثوقة' : 'Encrypted and trusted payment gateways' },
                { icon: Clock, titleKey: 'features.support.title', descKey: 'features.support.desc', titleFallback: lang === 'ar' ? 'دعم 24/7' : '24/7 Support', descFallback: lang === 'ar' ? 'فريق جاهز لخدمتك دائماً' : 'Our team is always ready to help' },
              ].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-card/80 backdrop-blur-lg border border-border/50 p-6 rounded-2xl shadow-xl shadow-black/5 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1"><EditableText contentKey={feature.titleKey} fallback={feature.titleFallback} /></h3>
                    <p className="text-muted-foreground text-sm leading-relaxed"><EditableText contentKey={feature.descKey} fallback={feature.descFallback} /></p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );

      case 'slider':
        return null;

      case 'categories':
        if (categoriesLoading || !categories || categories.length === 0) return null;
        return (
          <section key={section.id} className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
                {lang === 'ar' ? (section.titleAr || t('categories')) : (section.titleEn || t('categories'))}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat, i) => (
                <Link key={cat.id} href={`/shop?category=${cat.id}`}>
                  <motion.div whileHover={{ scale: 1.05 }}
                    className="bg-muted/30 border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors aspect-square">
                    <div className="w-16 h-16 rounded-full bg-background shadow-sm flex items-center justify-center text-2xl">
                      {cat.icon || '🛍️'}
                    </div>
                    <span className="font-bold text-foreground">{lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        );

      case 'featured_products':
        return (
          <section key={section.id} className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="w-2 h-8 bg-secondary rounded-full inline-block"></span>
                {lang === 'ar' ? (section.titleAr || t('featured')) : (section.titleEn || t('featured'))}
              </h2>
              <Link href="/shop" className="text-primary font-medium flex items-center gap-1 hover:underline">
                {lang === 'ar' ? 'عرض الكل' : 'View All'} <Arrow className="w-4 h-4" />
              </Link>
            </div>
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-card rounded-2xl border border-border h-[400px] animate-pulse">
                    <div className="h-[250px] bg-muted/50 rounded-t-2xl" />
                    <div className="p-4 space-y-3"><div className="h-6 bg-muted/50 rounded w-3/4" /><div className="h-4 bg-muted/50 rounded w-full" /><div className="h-8 bg-muted/50 rounded w-1/3 mt-4" /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${section.config?.columns || 4} gap-6`}>
                {productsData?.products.slice(0, section.config?.limit || 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        );

      case 'new_products':
        return (
          <section key={section.id} className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
                {lang === 'ar' ? (section.titleAr || 'منتجات جديدة') : (section.titleEn || 'New Products')}
              </h2>
              <Link href="/shop" className="text-primary font-medium flex items-center gap-1 hover:underline">
                {lang === 'ar' ? 'عرض الكل' : 'View All'} <Arrow className="w-4 h-4" />
              </Link>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${section.config?.columns || 4} gap-6`}>
              {allProductsData?.products.slice(0, section.config?.limit || 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );

      case 'cta':
        const couponCode = section.config?.couponCode || 'WELCOME10';
        return (
          <section key={section.id} className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-10 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
              <div className="relative z-10 max-w-2xl text-center md:text-start">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  <EditableText contentKey="cta.title" fallback={lang === 'ar' ? (section.titleAr || 'احصل على خصم 10% على أول طلب') : (section.titleEn || 'Get 10% Off Your First Order')} />
                </h2>
                <p className="text-lg text-white/80 mb-8">
                  <EditableText contentKey="cta.subtitle" fallback={lang === 'ar' ? (section.subtitleAr || 'استخدم الكود عند الدفع واستمتع بأفضل المنتجات الرقمية') : (section.subtitleEn || 'Use the code at checkout and enjoy the best digital products')} />
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 bg-white/20 p-2 rounded-xl backdrop-blur-sm max-w-sm mx-auto md:mx-0">
                  <div className="flex-1 px-4 font-mono text-xl tracking-widest font-bold">{couponCode}</div>
                  <CopyCodeButton code={couponCode} />
                </div>
              </div>
              <div className="relative z-10">
                <Gift className="w-40 h-40 text-white/90 drop-shadow-2xl animate-bounce-slow" />
              </div>
            </div>
          </section>
        );

      case 'banner':
        const bannerConfig = section.config || {};
        return (
          <section key={section.id} className="container mx-auto px-4">
            <div className="relative rounded-3xl overflow-hidden" style={{ backgroundColor: bannerConfig.bgColor || '#173E52' }}>
              {bannerConfig.image && (
                <img src={bannerConfig.image} alt="" className="w-full h-48 md:h-64 object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {lang === 'ar' ? section.titleAr : section.titleEn}
                  </h2>
                  {(section.subtitleAr || section.subtitleEn) && (
                    <p className="text-white/80 text-lg">{lang === 'ar' ? section.subtitleAr : section.subtitleEn}</p>
                  )}
                  {bannerConfig.link && (
                    <Link href={bannerConfig.link}>
                      <Button variant="secondary" className="mt-4 rounded-xl">{lang === 'ar' ? 'اكتشف المزيد' : 'Discover More'}</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const hasActiveSections = activeSections.length > 0;
  const sliderSections = activeSections.filter((s: any) => s.sectionType === 'slider');

  if (hasActiveSections) {
    return (
      <div className="flex flex-col gap-20 pb-20">
        {activeSections.map(section => renderSection(section))}
        {sliderSections.length > 0 && <HeroSlider sections={activeSections} lang={lang} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0">
          <img src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} alt="Hero Background" className="w-full h-full object-cover opacity-30 dark:opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6 border border-primary/20 backdrop-blur-md">
              <Zap className="w-4 h-4 fill-current" /><EditableText contentKey="hero.badge" fallback={heroBadge} />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight tracking-tight">
              <EditableText contentKey="hero.title.line1" fallback={heroLine1} /> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"><EditableText contentKey="hero.title.line2" fallback={heroLine2} /></span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"><EditableText contentKey="hero.subtitle" fallback={heroSubtitle} /></p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-xl text-lg h-14 px-8 shadow-xl shadow-primary/25 hover:-translate-y-1 transition-transform">
                  <EditableText contentKey="hero.cta.primary" fallback={lang === 'ar' ? 'تسوق الآن' : 'Shop Now'} /><Arrow className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, titleKey: 'features.instant.title', descKey: 'features.instant.desc', titleFallback: lang === 'ar' ? 'تسليم فوري' : 'Instant Delivery', descFallback: lang === 'ar' ? 'استلم طلبك رقمياً فور الدفع' : 'Get your order digitally right after payment' },
            { icon: Shield, titleKey: 'features.secure.title', descKey: 'features.secure.desc', titleFallback: lang === 'ar' ? 'دفع آمن' : 'Secure Payment', descFallback: lang === 'ar' ? 'بوابات دفع مشفرة وموثوقة' : 'Encrypted and trusted payment gateways' },
            { icon: Clock, titleKey: 'features.support.title', descKey: 'features.support.desc', titleFallback: lang === 'ar' ? 'دعم 24/7' : '24/7 Support', descFallback: lang === 'ar' ? 'فريق جاهز لخدمتك دائماً' : 'Our team is always ready to help' },
          ].map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card/80 backdrop-blur-lg border border-border/50 p-6 rounded-2xl shadow-xl shadow-black/5 flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><feature.icon className="w-7 h-7" /></div>
              <div>
                <h3 className="font-bold text-lg mb-1"><EditableText contentKey={feature.titleKey} fallback={feature.titleFallback} /></h3>
                <p className="text-muted-foreground text-sm leading-relaxed"><EditableText contentKey={feature.descKey} fallback={feature.descFallback} /></p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {!categoriesLoading && categories && categories.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3"><span className="w-2 h-8 bg-primary rounded-full inline-block" />{t('categories')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} href={`/shop?category=${cat.id}`}>
                <motion.div whileHover={{ scale: 1.05 }} className="bg-muted/30 border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors aspect-square">
                  <div className="w-16 h-16 rounded-full bg-background shadow-sm flex items-center justify-center text-2xl">{cat.icon || '🛍️'}</div>
                  <span className="font-bold text-foreground">{lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3"><span className="w-2 h-8 bg-secondary rounded-full inline-block" />{t('featured')}</h2>
          <Link href="/shop" className="text-primary font-medium flex items-center gap-1 hover:underline">{lang === 'ar' ? 'عرض الكل' : 'View All'} <Arrow className="w-4 h-4" /></Link>
        </div>
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border h-[400px] animate-pulse"><div className="h-[250px] bg-muted/50 rounded-t-2xl" /><div className="p-4 space-y-3"><div className="h-6 bg-muted/50 rounded w-3/4" /><div className="h-4 bg-muted/50 rounded w-full" /><div className="h-8 bg-muted/50 rounded w-1/3 mt-4" /></div></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsData?.products.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        )}
      </section>
      
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-10 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-2xl text-center md:text-start">
            <h2 className="text-3xl md:text-5xl font-bold mb-4"><EditableText contentKey="cta.title" fallback={lang === 'ar' ? 'احصل على خصم 10% على أول طلب' : 'Get 10% Off Your First Order'} /></h2>
            <p className="text-lg text-white/80 mb-8"><EditableText contentKey="cta.subtitle" fallback={lang === 'ar' ? 'استخدم الكود WELCOME10 عند الدفع واستمتع بأفضل المنتجات الرقمية' : 'Use code WELCOME10 at checkout and enjoy the best digital products'} /></p>
            <div className="flex items-center justify-center md:justify-start gap-4 bg-white/20 p-2 rounded-xl backdrop-blur-sm max-w-sm mx-auto md:mx-0">
              <div className="flex-1 px-4 font-mono text-xl tracking-widest font-bold">WELCOME10</div>
              <CopyCodeButton code="WELCOME10" />
            </div>
          </div>
          <div className="relative z-10"><Gift className="w-40 h-40 text-white/90 drop-shadow-2xl animate-bounce-slow" /></div>
        </div>
      </section>
    </div>
  );
}
