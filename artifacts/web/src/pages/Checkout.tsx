import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ShieldCheck, CreditCard, Upload, AlertTriangle, CheckCircle, Clock, MessageCircle, Tag, Loader2, Download, Receipt, Sparkles } from 'lucide-react';

const API = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

function Invoice({ orderNumber, orderTotal, items, formData, couponApplied, discountAmount, subtotal, lang }: any) {
  const date = new Date();
  const formattedDate = date.toLocaleDateString(lang === 'ar' ? 'ar-BH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString(lang === 'ar' ? 'ar-BH' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div id="invoice" className="bg-white text-gray-900 rounded-2xl border border-gray-200 overflow-hidden shadow-lg print:shadow-none">
      <div className="bg-gradient-to-r from-[#173E52] to-[#1FB5AC] p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xl font-bold">N</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">NEWFLIX STORE</h3>
              <p className="text-white/70 text-xs">{lang === 'ar' ? 'متجر المنتجات الرقمية' : 'Digital Products Store'}</p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-xs text-white/60">{lang === 'ar' ? 'فاتورة' : 'INVOICE'}</p>
            <p className="font-mono font-bold text-sm">{orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'العميل' : 'Customer'}</p>
            <p className="font-semibold">{formData.name}</p>
            <p className="text-gray-500 text-xs">{formData.email}</p>
            {formData.phone && <p className="text-gray-500 text-xs dir-ltr">{formData.phone}</p>}
          </div>
          <div className="text-end">
            <p className="text-gray-400 text-xs mb-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</p>
            <p className="font-semibold text-sm">{formattedDate}</p>
            <p className="text-gray-500 text-xs">{formattedTime}</p>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-start p-3 text-gray-500 font-medium">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                <th className="text-center p-3 text-gray-500 font-medium">{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                <th className="text-end p-3 text-gray-500 font-medium">{lang === 'ar' ? 'السعر' : 'Price'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="p-3 font-medium">{lang === 'ar' ? item.product.titleAr : item.product.titleEn}</td>
                  <td className="p-3 text-center text-gray-500">{item.quantity}</td>
                  <td className="p-3 text-end font-semibold">{(item.product.price * item.quantity).toFixed(2)} {lang === 'ar' ? 'د.ب' : 'BHD'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span>{subtotal.toFixed(2)} {lang === 'ar' ? 'د.ب' : 'BHD'}</span>
          </div>
          {couponApplied && (
            <div className="flex justify-between text-green-600">
              <span>{lang === 'ar' ? 'خصم' : 'Discount'} ({couponApplied.code})</span>
              <span>-{discountAmount.toFixed(2)} {lang === 'ar' ? 'د.ب' : 'BHD'}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
            <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
            <span className="text-[#1FB5AC]">{orderTotal.toFixed(2)} {lang === 'ar' ? 'د.ب' : 'BHD'}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-dashed border-gray-200 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[#1FB5AC] font-medium">
            <Sparkles className="w-4 h-4" />
            {lang === 'ar'
              ? 'شكراً لثقتكم في نيوفلكس ستور! نحن هنا دائماً لخدمتكم.'
              : 'Thank you for choosing NEWFLIX STORE! We are always here to serve you.'}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {lang === 'ar' ? 'واتساب: 37127483 | انستغرام: @NEWFLIX.ADS' : 'WhatsApp: 37127483 | Instagram: @NEWFLIX.ADS'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [step, setStep] = useState<'info' | 'payment' | 'receipt' | 'done'>('info');
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  if (items.length === 0 && !orderId) {
    setLocation('/cart');
    return null;
  }

  const displayItems = savedItems.length > 0 ? savedItems : items;
  const discountAmount = couponApplied?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`${API}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponApplied({ code: couponCode.trim(), discountAmount: data.discountAmount });
        toast.success(lang === 'ar' ? 'تم تطبيق الكوبون!' : 'Coupon applied!');
      } else {
        setCouponError(data.message || (lang === 'ar' ? 'كوبون غير صالح' : 'Invalid coupon'));
      }
    } catch {
      setCouponError(lang === 'ar' ? 'خطأ في التحقق' : 'Verification error');
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error(lang === 'ar' ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      setSavedItems([...items]);
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user?.uid || 'guest_' + Date.now(),
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          notes: formData.notes,
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          couponCode: couponApplied?.code || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      setOrderId(data.id);
      setOrderNumber(data.orderNumber || null);
      setOrderTotal(data.total);
      setStep('payment');
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'حدث خطأ في إنشاء الطلب' : 'Error creating order'));
    }
    setIsSubmitting(false);
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

  const buildWhatsAppUrl = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString(lang === 'ar' ? 'ar-BH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString(lang === 'ar' ? 'ar-BH' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    const orderItems = displayItems.map((i: any) => {
      const item = i.product || i;
      const title = lang === 'ar' ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr);
      const qty = i.quantity || 1;
      const price = ((item.price || 0) * qty).toFixed(2);
      return `  ${title} × ${qty} = ${price} ${lang === 'ar' ? 'د.ب' : 'BHD'}`;
    }).join('\n');

    const msg = lang === 'ar'
      ? `━━━━━━━━━━━━━━━━
🛒 *طلب جديد - نيوفلكس ستور*
━━━━━━━━━━━━━━━━

📋 *رقم الطلب:* ${orderNumber || orderId}
📅 *التاريخ:* ${formattedDate}
🕐 *الوقت:* ${formattedTime}

👤 *بيانات العميل:*
  الاسم: ${formData.name}
  البريد: ${formData.email}
  الهاتف: ${formData.phone || 'غير محدد'}

🛍️ *المنتجات:*
${orderItems}

💰 *تفاصيل الدفع:*
  المجموع الفرعي: ${subtotal.toFixed(2)} د.ب${couponApplied ? `\n  كوبون خصم (${couponApplied.code}): -${discountAmount.toFixed(2)} د.ب` : ''}
  *الإجمالي: ${orderTotal.toFixed(2)} د.ب*
${formData.notes ? `\n📝 *ملاحظات:* ${formData.notes}` : ''}

━━━━━━━━━━━━━━━━
✨ شكراً لتسوقكم من نيوفلكس ستور!`
      : `━━━━━━━━━━━━━━━━
🛒 *New Order - NEWFLIX STORE*
━━━━━━━━━━━━━━━━

📋 *Order:* ${orderNumber || orderId}
📅 *Date:* ${formattedDate}
🕐 *Time:* ${formattedTime}

👤 *Customer Details:*
  Name: ${formData.name}
  Email: ${formData.email}
  Phone: ${formData.phone || 'Not provided'}

🛍️ *Products:*
${orderItems}

💰 *Payment Details:*
  Subtotal: ${subtotal.toFixed(2)} BHD${couponApplied ? `\n  Coupon (${couponApplied.code}): -${discountAmount.toFixed(2)} BHD` : ''}
  *Total: ${orderTotal.toFixed(2)} BHD*
${formData.notes ? `\n📝 *Notes:* ${formData.notes}` : ''}

━━━━━━━━━━━━━━━━
✨ Thank you for shopping at NEWFLIX STORE!`;
    return `https://wa.me/97337127483?text=${encodeURIComponent(msg)}`;
  };

  if (step === 'done') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-card rounded-3xl border border-border p-8 shadow-xl text-center mb-8">
          {verificationResult?.verified ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}</h2>
              <p className="text-muted-foreground mb-2">{lang === 'ar' ? 'تم التحقق من الإيصال وسيتم تسليم المنتج في طلباتي' : 'Receipt verified, product will be delivered to My Orders'}</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تم استلام طلبك' : 'Order Received'}</h2>
              <p className="text-muted-foreground mb-4">{lang === 'ar' ? 'سيتم مراجعة الإيصال وتأكيد الطلب قريباً' : 'Receipt is under review, order will be confirmed soon'}</p>
              {verificationResult?.reason && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400 mb-4 text-start">
                  {verificationResult.reason}
                </div>
              )}
            </>
          )}

          <div className="mt-6 space-y-3">
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="block">
              <Button className="w-full rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-white h-12">
                <MessageCircle className="w-5 h-5" />
                {lang === 'ar' ? 'إرسال الطلب عبر الواتساب' : 'Send Order via WhatsApp'}
              </Button>
            </a>
            <Button onClick={() => setLocation('/account/orders')} variant="outline" className="w-full rounded-xl h-12">
              {lang === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
            </Button>
            <Button onClick={() => setLocation('/shop')} variant="ghost" className="w-full rounded-xl">
              {lang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">{lang === 'ar' ? 'فاتورة الطلب' : 'Order Invoice'}</h3>
          </div>
          <Invoice
            orderNumber={orderNumber}
            orderTotal={orderTotal}
            items={displayItems}
            formData={formData}
            couponApplied={couponApplied}
            discountAmount={discountAmount}
            subtotal={subtotal}
            lang={lang}
          />
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-xl">
          {orderNumber && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-6 text-center">
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'رقم الطلب' : 'Order Number'}</p>
              <p className="font-mono font-bold text-lg text-primary">{orderNumber}</p>
            </div>
          )}

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
                <span className="font-black text-xl text-primary">{orderTotal.toFixed(2)} {t('bhd')}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-400">
                <p className="font-bold mb-1">{lang === 'ar' ? 'تنبيه مهم:' : 'Important Notice:'}</p>
                <p>{lang === 'ar'
                  ? 'يجب أن يكون الاسم والرقم والمبلغ في الإيصال مطابقاً تماماً. يتم التحقق من الإيصال تلقائياً بالذكاء الاصطناعي.'
                  : 'The name, number, and amount on the receipt must match exactly. Receipts are automatically verified by AI.'}
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

            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" className="block">
              <Button variant="outline" className="w-full rounded-xl gap-2 text-green-600 border-green-200 hover:bg-green-50 h-12">
                <MessageCircle className="w-5 h-5" />
                {lang === 'ar' ? 'إرسال الطلب عبر الواتساب' : 'Send Order via WhatsApp'}
              </Button>
            </a>
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

            <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                </div>
              ) : (lang === 'ar' ? 'متابعة إلى الدفع' : 'Continue to Payment')}
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
                    <img src={item.product.mainImage} alt="" className="w-full h-full object-cover" />
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

          <div className="border-t border-border pt-4 space-y-3">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{lang === 'ar' ? 'كوبون خصم' : 'Discount Coupon'}</span>
              </div>
              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">{couponApplied.code}</span>
                    <span className="text-xs text-green-600">(-{couponApplied.discountAmount.toFixed(2)} {t('bhd')})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-destructive hover:underline">
                    {lang === 'ar' ? 'إزالة' : 'Remove'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value); setCouponError(''); }}
                    placeholder={lang === 'ar' ? 'أدخل كود الكوبون' : 'Enter coupon code'}
                    className="h-10 text-sm"
                  />
                  <Button type="button" variant="outline" className="h-10 px-4 rounded-lg shrink-0" onClick={handleApplyCoupon} disabled={couponLoading}>
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'ar' ? 'تطبيق' : 'Apply')}
                  </Button>
                </div>
              )}
              {couponError && <p className="text-xs text-destructive mt-2">{couponError}</p>}
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{subtotal.toFixed(2)} {t('bhd')}</span>
            </div>
            {couponApplied && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{lang === 'ar' ? 'الخصم' : 'Discount'}</span>
                <span>-{discountAmount.toFixed(2)} {t('bhd')}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black pt-2 border-t border-border">
              <span>{t('total')}</span>
              <span className="text-primary">{finalTotal.toFixed(2)} {t('bhd')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
