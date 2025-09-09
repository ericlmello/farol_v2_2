import { useState, useEffect } from 'react'
import { authService, type User } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Erro ao carregar usuário:', error)
          authService.logout()
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  const login = (token: string) => {
    authService.setToken(token)
    // Recarregar dados do usuário
    window.location.reload()
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
}
