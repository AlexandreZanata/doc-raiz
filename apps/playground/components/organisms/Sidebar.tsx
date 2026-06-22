'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/atoms/Badge';
import { ToolbarActions } from '@/components/atoms/ToolbarActions';
import { useI18n } from '@/components/providers/I18nProvider';
import { SidebarNavLink } from '@/components/organisms/SidebarNavLink';
import { DOCUMENT_ROUTES, PLATFORM_ROUTES } from '@/lib/nav';
import type { DocumentSlug } from '@/lib/nav';
import styles from './organisms.module.css';

function NavSection({
  title,
  routes,
  pathname,
  onNavigate,
}: {
  title: string;
  routes: readonly { slug: string }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const { messages } = useI18n();

  return (
    <section className={styles.navSection}>
      <h2 className={styles.navSectionTitle}>{title}</h2>
      <div className={styles.nav}>
        {routes.map((route) => {
          const href = `/${route.slug}`;
          const isActive = pathname === href;
          const routeCopy = messages.routes[route.slug as DocumentSlug | 'detect' | 'sanitize' | 'generate'];
          return (
            <SidebarNavLink key={route.slug} href={href} isActive={isActive} onNavigate={onNavigate}>
              <span className={styles.navLabel}>{routeCopy.label}</span>
              <span className={styles.navDescription}>{routeCopy.description}</span>
            </SidebarNavLink>
          );
        })}
      </div>
    </section>
  );
}

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { messages } = useI18n();

  useEffect(() => {
    const hrefs = [
      '/',
      ...DOCUMENT_ROUTES.map((route) => `/${route.slug}`),
      ...PLATFORM_ROUTES.map((route) => `/${route.slug}`),
    ];
    for (const href of hrefs) {
      router.prefetch(href);
    }
  }, [router]);

  return (
    <aside className={`${styles.sidebar} ${className ?? ''}`.trim()}>
      <header>
        <h1 className={styles.brandTitle}>{messages.brand.title}</h1>
        <p className={styles.brandSubtitle}>{messages.brand.subtitle}</p>
        <p className={styles.brandTagline}>{messages.brand.tagline}</p>
        <Badge variant="success">{messages.brand.openSource}</Badge>
      </header>

      <div className={styles.navGroups}>
        <NavSection
          title={messages.nav.documents}
          routes={DOCUMENT_ROUTES}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <NavSection
          title={messages.nav.platform}
          routes={PLATFORM_ROUTES}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </div>

      <ToolbarActions />
    </aside>
  );
}
