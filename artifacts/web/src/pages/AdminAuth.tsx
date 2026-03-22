import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Shield, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function AdminAuth({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const { lang } = useLanguage();
  const [, setLocation] = useLocation();
  const { register: registerAdmin, loginWithFirebase } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [signupDisabled, setSignupDisabled] = useState(false);

  const isLogin = mode === 'login';

  useEffect(() => {
    if (!isLogin) {
      const apiBase = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';
      fetch(`${apiBase}/admin-settings/admin_signup_disabled`)
        .then(r => r.json())
        .then(data => {
          if (data?.value === true) setSignupDisabled(true);
        })
        .catch(() => {});
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCred.user.getIdToken();
        const result = await loginWithFirebase(idToken);
        if (result.success) {
          toast.success(lang === 'ar' ? 'تم تسجيل الدخول كمدير بنجاح' : 'Admin login successful');
          setLocation('/admin');
        } else {
          toast.error(result.error || (lang === 'ar' ? 'ليس لديك صلاحية مدير' : 'No admin privileges found'));
        }
      } else {
        if (signupDisabled) {
          toast.error(lang === 'ar' ? 'تسجيل المدراء معطّل حالياً' : 'Admin registration is currently disabled');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        const result = await registerAdmin(email, password, name, inviteCode, 'admin', userCred.user.uid);
        if (result.success) {
          toast.success(lang === 'ar' ? 'تم إنشاء حساب المدير بنجاح' : 'Admin account created successfully');
          setLocation('/admin');
        } else {
          toast.error(result.error || (lang === 'ar' ? 'خطأ في إنشاء حساب المدير' : 'Admin registration failed'));
        }
      }
    } catch (error: any) {
      const errorMessages: Record<string, { ar: string; en: string }> = {
        'auth/user-not-found': { ar: 'لا يوجد حساب بهذا البريد الإلكتروني', en: 'No account found with this email' },
        'auth/wrong-password': { ar: 'كلمة المرور غير صحيحة', en: 'Incorrect password' },
        'auth/invalid-credential': { ar: 'البريد أو كلمة المرور غير صحيحة', en: 'Invalid email or password' },
        'auth/email-already-in-use': { ar: 'هذا البريد الإلكتروني مسجل مسبقاً', en: 'This email is already registered' },
        'auth/weak-password': { ar: 'كلمة المرور ضعيفة (6 أحرف على الأقل)', en: 'Password is too weak (min 6 characters)' },
        'auth/invalid-email': { ar: 'البريد الإلكتروني غير صالح', en: 'Invalid email address' },
      };
      const msg = errorMessages[error.code];
      toast.error(msg ? (lang === 'ar' ? msg.ar : msg.en) : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error(lang === 'ar' ? 'أدخل بريدك الإلكتروني أولاً' : 'Enter your email first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(lang === 'ar' ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك' : 'Password reset link sent to your email');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error(lang === 'ar' ? 'لا يوجد حساب بهذا البريد الإلكتروني' : 'No account found with this email');
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl shadow-black/5">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isLogin
                ? (lang === 'ar' ? 'دخول لوحة التحكم' : 'Admin Login')
                : (lang === 'ar' ? 'تسجيل مدير جديد' : 'Admin Registration')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? (lang === 'ar' ? 'سجل دخولك للوصول إلى لوحة التحكم' : 'Sign in to access the admin dashboard')
                : (lang === 'ar' ? 'أنشئ حساب مدير جديد برمز الدعوة' : 'Create a new admin account with invite code')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="admin-name">{lang === 'ar' ? 'الاسم' : 'Name'}</Label>
                <Input
                  id="admin-name"
                  required
                  className="h-12 mt-1.5"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label htmlFor="admin-email">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                id="admin-email"
                type="email"
                required
                className="h-12 mt-1.5 dir-ltr text-start"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary hover:underline"
                  >
                    {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="h-12 mt-1.5 dir-ltr text-start pe-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 translate-y-[-20%] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="admin-inviteCode">{lang === 'ar' ? 'رمز الدعوة' : 'Invite Code'}</Label>
                <div className="relative">
                  <Input
                    id="admin-inviteCode"
                    type="password"
                    required
                    className="h-12 mt-1.5 dir-ltr text-start ps-10"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل رمز الدعوة' : 'Enter invite code'}
                  />
                  <KeyRound className="absolute start-3 top-1/2 translate-y-[10%] w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-2" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {isLogin
                    ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                    : (lang === 'ar' ? 'إنشاء حساب مدير' : 'Create Admin Account')}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                {lang === 'ar' ? 'ليس لديك حساب مدير؟ ' : 'Don\'t have an admin account? '}
                <button onClick={() => setLocation('/newflix-admin/register')} className="text-primary font-bold hover:underline">
                  {lang === 'ar' ? 'تسجيل جديد' : 'Register'}
                </button>
              </>
            ) : (
              <>
                {lang === 'ar' ? 'لديك حساب مدير؟ ' : 'Already have an admin account? '}
                <button onClick={() => setLocation('/newflix-admin')} className="text-primary font-bold hover:underline">
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
