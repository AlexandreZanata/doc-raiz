'use client';

import Image from 'next/image';
import { useI18n } from '@/components/providers/I18nProvider';
import { LOCALES, type Locale } from '@/lib/i18n/types';
import styles from './atoms.module.css';

export function FlagIcon({ locale }: { locale: Locale }) {
  const meta = LOCALES.find((item) => item.code === locale);
  if (!meta) return null;

  return (
    <Image
      src={meta.flag}
      alt=""
      width={20}
      height={14}
      className={styles.flagImg}
      priority
    />
  );
}

export function LocaleSwitcher() {
  const { locale, setLocale, messages } = useI18n();

  return (
    <div className={styles.localeSwitcher} role="group" aria-label={messages.actions.selectLanguage}>
      {LOCALES.map((item) => {
        const active = item.code === locale;
        return (
          <button
            key={item.code}
            type="button"
            className={`${styles.localeButton} ${active ? styles.localeButtonActive : ''}`.trim()}
            aria-label={item.label}
            aria-pressed={active}
            title={item.label}
            onClick={() => {
              setLocale(item.code);
            }}
          >
            <FlagIcon locale={item.code} />
          </button>
        );
      })}
    </div>
  );
}
