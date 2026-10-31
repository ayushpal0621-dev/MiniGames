import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SoundProvider } from '@/components/providers/SoundProvider';
import { PlayerProvider } from '@/components/providers/PlayerProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://pixelplay.gg'),
  title: {
    default: 'PIXELPLAY — Small Games. Big Scores.',
    template: '%s | PIXELPLAY',
  },
  description:
    'Four tiny games. One goal: beat your best score. Play One Pixel, 0.001 Second, Memory 5, and Don\'t Trust the UI.',
  keywords: [
    'browser games',
    'mini games',
    'pixel game',
    'reflex game',
    'memory game',
    'arcade',
    'casual games',
    'online games',
  ],
  authors: [{ name: 'PIXELPLAY' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixelplay.gg',
    siteName: 'PIXELPLAY',
    title: 'PIXELPLAY — Small Games. Big Scores.',
    description:
      'Four tiny games. One goal: beat your best score. Challenge your friends and climb the leaderboard.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PIXELPLAY - Small Games. Big Scores.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PIXELPLAY — Small Games. Big Scores.',
    description: 'Four tiny games. One goal: beat your best score.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5397000816419287"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-surface-950 text-surface-50 font-sans antialiased">
        <PlayerProvider>
          <SoundProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
          </SoundProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}