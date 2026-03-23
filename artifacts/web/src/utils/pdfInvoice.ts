import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const API = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

interface InvoiceData {
  order: any;
  lang: string;
  storeName: string;
  storeNameAr: string;
  logoDataUrl?: string;
  user?: { displayName?: string | null; email?: string | null };
  deliveryCodes?: any[];
}

function esc(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function fetchDeliveryCodes(orderId: number, firebaseUid?: string): Promise<any[]> {
  try {
    const uid = firebaseUid ? encodeURIComponent(firebaseUid) : '';
    const url = uid
      ? `${API}/user/orders/${orderId}/delivery?firebaseUid=${uid}`
      : `${API}/user/orders/${orderId}/delivery`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items || [];
    return items.filter((item: any) => item.deliveryData && item.deliveryData !== 'PENDING_STOCK' && item.deliveryData !== 'WHATSAPP_DELIVERY' && !item.hidden);
  } catch {
    return [];
  }
}

async function imageToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function buildInvoiceHTML(data: InvoiceData): string {
  const { order, lang, storeName, storeNameAr, logoDataUrl, user, deliveryCodes } = data;
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontFamily = "'Segoe UI', Tahoma, Arial, sans-serif";

  const orderDate = new Date(order.createdAt);
  const dateStr = orderDate.toLocaleDateString(isAr ? 'ar-BH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = orderDate.toLocaleTimeString(isAr ? 'ar-BH' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const orderNum = esc(order.orderNumber || `#${order.id}`);
  const custName = esc(order.customerName || user?.displayName || (isAr ? 'غير محدد' : 'N/A'));
  const custEmail = esc(order.customerEmail || user?.email || (isAr ? 'غير محدد' : 'N/A'));
  const custPhone = esc(order.customerPhone || '');

  const items: any[] = order.items || [];
  const subtotal = items.reduce((sum: number, item: any) => sum + item.quantity * Number(item.price), 0);
  const discount = order.discount ? Number(order.discount) : 0;
  const total = Number(order.total);

  const displayName = isAr ? esc(storeNameAr) : esc(storeName);
  const subName = isAr ? esc(storeName) : esc(storeNameAr);

  const statusLabel = (order.status === 'paid' || order.status === 'delivered')
    ? (isAr ? 'مكتمل ✅' : '✅ Completed')
    : (isAr ? 'قيد المعالجة ⏳' : '⏳ Processing');

  const codesHtml = deliveryCodes && deliveryCodes.length > 0 ? `
    <div style="margin-top:18px;border:2px solid #1FB5AC;border-radius:12px;overflow:hidden;">
      <div style="background:#1FB5AC;padding:10px 16px;color:#fff;font-weight:700;font-size:13px;text-align:center;">
        ${isAr ? '🔑 أكواد المنتجات الرقمية' : '🔑 Digital Product Codes'}
      </div>
      <div style="padding:12px 16px;background:#F0FDFA;">
        ${deliveryCodes.map((item: any, idx: number) => `
          <div style="margin-bottom:${idx < deliveryCodes.length - 1 ? '10' : '0'}px;padding:10px 14px;background:#fff;border:1px solid #D1FAE5;border-radius:8px;">
            <div style="font-size:10px;color:#6B7280;margin-bottom:4px;">${esc(isAr ? (item.titleAr || item.titleEn || 'منتج') : (item.titleEn || item.titleAr || 'Product'))}</div>
            <div style="font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#065F46;letter-spacing:1px;word-break:break-all;">${esc(item.deliveryData)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" style="width:48px;height:48px;border-radius:10px;object-fit:contain;background:#fff;padding:4px;" />`
    : `<div style="width:48px;height:48px;border-radius:10px;background:#1FB5AC;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:900;">N</div>`;

  return `
    <div id="invoice-container" dir="${dir}" style="width:595px;padding:0;margin:0;font-family:${fontFamily};background:#ffffff;color:#1E1E1E;line-height:1.5;">
      
      <div style="background:linear-gradient(135deg,#173E52 0%,#1a4a60 50%,#173E52 100%);padding:28px 32px 22px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-30px;${isAr ? 'left' : 'right'}:-30px;width:120px;height:120px;background:rgba(31,181,172,0.15);border-radius:50%;"></div>
        <div style="position:absolute;bottom:-20px;${isAr ? 'right' : 'left'}:-20px;width:80px;height:80px;background:rgba(255,255,255,0.05);border-radius:50%;"></div>
        
        <div style="display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;">
          <div style="display:flex;align-items:center;gap:14px;">
            ${logoHtml}
            <div>
              <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:0.5px;">${displayName}</div>
              <div style="color:rgba(255,255,255,0.6);font-size:10px;margin-top:2px;">${subName}</div>
            </div>
          </div>
          <div style="text-align:${isAr ? 'left' : 'right'};">
            <div style="color:#1FB5AC;font-size:22px;font-weight:800;letter-spacing:2px;">${isAr ? 'فاتورة' : 'INVOICE'}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:9px;margin-top:2px;">${isAr ? 'INVOICE' : 'فاتورة'}</div>
          </div>
        </div>
      </div>
      
      <div style="height:4px;background:linear-gradient(90deg,#1FB5AC,#4BB874,#1FB5AC);"></div>

      <div style="padding:20px 32px 0;">
        
        <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:20px;">
          <div style="flex:1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 16px;text-align:center;">
            <div style="font-size:9px;color:#94A3B8;text-transform:uppercase;font-weight:600;margin-bottom:4px;">${isAr ? 'رقم الفاتورة' : 'Invoice No.'}</div>
            <div style="font-size:15px;font-weight:800;color:#173E52;">${orderNum}</div>
          </div>
          <div style="flex:1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 16px;text-align:center;">
            <div style="font-size:9px;color:#94A3B8;text-transform:uppercase;font-weight:600;margin-bottom:4px;">${isAr ? 'التاريخ' : 'Date'}</div>
            <div style="font-size:12px;font-weight:700;color:#334155;">${dateStr}</div>
          </div>
          <div style="flex:1;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 16px;text-align:center;">
            <div style="font-size:9px;color:#94A3B8;text-transform:uppercase;font-weight:600;margin-bottom:4px;">${isAr ? 'الحالة' : 'Status'}</div>
            <div style="font-size:12px;font-weight:700;color:#059669;">${statusLabel}</div>
          </div>
        </div>

        <div style="display:flex;gap:16px;margin-bottom:20px;">
          <div style="flex:1;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;">
            <div style="background:#173E52;color:#fff;padding:8px 14px;font-size:11px;font-weight:700;">📋 ${isAr ? 'بيانات المتجر' : 'Store Info'}</div>
            <div style="padding:12px 14px;font-size:11px;color:#475569;line-height:1.8;">
              <div style="font-weight:700;color:#173E52;margin-bottom:2px;">${esc(storeNameAr)} | ${esc(storeName)}</div>
              <div>${isAr ? 'مملكة البحرين' : 'Kingdom of Bahrain'}</div>
              <div style="direction:ltr;text-align:${isAr ? 'right' : 'left'};">📱 +973 37127483</div>
              <div>📷 @NEWFLIX.ADS</div>
            </div>
          </div>
          <div style="flex:1;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;">
            <div style="background:#1FB5AC;color:#fff;padding:8px 14px;font-size:11px;font-weight:700;">👤 ${isAr ? 'بيانات العميل' : 'Customer Info'}</div>
            <div style="padding:12px 14px;font-size:11px;color:#475569;line-height:1.8;">
              <div><span style="color:#94A3B8;">${isAr ? 'الاسم:' : 'Name:'}</span> <strong style="color:#1E293B;">${custName}</strong></div>
              <div><span style="color:#94A3B8;">${isAr ? 'البريد:' : 'Email:'}</span> <span style="color:#1E293B;">${custEmail}</span></div>
              ${custPhone ? `<div><span style="color:#94A3B8;">${isAr ? 'الهاتف:' : 'Phone:'}</span> <span style="color:#1E293B;direction:ltr;unicode-bidi:embed;">${custPhone}</span></div>` : ''}
              <div><span style="color:#94A3B8;">${isAr ? 'الوقت:' : 'Time:'}</span> <span style="color:#1E293B;">${timeStr}</span></div>
            </div>
          </div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;margin-bottom:16px;">
          <table style="width:100%;border-collapse:collapse;font-size:11px;">
            <thead>
              <tr style="background:#173E52;">
                <th style="padding:10px 14px;color:#fff;font-weight:700;text-align:${isAr ? 'right' : 'left'};width:45%;">${isAr ? 'المنتج' : 'Product'}</th>
                <th style="padding:10px 14px;color:#fff;font-weight:700;text-align:center;width:15%;">${isAr ? 'الكمية' : 'Qty'}</th>
                <th style="padding:10px 14px;color:#fff;font-weight:700;text-align:center;width:20%;">${isAr ? 'السعر' : 'Price'}</th>
                <th style="padding:10px 14px;color:#fff;font-weight:700;text-align:${isAr ? 'left' : 'right'};width:20%;">${isAr ? 'المجموع' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any, idx: number) => {
                const title = esc(isAr ? (item.titleAr || item.titleEn || 'منتج') : (item.titleEn || item.titleAr || 'Product'));
                const rowBg = idx % 2 === 0 ? '#ffffff' : '#F8FAFC';
                const itemTotal = (item.quantity * Number(item.price)).toFixed(3);
                return `
                  <tr style="background:${rowBg};border-bottom:1px solid #F1F5F9;">
                    <td style="padding:10px 14px;font-weight:600;color:#1E293B;">${title}</td>
                    <td style="padding:10px 14px;text-align:center;color:#64748B;">${item.quantity}</td>
                    <td style="padding:10px 14px;text-align:center;color:#64748B;">${Number(item.price).toFixed(3)} ${isAr ? 'د.ب' : 'BHD'}</td>
                    <td style="padding:10px 14px;text-align:${isAr ? 'left' : 'right'};font-weight:700;color:#173E52;">${itemTotal} ${isAr ? 'د.ب' : 'BHD'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex;justify-content:${isAr ? 'flex-start' : 'flex-end'};margin-bottom:14px;">
          <div style="width:240px;">
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:11px;color:#64748B;border-bottom:1px dashed #E2E8F0;">
              <span>${isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span style="font-weight:600;color:#334155;">${subtotal.toFixed(3)} ${isAr ? 'د.ب' : 'BHD'}</span>
            </div>
            ${discount > 0 ? `
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:11px;color:#DC2626;border-bottom:1px dashed #E2E8F0;">
                <span>${isAr ? 'الخصم' : 'Discount'}</span>
                <span style="font-weight:600;">-${discount.toFixed(3)} ${isAr ? 'د.ب' : 'BHD'}</span>
              </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;padding:10px 14px;margin-top:6px;background:#173E52;border-radius:8px;color:#fff;font-size:14px;font-weight:800;">
              <span>${isAr ? 'الإجمالي' : 'Total'}</span>
              <span>${total.toFixed(3)} ${isAr ? 'د.ب' : 'BHD'}</span>
            </div>
          </div>
        </div>

        ${codesHtml}

        <div style="margin-top:20px;text-align:center;padding:16px;background:linear-gradient(135deg,#F0FDFA,#EFF6FF);border-radius:10px;border:1px dashed #CBD5E1;">
          <div style="font-size:13px;font-weight:700;color:#173E52;margin-bottom:4px;">
            ${isAr ? '🎉 شكراً لتسوقك من نيوفلكس ستور!' : '🎉 Thank you for shopping at NEWFLIX STORE!'}
          </div>
          <div style="font-size:10px;color:#475569;">
            ${isAr ? 'نتمنى لك تجربة ممتعة! تابعنا للحصول على أحدث العروض والمنتجات الرقمية' : 'We hope you enjoy your purchase! Follow us for the latest deals and digital products'}
          </div>
        </div>

        <div id="invoice-footer-links" style="display:flex;justify-content:center;gap:24px;margin-top:14px;padding:12px 0;border-top:1px solid #E2E8F0;">
          <div id="invoice-whatsapp-link" style="display:flex;align-items:center;gap:6px;font-size:11px;color:#173E52;font-weight:600;cursor:pointer;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#25D366;color:#fff;border-radius:50%;font-size:12px;font-weight:900;">W</span>
            <span style="direction:ltr;">+973 37127483</span>
          </div>
          <div id="invoice-instagram-link" style="display:flex;align-items:center;gap:6px;font-size:11px;color:#173E52;font-weight:600;cursor:pointer;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;border-radius:50%;font-size:12px;font-weight:900;">I</span>
            <span>@NEWFLIX.ADS</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#475569;">
            📍 ${isAr ? 'مملكة البحرين' : 'Kingdom of Bahrain'}
          </div>
        </div>

      </div>
      
      <div style="height:4px;background:linear-gradient(90deg,#1FB5AC,#173E52,#1FB5AC);margin-top:8px;"></div>
      <div style="text-align:center;padding:8px;font-size:9px;color:#94A3B8;">
        ${isAr ? 'فاتورة إلكترونية صادرة تلقائياً من نيوفلكس ستور' : 'Automatically generated electronic invoice from NEWFLIX STORE'}
      </div>
    </div>
  `;
}

export async function generateProfessionalInvoice(
  order: any,
  lang: string,
  storeName: string,
  storeNameAr: string,
  user?: { displayName?: string | null; email?: string | null },
  logoUrl?: string,
  firebaseUid?: string
) {
  const deliveryCodes = (order.status === 'paid' || order.status === 'delivered')
    ? await fetchDeliveryCodes(order.id, firebaseUid)
    : [];

  let logoDataUrl: string | undefined;
  if (logoUrl) {
    const dataUrl = await imageToDataUrl(logoUrl);
    if (dataUrl) logoDataUrl = dataUrl;
  }

  const html = buildInvoiceHTML({
    order, lang, storeName, storeNameAr, logoDataUrl, user, deliveryCodes
  });

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.innerHTML = html;
  document.body.appendChild(container);

  const invoiceEl = container.querySelector('#invoice-container') as HTMLElement;

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const images = invoiceEl.querySelectorAll('img');
  if (images.length > 0) {
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
  }

  await new Promise((r) => setTimeout(r, 50));

  const whatsappEl = invoiceEl.querySelector('#invoice-whatsapp-link') as HTMLElement;
  const instagramEl = invoiceEl.querySelector('#invoice-instagram-link') as HTMLElement;
  const containerRect = invoiceEl.getBoundingClientRect();

  try {
    const canvas = await html2canvas(invoiceEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pdfHeight > 297 ? [pdfWidth, pdfHeight + 10] : 'a4',
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const scaleX = pdfWidth / containerRect.width;
    const scaleY = pdfHeight / containerRect.height;

    if (whatsappEl) {
      const r = whatsappEl.getBoundingClientRect();
      const x = (r.left - containerRect.left) * scaleX;
      const y = (r.top - containerRect.top) * scaleY;
      const w = r.width * scaleX;
      const h = r.height * scaleY;
      pdf.link(x, y, w, h, { url: 'https://wa.me/97337127483' });
    }

    if (instagramEl) {
      const r = instagramEl.getBoundingClientRect();
      const x = (r.left - containerRect.left) * scaleX;
      const y = (r.top - containerRect.top) * scaleY;
      const w = r.width * scaleX;
      const h = r.height * scaleY;
      pdf.link(x, y, w, h, { url: 'https://instagram.com/NEWFLIX.ADS' });
    }

    const orderNum = order.orderNumber || `${order.id}`;
    pdf.save(`invoice-${String(orderNum).replace('#', '')}.pdf`);
    return true;
  } finally {
    document.body.removeChild(container);
  }
}
