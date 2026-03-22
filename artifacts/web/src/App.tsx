import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import { useLanguage } from "@/contexts/LanguageContext";

const queryClient = new QueryClient();

function About() {
  const { lang } = useLanguage();
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-border p-8 md:p-12 shadow-sm">
        <h1 className="text-4xl font-bold mb-6">{lang === 'ar' ? 'من نحن' : 'About Us'}</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
          <p>{lang === 'ar' ? 'نيوفلكس ستور هو متجر إلكتروني متخصص في بيع المنتجات الرقمية في مملكة البحرين. نقدم مجموعة واسعة من الاشتراكات الرقمية، بطاقات الهدايا، تراخيص البرامج، والخدمات الرقمية بأفضل الأسعار وأعلى جودة.' : 'NEWFLIX STORE is an online store specializing in selling digital products in the Kingdom of Bahrain. We offer a wide range of digital subscriptions, gift cards, software licenses, and digital services at the best prices and highest quality.'}</p>
          <p>{lang === 'ar' ? 'نلتزم بتقديم تجربة تسوق سلسة وآمنة مع تسليم فوري لجميع المنتجات الرقمية. فريقنا متاح على مدار الساعة لخدمتكم عبر الواتساب.' : 'We are committed to providing a smooth and secure shopping experience with instant delivery of all digital products. Our team is available 24/7 to serve you via WhatsApp.'}</p>
        </div>
      </div>
    </div>
  );
}

