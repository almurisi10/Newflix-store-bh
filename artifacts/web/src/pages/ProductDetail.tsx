import { useParams } from 'wouter';
import { useGetProduct } from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap, ShieldCheck, Tag, Loader2, Check, ChevronDown, ChevronUp, Copy, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();
  const { data: product, isLoading, error } = useGetProduct(Number(id));
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error loading product</h1>
        <p className="text-muted-foreground">Product not found or an error occurred.</p>
      </div>
    );
  }

  const title = lang === 'ar' ? product.titleAr : product.titleEn;
  const desc = lang === 'ar' ? product.fullDescriptionAr : product.fullDescriptionEn;
  const shortDesc = lang === 'ar' ? product.shortDescriptionAr : product.shortDescriptionEn;
  const isDiscounted = product.comparePrice && product.comparePrice > product.price;
  const features = (lang === 'ar' ? product.featuresAr : product.featuresEn) as string[] || [];
  const packages = (product.packages || []) as any[];
  const activePrice = selectedPackage !== null && packages[selectedPackage]
    ? parseFloat(packages[selectedPackage].price)
    : product.price;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl shadow-black/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          
          <div className="p-6 md:p-8 bg-muted/20 border-b md:border-b-0 md:border-e border-border">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white mb-4 shadow-sm border border-border">
              <img 
                src={activeImage || product.mainImage} 
                alt={title} 
                className="w-full h-full object-contain p-4"
              />
            </div>
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                <button 
                  onClick={() => setActiveImage(product.mainImage)}
                  className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 ${activeImage === product.mainImage || !activeImage ? 'border-primary' : 'border-transparent'} transition-all`}
                >
                  <img src={product.mainImage} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
                {product.gallery.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 ${activeImage === img ? 'border-primary' : 'border-transparent'} transition-all`}
                  >
                    <img src={img} alt={`thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-12 flex flex-col">
            <div className="mb-6 flex flex-wrap gap-2">
              {product.deliveryType === 'instant' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-bold">
                  <Zap className="w-4 h-4 fill-current" />
                  {t('digitalDelivery')}
                </span>
              )}
              {product.badges?.map(badge => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                  <Tag className="w-4 h-4" />
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">{title}</h1>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{shortDesc}</p>

            {packages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3 text-foreground">
                  {lang === 'ar' ? 'اختر الباقة' : 'Choose Package'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPackage(idx === selectedPackage ? null : idx)}
                      className={`relative p-4 rounded-xl border-2 text-start transition-all ${
                        selectedPackage === idx
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/40 hover:bg-muted/30'
                      }`}
                    >
                      {selectedPackage === idx && (
                        <div className="absolute top-2 end-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <p className="font-bold text-sm mb-1">
                        {lang === 'ar' ? pkg.nameAr : pkg.nameEn}
                      </p>
                      {pkg.duration && (
                        <p className="text-xs text-muted-foreground mb-2">{pkg.duration}</p>
                      )}
                      <p className="text-lg font-black text-primary">
                        {pkg.price} {t('bhd')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/30 p-6 rounded-2xl mb-6 border border-border/50">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-4xl font-black text-primary">{activePrice} {t('bhd')}</span>
                {isDiscounted && selectedPackage === null && (
                  <>
                    <span className="text-xl text-muted-foreground line-through decoration-destructive/50 decoration-2 mb-1">
                      {product.comparePrice} {t('bhd')}
                    </span>
                    <span className="bg-destructive text-white text-sm font-bold px-2 py-1 rounded-lg mb-1 shadow-sm">
                      {lang === 'ar' ? 'وفر' : 'Save'} {((product.comparePrice! - product.price) / product.comparePrice! * 100).toFixed(0)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-4">
                <ShieldCheck className="w-4 h-4 text-success" />
                {lang === 'ar' ? 'دفع آمن ومضمون 100%' : '100% Secure Payment'}
              </p>
            </div>

            {features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  {lang === 'ar' ? 'المميزات' : 'Features'}
                </h3>
                <ul className="space-y-2">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4 mt-auto">
              <div className="flex items-center bg-background border border-input rounded-xl overflow-hidden h-14 w-32 shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 hover:bg-muted transition-colors font-medium text-lg">-</button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex-1 hover:bg-muted transition-colors font-medium text-lg">+</button>
              </div>
              
              <Button 
                size="lg" 
                className="flex-1 h-14 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1"
                onClick={() => addToCart(product, quantity)}
                disabled={!product.active || product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {product.stock === 0 ? (lang === 'ar' ? 'نفذت الكمية' : 'Out of Stock') : t('addToCart')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-card rounded-3xl p-8 md:p-12 border border-border shadow-sm">
        <button 
          onClick={() => setShowFullDesc(!showFullDesc)}
          className="w-full flex items-center justify-between group"
        >
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-2 h-6 bg-secondary rounded-full inline-block"></span>
            {lang === 'ar' ? 'وصف المنتج' : 'Product Description'}
          </h3>
          <span className="text-muted-foreground group-hover:text-primary transition-colors">
            {showFullDesc ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </span>
        </button>
        
        {!showFullDesc && shortDesc && (
          <p className="mt-4 text-muted-foreground leading-relaxed">{shortDesc}</p>
        )}
        
        {showFullDesc && (
          <div className="mt-6 prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 duration-300">
            {desc}
          </div>
        )}
        
        {!showFullDesc && desc && desc !== shortDesc && (
          <button 
            onClick={() => setShowFullDesc(true)} 
            className="mt-3 text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            {lang === 'ar' ? 'عرض الوصف الكامل' : 'Show full description'}
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
