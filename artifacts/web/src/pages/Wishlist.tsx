import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import { Heart, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Wishlist() {
  const { lang, dir } = useLanguage();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}</h2>
          <p className="text-muted-foreground mb-6">{lang === 'ar' ? 'يرجى تسجيل الدخول لعرض المفضلة' : 'Please login to view your wishlist'}</p>
          <Link href="/login">
            <Button className="rounded-xl">{lang === 'ar' ? 'تسجيل الدخول' : 'Login'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/account')} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <BackArrow className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{lang === 'ar' ? 'المفضلة' : 'Wishlist'}</h1>
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'المنتجات المحفوظة للشراء لاحقاً' : 'Products saved for later'}</p>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">{lang === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}</h2>
          <p className="text-muted-foreground mb-6">{lang === 'ar' ? 'اكتشف منتجاتنا وأضف ما يعجبك إلى المفضلة' : 'Discover our products and add your favorites'}</p>
          <Link href="/shop">
            <Button className="rounded-xl gap-2">
              <ShoppingBag className="w-4 h-4" />
              {lang === 'ar' ? 'تصفح المتجر' : 'Browse Shop'}
              <Arrow className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
