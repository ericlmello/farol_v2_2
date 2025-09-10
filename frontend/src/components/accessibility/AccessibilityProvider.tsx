'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation'

interface AccessibilityContextType {
  isVoiceModeActive: boolean
  isListening: boolean
  isSpeaking: boolean
  isMuted: boolean
  lastCommand: string
  commandHistory: string[]
  currentPage: string
  startListening: () => void
  stopListening: () => void
  toggleVoiceMode: () => void
  toggleMute: () => void
  speak: (text: string) => void
  describeCurrentPage: () => void
  handleVoiceCommand: (command: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

interface AccessibilityProviderProps {
  children: ReactNode
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const voiceNavigation = useVoiceNavigation()

  return (
    <AccessibilityContext.Provider value={voiceNavigation}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
