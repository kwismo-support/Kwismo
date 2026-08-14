import { useLanguageStore } from '@/shared/store/languageStore';
import { SUPPORTED_LANGS, type SupportedLang } from '@/config/constants';
import { cn } from '@/shared/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

const labels: Record<SupportedLang, string> = {
  fr: 'FR',
  en: 'EN',
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguageStore();

  return (
    <div
      className={cn('flex items-center gap-1 rounded-full border border-[var(--color-border)] p-0.5', className)}
      role="group"
      aria-label="Changer de langue"
    >
      {SUPPORTED_LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={l === 'fr' ? 'Français' : 'English'}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
            lang === l
              ? 'bg-primary-500 text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          )}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
