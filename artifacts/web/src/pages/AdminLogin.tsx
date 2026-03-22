import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Eye, EyeOff, Shield, Lock, Mail, User, KeyRound, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const { login, register, isAdminAuthenticated, loading } = useAdminAuth();
  const { lang } = useLanguage();
  const [, navigate] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signupDisabled, setSignupDisabled] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated && !loading) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, loading, navigate]);

  useEffect(() => {
    const apiBase = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';
    fetch(`${apiBase}/admin-settings/admin_signup_disabled`)
      .then(r => r.json())
      .then(data => {
        if (data?.value === true) setSignupDisabled(true);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isRegister) {
      const result = await register(email, password, displayName, inviteCode);
      if (result.success) {
        toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
        navigate('/admin');
      } else {
        toast.error(result.error || (lang === 'ar' ? 'خطأ في إنشاء الحساب' : 'Registration failed'));
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
        navigate('/admin');
      } else {
        toast.error(result.error || (lang === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login failed'));
      }
    }

    setSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const apiBase = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

    try {
      const res = await fetch(`${apiBase}/admin-auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
        setIsForgotPassword(false);
        setNewPassword('');
        setInviteCode('');
      } else {
        toast.error(data.error || (lang === 'ar' ? 'خطأ' : 'Error'));
      }
    } catch {
      toast.error(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection error');
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === 'ar' ? 'لوحة تحكم المدير' : 'Admin Panel'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {lang === 'ar' ? 'تسجيل دخول المدراء فقط' : 'Admin access only'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8">
          {isForgotPassword ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold">
                  {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {lang === 'ar' ? 'أدخل بريدك الإلكتروني ورمز الدعوة وكلمة المرور الجديدة' : 'Enter your email, invite code, and new password'}
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {lang === 'ar' ? 'رمز الدعوة' : 'Invite Code'}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      required
                      placeholder={lang === 'ar' ? 'أدخل رمز الدعوة للتحقق' : 'Enter invite code to verify'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setIsForgotPassword(false); setInviteCode(''); setNewPassword(''); }}
                  className="text-sm text-primary hover:underline"
                >
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to login'}
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      {lang === 'ar' ? 'رمز الدعوة' : 'Invite Code'}
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        required
                        placeholder={lang === 'ar' ? 'أدخل رمز الدعوة' : 'Enter invite code'}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      {isRegister
                        ? (lang === 'ar' ? 'إنشاء حساب مدير' : 'Create Admin Account')
                        : (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                      }
                    </>
                  )}
                </button>
              </form>

              {!isRegister && (
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                  >
                    {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>
              )}

              {!signupDisabled && (
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-sm text-primary hover:underline"
                  >
                    {isRegister
                      ? (lang === 'ar' ? 'لديك حساب؟ تسجيل الدخول' : 'Have an account? Sign in')
                      : (lang === 'ar' ? 'إنشاء حساب مدير جديد' : 'Create new admin account')
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {lang === 'ar' ? 'هذه الصفحة مخصصة للمدراء فقط' : 'This page is for administrators only'}
        </p>
      </div>
    </div>
  );
}
