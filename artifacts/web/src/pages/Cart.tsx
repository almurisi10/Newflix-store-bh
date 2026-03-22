import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Tag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useValidateCoupon } from '@workspace/api-client-react';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const { t, lang, dir } = useLanguage();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const validateMutation = useValidateCoupon();

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    validateMutation.mutate({ data: { code: couponCode, orderTotal: subtotal } }, {
      onSuccess: (res) => {
        if (res.valid) {
          setDiscount(res.discountAmount);
          toast.success(lang === 'ar' ? 'تم تفعيل الكوبون بنجاح' : 'Coupon applied successfully');
        } else {
          setDiscount(0);
          toast.error(res.message || (lang === 'ar' ? 'كوبون غير صالح' : 'Invalid coupon'));
        }
      },
      onError: () => toast.error(lang === 'ar' ? 'خطأ في التحقق من الكوبون' : 'Error validating coupon')
    });
  };

  const total = subtotal - discount;
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-50" />
        </div>
        <h1 className="text-3xl font-bold mb-4">{t('emptyCart')}</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          {lang === 'ar' ? 'يبدو أنك لم تضف أي منتجات إلى سلتك بعد. تصفح متجرنا لاكتشاف منتجاتنا المميزة.' : 'Looks like you haven\'t added anything to your cart yet. Browse our store to discover great products.'}
        </p>
        <Link href="/shop">
          <Button size="lg" className="rounded-xl h-14 px-8 text-lg">
            {t('continueShopping')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-primary" />
        {t('cart')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-end mb-4">
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={clearCart}>
              <Trash2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {lang === 'ar' ? 'إفراغ السلة' : 'Clear Cart'}
            </Button>
          </div>
          
          {items.map((item) => {
            const title = lang === 'ar' ? item.product.titleAr : item.product.titleEn;
            return (
              <div key={item.product.id} className="bg-card rounded-2xl border border-border p-4 flex gap-4 sm:gap-6 shadow-sm relative overflow-hidden">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 border border-border/50">
                  <img src={item.product.mainImage} alt={title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link href={`/product/${item.product.id}`} className="font-bold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
                        {title}
                      </Link>
                      <p className="text-muted-foreground text-sm mt-1">{item.product.deliveryType === 'instant' ? (lang === 'ar' ? 'تسليم فوري' : 'Instant') : ''}</p>
                    </div>
                    <p className="font-black text-primary text-xl whitespace-nowrap">
                      {item.product.price} <span className="text-sm font-normal text-muted-foreground">{t('bhd')}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center bg-muted/50 rounded-xl border border-border p-1">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-lg font-medium transition-colors">-</button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-lg font-medium transition-colors">+</button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-sm text-destructive font-medium hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{lang === 'ar' ? 'حذف' : 'Remove'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-3xl border border-border p-6 shadow-xl shadow-black/5 sticky top-24">
            <h3 className="text-xl font-bold mb-6">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h3>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="font-medium">{subtotal.toFixed(2)} {t('bhd')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>{lang === 'ar' ? 'الخصم' : 'Discount'}</span>
                  <span className="font-bold">-{discount.toFixed(2)} {t('bhd')}</span>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">{lang === 'ar' ? 'كود الخصم' : 'Coupon Code'}</label>
              <div className="flex gap-2">
                <Input 
                  placeholder={lang === 'ar' ? 'أدخل الكود هنا' : 'Enter code here'} 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="rounded-xl h-12"
                />
                <Button 
                  variant="secondary" 
                  className="rounded-xl h-12 px-6" 
                  onClick={handleApplyCoupon}
                  disabled={validateMutation.isPending || !couponCode}
                >
                  {validateMutation.isPending ? '...' : (lang === 'ar' ? 'تفعيل' : 'Apply')}
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">{t('total')}</span>
                <div className="text-end">
                  <span className="text-3xl font-black text-primary">{total.toFixed(2)}</span>
                  <span className="text-muted-foreground ml-1 rtl:mr-1 rtl:ml-0">{t('bhd')}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform">
                {t('checkout')}
                <Arrow className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" />
              </Button>
            </Link>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Tag className="w-4 h-4" />
              {lang === 'ar' ? 'تسوق آمن ومضمون 100%' : '100% Safe and Secure Checkout'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
