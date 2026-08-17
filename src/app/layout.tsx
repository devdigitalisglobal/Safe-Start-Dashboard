import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Safe Start — Staff Portal',
  description: 'Reporting and content management for Safe Start for Young Drivers.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
