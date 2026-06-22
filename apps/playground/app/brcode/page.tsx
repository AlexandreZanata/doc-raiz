'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BRCODE_GOLDEN_STATIC_EVP,
  BRCODE_OFFICIAL_SOURCE_URL,
  parseBrCode,
  validateBrCode,
} from '@br-validators/core';

export default function BrCodePlaygroundPage() {
  const [input, setInput] = useState(BRCODE_GOLDEN_STATIC_EVP);

  const parsed = useMemo(() => (input ? parseBrCode(input) : null), [input]);
  const validated = useMemo(() => (input ? validateBrCode(input) : null), [input]);

  const cliCommand = input ? `br-validators brcode parse "${input}" --json` : '';

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/" style={{ color: '#7aa2ff', textDecoration: 'none' }}>
        ← All types
      </Link>
      <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>BR Code Parser</h1>
      <p style={{ color: '#9aa5bd', marginBottom: '1.5rem' }}>
        Bacen EMV TLV + CRC16-CCITT · extracts PIX key, merchant, amount, txid
      </p>

      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9aa5bd' }}>Payload</label>
      <textarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        rows={5}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.85rem 1rem',
          borderRadius: 10,
          border: '1px solid #24304d',
          background: '#141b2f',
          color: '#e8ecf4',
          fontSize: '0.9rem',
          fontFamily: 'monospace',
        }}
      />

      <section
        style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: 12,
          background: '#141b2f',
          border: '1px solid #24304d',
          display: 'grid',
          gap: '0.75rem',
        }}
      >
        <Row
          label="Parse"
          value={parsed ? (parsed.ok ? 'ok' : `no — ${parsed.code}`) : '—'}
        />
        <Row
          label="Validate"
          value={validated ? (validated.ok ? 'ok (static key)' : `no — ${validated.code}`) : '—'}
        />
        <Row label="Merchant" value={parsed?.ok ? parsed.merchantName : '—'} />
        <Row label="City" value={parsed?.ok ? parsed.merchantCity : '—'} />
        <Row label="Amount" value={parsed?.ok ? parsed.amount ?? '—' : '—'} />
        <Row label="TXID" value={parsed?.ok ? parsed.txid ?? '—' : '—'} />
        <Row label="PIX key" value={parsed?.ok ? parsed.pixKey ?? parsed.pixInitiationUrl ?? '—' : '—'} />
        <Row label="Key type" value={parsed?.ok ? parsed.pixKeyType ?? 'url' : '—'} />
      </section>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        Official source:{' '}
        <a href={BRCODE_OFFICIAL_SOURCE_URL} target="_blank" rel="noreferrer" style={{ color: '#7aa2ff' }}>
          Bacen — Manual BR Code
        </a>
      </p>

      {cliCommand && (
        <pre
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: 10,
            background: '#0f1528',
            border: '1px solid #24304d',
            overflow: 'auto',
            fontSize: '0.85rem',
          }}
        >
          {cliCommand}
        </pre>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '6rem 1fr', gap: '1rem', alignItems: 'start' }}>
      <span style={{ color: '#9aa5bd' }}>{label}</span>
      <code style={{ wordBreak: 'break-all' }}>{value}</code>
    </div>
  );
}
