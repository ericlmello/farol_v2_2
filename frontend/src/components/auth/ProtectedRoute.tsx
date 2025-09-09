'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
  requireAuth?: boolean
  allowedUserTypes?: ('candidate' | 'company' | 'admin')[]
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
  requireAuth = true,
  allowedUserTypes
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // Usar useEffect para redirecionamentos seguros
  useEffect(() => {
    // Aguardar o carregamento inicial da autenticação
    if (isLoading) return

    // Se a rota requer autenticação e o usuário não está autenticado
    if (requireAuth && !isAuthenticated) {
      console.log('🔒 Usuário não autenticado, redirecionando para login...')
      router.push(redirectTo)
      return
    }

    // Se há restrições de tipo de usuário (admin tem acesso total)
    if (allowedUserTypes && user && user.user_type !== 'admin' && !allowedUserTypes.includes(user.user_type)) {
      console.log('🚫 Usuário não tem permissão, redirecionando para dashboard...')
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, isLoading, user, requireAuth, allowedUserTypes, redirectTo, router])

  // 1. PRIMEIRO: Condição de Carregamento
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
      )
    )
  }

  // 2. SEGUNDO: Condição de Não Autenticado
  if (requireAuth && !isAuthenticated) {
    return null // Não renderizar nada enquanto redireciona
  }

  // 3. TERCEIRO: Verificação de Tipo de Usuário (admin tem acesso total)
  if (allowedUserTypes && user && user.user_type !== 'admin' && !allowedUserTypes.includes(user.user_type)) {
    return null // Não renderizar nada enquanto redireciona
  }

  // 4. FINALMENTE: Condição de Sucesso - Renderizar o conteúdo
  return <>{children}</>
}

// Componente para rotas que só devem ser acessadas por usuários não autenticados
export function PublicRoute({
  children,
  redirectTo = '/dashboard'
}: {
  children: ReactNode
  redirectTo?: string
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Não renderizar nada enquanto redireciona
  }

  return <>{children}</>
}

// Hook para verificar se o usuário pode acessar uma rota
export function useCanAccess(allowedUserTypes?: ('candidate' | 'company' | 'admin')[]) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return false
  }

  if (!allowedUserTypes) {
    return true
  }

  return allowedUserTypes.includes(user.user_type)
}
