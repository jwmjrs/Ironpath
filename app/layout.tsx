import type { Metadata } from 'next';
import './globals.css';
import './header.css';
import './themes.css';

const themeBootScript = `
  try {
    const savedTheme = localStorage.getItem('ironpath-theme');
    const themes = ['classic', 'necromancy', 'infernal-wilderness'];
    document.documentElement.dataset.theme = themes.includes(savedTheme) ? savedTheme : 'necromancy';
  } catch {
    document.documentElement.dataset.theme = 'necromancy';
  }
`;

export const metadata: Metadata = {
  title: "Ironpath — RuneScape 3 Group Ironman Companion",
  description: 'Track Group Ironman HiScores, shared progression, distractions and diversions, unlocks, supplies and milestones for RuneScape 3.',
  applicationName: "Ironpath",
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  icons: { icon: '/ironpath-mark-v2.png', apple: '/ironpath-mark-v2.png' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      data-theme="necromancy"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
