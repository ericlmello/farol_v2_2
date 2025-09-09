'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui'
import Link from 'next/link'

export function Navigation() {
  const { user, isLoading, logout, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Farol
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Farol
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  {user?.user_type === 'candidate' && (
                    <>
                      <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/jobs">
                        <Button variant="ghost" size="sm">
                          Vagas
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-700">
                  Olá, {user?.email}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {user?.user_type}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={logout}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Criar Conta
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
