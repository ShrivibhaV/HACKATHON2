import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ProfileProvider } from '@/lib/profile-context'
import { Navigation } from '@/components/Navigation'
import { AgeAppropriateWrapper } from '@/components/learn/AgeAppropriateWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeuroLearn – Adaptive Learning for Every Mind',
  description: 'AI-powered adaptive learning for dyslexia, ADHD, and neurodivergent students. Personalised, gamified, and beautiful.',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Lexend', system-ui, sans-serif" }}>
        <ProfileProvider>
          <AgeAppropriateWrapper>
            <Navigation />
            {children}
          </AgeAppropriateWrapper>
        </ProfileProvider>
        <Analytics />
      </body>
    </html>
  )
}

