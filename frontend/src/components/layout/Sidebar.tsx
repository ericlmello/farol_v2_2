'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'


interface MenuItem {
  name: string
  href: string
  icon: React.ReactNode
  isActive?: boolean
}

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems: MenuItem[] = [
    {
      name: 'Boas-vindas',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      name: 'Perfil',
      href: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Home',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Vagas',
      href: '/jobs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    },
    {
      name: 'Selo Empresa Inclusiva',
      href: '/inclusive-company-seal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.955a11.955 11.955 0 0118 0 12.02 12.02 0 00-2.382-8.971z" />
        </svg>
      )
    },
    {
      name: 'Hub de Desenvolvimento',
      href: '/development-hub',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      name: 'Análise de Matches',
      href: '/matches',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'Entrevista',
      href: '/realtime-interview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Simulação Farol IA',
      href: '/simulation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Feedback',
      href: '/feedback',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    },
    {
      name: 'Teste de Acessibilidade',
      href: '/accessibility-test',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    }
  ]

  return (
    <div className={`fixed left-0 top-0 h-full bg-primary text-primary-foreground flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header with Toggle Button */}
      <div className="p-4 border-b border-primary-foreground/20 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">
              FAROL IA
            </h1>
            <p className="text-xs text-primary-foreground/80 mt-1">
              Plataforma de Carreiras
            </p>
          </div>
        )}
        <button
          onClick={() => {
            const newCollapsed = !isCollapsed
            setIsCollapsed(newCollapsed)
            onCollapseChange?.(newCollapsed)
          }}
          className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-foreground/20"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          <svg
            className={`w-5 h-5 text-primary-foreground transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-primary-foreground/20">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-foreground truncate">
                {user?.email || 'Usuário'}
              </p>
              <p className="text-xs text-primary-foreground/80 capitalize">
                {user?.user_type || 'candidate'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary-foreground/20 text-primary-foreground shadow-sm'
                  : 'text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground hover:shadow-sm hover:scale-105'
              } ${isCollapsed ? 'justify-center min-h-[48px]' : 'space-x-3'}`}
              title={isCollapsed ? item.name : undefined}
            >
              <div className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex items-center justify-center`}>
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-primary-foreground text-primary text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-primary/10">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-primary-foreground/20">
        <button
          onClick={() => {
            if (confirm('Tem certeza que deseja sair?')) {
              logout()
            }
          }}
          className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium text-primary-foreground/80 hover:bg-destructive hover:text-destructive-foreground hover:shadow-sm hover:scale-105 transition-all duration-200 group relative ${
            isCollapsed ? 'justify-center min-h-[48px]' : 'space-x-3'
          }`}
          title={isCollapsed ? 'Sair' : undefined}
        >
          <div className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex items-center justify-center`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          {!isCollapsed && <span>Sair</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-primary-foreground text-primary text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-primary/10">
              Sair
            </div>
          )}
        </button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-primary-foreground/20">
          <div className="text-xs text-primary-foreground/80 text-center">
            © 2025 Farol IA
          </div>
        </div>
      )}
    </div>
  )
}

