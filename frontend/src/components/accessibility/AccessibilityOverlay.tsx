'use client'

import React, { useState, useEffect } from 'react'
import { useAccessibility } from './AccessibilityProvider'
import { X, Volume2, VolumeX, Mic, MicOff, Eye, EyeOff } from 'lucide-react'

const AccessibilityOverlay: React.FC = () => {
  const {
    isVoiceModeActive,
    isListening,
    isSpeaking,
    isMuted,
    lastCommand,
    commandHistory,
    currentPage,
    startListening,
    stopListening,
    toggleVoiceMode,
    toggleMute,
    speak,
    describeCurrentPage,
  } = useAccessibility()

  const [showOverlay, setShowOverlay] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Mostrar overlay quando modo de voz estiver ativo
  useEffect(() => {
    if (isVoiceModeActive) {
      setShowOverlay(true)
    } else {
      setShowOverlay(false)
      setShowHelp(false)
    }
  }, [isVoiceModeActive])

  const speakHelp = () => {
    const helpText = `
      Comandos de voz disponíveis:
      - "Ir para [página]" ou "Navegar para [página]" para navegar
      - "Descrever" ou "O que tem aqui" para descrever a página
      - "Ajuda" para ouvir estes comandos
      - "Parar" ou "Sair" para parar o modo de voz
      - "Repetir" para repetir o último comando
      - "Botão [nome]" para clicar em um botão específico
      
      Páginas disponíveis:
      - "Início" ou "Home" para página inicial
      - "Simulação" ou "Entrevista" para configurar entrevista
      - "Histórico" para ver simulações anteriores
      - "Hub" ou "Desenvolvimento" para cursos
      - "Perfil" para seu perfil
      - "Configurações" para configurações
      - "Login" para fazer login
      - "Cadastro" para criar conta
    `
    speak(helpText)
  }

  if (!showOverlay) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Eye className="text-blue-600" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Modo de Voz Ativo</h2>
              <p className="text-sm text-gray-600">Navegação por voz para acessibilidade</p>
            </div>
          </div>
          <button
            onClick={() => setShowOverlay(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar overlay"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium">
                {isListening ? 'Ouvindo comandos...' : 'Aguardando comando'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium">
                {isSpeaking ? 'Falando...' : 'Silencioso'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMuted ? 'bg-gray-400' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">
                {isMuted ? 'Som desativado' : 'Som ativo'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium">Página: {currentPage}</span>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Controles</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? 'Parar Escuta' : 'Iniciar Escuta'}
            </button>
            
            <button
              onClick={toggleMute}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isMuted 
                  ? 'bg-gray-400 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              {isMuted ? 'Ativar Som' : 'Desativar Som'}
            </button>
            
            <button
              onClick={describeCurrentPage}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all font-medium"
            >
              <Eye size={18} />
              Descrever Página
            </button>
            
            <button
              onClick={speakHelp}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-all font-medium"
            >
              <Eye size={18} />
              Ouvir Ajuda
            </button>
          </div>
        </div>

        {/* Comandos */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Comandos de Voz</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">"Ir para [página]"</span>
              <span className="text-gray-600">Navegar para uma página</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">"Descrever"</span>
              <span className="text-gray-600">Descrever o conteúdo da página</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">"Ajuda"</span>
              <span className="text-gray-600">Ouvir todos os comandos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">"Parar"</span>
              <span className="text-gray-600">Parar o modo de voz</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">"Botão [nome]"</span>
              <span className="text-gray-600">Clicar em um botão específico</span>
            </div>
          </div>
        </div>

        {/* Histórico de comandos */}
        {commandHistory.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Últimos Comandos</h3>
            <div className="space-y-1">
              {commandHistory.slice(-5).map((cmd, index) => (
                <div key={index} className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Pressione ESC para fechar ou diga "parar" para desativar
            </div>
            <button
              onClick={() => setShowOverlay(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessibilityOverlay
