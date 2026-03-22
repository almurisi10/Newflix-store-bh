import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable, homepageSectionsTable, couponsTable, popupsTable, inventoryItemsTable, siteContentTable, adminSettingsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/seed", async (_req, res): Promise<void> => {
  await db.execute(sql`TRUNCATE categories, products, homepage_sections, coupons, popups, inventory_items, orders, site_content, admin_settings RESTART IDENTITY CASCADE`);

  const categories = await db.insert(categoriesTable).values([
    { nameAr: "اشتراكات رقمية", nameEn: "Digital Subscriptions", descriptionAr: "اشتراكات في أفضل المنصات الرقمية", descriptionEn: "Subscriptions to top digital platforms", icon: "📺", sortOrder: 1, active: true },
    { nameAr: "حسابات رقمية", nameEn: "Digital Accounts", descriptionAr: "حسابات جاهزة للاستخدام الفوري", descriptionEn: "Ready-to-use digital accounts", icon: "👤", sortOrder: 2, active: true },
    { nameAr: "بطاقات رقمية", nameEn: "Digital Cards", descriptionAr: "بطاقات شحن وهدايا إلكترونية", descriptionEn: "Top-up and gift cards", icon: "💳", sortOrder: 3, active: true },
    { nameAr: "برامج وتراخيص", nameEn: "Software & Licenses", descriptionAr: "تراخيص برامج أصلية", descriptionEn: "Original software licenses", icon: "🔑", sortOrder: 4, active: true },
    { nameAr: "ألعاب", nameEn: "Games", descriptionAr: "ألعاب وشحن رصيد الألعاب", descriptionEn: "Games and game credits", icon: "🎮", sortOrder: 5, active: true },
    { nameAr: "خدمات رقمية", nameEn: "Digital Services", descriptionAr: "خدمات متنوعة عبر الإنترنت", descriptionEn: "Various online services", icon: "⚙️", sortOrder: 6, active: true },
  ]).returning();

  const products = await db.insert(productsTable).values([
    {
      titleAr: "اشتراك نتفلكس بريميوم - 12 شهر", titleEn: "Netflix Premium - 12 Months",
      shortDescriptionAr: "استمتع بمشاهدة غير محدودة بأعلى جودة 4K", shortDescriptionEn: "Unlimited streaming in 4K quality",
      fullDescriptionAr: "اشتراك نتفلكس بريميوم لمدة سنة كاملة. شاهد أحدث الأفلام والمسلسلات بجودة 4K Ultra HD على 4 شاشات في نفس الوقت. تسليم فوري للحساب.", fullDescriptionEn: "Netflix Premium subscription for a full year. Watch the latest movies and series in 4K Ultra HD on 4 screens simultaneously. Instant account delivery.",
      mainImage: "https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28?w=400&h=400&fit=crop",
      gallery: ["https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28?w=800&h=600&fit=crop"],
      categoryIds: [categories[0].id], tags: ["نتفلكس", "netflix", "streaming"], price: 45, comparePrice: 60, discount: 25,
      badges: ["خصم", "الأكثر مبيعاً"], sku: "NF-PREM-12", featured: true, bestseller: true, active: true, stock: 50,
      deliveryType: "instant", productType: "account",
    },
    {
      titleAr: "اشتراك سبوتيفاي بريميوم - 6 أشهر", titleEn: "Spotify Premium - 6 Months",
      shortDescriptionAr: "استمع للموسيقى بدون إعلانات", shortDescriptionEn: "Listen to music ad-free",
      fullDescriptionAr: "اشتراك سبوتيفاي بريميوم لمدة 6 أشهر. استمع لملايين الأغاني بدون إعلانات مع إمكانية التحميل.", fullDescriptionEn: "Spotify Premium for 6 months. Listen to millions of songs ad-free with offline downloads.",
      mainImage: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop",
      gallery: [], categoryIds: [categories[0].id], tags: ["سبوتيفاي", "spotify", "music"], price: 18, comparePrice: 24, discount: 25,
      badges: ["جديد"], sku: "SP-PREM-6", featured: true, bestseller: false, active: true, stock: 30,
      deliveryType: "instant", productType: "account",
    },
    {
      titleAr: "بطاقة آيتونز 50 دولار", titleEn: "iTunes Gift Card $50",
      shortDescriptionAr: "بطاقة هدية آبل آيتونز", shortDescriptionEn: "Apple iTunes Gift Card",
      fullDescriptionAr: "بطاقة آيتونز بقيمة 50 دولار أمريكي. يمكن استخدامها لشراء التطبيقات والموسيقى والأفلام من متجر آبل.", fullDescriptionEn: "iTunes card worth $50 USD. Use it to purchase apps, music, and movies from the Apple Store.",
      mainImage: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
      gallery: [], categoryIds: [categories[2].id], tags: ["آيتونز", "itunes", "apple"], price: 20, comparePrice: null, discount: null,
      badges: [], sku: "IT-50", featured: false, bestseller: true, active: true, stock: 100,
      deliveryType: "instant", productType: "code",
    },
    {
      titleAr: "رخصة مايكروسوفت أوفيس 365", titleEn: "Microsoft Office 365 License",
      shortDescriptionAr: "رخصة أصلية لمدة سنة", shortDescriptionEn: "Original license for one year",
      fullDescriptionAr: "رخصة مايكروسوفت أوفيس 365 أصلية تشمل Word, Excel, PowerPoint وجميع تطبيقات أوفيس لمدة سنة كاملة.", fullDescriptionEn: "Original Microsoft Office 365 license including Word, Excel, PowerPoint and all Office apps for a full year.",
      mainImage: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=400&h=400&fit=crop",
      gallery: [], categoryIds: [categories[3].id], tags: ["مايكروسوفت", "office", "microsoft"], price: 25, comparePrice: 35, discount: 29,
      badges: ["خصم خاص"], sku: "MS-365", featured: true, bestseller: true, active: true, stock: 40,
      deliveryType: "instant", productType: "code",
    },
    {
      titleAr: "بطاقة بلايستيشن 100 دولار", titleEn: "PlayStation Store $100",
      shortDescriptionAr: "بطاقة شحن متجر بلايستيشن", shortDescriptionEn: "PlayStation Store top-up card",
      fullDescriptionAr: "بطاقة شحن متجر بلايستيشن بقيمة 100 دولار. اشترِ ألعابك المفضلة واشتراكات PS Plus.", fullDescriptionEn: "PlayStation Store gift card worth $100. Buy your favorite games and PS Plus subscriptions.",
      mainImage: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
      gallery: [], categoryIds: [categories[4].id], tags: ["بلايستيشن", "playstation", "gaming"], price: 38, comparePrice: null, discount: null,
      badges: [], sku: "PS-100", featured: false, bestseller: false, active: true, stock: 60,
      deliveryType: "instant", productType: "code",
    },
    {
      titleAr: "اشتراك يوتيوب بريميوم - 3 أشهر", titleEn: "YouTube Premium - 3 Months",
      shortDescriptionAr: "شاهد بدون إعلانات مع YouTube Music", shortDescriptionEn: "Watch ad-free with YouTube Music",
      fullDescriptionAr: "اشتراك يوتيوب بريميوم لمدة 3 أشهر. شاهد الفيديوهات بدون إعلانات واستمتع بخدمة YouTube Music مجاناً.", fullDescriptionEn: "YouTube Premium subscription for 3 months. Watch videos ad-free and enjoy YouTube Music for free.",
      mainImage: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=400&fit=crop",
      gallery: [], categoryIds: [categories[0].id], tags: ["يوتيوب", "youtube", "streaming"], price: 12, comparePrice: 15, discount: 20,
      badges: ["عرض محدود"], sku: "YT-PREM-3", featured: true, bestseller: false, active: true, stock: 25,
      deliveryType: "instant", productType: "account",
    },
    {
      titleAr: "رخصة ويندوز 11 برو", titleEn: "Windows 11 Pro License",
      shortDescriptionAr: "مفتاح تفعيل أصلي مدى الحياة", shortDescriptionEn: "Lifetime original activation key",
      fullDescriptionAr: "مفتاح تفعيل ويندوز 11 برو أصلي. تفعيل مدى الحياة مع تحديثات مجانية.", fullDescriptionEn: "Original Windows 11 Pro activation key. Lifetime activation with free updates.",
      mainImage: "https://images.unsplash.com/photo-1624571409024-23d38e2e5e7d?w=400&h=400&fit=crop",
      gallery: [], categoryIds: [categories[3].id], tags: ["ويندوز", "windows", "microsoft"], price: 15, comparePrice: 30, discount: 50,
      badges: ["أفضل سعر", "خصم 50%"], sku: "WIN-11-PRO", featured: true, bestseller: true, active: true, stock: 80,
      deliveryType: "instant", productType: "code",
    },
    {
      titleAr: "تصميم شعار احترافي", titleEn: "Professional Logo Design",
      shortDescriptionAr: "تصميم شعار فريد لعلامتك التجارية", shortDescriptionEn: "Unique logo design for your brand",
      fullDescriptionAr: "خدمة تصميم شعار احترافي مع 3 مقترحات وتعديلات غير محدودة. تسليم الملفات بجميع الصيغ.", fullDescriptionEn: "Professional logo design service with 3 proposals and unlimited revisions. All file formats included.",
      mainImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=400&fit=crop",
      gallery: [], categoryIds: [categories[5].id], tags: ["تصميم", "design", "logo"], price: 30, comparePrice: null, discount: null,
      badges: [], sku: "SRV-LOGO", featured: false, bestseller: false, active: true, stock: 999,
      deliveryType: "manual", productType: "manual",
    },
  ]).returning();

  for (const product of products) {
    if (product.productType === "code") {
      const codes = Array.from({ length: product.stock }, (_, i) =>
        ({ productId: product.id, data: `${product.sku}-${String(i + 1).padStart(4, "0")}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, status: "available" as const })
      );
      if (codes.length > 0) await db.insert(inventoryItemsTable).values(codes);
    } else if (product.productType === "account") {
      const accounts = Array.from({ length: product.stock }, (_, i) =>
        ({ productId: product.id, data: JSON.stringify({ email: `user${i + 1}@${product.sku.toLowerCase()}.com`, password: `Pass${Math.random().toString(36).substring(2, 10)}` }), status: "available" as const })
      );
      if (accounts.length > 0) await db.insert(inventoryItemsTable).values(accounts);
    }
  }

  await db.insert(homepageSectionsTable).values([
    { sectionType: "hero", titleAr: "نيوفلكس ستور", titleEn: "NEWFLIX STORE", subtitleAr: "وجهتك الأولى للمنتجات الرقمية في البحرين", subtitleEn: "Your #1 destination for digital products in Bahrain", active: true, sortOrder: 1, config: { slides: [{ image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop", ctaText: "تسوق الآن", ctaLink: "/shop" }] } },
    { sectionType: "categories", titleAr: "تصفح الأقسام", titleEn: "Browse Categories", active: true, sortOrder: 2, config: {} },
    { sectionType: "bestsellers", titleAr: "الأكثر مبيعاً", titleEn: "Best Sellers", active: true, sortOrder: 3, config: {} },
    { sectionType: "new_arrivals", titleAr: "وصل حديثاً", titleEn: "New Arrivals", active: true, sortOrder: 4, config: {} },
    { sectionType: "featured", titleAr: "منتجات مميزة", titleEn: "Featured Products", active: true, sortOrder: 5, config: {} },
    { sectionType: "offers", titleAr: "عروض وخصومات", titleEn: "Offers & Deals", active: true, sortOrder: 6, config: {} },
    { sectionType: "testimonials", titleAr: "آراء العملاء", titleEn: "Customer Reviews", active: true, sortOrder: 7, config: { reviews: [{ nameAr: "أحمد محمد", nameEn: "Ahmed Mohammed", textAr: "خدمة ممتازة وتسليم فوري. أنصح بالتعامل معهم!", textEn: "Excellent service and instant delivery. Highly recommended!", rating: 5 }, { nameAr: "فاطمة علي", nameEn: "Fatima Ali", textAr: "أسعار منافسة ومنتجات أصلية. شكراً نيوفلكس!", textEn: "Competitive prices and original products. Thanks NEWFLIX!", rating: 5 }, { nameAr: "محمد سالم", nameEn: "Mohammed Salem", textAr: "تجربة شراء سلسة ودعم فني متميز", textEn: "Smooth purchasing experience and excellent support", rating: 4 }] } },
    { sectionType: "faq", titleAr: "الأسئلة الشائعة", titleEn: "FAQ", active: true, sortOrder: 8, config: { items: [{ questionAr: "كيف أستلم المنتج؟", questionEn: "How do I receive the product?", answerAr: "بعد تأكيد الدفع، يتم تسليم المنتج فوراً عبر حسابك في الموقع", answerEn: "After payment confirmation, the product is delivered instantly through your account" }, { questionAr: "هل المنتجات أصلية؟", questionEn: "Are the products original?", answerAr: "نعم، جميع المنتجات أصلية 100% ومضمونة", answerEn: "Yes, all products are 100% original and guaranteed" }, { questionAr: "ما هي طرق الدفع؟", questionEn: "What are the payment methods?", answerAr: "نقبل بطاقات الائتمان والدفع الإلكتروني وBenefit Pay", answerEn: "We accept credit cards, e-payment, and Benefit Pay" }] } },
  ]);

  await db.insert(couponsTable).values([
    { code: "WELCOME10", descriptionAr: "خصم 10% للعملاء الجدد", descriptionEn: "10% off for new customers", discountType: "percentage", discountValue: 10, minOrderAmount: 10, maxUses: 100, active: true },
    { code: "NEWFLIX20", descriptionAr: "خصم 20% على جميع المنتجات", descriptionEn: "20% off all products", discountType: "percentage", discountValue: 20, minOrderAmount: 20, maxUses: 50, active: true },
  ]);

  await db.insert(popupsTable).values([
    { titleAr: "عرض خاص!", titleEn: "Special Offer!", descriptionAr: "احصل على خصم 10% على أول طلب باستخدام كود WELCOME10", descriptionEn: "Get 10% off your first order with code WELCOME10", ctaTextAr: "تسوق الآن", ctaTextEn: "Shop Now", targetUrl: "/shop", active: true, showOnce: true },
  ]);

  await db.insert(siteContentTable).values([
    { contentKey: "hero.badge", page: "home", section: "hero", valueAr: "أفضل متجر للمنتجات الرقمية", valueEn: "Premium Digital Store", contentType: "text" },
    { contentKey: "hero.title.line1", page: "home", section: "hero", valueAr: "عالم من الترفيه", valueEn: "A World of Entertainment", contentType: "text" },
    { contentKey: "hero.title.line2", page: "home", section: "hero", valueAr: "بين يديك", valueEn: "At Your Fingertips", contentType: "text" },
    { contentKey: "hero.subtitle", page: "home", section: "hero", valueAr: "اشتراكات، بطاقات هدايا، وألعاب. تسليم فوري وآمن وبأفضل الأسعار في البحرين.", valueEn: "Subscriptions, gift cards, and games. Instant secure delivery with the best prices in Bahrain.", contentType: "text" },
    { contentKey: "hero.cta.primary", page: "home", section: "hero", valueAr: "تسوق الآن", valueEn: "Shop Now", contentType: "text" },
    { contentKey: "hero.cta.secondary", page: "home", section: "hero", valueAr: "التصنيفات", valueEn: "Categories", contentType: "text" },
    { contentKey: "features.instant.title", page: "home", section: "features", valueAr: "تسليم فوري", valueEn: "Instant Delivery", contentType: "text" },
    { contentKey: "features.instant.desc", page: "home", section: "features", valueAr: "استلم طلبك رقمياً فور الدفع", valueEn: "Get your order digitally right after payment", contentType: "text" },
    { contentKey: "features.secure.title", page: "home", section: "features", valueAr: "دفع آمن", valueEn: "Secure Payment", contentType: "text" },
    { contentKey: "features.secure.desc", page: "home", section: "features", valueAr: "بوابات دفع مشفرة وموثوقة", valueEn: "Encrypted and trusted payment gateways", contentType: "text" },
    { contentKey: "features.support.title", page: "home", section: "features", valueAr: "دعم 24/7", valueEn: "24/7 Support", contentType: "text" },
    { contentKey: "features.support.desc", page: "home", section: "features", valueAr: "فريق جاهز لخدمتك دائماً", valueEn: "Our team is always ready to help", contentType: "text" },
    { contentKey: "cta.title", page: "home", section: "cta", valueAr: "احصل على خصم 10% على أول طلب", valueEn: "Get 10% Off Your First Order", contentType: "text" },
    { contentKey: "cta.subtitle", page: "home", section: "cta", valueAr: "استخدم الكود WELCOME10 عند الدفع واستمتع بأفضل المنتجات الرقمية", valueEn: "Use code WELCOME10 at checkout and enjoy the best digital products", contentType: "text" },
    { contentKey: "cta.button", page: "home", section: "cta", valueAr: "نسخ الكود", valueEn: "Copy Code", contentType: "text" },
    { contentKey: "navbar.storeName", page: "global", section: "navbar", valueAr: "نيوفلكس ستور", valueEn: "NEWFLIX STORE", contentType: "text" },
    { contentKey: "navbar.home", page: "global", section: "navbar", valueAr: "الرئيسية", valueEn: "Home", contentType: "text" },
    { contentKey: "navbar.shop", page: "global", section: "navbar", valueAr: "المتجر", valueEn: "Shop", contentType: "text" },
    { contentKey: "navbar.about", page: "global", section: "navbar", valueAr: "من نحن", valueEn: "About", contentType: "text" },
    { contentKey: "navbar.contact", page: "global", section: "navbar", valueAr: "اتصل بنا", valueEn: "Contact", contentType: "text" },
    { contentKey: "footer.description", page: "global", section: "footer", valueAr: "متجرك الأول للمنتجات الرقمية في البحرين", valueEn: "Your #1 digital products store in Bahrain", contentType: "text" },
    { contentKey: "footer.copyright", page: "global", section: "footer", valueAr: "جميع الحقوق محفوظة", valueEn: "All rights reserved", contentType: "text" },
    { contentKey: "about.title", page: "about", section: "main", valueAr: "من نحن", valueEn: "About Us", contentType: "text" },
    { contentKey: "about.content", page: "about", section: "main", valueAr: "نيوفلكس ستور هو متجر إلكتروني متخصص في بيع المنتجات الرقمية في مملكة البحرين. نقدم مجموعة واسعة من الاشتراكات الرقمية، بطاقات الهدايا، تراخيص البرامج، والخدمات الرقمية بأفضل الأسعار وأعلى جودة.", valueEn: "NEWFLIX STORE is an online store specializing in selling digital products in the Kingdom of Bahrain. We offer a wide range of digital subscriptions, gift cards, software licenses, and digital services at the best prices and highest quality.", contentType: "text" },
    { contentKey: "contact.title", page: "contact", section: "main", valueAr: "اتصل بنا", valueEn: "Contact Us", contentType: "text" },
    { contentKey: "contact.location", page: "contact", section: "main", valueAr: "مملكة البحرين", valueEn: "Kingdom of Bahrain", contentType: "text" },
    { contentKey: "contact.whatsapp", page: "contact", section: "main", valueAr: "+973 37127483", valueEn: "+973 37127483", contentType: "text" },
    { contentKey: "contact.instagram", page: "contact", section: "main", valueAr: "@NEWFLIX.ADS", valueEn: "@NEWFLIX.ADS", contentType: "text" },
  ]);

  await db.insert(adminSettingsTable).values([
    { settingKey: "admin_signup_disabled", settingValue: { value: false } },
    { settingKey: "maintenance_mode", settingValue: { value: false } },
  ]);

  res.json({ message: "تم إضافة البيانات التجريبية بنجاح" });
});

export default router;
