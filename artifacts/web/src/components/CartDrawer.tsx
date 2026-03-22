import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal } = useCart();
  const { t, lang, dir } = useLanguage();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-full max-w-md bg-background shadow-2xl z-50 flex flex-col border-${dir === 'rtl' ? 'r' : 'l'} border-border`}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
                {t('cart')}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <ShoppingBag className="w-20 h-20 mb-4" />
                  <p className="text-xl font-medium">{t('emptyCart')}</p>
                  <Button variant="outline" className="mt-6" onClick={() => setIsCartOpen(false)}>
                    {t('continueShopping')}
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                    <img 
                      src={item.product.mainImage} 
                      alt={lang === 'ar' ? item.product.titleAr : item.product.titleEn} 
                      className="w-24 h-24 object-cover rounded-xl shadow-sm"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-2">
                          {lang === 'ar' ? item.product.titleAr : item.product.titleEn}
                        </h3>
                        <p className="text-primary font-bold mt-1">
                          {item.product.price} {t('bhd')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.product.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium text-muted-foreground">{t('total')}</span>
                  <span className="text-2xl font-bold text-foreground">{subtotal.toFixed(2)} {t('bhd')}</span>
                </div>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full">
                  <Button className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                    {t('checkout')}
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
