import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      className="font-medium gap-2"
    >
      <Globe className="h-4 w-4" />
      {lang === 'ar' ? 'English' : 'عربي'}
    </Button>
  );
}
