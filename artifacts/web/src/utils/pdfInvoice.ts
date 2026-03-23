import { jsPDF } from 'jspdf';

const ARABIC_FORMS: Record<string, [string, string, string, string]> = {
  '\u0621': ['\uFE80', '\uFE80', '\uFE80', '\uFE80'],
  '\u0622': ['\uFE81', '\uFE82', '\uFE82', '\uFE81'],
  '\u0623': ['\uFE83', '\uFE84', '\uFE84', '\uFE83'],
  '\u0624': ['\uFE85', '\uFE86', '\uFE86', '\uFE85'],
  '\u0625': ['\uFE87', '\uFE88', '\uFE88', '\uFE87'],
  '\u0626': ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'],
  '\u0627': ['\uFE8D', '\uFE8E', '\uFE8E', '\uFE8D'],
  '\u0628': ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'],
  '\u0629': ['\uFE93', '\uFE94', '\uFE94', '\uFE93'],
  '\u062A': ['\uFE95', '\uFE96', '\uFE97', '\uFE98'],
  '\u062B': ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'],
  '\u062C': ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'],
  '\u062D': ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'],
  '\u062E': ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'],
  '\u062F': ['\uFEA9', '\uFEAA', '\uFEAA', '\uFEA9'],
  '\u0630': ['\uFEAB', '\uFEAC', '\uFEAC', '\uFEAB'],
  '\u0631': ['\uFEAD', '\uFEAE', '\uFEAE', '\uFEAD'],
  '\u0632': ['\uFEAF', '\uFEB0', '\uFEB0', '\uFEAF'],
  '\u0633': ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'],
  '\u0634': ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'],
  '\u0635': ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'],
  '\u0636': ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'],
  '\u0637': ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'],
  '\u0638': ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'],
  '\u0639': ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'],
  '\u063A': ['\uFECD', '\uFECE', '\uFECF', '\uFED0'],
  '\u0641': ['\uFED1', '\uFED2', '\uFED3', '\uFED4'],
  '\u0642': ['\uFED5', '\uFED6', '\uFED7', '\uFED8'],
  '\u0643': ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'],
  '\u0644': ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'],
  '\u0645': ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'],
  '\u0646': ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'],
  '\u0647': ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'],
  '\u0648': ['\uFEED', '\uFEEE', '\uFEEE', '\uFEED'],
  '\u0649': ['\uFEEF', '\uFEF0', '\uFEF0', '\uFEEF'],
  '\u064A': ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'],
  '\u0671': ['\uFB50', '\uFB51', '\uFB51', '\uFB50'],
};

const NON_JOINING = new Set([
  '\u0621', '\u0622', '\u0623', '\u0624', '\u0625', '\u0627',
  '\u062F', '\u0630', '\u0631', '\u0632', '\u0648', '\u0649',
  '\u0671',
]);

const TASHKEEL = new Set([
  '\u064B', '\u064C', '\u064D', '\u064E', '\u064F',
  '\u0650', '\u0651', '\u0652', '\u0670',
]);

const LAM = '\u0644';
const ALEF_VARIANTS: Record<string, string> = {
  '\u0622': '\uFEF5',
  '\u0623': '\uFEF7',
  '\u0625': '\uFEF9',
  '\u0627': '\uFEFB',
};
const LAM_ALEF_FINAL: Record<string, string> = {
  '\u0622': '\uFEF6',
  '\u0623': '\uFEF8',
  '\u0625': '\uFEFA',
  '\u0627': '\uFEFC',
};

function isArabic(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (code >= 0x0621 && code <= 0x064A) || code === 0x0671;
}

function canJoinNext(ch: string): boolean {
  return isArabic(ch) && !NON_JOINING.has(ch);
}

