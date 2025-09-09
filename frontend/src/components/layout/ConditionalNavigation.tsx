'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation'
import { usePathname } from 'next/navigation'

export function ConditionalNavigation() {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  // Não mostrar Navigation em páginas que usam MainLayout (dashboard, etc.)
  const isMainLayoutPage = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/profile') ||
                          pathname.startsWith('/jobs') ||
                          pathname.startsWith('/voice-registration') ||
                          pathname.startsWith('/development-hub') ||
                          pathname.startsWith('/matches') ||
                          pathname.startsWith('/interview') ||
                          pathname.startsWith('/simulation') ||
                          pathname.startsWith('/feedback') ||
                          pathname.startsWith('/career-assistant') ||
                          pathname.startsWith('/interview-simulator')

  // Se estiver em uma página que usa MainLayout, não mostrar Navigation
  if (isMainLayoutPage) {
    return null
  }

  // Para páginas públicas (login, register, home), sempre mostrar Navigation
  return <Navigation />
}
