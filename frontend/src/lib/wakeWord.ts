import { Porcupine, PorcupineWorker } from '@picovoice/porcupine-web'
import { WebVoiceProcessor } from '@picovoice/web-voice-processor'

export interface WakeWordConfig {
  accessKey: string
  keywordPath?: string
  keywordLabel?: string
  sensitivity?: number
}

export interface WakeWordDetection {
  keyword: string
  timestamp: number
}

export class WakeWordService {
  private porcupine: Porcupine | null = null
  private porcupineWorker: PorcupineWorker | null = null
  private isListening = false
  private onWakeWordDetected: ((detection: WakeWordDetection) => void) | null = null
  private isRecognitionActive = false // Nova variável de estado para controlar SpeechRecognition

  constructor() {
    // Configuração padrão para "Olá, Farol"
    this.initializePorcupine()
  }

  private async initializePorcupine() {
    try {
      // Para desenvolvimento, usaremos uma palavra-chave padrão
      // Em produção, você precisaria de uma chave de acesso da Picovoice
      const accessKey = process.env.NEXT_PUBLIC_PICOVOICE_ACCESS_KEY || 'demo'
      
      // TODO: Implementar PorcupineWorker quando a API estiver estável
      // Por enquanto, usar detecção manual
      console.log('🔄 Usando detecção manual de wake word (Porcupine temporariamente desabilitado)')
      this.setupManualWakeWordDetection()
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Porcupine:', error)
      // Fallback para detecção manual
      this.setupManualWakeWordDetection()
    }
  }

  /**
   * Fallback: Detecção manual de wake word usando Speech Recognition
   */
  private setupManualWakeWordDetection() {
    console.log('🔄 Usando detecção manual de wake word')
    
    if (typeof window !== 'undefined' && (window as any).SpeechRecognition) {
      const recognition = new (window as any).SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'pt-BR'

      recognition.onstart = () => {
        console.log('🎤 SpeechRecognition iniciado')
        this.isRecognitionActive = true
      }

      recognition.onresult = (event: any) => {
        for (let i = event.results.length - 1; i >= 0; i--) {
          const result = event.results[i]
          if (result.isFinal) {
            const transcript = result[0].transcript.toLowerCase().trim()
            
            // Detectar "olá farol" ou variações
            if (transcript.includes('olá farol') || 
                transcript.includes('ola farol') ||
                transcript.includes('hey farol') ||
                transcript.includes('oi farol')) {
              
              const detection: WakeWordDetection = {
                keyword: 'olá farol',
                timestamp: Date.now()
              }
              
              console.log('🎯 Wake word detectada (manual):', detection)
              this.onWakeWordDetected?.(detection)
              
              // Parar reconhecimento temporariamente
              recognition.stop()
              setTimeout(() => {
                if (this.isListening && !this.isRecognitionActive) {
                  this.startRecognitionSafely(recognition)
                }
              }, 2000)
            }
          }
        }
      }

      recognition.onerror = (event: any) => {
        console.error('❌ Erro no reconhecimento de wake word:', event.error)
        this.isRecognitionActive = false
        
        // Reiniciar apenas se não for um erro de estado inválido
        if (event.error !== 'invalid-state' && this.isListening) {
          setTimeout(() => {
            if (this.isListening && !this.isRecognitionActive) {
              this.startRecognitionSafely(recognition)
            }
          }, 1000)
        }
      }

      recognition.onend = () => {
        console.log('🔇 SpeechRecognition finalizado')
        this.isRecognitionActive = false
        
        if (this.isListening && !this.isRecognitionActive) {
          setTimeout(() => {
            this.startRecognitionSafely(recognition)
          }, 1000)
        }
      }

      // Armazenar referência para controle
      ;(this as any).manualRecognition = recognition
    }
  }

  /**
   * Inicia o SpeechRecognition de forma segura, verificando o estado
   */
  private startRecognitionSafely(recognition: any) {
    if (!this.isRecognitionActive && this.isListening) {
      try {
        console.log('🔄 Reiniciando SpeechRecognition...')
        recognition.start()
      } catch (error: any) {
        console.error('❌ Erro ao reiniciar SpeechRecognition:', error)
        this.isRecognitionActive = false
        
        // Se for erro de estado inválido, aguardar mais tempo
        if (error.name === 'InvalidStateError') {
          console.log('⏳ Aguardando mais tempo devido a InvalidStateError...')
          setTimeout(() => {
            if (this.isListening && !this.isRecognitionActive) {
              this.startRecognitionSafely(recognition)
            }
          }, 3000)
        }
      }
    }
  }

  /**
   * Inicia a escuta contínua para wake word
   */
  async startListening(onWakeWordDetected: (detection: WakeWordDetection) => void): Promise<boolean> {
    try {
      this.onWakeWordDetected = onWakeWordDetected
      this.isListening = true

      if (this.porcupineWorker) {
        // Usar Porcupine Worker
        await WebVoiceProcessor.subscribe(this.porcupineWorker)
        console.log('🎤 Wake word detection iniciado (Porcupine)')
        return true
      } else if ((this as any).manualRecognition) {
        // Usar detecção manual com controle de estado
        const recognition = (this as any).manualRecognition
        this.startRecognitionSafely(recognition)
        console.log('🎤 Wake word detection iniciado (manual)')
        return true
      } else {
        console.warn('⚠️ Nenhum método de wake word detection disponível')
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao iniciar wake word detection:', error)
      return false
    }
  }

  /**
   * Para a escuta de wake word
   */
  async stopListening(): Promise<void> {
    try {
      this.isListening = false
      this.isRecognitionActive = false // Resetar estado do SpeechRecognition
      this.onWakeWordDetected = null

      if (this.porcupineWorker) {
        await WebVoiceProcessor.unsubscribe(this.porcupineWorker)
        console.log('🔇 Wake word detection parado (Porcupine)')
      } else if ((this as any).manualRecognition) {
        const recognition = (this as any).manualRecognition
        try {
          recognition.stop()
          console.log('🔇 Wake word detection parado (manual)')
        } catch (error: any) {
          console.warn('⚠️ Erro ao parar SpeechRecognition:', error)
          // Mesmo com erro, resetar o estado
          this.isRecognitionActive = false
        }
      }
    } catch (error) {
      console.error('❌ Erro ao parar wake word detection:', error)
    }
  }

  /**
   * Verifica se o serviço está disponível
   */
  isAvailable(): boolean {
    return this.porcupineWorker !== null || (this as any).manualRecognition !== null
  }

  /**
   * Limpa recursos
   */
  async cleanup(): Promise<void> {
    await this.stopListening()
    
    // Resetar todos os estados
    this.isListening = false
    this.isRecognitionActive = false
    this.onWakeWordDetected = null
    
    if (this.porcupineWorker) {
      this.porcupineWorker.terminate()
      this.porcupineWorker = null
    }
    
    if (this.porcupine) {
      this.porcupine.release()
      this.porcupine = null
    }
    
    // Limpar referência do SpeechRecognition
    ;(this as any).manualRecognition = null
    
    console.log('🧹 WakeWordService limpo com sucesso')
  }
}

// Instância singleton
export const wakeWordService = new WakeWordService()
