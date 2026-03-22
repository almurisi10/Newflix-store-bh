import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateOrder } from '@workspace/api-client-react';
import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ShieldCheck, CreditCard, Upload, AlertTriangle, CheckCircle, XCircle, Clock, MessageCircle } from 'lucide-react';

const API = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createOrderMutation = useCreateOrder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  });
  const [orderId, setOrderId] = useState<number | null>(null);
  const [step, setStep] = useState<'info' | 'payment' | 'receipt' | 'done'>('info');
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  if (items.length === 0 && !orderId) {
    setLocation('/cart');
    return null;
  }

  const handleCreateOrder = (e: React.FormEvent) => {
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
        couponCode: null
      }
    }, {
      onSuccess: (data: any) => {
        setOrderId(data.id);
        setStep('payment');
      },
      onError: () => {
        toast.error(lang === 'ar' ? 'حدث خطأ' : 'Error creating order');
      }
    });
  };

  const handleUploadReceipt = async (file: File) => {
    if (!orderId) return;
    setUploading(true);

    const formDataObj = new FormData();
    formDataObj.append('receipt', file);

    try {
      const res = await fetch(`${API}/orders/${orderId}/upload-receipt`, {
        method: 'POST',
        headers: user?.uid ? { 'X-Firebase-UID': user.uid } : {},
        body: formDataObj,
      });
      const result = await res.json();
      setVerificationResult(result.details);

      if (result.verified) {
        clearCart();
        setStep('done');
        toast.success(lang === 'ar' ? 'تم التحقق من الإيصال بنجاح! سيتم تسليم طلبك.' : 'Receipt verified! Your order will be delivered.');
      } else {
        setStep('done');
        clearCart();
        toast.info(lang === 'ar' ? 'تم رفع الإيصال وسيتم مراجعته' : 'Receipt uploaded, under review');
      }
    } catch {
      toast.error(lang === 'ar' ? 'خطأ في رفع الإيصال' : 'Error uploading receipt');
    }
    setUploading(false);
  };

  if (step === 'done') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <div className="bg-card rounded-3xl border border-border p-8 shadow-xl">
          {verificationResult?.verified ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}</h2>
              <p className="text-muted-foreground mb-6">{lang === 'ar' ? 'تم التحقق من الإيصال وسيتم تسليم المنتج في طلباتي' : 'Receipt verified, product will be delivered to My Orders'}</p>
            </>
          ) : (
            <>
              <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تم استلام طلبك' : 'Order Received'}</h2>
              <p className="text-muted-foreground mb-4">{lang === 'ar' ? 'سيتم مراجعة الإيصال وتأكيد الطلب قريباً' : 'Receipt is under review, order will be confirmed soon'}</p>
              {verificationResult?.reason && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400 mb-4 text-start">
                  {verificationResult.reason}
                </div>
              )}
              <a href="https://wa.me/97337127483" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-600 hover:underline">
                <MessageCircle className="w-4 h-4" />
                {lang === 'ar' ? 'تواصل معنا عبر الواتساب' : 'Contact us via WhatsApp'}
              </a>
            </>
          )}

          <div className="mt-6 space-y-3">
            <Button onClick={() => setLocation('/account/orders')} className="w-full rounded-xl">
              {lang === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
            </Button>
            <Button onClick={() => setLocation('/shop')} variant="outline" className="w-full rounded-xl">
              {lang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">{lang === 'ar' ? 'الدفع عبر BenefitPay' : 'Pay via BenefitPay'}</h2>

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-8 h-8 text-blue-500" />
              <h3 className="font-bold text-lg">BenefitPay</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-white/5 rounded-xl">
                <span className="text-muted-foreground">{lang === 'ar' ? 'الاسم' : 'Name'}</span>
                <span className="font-bold">ESMAIL ALMURISI</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-white/5 rounded-xl">
                <span className="text-muted-foreground">{lang === 'ar' ? 'الرقم' : 'Number'}</span>
                <span className="font-bold font-mono text-lg">34490039</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-xl border border-primary/30">
                <span className="font-medium">{lang === 'ar' ? 'المبلغ المطلوب' : 'Amount Due'}</span>
                <span className="font-black text-xl text-primary">{subtotal.toFixed(2)} {t('bhd')}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                <p className="font-bold mb-1">{lang === 'ar' ? 'تنبيه مهم:' : 'Important Notice:'}</p>
                <p>{lang === 'ar'
                  ? 'يجب أن يكون الاسم والرقم والمبلغ في الإيصال مطابقاً تماماً. يتم التحقق من الإيصال تلقائياً بالذكاء الاصطناعي وسيتم رفض الإيصالات المعدلة أو المزيفة. في حال وجود مشكلة تواصل عبر الواتساب.'
                  : 'The name, number, and amount on the receipt must match exactly. Receipts are automatically verified by AI and edited/fake receipts will be rejected. Contact WhatsApp for any issues.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-medium text-center">{lang === 'ar' ? 'بعد الدفع، ارفع صورة الإيصال:' : 'After payment, upload the receipt:'}</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleUploadReceipt(e.target.files[0]); }}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20 gap-2"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  {lang === 'ar' ? 'رفع صورة الإيصال' : 'Upload Receipt Image'}
                </>
              )}
            </Button>

            <div className="flex justify-center">
              <a href="https://wa.me/97337127483" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-600 hover:underline">
                <MessageCircle className="w-4 h-4" />
                {lang === 'ar' ? 'تواصل عبر الواتساب في حال وجود مشكلة' : 'WhatsApp for issues'}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">{t('checkout')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <form onSubmit={handleCreateOrder} className="space-y-8">
            <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}</Label>
                  <Input id="name" required className="h-12 mt-1.5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="email">{lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}</Label>
                  <Input id="email" type="email" required className="h-12 mt-1.5" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'سنرسل المنتجات الرقمية إلى حسابك' : 'Digital products will be sent to your account'}</p>
                </div>
                <div>
                  <Label htmlFor="phone">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <Input id="phone" type="tel" className="h-12 mt-1.5 dir-ltr text-start" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="notes">{lang === 'ar' ? 'ملاحظات إضافية' : 'Order Notes'}</Label>
                  <Textarea id="notes" className="mt-1.5 min-h-[80px]" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
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
                    BenefitPay
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lang === 'ar' ? 'تحويل عبر بنفت باي ورفع إيصال الدفع' : 'Transfer via BenefitPay and upload receipt'}
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20" disabled={createOrderMutation.isPending}>
              {createOrderMutation.isPending ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : (lang === 'ar' ? 'متابعة إلى الدفع' : 'Continue to Payment')}
            </Button>

            <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-success" />
              {lang === 'ar' ? 'معلوماتك محمية وآمنة' : 'Your information is secure'}
            </div>
          </form>
        </div>

        <div className="bg-muted/30 rounded-3xl border border-border p-6 md:p-8 h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-6 border-b border-border pb-4">{lang === 'ar' ? 'الطلب' : 'Your Order'}</h3>

          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={item.product.mainImage} alt="img" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">{item.quantity}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2">{lang === 'ar' ? item.product.titleAr : item.product.titleEn}</h4>
                </div>
                <div className="font-bold text-sm whitespace-nowrap">{(item.product.price * item.quantity).toFixed(2)} {t('bhd')}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex justify-between text-xl font-black pt-2">
              <span>{t('total')}</span>
              <span className="text-primary">{subtotal.toFixed(2)} {t('bhd')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
