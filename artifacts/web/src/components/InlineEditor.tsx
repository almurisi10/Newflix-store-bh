import React, { useState, useRef, useEffect } from 'react';
import { Pencil, X, Check, RotateCcw } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface EditableTextProps {
  contentKey: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  fallback?: string;
  children?: React.ReactNode;
}

export function EditableText({ contentKey, as: Tag = 'span', className = '', fallback = '' }: EditableTextProps) {
  const { editMode } = useEditMode();
  const { getText, getStyles, updateContent, content } = useSiteContent();
  const { lang } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [valueAr, setValueAr] = useState('');
  const [valueEn, setValueEn] = useState('');
  const [fontSize, setFontSize] = useState('');
  const [fontWeight, setFontWeight] = useState('');
  const [textColor, setTextColor] = useState('');
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentText = getText(contentKey, lang) || fallback;
  const styles = getStyles(contentKey);

  useEffect(() => {
    if (editing && content[contentKey]) {
      setValueAr(content[contentKey]!.valueAr);
      setValueEn(content[contentKey]!.valueEn);
      setFontSize((styles as any)?.fontSize || '');
      setFontWeight((styles as any)?.fontWeight || '');
      setTextColor((styles as any)?.textColor || '');
    }
  }, [editing, contentKey, content, styles]);

  useEffect(() => {
    if (!editing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    const styleUpdate: any = {};
    if (fontSize) styleUpdate.fontSize = fontSize;
    if (fontWeight) styleUpdate.fontWeight = fontWeight;
    if (textColor) styleUpdate.textColor = textColor;

    const success = await updateContent(contentKey, {
      valueAr,
      valueEn,
      styles: Object.keys(styleUpdate).length > 0 ? styleUpdate : {},
    });

    setSaving(false);
    if (success) {
      toast.success(lang === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully');
      setEditing(false);
    } else {
      toast.error(lang === 'ar' ? 'فشل الحفظ' : 'Save failed');
    }
  };

  const handleReset = () => {
    if (content[contentKey]) {
      setValueAr(content[contentKey]!.valueAr);
      setValueEn(content[contentKey]!.valueEn);
      setFontSize((styles as any)?.fontSize || '');
      setFontWeight((styles as any)?.fontWeight || '');
      setTextColor((styles as any)?.textColor || '');
    }
  };

  const inlineStyle: React.CSSProperties = {};
  if ((styles as any)?.fontSize) inlineStyle.fontSize = (styles as any).fontSize;
  if ((styles as any)?.fontWeight) inlineStyle.fontWeight = (styles as any).fontWeight;
  if ((styles as any)?.textColor) inlineStyle.color = (styles as any).textColor;

  if (!editMode) {
    return <Tag className={className} style={inlineStyle}>{currentText}</Tag>;
  }

  return (
    <span className="relative inline-block group/editable">
      <Tag
        className={`${className} outline-dashed outline-1 outline-primary/40 hover:outline-primary/80 cursor-pointer rounded px-0.5 transition-all`}
        style={inlineStyle}
        onClick={() => setEditing(true)}
      >
        {currentText}
      </Tag>
      <button
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="absolute -top-2 -right-2 rtl:-left-2 rtl:right-auto w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover/editable:opacity-100 transition-opacity shadow-lg z-50 hover:scale-110"
      >
        <Pencil className="w-3 h-3" />
      </button>

      {editing && (
        <div
          ref={panelRef}
          className="absolute top-full left-0 rtl:left-auto rtl:right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl p-4 z-[100] w-80 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{contentKey}</span>
            <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">العربية (Arabic)</label>
            <textarea
              value={valueAr}
              onChange={(e) => setValueAr(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              rows={2}
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">English</label>
            <textarea
              value={valueEn}
              onChange={(e) => setValueEn(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              rows={2}
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Size</label>
              <input
                type="text"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                placeholder="e.g. 18px"
                className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-xs"
              >
                <option value="">Default</option>
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Color</label>
              <input
                type="color"
                value={textColor || '#000000'}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-8 rounded-lg cursor-pointer border border-border"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? '...' : (lang === 'ar' ? 'حفظ' : 'Save')}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm hover:bg-muted/80"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center justify-center gap-1.5 bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm hover:bg-muted/80"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

export function EditModeToggle() {
  const { editMode, toggleEditMode, canEdit } = useEditMode();
  const { lang } = useLanguage();

  if (!canEdit) return null;

  return (
    <button
      onClick={toggleEditMode}
      className={`fixed bottom-20 right-4 rtl:left-4 rtl:right-auto z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl transition-all ${
        editMode
          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2'
          : 'bg-card text-foreground border border-border hover:border-primary/50'
      }`}
    >
      <Pencil className="w-4 h-4" />
      <span className="text-sm font-medium">
        {editMode
          ? (lang === 'ar' ? 'وضع التحرير: مفعل' : 'Edit Mode: ON')
          : (lang === 'ar' ? 'وضع التحرير' : 'Edit Mode')
        }
      </span>
    </button>
  );
}
