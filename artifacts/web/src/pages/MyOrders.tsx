import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Package, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyOrders() {
  const { user } = useAuth();
  const { lang, dir } = useLanguage();
  const [, navigate] = useLocation();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders', user?.uid],
    queryFn: async () => {
      const res = await fetch(`/api/user/orders?firebaseUid=${user!.uid}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: !!user?.uid,
  });

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}</h2>
          <p className="text-muted-foreground mb-6">{lang === 'ar' ? 'يرجى تسجيل الدخول لعرض طلباتك' : 'Please login to view your orders'}</p>
          <Link href="/login">
            <Button className="rounded-xl">{lang === 'ar' ? 'تسجيل الدخول' : 'Login'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: lang === 'ar' ? 'مكتمل' : 'Completed' };
      case 'pending':
        return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: lang === 'ar' ? 'قيد الانتظار' : 'Pending' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: lang === 'ar' ? 'ملغي' : 'Cancelled' };
      default:
        return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: status };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/account')} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <BackArrow className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{lang === 'ar' ? 'طلباتي' : 'My Orders'}</h1>
            <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'تتبع وإدارة جميع طلباتك' : 'Track and manage all your orders'}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-5 bg-muted rounded w-32" />
                  <div className="h-5 bg-muted rounded w-24" />
                </div>
                <div className="h-4 bg-muted rounded w-48 mb-2" />
                <div className="h-4 bg-muted rounded w-36" />
              </div>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">{lang === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}</h2>
            <p className="text-muted-foreground mb-6">{lang === 'ar' ? 'ابدأ التسوق واكتشف منتجاتنا الرقمية' : 'Start shopping and discover our digital products'}</p>
            <Link href="/shop">
              <Button className="rounded-xl gap-2">
                {lang === 'ar' ? 'تصفح المتجر' : 'Browse Shop'}
                <Arrow className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all">
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-lg">#{order.id}</span>
                          <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-BH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'المجموع' : 'Total'}</p>
                        <p className="text-xl font-bold text-primary">{order.total} <span className="text-sm">{lang === 'ar' ? 'د.ب' : 'BHD'}</span></p>
                      </div>
                      {order.status === 'paid' || order.status === 'delivered' ? (
                        <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          {lang === 'ar' ? 'تم التسليم' : 'Delivered'}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="px-5 md:px-6 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                    <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      <Eye className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'التفاصيل' : 'Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
