'use client';

import Link from 'next/link';
import { useI18n } from '@/components/providers/I18nProvider';
import { ValidatorPanel } from '@/components/organisms/ValidatorPanel';
import styles from './home.module.css';

export default function HomePage() {
  const { messages } = useI18n();

  return (
    <ValidatorPanel title={messages.home.title} description={messages.home.description}>
      <p className={styles.lead}>{messages.home.lead}</p>
      <section className={styles.quickLinks}>
        <h2 className={styles.quickTitle}>{messages.home.quickStart}</h2>
        <ul>
          <li>
            <Link href="/cpf">{messages.home.cpfLink}</Link>
          </li>
          <li>
            <Link href="/cnpj">{messages.home.cnpjLink}</Link>
          </li>
          <li>
            <Link href="/pix">{messages.home.pixLink}</Link>
          </li>
        </ul>
      </section>
      <section className={styles.quickLinks}>
        <h2 className={styles.quickTitle}>{messages.home.platform}</h2>
        <ul>
          <li>
            <Link href="/detect">{messages.home.detectLink}</Link>
          </li>
          <li>
            <Link href="/sanitize">{messages.home.sanitizeLink}</Link>
          </li>
          <li>
            <Link href="/generate">{messages.home.generateLink}</Link>
          </li>
        </ul>
      </section>
    </ValidatorPanel>
  );
}
