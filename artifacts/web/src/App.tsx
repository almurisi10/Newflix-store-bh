import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { EditModeToggle } from "@/components/InlineEditor";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";
import MyOrders from "@/pages/MyOrders";
import AccountSettings from "@/pages/AccountSettings";
import Wishlist from "@/pages/Wishlist";
import NotFound from "@/pages/not-found";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, Heart, Settings, User, Coins, Wallet, Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, signOut } = useAuth();
  const API = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<string | null>(null);

  const { data: loyaltyData, refetch: refetchLoyalty } = useQuery({
    queryKey: ['loyalty', user?.uid],
    queryFn: async () => {
      const res = await fetch(`${API}/loyalty/${user!.uid}`);
      return res.json();
    },
    enabled: !!user?.uid,
  });

  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet', user?.uid],
    queryFn: async () => {
      const res = await fetch(`${API}/wallet/${user!.uid}`);
      return res.json();
    },
    enabled: !!user?.uid,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}</h2>
          <p className="text-muted-foreground mb-6">{lang === 'ar' ? 'يرجى تسجيل الدخول لعرض حسابك' : 'Please login to view your account'}</p>
          <Link href="/login">
            <button className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-8 py-3 font-medium">{lang === 'ar' ? 'تسجيل الدخول' : 'Login'}</button>
          </Link>
        </div>
      </div>
    );
  }

  const totalPoints = loyaltyData?.totalPoints || 0;
  const walletBalance = walletData?.balance || 0;

  const handleRedeem = async () => {
    setRedeemLoading(true);
    try {
      const res = await fetch(`${API}/loyalty/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(lang === 'ar' ? 'تم تحويل 50 نقطة إلى 2 د.ب في المحفظة!' : '50 points redeemed → 2 BHD wallet!');
        refetchLoyalty();
        refetchWallet();
      } else {
        toast.error(data.error || (lang === 'ar' ? 'خطأ' : 'Error'));
      }
    } catch { toast.error(lang === 'ar' ? 'خطأ' : 'Error'); }
    setRedeemLoading(false);
  };

  const handleGenerateCoupon = async () => {
    setCouponLoading(true);
    try {
      const res = await fetch(`${API}/wallet/generate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCoupon(data.couponCode);
        toast.success(lang === 'ar' ? 'تم إنشاء كوبون خصم!' : 'Discount coupon generated!');
        refetchWallet();
      } else {
        toast.error(data.error || (lang === 'ar' ? 'خطأ' : 'Error'));
      }
    } catch { toast.error(lang === 'ar' ? 'خطأ' : 'Error'); }
    setCouponLoading(false);
  };

  const menuItems = [
    { href: '/account/orders', Icon: Package, titleAr: 'طلباتي', titleEn: 'My Orders', descAr: 'تتبع حالة طلباتك وسجل المشتريات', descEn: 'Track your orders and purchase history', color: 'bg-blue-500/10 text-blue-500' },
    { href: '/account/wishlist', Icon: Heart, titleAr: 'المفضلة', titleEn: 'Wishlist', descAr: 'المنتجات المحفوظة للشراء لاحقاً', descEn: 'Products saved for later', color: 'bg-pink-500/10 text-pink-500' },
    { href: '/account/settings', Icon: Settings, titleAr: 'إعدادات الحساب', titleEn: 'Account Settings', descAr: 'إدارة معلومات حسابك وتفضيلاتك', descEn: 'Manage your account info and preferences', color: 'bg-gray-500/10 text-gray-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8 p-6 bg-card border border-border rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{user.displayName || user.email?.split('@')[0]}</h1>
            <p className="text-sm text-muted-foreground truncate dir-ltr text-start">{user.email}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-lg">{lang === 'ar' ? 'برنامج الولاء' : 'Loyalty Program'}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 text-center">
              <Coins className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{totalPoints}</p>
              <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}</p>
            </div>
            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 text-center">
              <Wallet className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-black text-green-600 dark:text-green-400">{walletBalance.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'رصيد المحفظة (د.ب)' : 'Wallet (BHD)'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{lang === 'ar' ? 'تحويل النقاط → محفظة' : 'Convert Points → Wallet'}</span>
                <span className="text-xs text-muted-foreground">50 {lang === 'ar' ? 'نقطة' : 'pts'} = 2 {lang === 'ar' ? 'د.ب' : 'BHD'}</span>
              </div>
              <div className="w-full bg-amber-200/50 dark:bg-amber-900/30 rounded-full h-2 mb-3">
                <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (totalPoints / 50) * 100)}%` }} />
              </div>
              <button
                onClick={handleRedeem}
                disabled={totalPoints < 50 || redeemLoading}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {redeemLoading ? '...' : totalPoints < 50
                  ? (lang === 'ar' ? `تحتاج ${50 - totalPoints} نقطة إضافية` : `Need ${50 - totalPoints} more points`)
                  : (lang === 'ar' ? 'تحويل 50 نقطة → 2 د.ب' : 'Redeem 50 pts → 2 BHD')}
              </button>
            </div>

            {walletBalance >= 2 && (
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{lang === 'ar' ? 'إنشاء كوبون خصم' : 'Generate Discount Coupon'}</span>
                </div>
                {generatedCoupon ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{lang === 'ar' ? 'كود الكوبون:' : 'Coupon Code:'}</p>
                    <p className="font-mono font-bold text-lg text-green-600 dark:text-green-400 select-all">{generatedCoupon}</p>
                    <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'استخدمه في الشراء القادم' : 'Use at your next checkout'}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCoupon}
                    disabled={couponLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? '...' : (lang === 'ar' ? 'إنشاء كوبون 2 د.ب' : 'Generate 2 BHD Coupon')}
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              {lang === 'ar' ? 'اكسب 1 نقطة لكل 1 د.ب عند تأكيد الدفع' : 'Earn 1 point per 1 BHD on confirmed payments'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-lg transition-all h-full cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">{lang === 'ar' ? item.titleAr : item.titleEn}</h3>
                <p className="text-muted-foreground text-sm">{lang === 'ar' ? item.descAr : item.descEn}</p>
              </div>
            </Link>
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
      <Route path="/account/orders" component={MyOrders} />
      <Route path="/account/settings" component={AccountSettings} />
      <Route path="/account/wishlist" component={Wishlist} />
      <Route path="/Newflix-login" component={AdminLogin} />
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

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <EditModeToggle />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <SiteContentProvider>
                <EditModeProvider>
                  <CartProvider>
                    <TooltipProvider>
                      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                        <PublicLayout />
                      </WouterRouter>
                      <Toaster position="top-center" richColors />
                    </TooltipProvider>
                  </CartProvider>
                </EditModeProvider>
              </SiteContentProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
