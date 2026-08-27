import type { Metadata } from 'next'
import { Alumni_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import TopBar from '@/components/TopBar'
import IframeResizer from '@/components/IframeResizer'

const alumniSans = Alumni_Sans({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-alumni',
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Skate IQ Games',
  description: 'Daily skateboarding word and puzzle games',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`h-full ${alumniSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <IframeResizer />
            <TopBar />
            <main className="flex-1 flex flex-col">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
