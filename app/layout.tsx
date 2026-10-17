import type { Metadata } from 'next';
import './globals.css';
import './header.css';
import './themes.css';
import './dashboard.css';
import './distractions.css';
import './dark-system.css';
import './landing.css';
import './fonts.css';
import './brand-logo.css';
import './progression.css';
import FontPreferences from './font-preferences';

const fontBootScript = `
  try {
    const savedFont = localStorage.getItem('ironpath-font');
    document.documentElement.dataset.font = ['original', 'comfortaa', 'quicksand', 'nunito', 'manrope', 'outfit'].includes(savedFont) ? savedFont : ['rajdhani', 'space'].includes(savedFont) ? 'comfortaa' : 'original';
  } catch {
    document.documentElement.dataset.font = 'original';
  }
`;


export const metadata: Metadata = {
  title: "Ironpath — RuneScape 3 Group Ironman Companion",
  description: 'Track Group Ironman HiScores, shared progression, distractions and diversions, unlocks, supplies and milestones for RuneScape 3.',
  applicationName: "Ironpath",
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  icons: { icon: '/ironpath-zaros-512.png', apple: '/ironpath-zaros-192.png' },
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
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: fontBootScript }} />
      </head>
      <body>{children}<FontPreferences /></body>
    </html>
  );
}
