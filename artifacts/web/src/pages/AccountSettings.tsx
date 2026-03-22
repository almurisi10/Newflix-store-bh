import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, ArrowLeft, ArrowRight, LogOut, Bell, Globe, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { lang, dir, setLang } = useLanguage();
  const [, navigate] = useLocation();
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}</h2>
          <p className="text-muted-foreground mb-6">{lang === 'ar' ? 'يرجى تسجيل الدخول لعرض إعدادات حسابك' : 'Please login to view account settings'}</p>
          <Link href="/login">
            <Button className="rounded-xl">{lang === 'ar' ? 'تسجيل الدخول' : 'Login'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/account')} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <BackArrow className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{lang === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}</h1>
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إدارة معلومات حسابك' : 'Manage your account information'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {lang === 'ar' ? 'معلومات الحساب' : 'Account Information'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الاسم' : 'Name'}</p>
                    <p className="font-medium">{user.displayName || (lang === 'ar' ? 'لم يتم التعيين' : 'Not set')}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                    <p className="font-medium dir-ltr text-start">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'نوع الحساب' : 'Account Type'}</p>
                    <p className="font-medium">{lang === 'ar' ? 'حساب عادي' : 'Regular Account'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-5 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {lang === 'ar' ? 'التفضيلات' : 'Preferences'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span>{lang === 'ar' ? 'اللغة' : 'Language'}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setLang('ar')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lang === 'ar' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>عربي</button>
                  <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>English</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
                </div>
                <span className="text-sm text-muted-foreground">{lang === 'ar' ? 'مفعلة' : 'Enabled'}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-destructive/30 rounded-2xl p-6">
            <h3 className="font-bold mb-3 text-destructive flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'ar' ? 'سيتم تسجيل خروجك من حسابك على هذا الجهاز' : 'You will be signed out of your account on this device'}
            </p>
            <Button variant="destructive" className="rounded-xl" onClick={() => { signOut(); navigate('/'); }}>
              <LogOut className="w-4 h-4 me-2" />
              {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
