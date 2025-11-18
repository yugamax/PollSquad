import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '../lib/auth-context'
import { ThemeProvider } from '../lib/theme-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const baloo = Geist({ subsets: ["latin"], variable: '--font-comic' });

export const metadata: Metadata = {
  title: 'PollSquad - Community Polling Platform',
  description: 'Vote, earn points, and boost your polls with PollSquad',
  generator: 'Next.js',
  icons: {
    icon: [
      {
        url: '/polledin.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/web_icon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/web_icon.png',
        type: 'image/svg+xml+png',
      },
    ],
    apple: '/web_icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('🌐 RootLayout rendering')
  
  return (
    <html lang="en">
      <body className={`font-sans antialiased min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            {console.log('🔗 AuthProvider wrapping children')}
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
