'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Eye, Loader2, Navigation, HelpCircle, Settings } from 'lucide-react'
import { voiceDescriptionService } from '@/services/voiceDescriptionService'
import { useAccessibility } from './AccessibilityProvider'

interface VoiceAssistantProps {
  className?: string
}

export default function VoiceAssistant({ className = '' }: VoiceAssistantProps) {
  // Usar contexto de acessibilidade integrado
  const accessibility = useAccessibility()
  
  // Estados locais específicos do assistente
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showWakeWordInfo, setShowWakeWordInfo] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Usar estados do contexto
  const {
    isListening,
    isMuted,
    lastCommand,
    isVoiceModeActive,
    startListening,
    stopListening,
    toggleMute,
    speak,
    describeCurrentPage: contextDescribePage,
    toggleVoiceMode,
    handleVoiceCommand
  } = accessibility

  // Ativar modo de voz automaticamente ao inicializar
  useEffect(() => {
    if (!isVoiceModeActive) {
      toggleVoiceMode()
    }
  }, [])

  // Função integrada para descrição de página com fallback
  const enhancedDescribePage = useCallback(async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    speak('Descrevendo a página atual...')
    
    try {
      // Tentar usar o serviço de descrição avançado
      const currentUrl = window.location.href
      const data = await voiceDescriptionService.describePage(currentUrl)
      
      if (data.audio_url) {
        // Reproduzir áudio gerado
        const audio = new Audio(data.audio_url)
        audioRef.current = audio
        
        audio.onloadstart = () => {
          speak('Carregando descrição...')
        }
        
        audio.oncanplaythrough = () => {
          audio.play()
        }
        
        audio.onended = () => {
          speak('Descrição concluída.')
        }
        
        audio.onerror = (error) => {
          console.error('Erro ao reproduzir áudio:', error)
          speak('Erro ao reproduzir áudio. Usando descrição textual.')
          // Fallback para descrição do contexto
          contextDescribePage()
        }
      } else {
        // Fallback para descrição do contexto
        contextDescribePage()
      }
    } catch (error) {
      console.error('Erro ao descrever página:', error)
      
      // Fallback para descrição do contexto
      speak('Usando descrição básica da página...')
      contextDescribePage()
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, speak, contextDescribePage])

  // Função de ajuda integrada
  const showHelp = useCallback(() => {
    const helpText = `
      Assistente de Voz Farol - Comandos disponíveis:
      - "Descrever página" ou "Descreva a página" para obter uma descrição completa
      - "Ajuda" ou "Comandos" para ouvir esta lista
      - "Parar" ou "Sair" para parar a escuta
      - "Ir para [página]" para navegar
      - "Botão [nome]" para clicar em botões
      
      Páginas disponíveis:
      - "Início" para página inicial
      - "Perfil" para seu perfil
      - "Simulação" para entrevistas
      - "Desenvolvimento" para cursos
    `
    speak(helpText)
    setShowWakeWordInfo(false)
  }, [speak])

  // Funções de controle da interface
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded)
    setShowWakeWordInfo(false)
  }, [isExpanded])

  const toggleWakeWordInfo = useCallback(() => {
    setShowWakeWordInfo(!showWakeWordInfo)
  }, [showWakeWordInfo])

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Botão principal flutuante */}
      <div className="relative">
        <button
          onClick={toggleExpanded}
          className={`
            w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : isProcessing 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            }
            ${isExpanded ? 'scale-110' : 'scale-100'}
          `}
          aria-label="Assistente de voz"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : isListening ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <Eye className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Indicador de status */}
        {isListening && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
        )}
      </div>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Assistente de Voz
            </h3>
            
            {/* Status */}
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {isListening ? '🎤 Escutando...' : isProcessing ? '⚙️ Processando...' : '👁️ Pronto'}
            </div>

            {/* Último comando */}
            {lastCommand && (
              <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                Último comando: "{lastCommand}"
              </div>
            )}

            {/* Controles */}
            <div className="flex space-x-2">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`
                  flex-1 px-3 py-2 rounded text-sm font-medium transition-colors
                  ${isListening 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }
                `}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 inline mr-1" />
                    Parar
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 inline mr-1" />
                    Escutar
                  </>
                )}
              </button>

              <button
                onClick={toggleMute}
                className={`
                  px-3 py-2 rounded text-sm font-medium transition-colors
                  ${isMuted 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }
                `}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Comando rápido */}
            <button
              onClick={enhancedDescribePage}
              disabled={isProcessing}
              className="w-full px-3 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 inline mr-1" />
                  Descrever Página
                </>
              )}
            </button>

            {/* Ajuda */}
            <button
              onClick={showHelp}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
            >
              Ajuda
            </button>

            {/* Informações do Wake Word */}
            <button
              onClick={toggleWakeWordInfo}
              className="w-full px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium transition-colors"
            >
              {showWakeWordInfo ? 'Ocultar' : 'Mostrar'} Wake Word
            </button>
          </div>
        </div>
      )}

      {/* Informações do Wake Word */}
      {showWakeWordInfo && (
        <div className="absolute bottom-20 right-0 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-lg p-3 w-64 border border-blue-200 dark:border-blue-700">
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <div className="font-semibold mb-1">Wake Word Ativo:</div>
            <div>Diga "Descrever página" para ativar</div>
            <div className="mt-1 text-blue-600 dark:text-blue-300">
              Funciona quando o botão está ativo
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
