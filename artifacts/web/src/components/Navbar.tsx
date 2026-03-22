import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { ShoppingBag, User, Menu, ChevronDown, LogOut, X, Home, Store, Info, Phone, Package, Settings, Heart, Shield, Coins } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function Navbar() {
  const { t, lang } = useLanguage();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const { isAdminAuthenticated } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/shop', label: t('shop') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  const close = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">

        <Link href="/" className="flex-shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <span className="font-heading font-bold text-xl text-foreground">
            {lang === 'ar' ? 'نيوفلكس ستور' : 'NEWFLIX STORE'}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${location === link.href ? 'text-primary bg-primary/5' : 'text-foreground/80 hover:text-primary hover:bg-primary/5'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 me-2 pe-2 border-e border-border">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {user ? (
            <div className="relative group hidden sm:block">
              <Button variant="ghost" className="gap-2 rounded-full ps-2 pe-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium truncate max-w-[100px]">{user.displayName || user.email?.split('@')[0]}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
              <div className="absolute top-full end-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                <div className="p-2 flex flex-col gap-1">
                  <Link href="/account" className="px-4 py-2 text-sm rounded-lg hover:bg-muted flex items-center gap-2">
                    <User className="w-4 h-4" /> {t('myAccount')}
                  </Link>
                  <Link href="/account/orders" className="px-4 py-2 text-sm rounded-lg hover:bg-muted flex items-center gap-2">
                    <Package className="w-4 h-4" /> {lang === 'ar' ? 'طلباتي' : 'My Orders'}
                  </Link>
                  <Link href="/account/wishlist" className="px-4 py-2 text-sm rounded-lg hover:bg-muted flex items-center gap-2">
                    <Heart className="w-4 h-4" /> {lang === 'ar' ? 'المفضلة' : 'Wishlist'}
                  </Link>
                  {isAdminAuthenticated && (
                    <Link href="/admin" className="px-4 py-2 text-sm rounded-lg hover:bg-muted flex items-center gap-2">
                      <Shield className="w-4 h-4" /> {t('dashboard')}
                    </Link>
                  )}
                  <div className="h-px bg-border my-1" />
                  <button onClick={signOut} className="px-4 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-2 text-start">
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="outline" className="rounded-xl font-medium px-6">
                {t('login')}
              </Button>
            </Link>
          )}

          <Button
            variant="default"
            className="rounded-xl gap-2 shadow-lg shadow-primary/20 relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">{t('cart')}</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -end-2 bg-destructive text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 z-50 lg:hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-background rounded-b-3xl shadow-2xl border-b border-border">
                <div className="relative bg-gradient-to-br from-primary via-primary/90 to-[#1FB5AC] p-5 pb-8">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                  <div className="relative z-10 flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                      </div>
                      <span className="font-heading font-bold text-white text-lg">
                        {lang === 'ar' ? 'نيوفلكس ستور' : 'NEWFLIX STORE'}
                      </span>
                    </div>
                    <button onClick={close} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {user ? (
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{user.displayName || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-white/70 truncate">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10">
                      <p className="text-white/80 text-sm">{lang === 'ar' ? 'مرحباً بك في نيوفلكس ستور' : 'Welcome to NEWFLIX STORE'}</p>
                    </div>
                  )}
                </div>

                <div className="px-4 pt-4 pb-5">
                  <div className="flex items-center gap-3 mb-4">
                    <ThemeToggle />
                    <LanguageSwitcher />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { href: '/', icon: Home, label: t('home') },
                      { href: '/shop', icon: Store, label: t('shop') },
                      { href: '/about', icon: Info, label: t('about') },
                      { href: '/contact', icon: Phone, label: t('contact') },
                    ].map((link) => (
                      <Link key={link.href} href={link.href} onClick={close}>
                        <div className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all ${
                          location === link.href
                            ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                            : 'text-foreground hover:bg-muted/80 border border-transparent'
                        }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            location === link.href ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            <link.icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{link.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {user && (
                    <>
                      <div className="h-px bg-border mx-1 my-3" />
                      <p className="text-xs text-muted-foreground font-medium px-2 mb-2 uppercase tracking-wider">
                        {lang === 'ar' ? 'حسابي' : 'My Account'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          { href: '/account', icon: User, label: lang === 'ar' ? 'حسابي' : 'Account' },
                          { href: '/account/orders', icon: Package, label: lang === 'ar' ? 'طلباتي' : 'My Orders' },
                          { href: '/account/wishlist', icon: Heart, label: lang === 'ar' ? 'المفضلة' : 'Wishlist' },
                          { href: '/account/settings', icon: Settings, label: lang === 'ar' ? 'الإعدادات' : 'Settings' },
                        ].map((link) => (
                          <Link key={link.href} href={link.href} onClick={close}>
                            <div className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all ${
                              location === link.href
                                ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                                : 'text-foreground hover:bg-muted/80 border border-transparent'
                            }`}>
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                <link.icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm">{link.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {isAdminAuthenticated && (
                        <Link href="/admin" onClick={close}>
                          <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-foreground hover:bg-muted/80 transition-all border border-transparent">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Shield className="w-4 h-4" />
                            </div>
                            <span className="text-sm">{t('dashboard')}</span>
                          </div>
                        </Link>
                      )}
                    </>
                  )}
                </div>

                <div className="px-4 pb-5">
                  {user ? (
                    <button
                      onClick={() => { signOut(); close(); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  ) : (
                    <Link href="/login" onClick={close} className="block">
                      <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 text-lg">
                        <User className="w-5 h-5" />
                        {t('login')}
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
