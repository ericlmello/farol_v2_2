'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import '@/types/voice'

interface VoiceNavigationState {
  isListening: boolean
  isSpeaking: boolean
  isVoiceModeActive: boolean
  isMuted: boolean
  lastCommand: string
  commandHistory: string[]
  currentPage: string
}

interface VoiceNavigationActions {
  startListening: () => void
  stopListening: () => void
  toggleVoiceMode: () => void
  toggleMute: () => void
  speak: (text: string) => void
  describeCurrentPage: () => void
  handleVoiceCommand: (command: string) => void
}

export const useVoiceNavigation = (): VoiceNavigationState & VoiceNavigationActions => {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [lastCommand, setLastCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState('')
  
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
        
        recognitionInstance.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
          
          if (event.results[event.results.length - 1].isFinal) {
            handleVoiceCommand(transcript.toLowerCase().trim())
          }
        }
        
        recognitionInstance.onerror = (event) => {
          console.error('Erro no reconhecimento de voz:', event.error)
          setIsListening(false)
          speak('Desculpe, não consegui entender. Tente novamente.')
        }
        
        recognitionInstance.onend = () => {
          setIsListening(false)
        }
        
        recognitionRef.current = recognitionInstance
      }
      
      // Verificar suporte à síntese de voz
      if ('speechSynthesis' in window) {
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

  return {
    // Estado
    isListening,
    isSpeaking,
    isVoiceModeActive,
    isMuted,
    lastCommand,
    commandHistory,
    currentPage,
    
    // Ações
    startListening,
    stopListening,
    toggleVoiceMode,
    toggleMute,
    speak,
    describeCurrentPage,
    handleVoiceCommand,
  }
}
