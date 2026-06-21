import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BR Validators Playground',
  description: 'Test Brazilian document validators — 100% client-side',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#0b1020', color: '#e8ecf4' }}>
        {children}
      </body>
    </html>
  );
}
