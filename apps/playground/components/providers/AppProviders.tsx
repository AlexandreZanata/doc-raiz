'use client';

import { I18nProvider } from '@/components/providers/I18nProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
