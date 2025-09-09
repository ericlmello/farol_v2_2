'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { FarolAssistant } from '@/components/FarolAssistant'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar retrátil à esquerda */}
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      
      {/* Área de conteúdo principal */}
      <main className={`flex-1 bg-background p-0 overflow-auto transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {children}
      </main>
      
      {/* Assistente de voz Farol - apenas na área logada */}
      <FarolAssistant />
    </div>
  )
}

