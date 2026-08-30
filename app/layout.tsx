import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ironpath — RuneScape 3 Group Ironman Companion',
  description: 'Track Group Ironman HiScores, shared progression, repeatables, unlocks, supplies and milestones for RuneScape 3.',
  applicationName: 'Ironpath',
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
