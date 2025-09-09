'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { voiceService } from '@/lib/voice'
import { wakeWordService, WakeWordDetection } from '@/lib/wakeWord'

// Estados do assistente
type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

// Tipos de intenção
type Intent = 'navigate' | 'search_jobs' | 'describe_screen' | 'profile' | 'matches' | 'interviews' | 'simulations' | 'development_hub' | 'help' | 'schedule_interview' | 'update_profile' | 'search_courses' | 'unrecognized'

interface VoiceCommand {
  intent: Intent
  entities: Record<string, any>
  original_transcript: string
}

export function FarolAssistant() {
  const router = useRouter()
  
  // Estados principais
  const [state, setState] = useState<AssistantState>('idle')
  const [transcript, setTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false)
  const [wakeWordDetected, setWakeWordDetected] = useState(false)
  const [isWakeWordActive, setIsWakeWordActive] = useState(false) // Estado para controlar se o wake word está ativo
  
  // Refs para MediaRecorder e controles
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // useEffect para inicialização única do wake word
  useEffect(() => {
    let isMounted = true

    const initializeServices = async () => {
      try {
        // Verificar suporte para MediaRecorder
        if (typeof window !== 'undefined' && window.MediaRecorder) {
          setIsSupported(true)
        } else {
          console.warn('⚠️ MediaRecorder não suportado neste navegador')
          return
        }

        // Verificar se o wake word já está ativo para evitar inicializações duplicadas
        if (isWakeWordActive) {
          console.log('🔄 Wake word já está ativo, pulando inicialização')
          return
        }

        // Inicializar wake word detection apenas uma vez
        if (wakeWordService.isAvailable() && !isWakeWordActive) {
          console.log('🔄 Inicializando wake word detection...')
          setIsWakeWordActive(true)
          setWakeWordEnabled(true)
          
          // Iniciar escuta contínua
          const success = await wakeWordService.startListening((detection: WakeWordDetection) => {
            if (isMounted) {
              console.log('🎯 Wake word detectada:', detection)
              setWakeWordDetected(true)
              speakResponse('Olá! Como posso ajudar?')
              
              // Auto-iniciar captura de áudio após wake word
              setTimeout(() => {
                if (isMounted) {
                  startListening()
                }
              }, 1000)
            }
          })

          if (!success) {
            console.warn('⚠️ Falha ao inicializar wake word detection')
            setIsWakeWordActive(false)
            setWakeWordEnabled(false)
          } else {
            console.log('✅ Wake word detection inicializado com sucesso')
          }
        } else {
          console.warn('⚠️ Wake word detection não disponível')
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar serviços:', error)
        if (isMounted) {
          setIsWakeWordActive(false)
          setWakeWordEnabled(false)
        }
      }
    }

    initializeServices()

    // Função de limpeza
    return () => {
      isMounted = false
      
      // Cleanup de recursos de áudio
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Cleanup do wake word service
      if (isWakeWordActive) {
        console.log('🧹 Limpando wake word service...')
        wakeWordService.cleanup()
        setIsWakeWordActive(false)
      }
    }
  }, []) // Array de dependências vazio para execução única


  /**
   * Inicia a captura de áudio
   */
  const startListening = async () => {
    // Verificar se já está em processo de escuta para evitar chamadas duplicadas
    if (state === 'listening' || state === 'processing' || state === 'speaking') {
      console.log('🔄 Já está em processo de escuta, ignorando chamada duplicada')
      return
    }

    try {
      setState('listening')
      setTranscript('')
      setErrorMessage('')
      audioChunksRef.current = []

      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream

      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder

      // Event listeners
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        await processAudio()
      }

      mediaRecorder.onerror = (event) => {
        console.error('❌ Erro no MediaRecorder:', event)
        setState('error')
        setErrorMessage('Erro ao gravar áudio')
      }

      // Iniciar gravação
      mediaRecorder.start(100) // Coletar dados a cada 100ms

      // Timeout de 10 segundos
      timeoutRef.current = setTimeout(() => {
        if (state === 'listening') {
          stopListening()
          speakResponse('Tempo limite atingido. Tente novamente.')
        }
      }, 10000)

      console.log('🎤 Iniciando captura de áudio...')

    } catch (error: any) {
      console.error('❌ Erro ao iniciar captura:', error)
      setState('error')
      
      if (error.name === 'NotAllowedError') {
        setErrorMessage('Permissão negada para usar o microfone')
        speakResponse('Permissão negada para usar o microfone. Verifique as configurações do navegador.')
      } else if (error.name === 'NotFoundError') {
        setErrorMessage('Microfone não encontrado')
        speakResponse('Microfone não encontrado. Verifique se há um microfone conectado.')
      } else {
        setErrorMessage('Erro ao acessar o microfone')
        speakResponse('Erro ao acessar o microfone. Tente novamente.')
      }
    }
  }

  /**
   * Para a captura de áudio
   */
  const stopListening = () => {
    console.log('🔇 Parando captura de áudio...')
    
    // Parar MediaRecorder se estiver ativo
    if (mediaRecorderRef.current && state === 'listening') {
      try {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      } catch (error) {
        console.warn('⚠️ Erro ao parar MediaRecorder:', error)
      }
    }
    
    // Parar todas as tracks do stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('🔇 Track parada:', track.kind)
      })
      streamRef.current = null
    }
    
    // Limpar timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Resetar estado se estiver escutando
    if (state === 'listening') {
      setState('idle')
    }
  }

  /**
   * Processa o áudio capturado
   */
  const processAudio = async () => {
    try {
      setState('processing')
      
      // Criar blob do áudio
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      
      if (audioBlob.size === 0) {
        throw new Error('Nenhum áudio foi capturado')
      }

      console.log('🎵 Processando áudio...', audioBlob.size, 'bytes')

      // Etapa 1: Transcrever com Whisper
      console.log('📝 Transcrevendo com Whisper...')
      const transcribeResponse = await voiceService.transcribeAudio(audioBlob)
      
      if (!transcribeResponse.success) {
        throw new Error('Erro na transcrição')
      }

      const transcriptText = transcribeResponse.transcript
      setTranscript(transcriptText)
      console.log('✅ Transcrição:', transcriptText)

      // Etapa 2: Interpretar intenção com GPT-4o-mini
      console.log('🧠 Interpretando intenção...')
      const interpretResponse = await voiceService.interpretIntent(transcriptText)
      
      if (!interpretResponse.success) {
        throw new Error('Erro na interpretação')
      }

      const command: VoiceCommand = {
        intent: interpretResponse.intent as Intent,
        entities: interpretResponse.entities,
        original_transcript: interpretResponse.original_transcript
      }

      console.log('✅ Comando interpretado:', command)

      // Etapa 3: Executar comando
      await executeCommand(command)

    } catch (error: any) {
      console.error('❌ Erro no processamento:', error)
      setState('error')
      setErrorMessage(error.message || 'Erro ao processar comando de voz')
      speakResponse('Desculpe, houve um erro ao processar seu comando. Tente novamente.')
    }
  }

  /**
   * Executa o comando interpretado
   */
  const executeCommand = async (command: VoiceCommand) => {
    try {
      console.log('⚡ Executando comando:', command.intent)

      switch (command.intent) {
        case 'navigate':
          await handleNavigation(command.entities)
          break

        case 'search_jobs':
          await handleJobSearch(command.entities)
          break

        case 'describe_screen':
          await handleScreenDescription()
          break

        case 'help':
          await handleHelp()
          break

        case 'schedule_interview':
          await handleScheduleInterview(command.entities)
          break

        case 'update_profile':
          await handleUpdateProfile(command.entities)
          break

        case 'search_courses':
          await handleSearchCourses(command.entities)
          break

        case 'unrecognized':
          speakResponse('Desculpe, não entendi o comando. Tente dizer "ajuda" para ver os comandos disponíveis.')
          break

        default:
          speakResponse('Comando não implementado ainda. Tente dizer "ajuda" para ver os comandos disponíveis.')
      }

      setState('idle')

    } catch (error: any) {
      console.error('❌ Erro na execução:', error)
      setState('error')
      setErrorMessage(error.message || 'Erro ao executar comando')
      speakResponse('Erro ao executar comando. Tente novamente.')
    }
  }

  /**
   * Manipula comandos de navegação
   */
  const handleNavigation = async (entities: Record<string, any>) => {
    const destination = entities.destination
    
    if (destination) {
      const destinationMessages: Record<string, string> = {
        '/jobs': 'Navegando para a seção de vagas...',
        '/profile': 'Abrindo seu perfil...',
        '/matches': 'Abrindo análise de matches...',
        '/simulation': 'Abrindo simulações...',
        '/realtime-interview': 'Abrindo entrevistas agendadas...',
        '/development-hub': 'Abrindo hub de desenvolvimento...',
        '/dashboard': 'Voltando ao dashboard...'
      }

      const message = destinationMessages[destination] || 'Navegando...'
      speakResponse(message)
      router.push(destination)
    } else {
      speakResponse('Para onde você gostaria de navegar?')
    }
  }

  /**
   * Manipula busca de vagas
   */
  const handleJobSearch = async (entities: Record<string, any>) => {
    const { job_title, location, company, experience_level } = entities
    
    let searchMessage = 'Buscando vagas'
    
    if (job_title) searchMessage += ` de ${job_title}`
    if (location) searchMessage += ` em ${location}`
    if (company) searchMessage += ` na empresa ${company}`
    if (experience_level) searchMessage += ` para nível ${experience_level}`
    
    searchMessage += '...'
    
    speakResponse(searchMessage)
    
    // Navegar para jobs com parâmetros de busca
    const searchParams = new URLSearchParams()
    if (job_title) searchParams.set('title', job_title)
    if (location) searchParams.set('location', location)
    if (company) searchParams.set('company', company)
    if (experience_level) searchParams.set('experience', experience_level)
    
    const queryString = searchParams.toString()
    router.push(`/jobs${queryString ? `?${queryString}` : ''}`)
  }

  /**
   * Manipula descrição de tela
   */
  const handleScreenDescription = async () => {
    try {
      setState('processing')
      speakResponse('Analisando a tela atual...')

      // Capturar screenshot da tela atual
      const canvas = await captureScreen()
      const imageBase64 = canvas.toDataURL('image/png').split(',')[1]

      // Descrever imagem
      const descriptionResponse = await voiceService.describeImage(imageBase64)
      
      if (!descriptionResponse.success) {
        throw new Error('Erro ao descrever imagem')
      }

      const description = descriptionResponse.description
      console.log('✅ Descrição gerada:', description)

      // Gerar áudio da descrição
      const speechResponse = await voiceService.generateSpeech(description)
      
      if (!speechResponse.success) {
        throw new Error('Erro ao gerar áudio')
      }

      // Reproduzir áudio
      await playAudio(speechResponse.audio)

    } catch (error: any) {
      console.error('❌ Erro na descrição:', error)
      setState('error')
      setErrorMessage(error.message || 'Erro ao descrever tela')
      speakResponse('Erro ao analisar a tela. Tente novamente.')
    }
  }

  /**
   * Manipula comando de ajuda
   */
  const handleHelp = async () => {
    const helpText = `
      Olá! Sou o assistente Farol. Aqui estão os comandos disponíveis:
      
      Para navegar: "Vou para vagas", "Abrir perfil", "Ver matches", "Dashboard"
      
      Para buscar vagas: "Buscar vagas de analista", "Vagas home office", "Trabalho remoto"
      
      Para descrever: "Descrever a tela", "O que tem na tela", "Analisar página"
      
      Para agendar: "Agendar entrevista com Google para desenvolvedor"
      
      Para perfil: "Atualizar meu telefone para 11999999999"
      
      Para cursos: "Buscar cursos de Python", "Cursos de JavaScript para iniciantes"
      
      Para ajuda: "Ajuda", "Comandos", "O que posso fazer"
      
      Tente dizer um comando para começar!
    `
    
    speakResponse(helpText)
  }

  /**
   * Manipula agendamento de entrevista
   */
  const handleScheduleInterview = async (entities: Record<string, any>) => {
    try {
      const { company, position, date, time, interview_type } = entities
      
      if (!company || !position) {
        speakResponse('Para agendar uma entrevista, preciso saber a empresa e o cargo. Tente dizer "Agendar entrevista com Google para desenvolvedor".')
        return
      }

      const interviewData = {
        company,
        position,
        date: date || new Date().toISOString().split('T')[0],
        time: time || '14:00',
        type: interview_type || 'online' as 'online' | 'presencial',
        notes: `Entrevista agendada via assistente de voz`
      }

      const result = await voiceService.scheduleInterview(interviewData)
      
      if (result.success) {
        speakResponse(`Entrevista agendada com sucesso! ${result.message}`)
      } else {
        speakResponse('Erro ao agendar entrevista. Tente novamente.')
      }

    } catch (error: any) {
      console.error('❌ Erro ao agendar entrevista:', error)
      speakResponse('Erro ao agendar entrevista. Tente novamente.')
    }
  }

  /**
   * Manipula atualização de perfil
   */
  const handleUpdateProfile = async (entities: Record<string, any>) => {
    try {
      const { profile_field, profile_value } = entities
      
      if (!profile_field || !profile_value) {
        speakResponse('Para atualizar seu perfil, preciso saber o campo e o novo valor. Tente dizer "Atualizar meu telefone para 11999999999".')
        return
      }

      const profileData = {
        field: profile_field,
        value: profile_value,
        section: 'personal'
      }

      const result = await voiceService.updateProfile(profileData)
      
      if (result.success) {
        speakResponse(`Perfil atualizado com sucesso! ${result.message}`)
      } else {
        speakResponse('Erro ao atualizar perfil. Tente novamente.')
      }

    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error)
      speakResponse('Erro ao atualizar perfil. Tente novamente.')
    }
  }

  /**
   * Manipula busca de cursos
   */
  const handleSearchCourses = async (entities: Record<string, any>) => {
    try {
      const { course_query, course_category, course_level, duration } = entities
      
      if (!course_query) {
        speakResponse('Para buscar cursos, preciso saber o que você está procurando. Tente dizer "Buscar cursos de Python".')
        return
      }

      const searchParams = {
        query: course_query,
        category: course_category,
        level: course_level,
        duration
      }

      const result = await voiceService.searchCourses(searchParams)
      
      if (result.success) {
        const courseCount = result.courses.length
        speakResponse(`Encontrei ${courseCount} cursos sobre ${course_query}. Navegando para o hub de desenvolvimento...`)
        
        // Navegar para o hub de desenvolvimento com filtros
        const searchParams = new URLSearchParams()
        if (course_query) searchParams.set('search', course_query)
        if (course_category) searchParams.set('category', course_category)
        if (course_level) searchParams.set('level', course_level)
        
        const queryString = searchParams.toString()
        router.push(`/development-hub${queryString ? `?${queryString}` : ''}`)
      } else {
        speakResponse('Erro ao buscar cursos. Tente novamente.')
      }

    } catch (error: any) {
      console.error('❌ Erro ao buscar cursos:', error)
      speakResponse('Erro ao buscar cursos. Tente novamente.')
    }
  }

  /**
   * Captura screenshot da tela atual
   */
  const captureScreen = async (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      // Usar html2canvas se disponível, senão usar método nativo
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        (window as any).html2canvas(document.body).then((canvas: HTMLCanvasElement) => {
          resolve(canvas)
        }).catch(reject)
      } else {
        // Fallback: capturar apenas a viewport
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        
        if (ctx) {
          // Desenhar fundo branco
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Adicionar texto indicativo
          ctx.fillStyle = '#000000'
          ctx.font = '16px Arial'
          ctx.fillText('Screenshot da tela atual', 20, 40)
        }
        
        resolve(canvas)
      }
    })
  }

  /**
   * Reproduz áudio em base64
   */
  const playAudio = async (audioBase64: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setState('speaking')
        
        const audioBlob = new Blob([
          Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
        ], { type: 'audio/mp3' })
        
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audioRef.current = audio
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setState('idle')
          resolve()
        }
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          reject(error)
        }
        
        audio.play()
        
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Usa síntese de voz nativa como fallback
   */
  const speakResponse = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  // Renderização condicional baseada no suporte
  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg">
          <p className="text-sm">
            ⚠️ Seu navegador não suporta captura de áudio
          </p>
        </div>
      </div>
    )
  }

  // Funções auxiliares para UI
  const getButtonColor = () => {
    switch (state) {
      case 'listening': return 'border-[#dc2626] bg-[#f9f7f2] hover:bg-[#dc2626] hover:text-[#f9f7f2] animate-pulse text-[#dc2626]'
      case 'processing': return 'border-[#d97706] bg-[#f9f7f2] hover:bg-[#d97706] hover:text-[#f9f7f2] text-[#d97706]'
      case 'speaking': return 'border-[#059669] bg-[#f9f7f2] hover:bg-[#059669] hover:text-[#f9f7f2] text-[#059669]'
      case 'error': return 'border-[#dc2626] bg-[#f9f7f2] hover:bg-[#dc2626] hover:text-[#f9f7f2] text-[#dc2626]'
      default: return 'border-[#061531] bg-[#f9f7f2] hover:bg-[#061531] hover:text-[#f9f7f2] text-[#061531]'
    }
  }

  const getButtonIcon = () => {
    switch (state) {
      case 'listening': return (
        <svg className="w-6 h-6 text-[#dc2626]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z"/>
        </svg>
      )
      case 'processing': return (
        <svg className="w-6 h-6 text-[#d97706] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
      case 'speaking': return (
        <svg className="w-6 h-6 text-[#059669] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      )
      case 'error': return (
        <svg className="w-6 h-6 text-[#dc2626]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
      default: return (
        <svg className="w-6 h-6 text-[#061531]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      )
    }
  }

  const getStatusMessage = () => {
    switch (state) {
      case 'listening': return '🎤 Ouvindo...'
      case 'processing': return '🧠 Processando...'
      case 'speaking': return '🔊 Falando...'
      case 'error': return '❌ Erro'
      default: return null
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botão flutuante do assistente */}
      <div className="relative">
        <Button
          onClick={state === 'listening' ? stopListening : startListening}
          disabled={state === 'processing' || state === 'speaking'}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${getButtonColor()}`}
          size="icon"
          aria-label={state === 'listening' ? 'Parar escuta' : 'Iniciar assistente de voz'}
        >
          {getButtonIcon()}
        </Button>

        {/* Indicador de status */}
        {(state === 'listening' || state === 'processing' || state === 'speaking') && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>

      {/* Status do processamento */}
      {getStatusMessage() && (
        <div className="absolute bottom-20 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{getStatusMessage()}</span>
          </p>
        </div>
      )}

      {/* Mensagem de erro */}
      {state === 'error' && errorMessage && (
        <div className="absolute bottom-20 right-0 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 max-w-xs">
          <p className="text-sm text-red-700">
            <span className="font-semibold">❌ Erro:</span> {errorMessage}
          </p>
        </div>
      )}

      {/* Transcript */}
      {transcript && state !== 'processing' && (
        <div className="absolute bottom-20 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Comando:</span> {transcript}
          </p>
        </div>
      )}

      {/* Instruções iniciais */}
      {state === 'idle' && !transcript && (
        <div className="absolute bottom-20 right-0 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-3 max-w-xs">
          <p className="text-sm text-blue-700">
            {wakeWordEnabled ? (
              <>
                <span className="font-semibold">🎤 Wake Word:</span> Diga "Olá, Farol" ou clique no botão
              </>
            ) : (
              <>
                <span className="font-semibold">💡 Dica:</span> Diga "ajuda" para ver os comandos disponíveis
              </>
            )}
          </p>
        </div>
      )}

      {/* Status do Wake Word */}
      {wakeWordEnabled && (
        <div className="absolute bottom-32 right-0 bg-green-50 border border-green-200 rounded-lg shadow-lg p-2 max-w-xs">
          <p className="text-xs text-green-700">
            <span className="font-semibold">🟢 Wake Word Ativo</span>
          </p>
        </div>
      )}
    </div>
  )
}
