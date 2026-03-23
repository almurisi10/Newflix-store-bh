import { Product } from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();

  const title = lang === 'ar' ? product.titleAr : product.titleEn;
  const desc = lang === 'ar' ? product.shortDescriptionAr : product.shortDescriptionEn;
  const isDiscounted = product.comparePrice && product.comparePrice > product.price;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="relative aspect-[4/3] block overflow-hidden bg-muted/20">
        <img 
          src={product.mainImage} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {product.deliveryType === 'instant' && (
            <div className="bg-success/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <Zap className="w-3 h-3 fill-current" />
              {lang === 'ar' ? 'تسليم فوري' : 'Instant'}
            </div>
          )}
          {isDiscounted && (
            <div className="bg-destructive/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {lang === 'ar' ? 'خصم' : 'Sale'}
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{title}</h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{desc}</p>
        </div>
        
        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-primary">{product.price} {t('bhd')}</span>
              {isDiscounted && (
                <span className="text-sm text-muted-foreground line-through decoration-destructive/50 decoration-2">
                  {product.comparePrice} {t('bhd')}
                </span>
              )}
            </div>
          </div>
          <Button 
            size="icon" 
            className="rounded-xl h-12 w-12 shadow-md hover:shadow-lg transition-all"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function CompactProductCard({ product }: { product: Product }) {
  const { t, lang } = useLanguage();
  const { addToCart } = useCart();

  const title = lang === 'ar' ? product.titleAr : product.titleEn;
  const isDiscounted = product.comparePrice && product.comparePrice > product.price;

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      >
        <div className="relative aspect-square overflow-hidden bg-muted/20">
          <img
            src={product.mainImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {product.deliveryType === 'instant' && (
              <div className="bg-success/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 shadow">
                <Zap className="w-2.5 h-2.5 fill-current" />
                {lang === 'ar' ? 'فوري' : 'Instant'}
              </div>
            )}
            {isDiscounted && (
              <div className="bg-destructive/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                {lang === 'ar' ? 'خصم' : 'Sale'}
              </div>
            )}
          </div>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-bold text-sm leading-tight mb-1.5 line-clamp-2">{title}</h3>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-primary">{product.price}</span>
              <span className="text-xs text-muted-foreground">{t('bhd')}</span>
              {isDiscounted && (
                <span className="text-xs text-muted-foreground line-through">{product.comparePrice}</span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
              className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
