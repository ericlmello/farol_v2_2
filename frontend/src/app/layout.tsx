import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'
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
          <VoiceAssistant />
          <div>
            {children}
          </div>
        </AccessibilityProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
