'use client';

import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/components/providers/I18nProvider';
import { MoonIcon, SunIcon } from './icons';
import { Button } from './Button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { messages } = useI18n();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="icon"
      size="sm"
      onClick={toggleTheme}
      aria-label={messages.actions.toggleTheme}
      title={isDark ? messages.actions.toggleThemeLight : messages.actions.toggleThemeDark}
      type="button"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
