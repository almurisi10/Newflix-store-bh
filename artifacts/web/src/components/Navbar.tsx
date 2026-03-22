import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { ShoppingBag, User, Menu, Search, ChevronDown, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { t, lang } = useLanguage();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/shop', label: t('shop') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        <Link href="/" className="flex-shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <span className="font-heading font-bold text-xl text-foreground hidden sm:block">
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
                  {isAdmin && (
                    <Link href="/admin" className="px-4 py-2 text-sm rounded-lg hover:bg-muted flex items-center gap-2">
                      {t('dashboard')}
                    </Link>
                  )}
                  <Link href="/account" className="px-4 py-2 text-sm rounded-lg hover:bg-muted flex items-center gap-2">
                    {t('myAccount')}
                  </Link>
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
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 ${lang === 'ar' ? 'right-0' : 'left-0'} w-[80%] max-w-sm bg-background shadow-2xl z-50 flex flex-col p-6 lg:hidden overflow-y-auto`}
            >
              <div className="flex justify-end mb-8">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-muted/50">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>

              <nav className="flex flex-col gap-2 mb-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-lg font-medium hover:bg-muted transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{user.displayName || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                        <Button variant="outline" className="w-full h-12 rounded-xl justify-start px-6">
                          {t('dashboard')}
                        </Button>
                      </Link>
                    )}
                    <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                      <Button variant="outline" className="w-full h-12 rounded-xl justify-start px-6">
                        {t('myAccount')}
                      </Button>
                    </Link>
                    <Button variant="destructive" className="w-full h-12 rounded-xl" onClick={() => { signOut(); setIsMobileMenuOpen(false); }}>
                      <LogOut className="w-5 h-5 me-2" />
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                    <Button className="w-full h-14 text-lg rounded-xl shadow-lg">
                      {t('login')}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
