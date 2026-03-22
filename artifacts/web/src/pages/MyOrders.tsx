import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Package, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, ShoppingBag, Eye, Copy, MessageCircle, Upload, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

const API = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

export default function MyOrders() {
  const { user } = useAuth();
  const { lang, dir } = useLanguage();
  const [, navigate] = useLocation();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [uploadingOrder, setUploadingOrder] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['user-orders', user?.uid],
    queryFn: async () => {
      const res = await fetch(`${API}/user/orders?firebaseUid=${user!.uid}`);
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

  const handleUploadReceipt = async (orderId: number, file: File) => {
    setUploadingOrder(orderId);
    const formData = new FormData();
    formData.append('receipt', file);
    try {
      const res = await fetch(`${API}/orders/${orderId}/upload-receipt`, {
        method: 'POST',
        headers: user?.uid ? { 'X-Firebase-UID': user.uid } : {},
        body: formData,
      });
      const result = await res.json();
      if (result.verified) {
        toast.success(lang === 'ar' ? 'تم التحقق من الإيصال! ستجد المنتج أدناه.' : 'Receipt verified! Product delivered below.');
      } else {
        toast.info(lang === 'ar' ? 'تم رفع الإيصال وسيتم المراجعة' : 'Receipt uploaded, under review');
      }
      refetch();
    } catch { toast.error(lang === 'ar' ? 'خطأ في الرفع' : 'Upload error'); }
    setUploadingOrder(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(lang === 'ar' ? 'تم النسخ' : 'Copied');
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

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const orderId = fileInputRef.current?.dataset?.orderId;
          if (e.target.files?.[0] && orderId) handleUploadReceipt(parseInt(orderId), e.target.files[0]);
        }} />

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between mb-4"><div className="h-5 bg-muted rounded w-32" /><div className="h-5 bg-muted rounded w-24" /></div>
                <div className="h-4 bg-muted rounded w-48 mb-2" /><div className="h-4 bg-muted rounded w-36" />
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
            <Link href="/shop"><Button className="rounded-xl gap-2">{lang === 'ar' ? 'تصفح المتجر' : 'Browse Shop'}<Arrow className="w-4 h-4" /></Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const status = getStatusConfig(order.status);
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all">
                  <div className="p-5 md:p-6 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-lg">{order.orderNumber || `#${order.id}`}</span>
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
                      <div className="flex items-center gap-2">
                        {order.receiptStatus === 'pending' && (
                          <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                            {lang === 'ar' ? 'قيد المراجعة' : 'Under Review'}
                          </span>
                        )}
                        {order.loyaltyPointsEarned && order.loyaltyPointsEarned > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">
                            +{order.loyaltyPointsEarned} {lang === 'ar' ? 'نقطة' : 'pts'}
                          </span>
                        )}
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border">
                      <div className="p-5 md:p-6 space-y-4">
                        {(order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-3 items-center">
                            {item.mainImage && <img src={item.mainImage} className="w-12 h-12 rounded-lg object-cover border border-border" />}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{lang === 'ar' ? item.titleAr : item.titleEn}</p>
                              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity} × {item.price} {lang === 'ar' ? 'د.ب' : 'BHD'}</p>
                            </div>
                          </div>
                        ))}

                        {order.status === 'pending' && (!order.receiptImage || order.receiptStatus === 'rejected') && (
                          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <p className="text-sm font-medium mb-3">{lang === 'ar' ? 'ارفع إيصال الدفع لإتمام الطلب:' : 'Upload payment receipt to complete order:'}</p>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (fileInputRef.current) {
                                  fileInputRef.current.dataset.orderId = String(order.id);
                                  fileInputRef.current.click();
                                }
                              }}
                              disabled={uploadingOrder === order.id}
                              className="rounded-xl gap-2 w-full"
                            >
                              {uploadingOrder === order.id ? (
                                <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />{lang === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</>
                              ) : (
                                <><Upload className="w-4 h-4" />{lang === 'ar' ? 'رفع إيصال الدفع' : 'Upload Receipt'}</>
                              )}
                            </Button>
                          </div>
                        )}

                        {order.status === 'pending' && order.receiptImage && order.receiptStatus === 'pending' && (
                          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
                            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-sm font-medium">{lang === 'ar' ? 'تم رفع الإيصال - جاري المراجعة' : 'Receipt uploaded - Under review'}</p>
                            <a href="https://wa.me/97337127483" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-green-600 mt-2 hover:underline">
                              <MessageCircle className="w-3 h-3" /> {lang === 'ar' ? 'تواصل عبر الواتساب' : 'Contact via WhatsApp'}
                            </a>
                          </div>
                        )}

                        {(order.status === 'paid' || order.status === 'delivered') && (
                          <OrderDelivery orderId={order.id} lang={lang} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDelivery({ orderId, lang }: { orderId: number; lang: string }) {
  const { data: delivery, isLoading } = useQuery({
    queryKey: ['order-delivery', orderId],
    queryFn: async () => {
      const res = await fetch(`${API}/user/orders/${orderId}/delivery`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(lang === 'ar' ? 'تم النسخ' : 'Copied');
  };

  if (isLoading) return <div className="animate-pulse h-16 bg-muted rounded-xl" />;

  if (!delivery || delivery.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
        <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
        <p className="text-sm font-medium text-green-700 dark:text-green-400">{lang === 'ar' ? 'تم تأكيد الدفع' : 'Payment confirmed'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Key className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm">{lang === 'ar' ? 'منتجاتك الرقمية:' : 'Your Digital Products:'}</h4>
      </div>
      {delivery.map((item: any, idx: number) => (
        <div key={idx} className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? item.titleAr : item.titleEn}</p>
          {item.deliveryData === 'WHATSAPP_DELIVERY' ? (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{lang === 'ar' ? 'سيتم التسليم عبر الواتساب' : 'Will be delivered via WhatsApp'}</span>
              <a href="https://wa.me/97337127483" target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline ms-auto">{lang === 'ar' ? 'تواصل' : 'Contact'}</a>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white dark:bg-black/20 border border-green-300 dark:border-green-700 rounded-lg px-3 py-2 text-sm font-mono select-all break-all">{item.deliveryData}</code>
              <button onClick={() => copyToClipboard(item.deliveryData)} className="shrink-0 p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg">
                <Copy className="w-4 h-4 text-green-600" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