function Contact() {
  const { lang } = useLanguage();
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-border p-8 md:p-12 shadow-sm">
        <h1 className="text-4xl font-bold mb-6">{lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}</h1>
        <div className="space-y-6 text-muted-foreground">
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
            <span className="text-2xl">📍</span>
            <div><h3 className="font-bold text-foreground mb-1">{lang === 'ar' ? 'الموقع' : 'Location'}</h3><p>{lang === 'ar' ? 'مملكة البحرين' : 'Kingdom of Bahrain'}</p></div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
            <span className="text-2xl">📱</span>
            <div><h3 className="font-bold text-foreground mb-1">{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</h3><a href="https://wa.me/97337127483" className="text-primary hover:underline dir-ltr inline-block">+973 37127483</a></div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
            <span className="text-2xl">📸</span>
            <div><h3 className="font-bold text-foreground mb-1">{lang === 'ar' ? 'انستغرام' : 'Instagram'}</h3><a href="https://instagram.com/NEWFLIX.ADS" target="_blank" rel="noreferrer" className="text-primary hover:underline">@NEWFLIX.ADS</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticPage({ titleAr, titleEn, contentAr, contentEn }: { titleAr: string; titleEn: string; contentAr: string; contentEn: string }) {
  const { lang } = useLanguage();
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-border p-8 md:p-12 shadow-sm">
        <h1 className="text-4xl font-bold mb-6">{lang === 'ar' ? titleAr : titleEn}</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {lang === 'ar' ? contentAr : contentEn}
        </div>
      </div>
    </div>
  );
}

function Account() {
  const { lang } = useLanguage();
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{lang === 'ar' ? 'حسابي' : 'My Account'}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { href: '/account/orders', icon: '📦', titleAr: 'طلباتي', titleEn: 'My Orders', descAr: 'تتبع حالة طلباتك', descEn: 'Track your order status' },
            { href: '/account', icon: '⚙️', titleAr: 'إعدادات الحساب', titleEn: 'Account Settings', descAr: 'إدارة معلومات حسابك', descEn: 'Manage your account info' },
          ].map((item) => (
            <a key={item.href} href={item.href} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-lg transition-all">
              <span className="text-3xl mb-4 block">{item.icon}</span>
              <h3 className="font-bold text-lg mb-1">{lang === 'ar' ? item.titleAr : item.titleEn}</h3>
              <p className="text-muted-foreground text-sm">{lang === 'ar' ? item.descAr : item.descEn}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login">{() => <Auth mode="login" />}</Route>
      <Route path="/register">{() => <Auth mode="register" />}</Route>
      <Route path="/account" component={Account} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq">{() => <StaticPage titleAr="الأسئلة الشائعة" titleEn="FAQ" contentAr={`س: كيف أستلم المنتج؟\nج: بعد تأكيد الدفع، يتم تسليم المنتج فوراً عبر حسابك في الموقع.\n\nس: هل المنتجات أصلية؟\nج: نعم، جميع المنتجات أصلية 100% ومضمونة.\n\nس: ما هي طرق الدفع؟\nج: نقبل بطاقات الائتمان والدفع الإلكتروني وBenefit Pay.\n\nس: هل يمكن استرجاع المنتج؟\nج: بسبب طبيعة المنتجات الرقمية، لا يمكن الاسترجاع بعد التسليم إلا في حالات محددة.\n\nس: كيف أتواصل مع الدعم؟\nج: يمكنك التواصل معنا عبر الواتساب على الرقم 37127483 في أي وقت.`} contentEn={`Q: How do I receive the product?\nA: After payment confirmation, the product is delivered instantly through your account.\n\nQ: Are the products original?\nA: Yes, all products are 100% original and guaranteed.\n\nQ: What are the payment methods?\nA: We accept credit cards, e-payment, and BenefitPay.\n\nQ: Can I return a product?\nA: Due to the nature of digital products, returns are not possible after delivery except in specific cases.\n\nQ: How do I contact support?\nA: You can reach us via WhatsApp at 37127483 anytime.`} />}</Route>
      <Route path="/terms">{() => <StaticPage titleAr="الشروط والأحكام" titleEn="Terms & Conditions" contentAr="باستخدامك لموقع نيوفلكس ستور، فإنك توافق على الشروط والأحكام التالية:\n\n1. جميع المنتجات المعروضة هي منتجات رقمية ويتم تسليمها إلكترونياً.\n2. يجب على المستخدم التأكد من صحة البيانات المدخلة عند الطلب.\n3. لا يمكن استرجاع المنتجات الرقمية بعد تسليمها.\n4. نحتفظ بالحق في تعديل الأسعار والعروض في أي وقت.\n5. يجب أن يكون عمر المستخدم 18 عاماً أو أكثر.\n6. نلتزم بحماية بياناتك الشخصية وعدم مشاركتها مع أطراف ثالثة." contentEn="By using NEWFLIX STORE, you agree to the following terms and conditions:\n\n1. All listed products are digital products and are delivered electronically.\n2. Users must ensure the accuracy of information entered during ordering.\n3. Digital products cannot be returned after delivery.\n4. We reserve the right to modify prices and offers at any time.\n5. Users must be 18 years of age or older.\n6. We are committed to protecting your personal data and not sharing it with third parties." />}</Route>
      <Route path="/privacy">{() => <StaticPage titleAr="سياسة الخصوصية" titleEn="Privacy Policy" contentAr="نحن في نيوفلكس ستور نلتزم بحماية خصوصية مستخدمينا:\n\n- نجمع فقط البيانات الضرورية لإتمام عمليات الشراء.\n- لا نشارك بياناتك الشخصية مع أطراف ثالثة.\n- نستخدم تشفير SSL لحماية جميع المعاملات.\n- يمكنك طلب حذف بياناتك في أي وقت.\n- نحتفظ بسجلات الطلبات لأغراض المحاسبة فقط." contentEn="At NEWFLIX STORE, we are committed to protecting our users' privacy:\n\n- We only collect data necessary to complete purchases.\n- We do not share your personal data with third parties.\n- We use SSL encryption to protect all transactions.\n- You can request deletion of your data at any time.\n- We retain order records for accounting purposes only." />}</Route>
      <Route path="/refund-policy">{() => <StaticPage titleAr="سياسة الاسترجاع" titleEn="Refund Policy" contentAr="بسبب الطبيعة الرقمية لمنتجاتنا:\n\n- لا يمكن استرجاع المنتجات بعد تسليمها واستخدامها.\n- في حالة وجود مشكلة تقنية في المنتج، يرجى التواصل معنا خلال 24 ساعة.\n- سنقوم باستبدال المنتج أو رد المبلغ في حالة ثبوت خلل في المنتج.\n- للتواصل بخصوص الاسترجاع: واتساب 37127483" contentEn="Due to the digital nature of our products:\n\n- Products cannot be returned after delivery and use.\n- If there is a technical issue with the product, please contact us within 24 hours.\n- We will replace the product or refund the amount if a defect is confirmed.\n- For refund inquiries: WhatsApp 37127483" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <AppLayout />
                </WouterRouter>
                <Toaster position="top-center" richColors />
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
