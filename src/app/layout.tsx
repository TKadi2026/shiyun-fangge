import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeInit } from '@/components/ThemeInit';
import { AchievementNotifier } from '@/components/AchievementNotifier';
import { ClickSound } from '@/components/ClickSound';

export const metadata: Metadata = {
  title: '诗韵方格 — 苏尔特方格 × 唐诗三百首',
  description: '将苏尔特方格专注力训练与唐诗三百首结合的 Web 训练应用',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeInit />
        <AchievementNotifier />
        <ClickSound />
        {children}
      </body>
    </html>
  );
}
