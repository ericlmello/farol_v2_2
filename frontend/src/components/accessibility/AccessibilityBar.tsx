'use client'

import React from 'react'
import { Mic, MicOff, Volume2, VolumeX, Navigation, Eye, EyeOff, HelpCircle } from 'lucide-react'
import { useAccessibility } from './AccessibilityProvider'

const AccessibilityBar: React.FC = () => {
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo e título */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye className="text-blue-600" size={24} />
              <span className="font-semibold text-gray-800">Farol Acessível</span>
            </div>
            {isVoiceModeActive && (
              <div className="text-sm text-blue-600 font-medium">
                Modo de Voz Ativo
              </div>
            )}
          </div>

          {/* Controles de acessibilidade */}
          <div className="flex items-center gap-2">
            {/* Botão principal de ativação */}
            <button
              onClick={toggleVoiceMode}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isVoiceModeActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={isVoiceModeActive ? 'Desativar modo de voz' : 'Ativar modo de voz'}
            >
              {isVoiceModeActive ? (
                <div className="flex items-center gap-2">
                  <EyeOff size={18} />
                  <span>Desativar Voz</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  <span>Ativar Voz</span>
                </div>
              )}
            </button>

            {/* Controles secundários */}
            {isVoiceModeActive && (
              <>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  aria-label={isListening ? 'Parar escuta' : 'Iniciar escuta'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                
                <button
                  onClick={toggleMute}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    isMuted 
                      ? 'bg-gray-400 text-white' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                
                <button
                  onClick={describeCurrentPage}
                  className="px-3 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all font-medium"
                  aria-label="Descrever página atual"
                >
                  <Navigation size={18} />
                </button>
                
                <button
                  onClick={speakHelp}
                  className="px-3 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-all font-medium"
                  aria-label="Ouvir ajuda"
                >
                  <HelpCircle size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status e informações */}
        {isVoiceModeActive && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <span>{isListening ? 'Ouvindo...' : 'Aguardando comando'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <span>{isSpeaking ? 'Falando...' : 'Silencioso'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-gray-400' : 'bg-green-500'}`}></div>
                  <span>{isMuted ? 'Som desativado' : 'Som ativo'}</span>
                </div>
              </div>
              
              {lastCommand && (
                <div className="text-gray-500 font-mono text-xs">
                  Último comando: "{lastCommand}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccessibilityBar
