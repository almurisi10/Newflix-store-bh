import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Auth({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully');
      }
      setLocation('/');
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');
      setLocation('/');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message);
      }
    } finally {
      setGoogleLoading(false);
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
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border p-8 shadow-2xl shadow-black/5">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{isLogin ? t('login') : t('register')}</h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? (lang === 'ar' ? 'أهلاً بك مجدداً في متجر نيوفلكس' : 'Welcome back to Newflix Store')
              : (lang === 'ar' ? 'أنشئ حسابك الجديد للبدء' : 'Create your new account to get started')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors text-sm font-medium disabled:opacity-50 mb-6"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {lang === 'ar' ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}
            </>
          )}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {lang === 'ar' ? 'أو' : 'OR'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <Label htmlFor="name">{lang === 'ar' ? 'الاسم' : 'Name'}</Label>
              <Input 
                id="name" 
                required 
                className="h-12 mt-1.5"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              className="h-12 mt-1.5 dir-ltr text-start"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
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
            <Input 
              id="password" 
              type="password" 
              required 
              className="h-12 mt-1.5 dir-ltr text-start"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-4" disabled={loading}>
            {loading ? '...' : (isLogin ? t('login') : t('register'))}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              {lang === 'ar' ? 'ليس لديك حساب؟ ' : 'Don\'t have an account? '}
              <button onClick={() => setLocation('/register')} className="text-primary font-bold hover:underline">
                {t('register')}
              </button>
            </>
          ) : (
            <>
              {lang === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              <button onClick={() => setLocation('/login')} className="text-primary font-bold hover:underline">
                {t('login')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
