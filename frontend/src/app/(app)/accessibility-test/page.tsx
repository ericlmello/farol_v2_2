'use client'

import React from 'react'
import { TestTube, Mic, Eye, Volume2, CheckCircle } from 'lucide-react'

const AccessibilityTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <TestTube className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-800">Teste de Acessibilidade</h1>
          </div>

          {/* Informações sobre o assistente de voz */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Assistente de Voz Integrado
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-medium text-green-800">Sistema Ativo</span>
                </div>
                <p className="text-green-700 text-sm">
                  O assistente de voz está funcionando no botão flutuante no canto inferior direito.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-800">Funcionalidades:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mic className="text-blue-600" size={16} />
                    <span className="text-sm">Reconhecimento de voz em português</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="text-purple-600" size={16} />
                    <span className="text-sm">Descrição inteligente de páginas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="text-green-600" size={16} />
                    <span className="text-sm">Síntese de voz natural</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Como Testar:</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Clique no botão flutuante no canto inferior direito</li>
                  <li>Clique em "Escutar" para ativar o reconhecimento</li>
                  <li>Diga "Descrever página" para ouvir a descrição</li>
                  <li>Diga "Ajuda" para ouvir todos os comandos</li>
                  <li>Diga "Ir para início" para testar navegação</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Comandos Principais:</h4>
                <div className="space-y-1 text-sm text-yellow-700">
                  <div><code className="bg-yellow-100 px-1 rounded">"Descrever página"</code> - Descreve o conteúdo</div>
                  <div><code className="bg-yellow-100 px-1 rounded">"Ir para [página]"</code> - Navega para página</div>
                  <div><code className="bg-yellow-100 px-1 rounded">"Ajuda"</code> - Lista todos os comandos</div>
                  <div><code className="bg-yellow-100 px-1 rounded">"Parar"</code> - Para a escuta</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              💡 Use o assistente de voz para navegar por toda a plataforma de forma acessível
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessibilityTestPage
