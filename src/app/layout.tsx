import type { Metadata } from 'next';
import { Fredoka, Nunito, JetBrains_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import '@xyflow/react/dist/style.css';
import './globals.css';

const display = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['400', '500', '600', '700'],
});

const sans = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CloudCraft Studio — Design & Stress-Test Cloud Architectures',
  description:
    'A gamified cloud architecture game. Drag isometric cloud tiles, wire them together, run deterministic traffic simulations, and learn why systems fail.',
  keywords: ['cloud architecture', 'system design', 'learning game', 'devops', 'isometric'],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-app)] antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#FFF3DD',
              border: '1px solid #ECE0C8',
              color: '#1B1733',
              fontFamily: 'var(--font-nunito)',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}
