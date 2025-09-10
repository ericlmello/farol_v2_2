'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Eye, Loader2 } from 'lucide-react'
import { voiceDescriptionService } from '@/services/voiceDescriptionService'

interface VoiceAssistantProps {
  className?: string
}

export default function VoiceAssistant({ className = '' }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [lastCommand, setLastCommand] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'pt-BR'
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
            .toLowerCase()
          
          setLastCommand(transcript)
          handleVoiceCommand(transcript)
        }

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Erro no reconhecimento:', event.error)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
        recognitionRef.current = recognitionInstance
      }
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (isMuted || !text) return
    
    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Usar síntese de voz nativa como fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }, [isMuted])

  const handleVoiceCommand = useCallback(async (command: string) => {
    console.log('Comando recebido:', command)
    
    // Comandos de wake word
    if (command.includes('descrever') || command.includes('descreva') || command.includes('falar sobre a página')) {
      await describeCurrentPage()
    } else if (command.includes('ajuda') || command.includes('comandos')) {
      showHelp()
    } else if (command.includes('parar') || command.includes('sair')) {
      stopListening()
    }
  }, [])

  const describeCurrentPage = useCallback(async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    speak('Descrevendo a página atual...')
    
    try {
      const currentUrl = window.location.href
      const data = await voiceDescriptionService.describePage(currentUrl)
      
      if (data.audio_url) {
        // Reproduzir áudio gerado
        const audio = new Audio(data.audio_url)
        audioRef.current = audio
        audio.play()
        
        audio.onended = () => {
          speak('Descrição concluída.')
        }
      } else {
        // Fallback para síntese de voz nativa
        speak(data.descricao || 'Erro ao gerar descrição da página.')
      }
    } catch (error) {
      console.error('Erro ao descrever página:', error)
      speak('Desculpe, não foi possível descrever a página no momento.')
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, speak])

  const showHelp = useCallback(() => {
    const helpText = `
      Comandos disponíveis:
      - "Descrever página" ou "Descreva a página" para obter uma descrição completa
      - "Ajuda" ou "Comandos" para ouvir esta lista
      - "Parar" ou "Sair" para parar a escuta
    `
    speak(helpText)
  }, [speak])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
      setIsListening(true)
      speak('Escutando...')
    }
  }, [isListening, speak])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      speak('Parando escuta.')
    }
  }, [isListening, speak])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    speechSynthesis.cancel()
  }, [isMuted])

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded)
  }, [isExpanded])

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
              onClick={describeCurrentPage}
              disabled={isProcessing}
              className="w-full px-3 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processando...' : 'Descrever Página'}
            </button>

            {/* Ajuda */}
            <button
              onClick={showHelp}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
            >
              Ajuda
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
