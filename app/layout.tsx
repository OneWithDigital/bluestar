import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';
const serif = Fraunces({ variable: '--font-editorial', subsets: ['latin'] });
const sans = DM_Sans({ variable: '--font-body', subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Blue Star Barns | Coffee & Bikes',
  description:
    'Good coffee. Great rides. A private website and bike reservation demonstration for Blue Star Barns in Saugatuck, Michigan.',
  icons: { icon: '/favicon.svg' },
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={serif.variable + ' ' + sans.variable}>{children}</body>
    </html>
  );
}
