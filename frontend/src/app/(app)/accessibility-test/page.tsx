'use client'

import React from 'react'
import VoiceNavigationTest from '@/components/accessibility/VoiceNavigationTest'

const AccessibilityTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <VoiceNavigationTest />
      </div>
    </div>
  )
}

export default AccessibilityTestPage
