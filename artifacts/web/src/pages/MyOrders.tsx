import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Package, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, ShoppingBag, Eye, Copy, MessageCircle, Upload, Key, Hourglass, AlertCircle } from 'lucide-react';
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
  const [receiptIssues, setReceiptIssues] = useState<Record<number, any>>({});
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

  const getStatusConfig = (order: any) => {
    if (order.status === 'paid' || order.status === 'delivered') {
      return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: lang === 'ar' ? 'مكتمل' : 'Completed' };
    }
    if (order.status === 'cancelled') {
      return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: lang === 'ar' ? 'ملغي' : 'Cancelled' };
    }
    if (order.status === 'pending' && order.receiptImage && order.receiptStatus !== 'rejected') {
      return { icon: Hourglass, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: lang === 'ar' ? 'بانتظار التأكيد' : 'Awaiting Confirmation' };
    }
    if (order.status === 'pending' && order.receiptStatus === 'rejected') {
      return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: lang === 'ar' ? 'مرفوض - أعد رفع الإيصال' : 'Rejected - Re-upload Receipt' };
    }
    return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: lang === 'ar' ? 'بانتظار الدفع' : 'Awaiting Payment' };
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
      if (!res.ok) {
        toast.error(result.error || (lang === 'ar' ? 'خطأ في رفع الإيصال' : 'Error uploading receipt'));
      } else if (result.details?.duplicateOfOrder) {
        toast.error(lang === 'ar' ? 'تم رفض الإيصال - هذا الإيصال مستخدم سابقاً في طلب آخر' : 'Receipt rejected - this receipt was already used for another order');
      } else {
        const d = result.details || {};
        const hasAiIssues = d.nameMatch === false || d.amountMatch === false || d.dateMatch === false || d.numberMatch === false || d.isFraudulent === true;
        if (hasAiIssues) {
          setReceiptIssues(prev => ({ ...prev, [orderId]: d }));
          setExpandedOrder(orderId);
          toast.warning(lang === 'ar' ? 'تم رفع الإيصال - توجد ملاحظات تحتاج مراجعة' : 'Receipt uploaded - There are issues that need review');
        } else {
          toast.info(lang === 'ar' ? 'تم رفع الإيصال بنجاح - بانتظار تأكيد الإدارة' : 'Receipt uploaded - Awaiting admin confirmation');
        }
      }
      refetch();
    } catch { toast.error(lang === 'ar' ? 'خطأ في الرفع' : 'Upload error'); }
    setUploadingOrder(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(lang === 'ar' ? 'تم النسخ' : 'Copied');
  };

  const buildWhatsAppIssueUrl = (order: any) => {
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString(lang === 'ar' ? 'ar-BH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = orderDate.toLocaleTimeString(lang === 'ar' ? 'ar-BH' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    const itemsText = (order.items || []).map((item: any, idx: number) => {
      const title = lang === 'ar' ? item.titleAr : item.titleEn;
      return `${idx + 1}. ${title} | ${lang === 'ar' ? 'الكمية' : 'Qty'}: ${item.quantity} | ${lang === 'ar' ? 'السعر' : 'Price'}: ${item.price} ${lang === 'ar' ? 'د.ب' : 'BHD'}`;
    }).join('\n');

    const statusText = getStatusConfig(order).label;

    const message = lang === 'ar'
      ? `🛒 *بلاغ مشكلة في طلب - نيوفلكس ستور*\n\n` +
        `📋 *تفاصيل الطلب:*\n` +
        `رقم الطلب: ${order.orderNumber || `#${order.id}`}\n` +
        `التاريخ: ${dateStr}\n` +
        `الوقت: ${timeStr}\n` +
        `الحالة: ${statusText}\n\n` +
        `🛍️ *المنتجات:*\n${itemsText}\n\n` +
        `💰 *المجموع:* ${order.total} د.ب\n` +
        (order.discount ? `🏷️ *الخصم:* ${order.discount} د.ب\n` : '') +
        `\n👤 *معلومات العميل:*\n` +
        `الاسم: ${user?.displayName || 'غير محدد'}\n` +
        `البريد: ${user?.email || 'غير محدد'}\n\n` +
        `⚠️ *المشكلة:*\n[اكتب المشكلة هنا]`
      : `🛒 *Order Issue Report - NEWFLIX STORE*\n\n` +
        `📋 *Order Details:*\n` +
        `Order: ${order.orderNumber || `#${order.id}`}\n` +
        `Date: ${dateStr}\n` +
        `Time: ${timeStr}\n` +
        `Status: ${statusText}\n\n` +
        `🛍️ *Products:*\n${itemsText}\n\n` +
        `💰 *Total:* ${order.total} BHD\n` +
        (order.discount ? `🏷️ *Discount:* ${order.discount} BHD\n` : '') +
        `\n👤 *Customer Info:*\n` +
        `Name: ${user?.displayName || 'N/A'}\n` +
        `Email: ${user?.email || 'N/A'}\n\n` +
        `⚠️ *Issue:*\n[Describe your issue here]`;

    return `https://wa.me/97337127483?text=${encodeURIComponent(message)}`;
  };

  const buildWhatsAppAiIssueUrl = (order: any, aiDetails: any) => {
    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString(lang === 'ar' ? 'ar-BH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = orderDate.toLocaleTimeString(lang === 'ar' ? 'ar-BH' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    const itemsText = (order.items || []).map((item: any, idx: number) => {
      const title = lang === 'ar' ? item.titleAr : item.titleEn;
      return `${idx + 1}. ${title} | ${lang === 'ar' ? 'الكمية' : 'Qty'}: ${item.quantity} | ${lang === 'ar' ? 'السعر' : 'Price'}: ${item.price} ${lang === 'ar' ? 'د.ب' : 'BHD'}`;
    }).join('\n');

    const issues: string[] = [];
    if (aiDetails.nameMatch === false) issues.push(lang === 'ar' ? `❌ اسم المستلم غير متطابق (الموجود: ${aiDetails.nameFound || 'غير معروف'})` : `❌ Recipient name mismatch (Found: ${aiDetails.nameFound || 'unknown'})`);
    if (aiDetails.numberMatch === false) issues.push(lang === 'ar' ? '❌ رقم الحساب غير متطابق' : '❌ Account number mismatch');
    if (aiDetails.amountMatch === false) issues.push(lang === 'ar' ? `❌ المبلغ غير متطابق (الموجود: ${aiDetails.amountFound || 'غير معروف'})` : `❌ Amount mismatch (Found: ${aiDetails.amountFound || 'unknown'})`);
    if (aiDetails.dateMatch === false) issues.push(lang === 'ar' ? `❌ التاريخ غير متطابق (الموجود: ${aiDetails.dateFound || 'غير معروف'})` : `❌ Date mismatch (Found: ${aiDetails.dateFound || 'unknown'})`);
    if (aiDetails.isFraudulent) issues.push(lang === 'ar' ? '❌ يشتبه في تلاعب بالإيصال' : '❌ Suspected receipt tampering');
    if (aiDetails.reason) issues.push(lang === 'ar' ? `📝 السبب: ${aiDetails.reason}` : `📝 Reason: ${aiDetails.reason}`);

    const message = lang === 'ar'
      ? `🛒 *مشكلة في إيصال الدفع - نيوفلكس ستور*\n\n` +
        `📋 *تفاصيل الطلب:*\n` +
        `رقم الطلب: ${order.orderNumber || `#${order.id}`}\n` +
        `التاريخ: ${dateStr}\n` +
        `الوقت: ${timeStr}\n\n` +
        `🛍️ *المنتجات:*\n${itemsText}\n\n` +
        `💰 *المجموع:* ${order.total} د.ب\n\n` +
        `👤 *معلومات العميل:*\n` +
        `الاسم: ${user?.displayName || 'غير محدد'}\n` +
        `البريد: ${user?.email || 'غير محدد'}\n\n` +
        `⚠️ *المشاكل المكتشفة في الإيصال:*\n${issues.join('\n')}\n\n` +
        `💬 *ملاحظة العميل:*\n[اكتب ملاحظتك هنا]`
      : `🛒 *Receipt Issue - NEWFLIX STORE*\n\n` +
        `📋 *Order Details:*\n` +
        `Order: ${order.orderNumber || `#${order.id}`}\n` +
        `Date: ${dateStr}\n` +
        `Time: ${timeStr}\n\n` +
        `🛍️ *Products:*\n${itemsText}\n\n` +
        `💰 *Total:* ${order.total} BHD\n\n` +
        `👤 *Customer Info:*\n` +
        `Name: ${user?.displayName || 'N/A'}\n` +
        `Email: ${user?.email || 'N/A'}\n\n` +
        `⚠️ *Issues Detected in Receipt:*\n${issues.join('\n')}\n\n` +
        `💬 *Customer Note:*\n[Write your note here]`;

    return `https://wa.me/97337127483?text=${encodeURIComponent(message)}`;
  };

  const pendingPayment = (orders || []).filter((o: any) => o.status === 'pending' && (!o.receiptImage || o.receiptStatus === 'rejected'));
  const awaitingConfirmation = (orders || []).filter((o: any) => o.status === 'pending' && o.receiptImage && o.receiptStatus !== 'rejected');
  const completed = (orders || []).filter((o: any) => o.status === 'paid' || o.status === 'delivered');
  const cancelled = (orders || []).filter((o: any) => o.status === 'cancelled');

  const renderOrderCard = (order: any) => {
    const status = getStatusConfig(order);
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
                  {order.receiptStatus === 'rejected' && (
                    <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm font-medium">{lang === 'ar' ? 'تم رفض الإيصال السابق. يرجى رفع إيصال صحيح.' : 'Previous receipt was rejected. Please upload a valid receipt.'}</p>
                    </div>
                  )}
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

              {order.status === 'pending' && order.receiptImage && order.receiptStatus !== 'rejected' && (() => {
                const aiData = receiptIssues[order.id] || order.aiVerificationResult;
                const hasAiIssues = aiData && (aiData.nameMatch === false || aiData.amountMatch === false || aiData.dateMatch === false || aiData.numberMatch === false || aiData.isFraudulent === true);

                return (
                  <div className="space-y-3">
                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center">
                      <Hourglass className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                      <p className="text-base font-bold text-orange-700 dark:text-orange-400 mb-1">
                        {lang === 'ar' ? 'بانتظار التأكيد من الإدارة' : 'Awaiting Admin Confirmation'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {lang === 'ar' ? 'تم رفع إيصال الدفع بنجاح وسيتم مراجعته قريباً. بعد التأكيد ستصلك أكواد المنتجات هنا.' : 'Your payment receipt has been uploaded and will be reviewed shortly. After confirmation, your product codes will appear here.'}
                      </p>
                      <a href="https://wa.me/97337127483" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:underline font-medium">
                        <MessageCircle className="w-4 h-4" /> {lang === 'ar' ? 'تواصل عبر الواتساب للاستعجال' : 'Contact WhatsApp to expedite'}
                      </a>
                    </div>

                    {hasAiIssues && (
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <p className="text-sm font-bold text-red-700 dark:text-red-400">
                            {lang === 'ar' ? 'ملاحظات على الإيصال:' : 'Receipt Issues Detected:'}
                          </p>
                        </div>
                        <div className="space-y-1.5 mb-4">
                          {aiData.nameMatch === false && (
                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              {lang === 'ar' ? `اسم المستلم غير متطابق${aiData.nameFound ? ` (الموجود: ${aiData.nameFound})` : ''}` : `Recipient name mismatch${aiData.nameFound ? ` (Found: ${aiData.nameFound})` : ''}`}
                            </p>
                          )}
                          {aiData.numberMatch === false && (
                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              {lang === 'ar' ? 'رقم الحساب غير متطابق' : 'Account number mismatch'}
                            </p>
                          )}
                          {aiData.amountMatch === false && (
                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              {lang === 'ar' ? `المبلغ غير متطابق${aiData.amountFound ? ` (الموجود: ${aiData.amountFound})` : ''}` : `Amount mismatch${aiData.amountFound ? ` (Found: ${aiData.amountFound})` : ''}`}
                            </p>
                          )}
                          {aiData.dateMatch === false && (
                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              {lang === 'ar' ? `التاريخ غير متطابق${aiData.dateFound ? ` (الموجود: ${aiData.dateFound})` : ''}` : `Date mismatch${aiData.dateFound ? ` (Found: ${aiData.dateFound})` : ''}`}
                            </p>
                          )}
                          {aiData.isFraudulent && (
                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              {lang === 'ar' ? 'يشتبه في تلاعب بالإيصال' : 'Suspected receipt tampering'}
                            </p>
                          )}
                          {aiData.reason && (
                            <p className="text-xs text-muted-foreground mt-2 border-t border-red-200 dark:border-red-800 pt-2">
                              {aiData.reason}
                            </p>
                          )}
                        </div>
                        <a
                          href={buildWhatsAppAiIssueUrl(order, aiData)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {lang === 'ar' ? 'أبلغ المتجر عن المشكلة عبر الواتساب' : 'Report issue to store via WhatsApp'}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })()}

              {(order.status === 'paid' || order.status === 'delivered') && (
                <OrderDelivery orderId={order.id} firebaseUid={user?.uid} lang={lang} />
              )}

              <a
                href={buildWhatsAppIssueUrl(order)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 w-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                {lang === 'ar' ? 'واجهت مشكلة؟ أبلغ المتجر عبر الواتساب' : 'Having an issue? Report via WhatsApp'}
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    );
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
          <div className="space-y-8">
            {awaitingConfirmation.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Hourglass className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-orange-700 dark:text-orange-400">{lang === 'ar' ? 'بانتظار التأكيد' : 'Awaiting Confirmation'}</h2>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded-full">{awaitingConfirmation.length}</span>
                </div>
                <div className="space-y-4">{awaitingConfirmation.map(renderOrderCard)}</div>
              </div>
            )}

            {pendingPayment.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-amber-700 dark:text-amber-400">{lang === 'ar' ? 'بانتظار الدفع' : 'Awaiting Payment'}</h2>
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded-full">{pendingPayment.length}</span>
                </div>
                <div className="space-y-4">{pendingPayment.map(renderOrderCard)}</div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-bold text-green-700 dark:text-green-400">{lang === 'ar' ? 'مكتملة' : 'Completed'}</h2>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-0.5 rounded-full">{completed.length}</span>
                </div>
                <div className="space-y-4">{completed.map(renderOrderCard)}</div>
              </div>
            )}

            {cancelled.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-red-700 dark:text-red-400">{lang === 'ar' ? 'ملغية' : 'Cancelled'}</h2>
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full">{cancelled.length}</span>
                </div>
                <div className="space-y-4">{cancelled.map(renderOrderCard)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDelivery({ orderId, firebaseUid, lang }: { orderId: number; firebaseUid?: string; lang: string }) {
  const { data: deliveryResponse, isLoading } = useQuery({
    queryKey: ['order-delivery', orderId],
    queryFn: async () => {
      const url = firebaseUid ? `${API}/user/orders/${orderId}/delivery?firebaseUid=${firebaseUid}` : `${API}/user/orders/${orderId}/delivery`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (Array.isArray(data)) return { items: data, hasPendingCodes: false };
      return data;
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(lang === 'ar' ? 'تم النسخ' : 'Copied');
  };

  if (isLoading) return <div className="animate-pulse h-16 bg-muted rounded-xl" />;

  const delivery = deliveryResponse?.items || [];
  const hasPendingCodes = deliveryResponse?.hasPendingCodes || false;

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
        <div key={idx} className={`rounded-xl p-4 ${item.deliveryData === 'PENDING_STOCK' ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800' : 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'}`}>
          <p className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? item.titleAr : item.titleEn}</p>
          {item.deliveryData === 'PENDING_STOCK' ? (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Hourglass className="w-4 h-4" />
              <span className="text-sm font-medium">{lang === 'ar' ? 'بانتظار إتمام طلبك - سيتم توفير الكود قريباً' : 'Awaiting order completion - code will be available soon'}</span>
            </div>
          ) : item.deliveryData === 'WHATSAPP_DELIVERY' ? (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{lang === 'ar' ? 'سيتم التسليم عبر الواتساب' : 'Will be delivered via WhatsApp'}</span>
              <a href="https://wa.me/97337127483" target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline ms-auto">{lang === 'ar' ? 'تواصل' : 'Contact'}</a>
            </div>
          ) : item.hidden ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{lang === 'ar' ? 'تم إلغاء هذا الكود بواسطة الإدارة' : 'This code has been revoked by admin'}</span>
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
      {hasPendingCodes && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
          <Hourglass className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">
            {lang === 'ar' ? 'بانتظار إتمام طلبك' : 'Awaiting Order Completion'}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === 'ar' ? 'بعض الأكواد غير متوفرة حالياً وسيتم توفيرها قريباً. تواصل معنا للمساعدة.' : 'Some codes are currently unavailable and will be provided soon. Contact us for assistance.'}
          </p>
          <a href="https://wa.me/97337127483" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:underline font-medium mt-2">
            <MessageCircle className="w-4 h-4" /> {lang === 'ar' ? 'تواصل عبر الواتساب' : 'Contact via WhatsApp'}
          </a>
        </div>
      )}
    </div>
  );
}
