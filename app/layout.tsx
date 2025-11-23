import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tip Distribution Calculator',
  description: 'Calculate weekly tip distribution from uploaded reports',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
