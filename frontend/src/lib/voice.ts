import { api } from '@/lib/api'

export interface VoiceTranscribeResponse {
  success: boolean
  transcript: string
  language: string
}

export interface VoiceInterpretResponse {
  success: boolean
  intent: string
  entities: Record<string, any>
  original_transcript: string
}

export interface VoiceDescribeResponse {
  success: boolean
  description: string
}

export interface VoiceSpeakResponse {
  success: boolean
  audio: string
  format: string
}

export const voiceService = {
  /**
   * Transcreve áudio usando OpenAI Whisper
   */
  async transcribeAudio(audioBlob: Blob): Promise<VoiceTranscribeResponse> {
    const formData = new FormData()
    formData.append('audio_file', audioBlob, 'audio.webm')
    
    const response = await api.post('/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  /**
   * Interpreta a intenção do usuário usando GPT-4o-mini
   */
  async interpretIntent(transcript: string): Promise<VoiceInterpretResponse> {
    const response = await api.post('/voice/interpret', {
      transcript
    })
    
    return response.data
  },

  /**
   * Descreve uma imagem usando GPT-4o-mini Vision
   */
  async describeImage(imageBase64: string): Promise<VoiceDescribeResponse> {
    const response = await api.post('/voice/describe', {
      image: imageBase64
    })
    
    return response.data
  },

  /**
   * Gera áudio de fala usando OpenAI TTS
   */
  async generateSpeech(text: string): Promise<VoiceSpeakResponse> {
    const response = await api.post('/voice/speak', {
      text
    })
    
    return response.data
  },

  /**
   * Agenda uma entrevista
   */
  async scheduleInterview(interviewData: {
    company: string
    position: string
    date: string
    time: string
    type: 'online' | 'presencial'
    notes?: string
  }): Promise<{ success: boolean; message: string; interviewId?: string }> {
    const response = await api.post('/interviews/schedule', interviewData)
    return response.data
  },

  /**
   * Atualiza informações do perfil
   */
  async updateProfile(profileData: {
    field: string
    value: string
    section?: string
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/profile/update', profileData)
    return response.data
  },

  /**
   * Busca cursos no hub de desenvolvimento
   */
  async searchCourses(searchParams: {
    query?: string
    category?: string
    level?: 'iniciante' | 'intermediario' | 'avancado'
    duration?: string
  }): Promise<{ success: boolean; courses: any[]; message: string }> {
    const response = await api.post('/hub/search-courses', searchParams)
    return response.data
  }
}
