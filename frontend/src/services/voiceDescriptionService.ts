import { api } from '@/lib/api'

export interface VoiceDescriptionResponse {
  status: string
  screenshot: string
  descricao: string
  audio: string
  audio_url: string
}

export interface VoiceDescriptionRequest {
  url: string
}

class VoiceDescriptionService {
  async describePage(url: string): Promise<VoiceDescriptionResponse> {
    try {
      const response = await api.post('/voice-description/describe-page', {
        url: url
      })
      return response.data
    } catch (error) {
      console.error('Erro ao descrever página:', error)
      throw new Error('Erro ao descrever página')
    }
  }

  async getAudio(audioFilename: string): Promise<string> {
    try {
      const response = await api.get(`/voice-description/audio/${audioFilename}`, {
        responseType: 'blob'
      })
      
      // Criar URL do blob para reprodução
      const blob = new Blob([response.data], { type: 'audio/mpeg' })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Erro ao obter áudio:', error)
      throw new Error('Erro ao obter áudio')
    }
  }

  async playAudio(audioUrl: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl)
      
      audio.oncanplaythrough = () => {
        resolve(audio)
      }
      
      audio.onerror = (error) => {
        reject(new Error('Erro ao carregar áudio'))
      }
      
      audio.load()
    })
  }
}

export const voiceDescriptionService = new VoiceDescriptionService()
