'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function SimulationActivePage() {
  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Simulação de Entrevista Ativa
          </h1>
          <p className="text-muted-foreground mb-8">
            Esta página está em desenvolvimento. Em breve você poderá praticar entrevistas com IA.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Funcionalidades Planejadas:
            </h2>
            <ul className="text-blue-800 space-y-2">
              <li>• Perguntas personalizadas baseadas no seu perfil</li>
              <li>• Análise de respostas em tempo real</li>
              <li>• Feedback detalhado sobre performance</li>
              <li>• Gravação de áudio para análise posterior</li>
              <li>• Simulação de diferentes tipos de entrevista</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