function reshapeArabicWord(word: string): string {
  const chars: string[] = [];
  for (const ch of word) {
    if (!TASHKEEL.has(ch)) chars.push(ch);
  }

  if (chars.length === 0) return '';

  const result: string[] = [];
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];

    if (ch === LAM && i + 1 < chars.length && ALEF_VARIANTS[chars[i + 1]]) {
      const alef = chars[i + 1];
      const prevJoins = i > 0 && canJoinNext(chars[i - 1]);
      if (prevJoins) {
        result.push(LAM_ALEF_FINAL[alef]);
      } else {
        result.push(ALEF_VARIANTS[alef]);
      }
      i += 2;
      continue;
    }

    if (!isArabic(ch) || !ARABIC_FORMS[ch]) {
      result.push(ch);
      i++;
      continue;
    }

    const forms = ARABIC_FORMS[ch];
    const prevJoins = i > 0 && canJoinNext(chars[i - 1]);
    const nextJoins = i + 1 < chars.length && isArabic(chars[i + 1]);

    if (prevJoins && nextJoins && canJoinNext(ch)) {
      result.push(forms[3]);
    } else if (prevJoins) {
      result.push(forms[1]);
    } else if (nextJoins && canJoinNext(ch)) {
      result.push(forms[2]);
    } else {
      result.push(forms[0]);
    }

    i++;
  }

  return result.join('');
}

function processArabicText(text: string): string {
  const segments: { text: string; isArabic: boolean }[] = [];
  let current = '';
  let currentIsArabic = false;

  for (const ch of text) {
    const chIsArabic = isArabic(ch) || TASHKEEL.has(ch);
    const isSpace = ch === ' ';

    if (isSpace) {
      if (current) segments.push({ text: current, isArabic: currentIsArabic });
      segments.push({ text: ' ', isArabic: currentIsArabic });
      current = '';
      continue;
    }

    if (current && chIsArabic !== currentIsArabic) {
      segments.push({ text: current, isArabic: currentIsArabic });
      current = '';
    }

    current += ch;
    currentIsArabic = chIsArabic;
  }
  if (current) segments.push({ text: current, isArabic: currentIsArabic });

  const processed = segments.map(seg => {
    if (seg.isArabic && seg.text.trim()) {
      return { ...seg, text: reshapeArabicWord(seg.text) };
    }
    return seg;
  });

  return processed.reverse().map(s => s.text).join('');
}

export function arText(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map(line => processArabicText(line)).join('\n');
}

let fontsLoaded = false;

async function loadFonts(doc: jsPDF, baseUrl: string) {
  if (fontsLoaded) return;

  try {
    const [regularRes, boldRes] = await Promise.all([
      fetch(`${baseUrl}fonts/NotoKufiArabic-Regular.ttf`),
      fetch(`${baseUrl}fonts/NotoKufiArabic-Bold.ttf`),
    ]);
    const [regularBuf, boldBuf] = await Promise.all([
      regularRes.arrayBuffer(),
      boldRes.arrayBuffer(),
    ]);

    const toBase64 = (buf: ArrayBuffer) => {
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    };

    doc.addFileToVFS('NotoKufiArabic-Regular.ttf', toBase64(regularBuf));
    doc.addFont('NotoKufiArabic-Regular.ttf', 'NotoKufi', 'normal');

    doc.addFileToVFS('NotoKufiArabic-Bold.ttf', toBase64(boldBuf));
    doc.addFont('NotoKufiArabic-Bold.ttf', 'NotoKufi', 'bold');

    fontsLoaded = true;
  } catch (e) {
    console.warn('Failed to load Arabic fonts, using default', e);
  }
}

const COLORS = {
  primary: [23, 62, 82] as [number, number, number],
  accent: [31, 181, 172] as [number, number, number],
  dark: [30, 30, 30] as [number, number, number],
  medium: [100, 100, 100] as [number, number, number],
  light: [160, 160, 160] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  success: [75, 184, 116] as [number, number, number],
};

