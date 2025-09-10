import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'
import AccessibilityBar from '@/components/accessibility/AccessibilityBar'
import AccessibilityOverlay from '@/components/accessibility/AccessibilityOverlay'
import VoiceAssistant from '@/components/accessibility/VoiceAssistant'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Farol - Plataforma de Carreiras',
  description: 'Conectando talentos com oportunidades',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
        <AccessibilityProvider>
          <AccessibilityBar />
          <AccessibilityOverlay />
          <VoiceAssistant />
          <div className="pt-16">
            {children}
          </div>
        </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
