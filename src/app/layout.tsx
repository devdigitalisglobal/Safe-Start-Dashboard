import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Safe Start — Staff Portal',
  description: 'Reporting and content management for Safe Start for Young Drivers.',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
