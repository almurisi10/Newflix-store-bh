import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Auth({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const { t, lang } = useLanguage();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
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
      toast.error(error.message);
    } finally {
      setLoading(false);
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
            <Label htmlFor="password">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
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
