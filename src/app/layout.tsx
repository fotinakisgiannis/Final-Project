import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'NutriTrack AI', template: '%s | NutriTrack AI' },
  description: 'The fastest AI nutrition tracker with intelligent coaching.',
  keywords: ['nutrition', 'calorie tracker', 'AI food recognition', 'macro tracking', 'diet app'],
  authors: [{ name: 'NutriTrack AI' }],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'NutriTrack AI' },
  openGraph: {
    type: 'website',
    title: 'NutriTrack AI',
    description: 'AI-powered nutrition tracking. Log meals in under 5 seconds.',
    siteName: 'NutriTrack AI',
  },
};

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', background: '#1f2937', color: '#fff', fontSize: '14px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
