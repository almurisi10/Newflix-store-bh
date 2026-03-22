import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const { lang } = useLanguage();
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-8xl font-black text-primary/20 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">
          {lang === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {lang === 'ar' 
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
            : 'Sorry, the page you are looking for does not exist or has been moved.'}
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-xl h-12 px-8">
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