function setFont(doc: jsPDF, style: 'normal' | 'bold' = 'normal', size: number = 10) {
  try {
    doc.setFont('NotoKufi', style);
  } catch {
    doc.setFont('helvetica', style);
  }
  doc.setFontSize(size);
}

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: [number, number, number]) {
  doc.setFillColor(...fill);
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

export async function generateProfessionalInvoice(
  order: any,
  lang: string,
  storeName: string,
  storeNameAr: string,
  user?: { displayName?: string | null; email?: string | null }
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const baseUrl = import.meta.env.BASE_URL || '/';
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pw - margin * 2;

  await loadFonts(doc, baseUrl);

  const isAr = lang === 'ar';
  const textRight = (text: string, x: number, y: number, opts?: any) => {
    doc.text(text, x, y, { align: 'right', ...opts });
  };
  const textLeft = (text: string, x: number, y: number, opts?: any) => {
    doc.text(text, x, y, { align: 'left', ...opts });
  };
  const textCenter = (text: string, x: number, y: number, opts?: any) => {
    doc.text(text, x, y, { align: 'center', ...opts });
  };

  drawRoundedRect(doc, 0, 0, pw, 52, 0, COLORS.primary);
  doc.setFillColor(31, 181, 172);
  doc.rect(0, 48, pw, 4, 'F');

  setFont(doc, 'bold', 22);
  doc.setTextColor(...COLORS.white);
  textCenter(arText(storeNameAr), pw / 2, 22);

  setFont(doc, 'normal', 10);
  doc.setTextColor(200, 220, 230);
  textCenter(storeName, pw / 2, 30);

  setFont(doc, 'normal', 8);
  doc.setTextColor(170, 200, 215);
  textCenter(isAr ? arText('متجر المنتجات الرقمية - البحرين') : 'Digital Products Store - Bahrain', pw / 2, 37);

  let y = 62;

  setFont(doc, 'bold', 16);
  doc.setTextColor(...COLORS.primary);
  textCenter(isAr ? arText('فاتورة') + '  |  INVOICE' : 'INVOICE  |  ' + arText('فاتورة'), pw / 2, y);

  y += 4;
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.8);
  doc.line(pw / 2 - 25, y, pw / 2 + 25, y);

  y += 10;

  const orderDate = new Date(order.createdAt);
  const dateStrEn = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const dateStrAr = orderDate.toLocaleDateString('ar-BH', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const orderNum = order.orderNumber || `#${order.id}`;

  drawRoundedRect(doc, margin, y, contentWidth, 24, 3, COLORS.bg);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'S');

  const colW = contentWidth / 3;
  const iy = y + 9;

  setFont(doc, 'normal', 7);
  doc.setTextColor(...COLORS.light);
  textCenter(isAr ? arText('رقم الفاتورة') : 'INVOICE NO.', margin + colW * 0.5, iy - 2);
  setFont(doc, 'bold', 11);
  doc.setTextColor(...COLORS.primary);
  textCenter(orderNum, margin + colW * 0.5, iy + 5);

  setFont(doc, 'normal', 7);
  doc.setTextColor(...COLORS.light);
  textCenter(isAr ? arText('التاريخ') : 'DATE', margin + colW * 1.5, iy - 2);
  setFont(doc, 'bold', 10);
  doc.setTextColor(...COLORS.dark);
  textCenter(isAr ? arText(dateStrAr) : dateStrEn, margin + colW * 1.5, iy + 5);

  setFont(doc, 'normal', 7);
  doc.setTextColor(...COLORS.light);
  textCenter(isAr ? arText('الوقت') : 'TIME', margin + colW * 2.5, iy - 2);
  setFont(doc, 'bold', 10);
  doc.setTextColor(...COLORS.dark);
  textCenter(timeStr, margin + colW * 2.5, iy + 5);

  y += 32;

  drawRoundedRect(doc, margin, y, contentWidth, 30, 3, COLORS.white);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'S');

  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(margin, y, contentWidth, 8, 3, 3, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(margin, y + 4, contentWidth, 4, 'F');

  setFont(doc, 'bold', 9);
  doc.setTextColor(...COLORS.white);
  const custLabel = isAr ? arText('معلومات العميل') + '  |  Customer Information' : 'Customer Information  |  ' + arText('معلومات العميل');
  textCenter(custLabel, pw / 2, y + 5.5);

  const cy = y + 14;
  const custName = order.customerName || user?.displayName || 'N/A';
  const custEmail = order.customerEmail || user?.email || 'N/A';
  const custPhone = order.customerPhone || '';

  setFont(doc, 'normal', 7);
  doc.setTextColor(...COLORS.light);
  textLeft(isAr ? arText('الاسم') + ' / Name' : 'Name / ' + arText('الاسم'), margin + 5, cy);
  setFont(doc, 'bold', 9);
  doc.setTextColor(...COLORS.dark);
  textLeft(custName, margin + 5, cy + 5);

  setFont(doc, 'normal', 7);
  doc.setTextColor(...COLORS.light);
  textCenter(isAr ? arText('البريد') + ' / Email' : 'Email / ' + arText('البريد'), pw / 2, cy);
  setFont(doc, 'bold', 9);
  doc.setTextColor(...COLORS.dark);
  textCenter(custEmail, pw / 2, cy + 5);

  if (custPhone) {
    setFont(doc, 'normal', 7);
    doc.setTextColor(...COLORS.light);
    textRight(isAr ? arText('الهاتف') + ' / Phone' : 'Phone / ' + arText('الهاتف'), pw - margin - 5, cy);
    setFont(doc, 'bold', 9);
    doc.setTextColor(...COLORS.dark);
    textRight(custPhone, pw - margin - 5, cy + 5);
  }

  y += 38;

  const items: any[] = order.items || [];
  const tableH = 9;
  const headerH = 10;
  const rowH = 9;

  drawRoundedRect(doc, margin, y, contentWidth, headerH, 2, COLORS.primary);

  const cols = isAr
    ? [
        { label: arText('المنتج') + ' / Product', x: pw - margin - 5, align: 'right' as const, w: contentWidth * 0.45 },
        { label: arText('الكمية') + ' / Qty', x: pw - margin - contentWidth * 0.45 - 15, align: 'center' as const, w: contentWidth * 0.15 },
        { label: arText('السعر') + ' / Price', x: margin + contentWidth * 0.25, align: 'center' as const, w: contentWidth * 0.2 },
        { label: arText('المجموع') + ' / Total', x: margin + 5, align: 'left' as const, w: contentWidth * 0.2 },
      ]
    : [
        { label: 'Product / ' + arText('المنتج'), x: margin + 5, align: 'left' as const, w: contentWidth * 0.45 },
        { label: 'Qty / ' + arText('الكمية'), x: margin + contentWidth * 0.5, align: 'center' as const, w: contentWidth * 0.15 },
        { label: 'Price / ' + arText('السعر'), x: margin + contentWidth * 0.7, align: 'center' as const, w: contentWidth * 0.15 },
        { label: 'Total / ' + arText('المجموع'), x: pw - margin - 5, align: 'right' as const, w: contentWidth * 0.15 },
      ];

  setFont(doc, 'bold', 8);
  doc.setTextColor(...COLORS.white);
  cols.forEach(col => {
    doc.text(col.label, col.x, y + 7, { align: col.align });
  });

  y += headerH;

  items.forEach((item: any, idx: number) => {
    const bgColor = idx % 2 === 0 ? COLORS.white : COLORS.bg;
    doc.setFillColor(...bgColor);
    doc.rect(margin, y, contentWidth, rowH, 'F');

    const title = isAr
      ? arText(item.titleAr || item.titleEn || 'Product')
      : (item.titleEn || item.titleAr || 'Product');
    const qty = String(item.quantity);
    const price = `${item.price} BHD`;
    const total = `${(item.quantity * item.price).toFixed(3)} BHD`;

    setFont(doc, 'bold', 8.5);
    doc.setTextColor(...COLORS.dark);
    doc.text(title.substring(0, 45), cols[0].x, y + 6, { align: cols[0].align });

    setFont(doc, 'normal', 9);
    doc.setTextColor(...COLORS.medium);
    doc.text(qty, cols[1].x, y + 6, { align: cols[1].align });
    doc.text(price, cols[2].x, y + 6, { align: cols[2].align });

    setFont(doc, 'bold', 9);
    doc.setTextColor(...COLORS.primary);
    doc.text(total, cols[3].x, y + 6, { align: cols[3].align });

    y += rowH;
  });

  doc.setDrawColor(...COLORS.border);
  doc.line(margin, y, pw - margin, y);

  y += 6;

  const subtotal = items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);
  const discount = order.discount ? Number(order.discount) : 0;
  const total = Number(order.total);

  const summaryX = isAr ? margin + 5 : pw - margin - 5;
  const summaryLabelX = isAr ? margin + 75 : pw - margin - 75;
  const summaryAlign = isAr ? 'left' as const : 'right' as const;
  const labelAlign = isAr ? 'left' as const : 'right' as const;

  setFont(doc, 'normal', 9);
  doc.setTextColor(...COLORS.medium);
  doc.text(isAr ? arText('المجموع الفرعي') + ' / Subtotal' : 'Subtotal / ' + arText('المجموع الفرعي'), summaryLabelX, y, { align: labelAlign });
  doc.text(`${subtotal.toFixed(3)} BHD`, summaryX, y, { align: summaryAlign });

  if (discount > 0) {
    y += 7;
    doc.setTextColor(220, 38, 38);
    setFont(doc, 'normal', 9);
    doc.text(isAr ? arText('الخصم') + ' / Discount' : 'Discount / ' + arText('الخصم'), summaryLabelX, y, { align: labelAlign });
    doc.text(`-${discount.toFixed(3)} BHD`, summaryX, y, { align: summaryAlign });
  }

  y += 4;
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  const lineStartX = isAr ? margin : pw - margin - 80;
  const lineEndX = isAr ? margin + 80 : pw - margin;
  doc.line(lineStartX, y, lineEndX, y);

  y += 8;
  drawRoundedRect(doc, lineStartX - 2, y - 6, 84, 14, 3, COLORS.primary);
  setFont(doc, 'bold', 12);
  doc.setTextColor(...COLORS.white);
  doc.text(isAr ? arText('الإجمالي') + ' / Total' : 'Total / ' + arText('الإجمالي'), summaryLabelX, y + 2, { align: labelAlign });
  doc.text(`${total.toFixed(3)} BHD`, summaryX, y + 2, { align: summaryAlign });

  y += 22;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(margin + 20, y, pw - margin - 20, y);
  doc.setLineDashPattern([], 0);

  y += 10;

  setFont(doc, 'bold', 10);
  doc.setTextColor(...COLORS.accent);
  textCenter(isAr ? arText('شكراً لتسوقك معنا!') : 'Thank you for your purchase!', pw / 2, y);

  y += 6;
  setFont(doc, 'normal', 8);
  doc.setTextColor(...COLORS.light);
  textCenter(isAr ? arText('نيوفلكس ستور') + ' | NEWFLIX STORE' : 'NEWFLIX STORE | ' + arText('نيوفلكس ستور'), pw / 2, y);

  y += 5;
  setFont(doc, 'normal', 7);
  doc.setTextColor(200, 200, 200);
  textCenter(isAr ? arText('هذه فاتورة إلكترونية صادرة تلقائياً') : 'This is an automatically generated electronic invoice', pw / 2, y);

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, ph - 6, pw, 6, 'F');
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, ph - 6, pw, 2, 'F');

  doc.save(`invoice-${orderNum.replace('#', '')}.pdf`);
  return true;
}
