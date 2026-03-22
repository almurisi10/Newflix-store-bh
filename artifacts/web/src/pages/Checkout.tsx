import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateOrder } from '@workspace/api-client-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ShieldCheck, CreditCard } from 'lucide-react';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createOrderMutation = useCreateOrder();

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  });

  if (items.length === 0) {
    setLocation('/cart');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error(lang === 'ar' ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    createOrderMutation.mutate({
      data: {
        firebaseUid: user?.uid || 'guest_' + Date.now(),
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        notes: formData.notes,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        couponCode: null // Simplified for this implementation
      }
    }, {
      onSuccess: () => {
        clearCart();
        toast.success(lang === 'ar' ? 'تم استلام طلبك بنجاح' : 'Order received successfully');
        setLocation('/account/orders'); // Redirect to orders page
      },
      onError: (err) => {
        toast.error(lang === 'ar' ? 'حدث خطأ أثناء معالجة الطلب' : 'Error processing order');
        console.error(err);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('checkout')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}</Label>
                  <Input 
                    id="name" 
                    required 
                    className="h-12 mt-1.5"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    className="h-12 mt-1.5"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === 'ar' ? 'سنرسل المنتجات الرقمية إلى هذا البريد' : 'We will send digital products to this email'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    className="h-12 mt-1.5 dir-ltr text-start"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">{lang === 'ar' ? 'ملاحظات إضافية' : 'Order Notes'}</Label>
                  <Textarea 
                    id="notes" 
                    className="mt-1.5 min-h-[100px]"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                {lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </h2>
              
              <div className="border border-primary/50 bg-primary/5 rounded-xl p-4 flex items-start gap-4">
                <input type="radio" checked readOnly className="mt-1 w-5 h-5 accent-primary" />
                <div>
                  <h4 className="font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {lang === 'ar' ? 'بطاقة الائتمان / بنفت' : 'Credit Card / BenefitPay'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lang === 'ar' ? 'دفع إلكتروني آمن عن طريق بوابة الدفع' : 'Secure online payment via payment gateway'}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending 
                ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') 
                : (lang === 'ar' ? `دفع ${subtotal.toFixed(2)} ${t('bhd')}` : `Pay ${subtotal.toFixed(2)} ${t('bhd')}`)}
            </Button>

            <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-success" />
              {lang === 'ar' ? 'معلوماتك مشفرة وآمنة تماماً' : 'Your information is fully encrypted and secure'}
            </div>
          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="bg-muted/30 rounded-3xl border border-border p-6 md:p-8 h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-6 border-b border-border pb-4">{lang === 'ar' ? 'الطلب' : 'Your Order'}</h3>
          
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={item.product.mainImage} alt="img" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2">
                    {lang === 'ar' ? item.product.titleAr : item.product.titleEn}
                  </h4>
                  <p className="text-muted-foreground text-xs mt-1">{item.product.deliveryType}</p>
                </div>
                <div className="font-bold text-sm whitespace-nowrap">
                  {(item.product.price * item.quantity).toFixed(2)} {t('bhd')}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="font-medium">{subtotal.toFixed(2)} {t('bhd')}</span>
            </div>
            <div className="flex justify-between text-xl font-black pt-4 border-t border-border">
              <span>{t('total')}</span>
              <span className="text-primary">{subtotal.toFixed(2)} {t('bhd')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
