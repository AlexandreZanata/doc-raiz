'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './organisms.module.css';

type Props = {
  href: string;
  isActive: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
};

export function SidebarNavLink({ href, isActive, onNavigate, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  return (
    <Link
      href={href}
      prefetch
      scroll={false}
      className={`${styles.navLink} ${isActive || pending ? styles.active : ''}`.trim()}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => {
        setPending(true);
        onNavigate?.();
      }}
    >
      {children}
    </Link>
  );
}
