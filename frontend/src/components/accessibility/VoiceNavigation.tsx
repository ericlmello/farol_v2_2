'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Mic, MicOff, Volume2, VolumeX, Navigation, Eye, EyeOff } from 'lucide-react'

interface VoiceNavigationProps {
  className?: string
}

interface VoiceCommand {
  command: string
  action: () => void
  description: string
}

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({ className = '' }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false)
  const [currentPage, setCurrentPage] = useState('')
  const [pageContent, setPageContent] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null)
  const [lastCommand, setLastCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  
  const router = useRouter()
  const pathname = usePathname()
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  // Inicializar APIs de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verificar suporte ao reconhecimento de voz
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'pt-BR'
        
        recognitionInstance.onstart = () => {
          setIsListening(true)
          speak('Estou ouvindo. Pode falar seu comando.')
        }
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
          
          if (event.results[event.results.length - 1].isFinal) {
            handleVoiceCommand(transcript.toLowerCase().trim())
          }
        }
        
        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Erro no reconhecimento de voz:', event.error)
          setIsListening(false)
          speak('Desculpe, não consegui entender. Tente novamente.')
        }
        
        recognitionInstance.onend = () => {
          setIsListening(false)
        }
        
        setRecognition(recognitionInstance)
        recognitionRef.current = recognitionInstance
      }
      
      // Verificar suporte à síntese de voz
      if ('speechSynthesis' in window) {
        setSynthesis(window.speechSynthesis)
        synthesisRef.current = window.speechSynthesis
      }
    }
  }, [])

  // Atualizar página atual
  useEffect(() => {
    setCurrentPage(pathname)
    if (isVoiceModeActive) {
      describeCurrentPage()
    }
  }, [pathname, isVoiceModeActive])

  // Função para falar texto
  const speak = useCallback((text: string) => {
    if (!synthesisRef.current || isMuted) return
    
    // Parar fala anterior
    synthesisRef.current.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    synthesisRef.current.speak(utterance)
  }, [isMuted])

  // Função para descrever a página atual
  const describeCurrentPage = useCallback(() => {
    const pageDescriptions: { [key: string]: string } = {
      '/': 'Página inicial do Farol. Aqui você pode acessar todas as funcionalidades principais.',
      '/simulation/start': 'Página de configuração de simulação de entrevista. Configure o tipo de entrevista, dificuldade e áreas de foco.',
      '/simulation/active': 'Página de entrevista ativa. Aqui você conversa com o entrevistador de IA.',
      '/simulation/history': 'Histórico de simulações. Veja todas as suas entrevistas anteriores.',
      '/development-hub': 'Hub de desenvolvimento. Acesse cursos e recursos de aprendizado.',
      '/profile': 'Seu perfil de usuário. Gerencie suas informações pessoais.',
      '/settings': 'Configurações da conta. Personalize sua experiência.',
      '/auth/login': 'Página de login. Faça login na sua conta.',
      '/auth/register': 'Página de cadastro. Crie uma nova conta.',
    }
    
    const description = pageDescriptions[pathname] || `Página: ${pathname}`
    speak(description)
    
    // Descrever elementos interativos da página
    setTimeout(() => {
      describePageElements()
    }, 2000)
  }, [pathname, speak])

  // Função para descrever elementos da página
  const describePageElements = useCallback(() => {
    const buttons = document.querySelectorAll('button')
    const links = document.querySelectorAll('a')
    const inputs = document.querySelectorAll('input, textarea, select')
    
    let elementsDescription = ''
    
    if (buttons.length > 0) {
      elementsDescription += `Esta página tem ${buttons.length} botões. `
    }
    
    if (links.length > 0) {
      elementsDescription += `${links.length} links. `
    }
    
    if (inputs.length > 0) {
      elementsDescription += `${inputs.length} campos de entrada. `
    }
    
    if (elementsDescription) {
      speak(elementsDescription)
    }
  }, [speak])

  // Função para processar comandos de voz
  const handleVoiceCommand = useCallback((command: string) => {
    setLastCommand(command)
    setCommandHistory(prev => [...prev.slice(-4), command])
    
    // Comandos de navegação
    if (command.includes('ir para') || command.includes('navegar para')) {
      const page = extractPageFromCommand(command)
      if (page) {
        navigateToPage(page)
      } else {
        speak('Para onde você gostaria de ir? Diga o nome da página.')
      }
      return
    }
    
    // Comandos de descrição
    if (command.includes('descrever') || command.includes('o que tem') || command.includes('conteúdo')) {
      describeCurrentPage()
      return
    }
    
    // Comandos de ajuda
    if (command.includes('ajuda') || command.includes('comandos')) {
      speakHelp()
      return
    }
    
    // Comandos de controle
    if (command.includes('parar') || command.includes('sair')) {
      stopListening()
      return
    }
    
    // Comandos de repetição
    if (command.includes('repetir') || command.includes('novamente')) {
      if (commandHistory.length > 0) {
        const lastCmd = commandHistory[commandHistory.length - 1]
        handleVoiceCommand(lastCmd)
      }
      return
    }
    
    // Comandos de elementos específicos
    if (command.includes('botão') || command.includes('clicar')) {
      handleElementCommand(command)
      return
    }
    
    // Comando não reconhecido
    speak('Comando não reconhecido. Diga "ajuda" para ver os comandos disponíveis.')
  }, [commandHistory, describeCurrentPage, speak])

  // Função para extrair página do comando
  const extractPageFromCommand = (command: string): string | null => {
    const pageMappings: { [key: string]: string } = {
      'início': '/',
      'home': '/',
      'página inicial': '/',
      'simulação': '/simulation/start',
      'entrevista': '/simulation/start',
      'histórico': '/simulation/history',
      'hub': '/development-hub',
      'desenvolvimento': '/development-hub',
      'perfil': '/profile',
      'configurações': '/settings',
      'login': '/auth/login',
      'cadastro': '/auth/register',
      'registro': '/auth/register',
    }
    
    for (const [keyword, path] of Object.entries(pageMappings)) {
      if (command.includes(keyword)) {
        return path
      }
    }
    
    return null
  }

  // Função para navegar para uma página
  const navigateToPage = useCallback((path: string) => {
    speak(`Navegando para ${path}`)
    router.push(path)
  }, [router, speak])

  // Função para falar ajuda
  const speakHelp = useCallback(() => {
    const helpText = `
      Comandos disponíveis:
      - "Ir para [página]" ou "Navegar para [página]" para navegar
      - "Descrever" ou "O que tem aqui" para descrever a página
      - "Ajuda" para ouvir estes comandos
      - "Parar" ou "Sair" para parar o modo de voz
      - "Repetir" para repetir o último comando
      - "Botão [nome]" para clicar em um botão específico
    `
    speak(helpText)
  }, [speak])

  // Função para lidar com comandos de elementos
  const handleElementCommand = useCallback((command: string) => {
    const buttons = document.querySelectorAll('button')
    const links = document.querySelectorAll('a')
    
    // Procurar por botão ou link que corresponda ao comando
    const allElements = [...buttons, ...links]
    
    for (const element of allElements) {
      const text = element.textContent?.toLowerCase() || ''
      const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || ''
      
      if (text.includes(command) || ariaLabel.includes(command)) {
        speak(`Clicando em ${text || ariaLabel}`)
        element.click()
        return
      }
    }
    
    speak('Elemento não encontrado. Tente ser mais específico.')
  }, [speak])

  // Função para iniciar escuta
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }, [isListening])

  // Função para parar escuta
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  // Função para alternar modo de voz
  const toggleVoiceMode = useCallback(() => {
    const newMode = !isVoiceModeActive
    setIsVoiceModeActive(newMode)
    
    if (newMode) {
      speak('Modo de voz ativado. Diga "ajuda" para ver os comandos disponíveis.')
      setTimeout(() => {
        describeCurrentPage()
      }, 1000)
    } else {
      speak('Modo de voz desativado.')
      stopListening()
    }
  }, [isVoiceModeActive, speak, describeCurrentPage, stopListening])

  // Função para alternar mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
    }
  }, [isMuted])

  return (
    <div className={`voice-navigation ${className}`}>
      {/* Controles principais */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
        <button
          onClick={toggleVoiceMode}
          className={`p-2 rounded-full transition-colors ${
            isVoiceModeActive 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-label={isVoiceModeActive ? 'Desativar modo de voz' : 'Ativar modo de voz'}
        >
          {isVoiceModeActive ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        
        {isVoiceModeActive && (
          <>
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
              aria-label={isListening ? 'Parar escuta' : 'Iniciar escuta'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              onClick={toggleMute}
              className={`p-2 rounded-full transition-colors ${
                isMuted 
                  ? 'bg-gray-400 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <button
              onClick={describeCurrentPage}
              className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              aria-label="Descrever página atual"
            >
              <Navigation size={20} />
            </button>
          </>
        )}
      </div>
      
      {/* Status do modo de voz */}
      {isVoiceModeActive && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <div>Modo de voz: <span className="font-semibold">Ativo</span></div>
            <div>Status: {isListening ? 'Ouvindo...' : 'Aguardando comando'}</div>
            {lastCommand && (
              <div>Último comando: <span className="font-mono text-xs">{lastCommand}</span></div>
            )}
          </div>
        </div>
      )}
      
      {/* Instruções para usuários */}
      {isVoiceModeActive && (
        <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">
            Comandos de Voz Disponíveis:
          </h3>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• "Ir para [página]" - Navegar para uma página</li>
            <li>• "Descrever" - Descrever o conteúdo da página</li>
            <li>• "Ajuda" - Ouvir todos os comandos</li>
            <li>• "Parar" - Parar o modo de voz</li>
            <li>• "Botão [nome]" - Clicar em um botão específico</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default VoiceNavigation
