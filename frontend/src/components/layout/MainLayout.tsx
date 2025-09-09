'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 bg-blue-50 overflow-y-auto">
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  )
}
