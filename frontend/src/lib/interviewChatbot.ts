import { api } from './api'

export interface InterviewConfig {
  interview_type: string
  difficulty_level: string
  duration: string
  interaction_mode: string
  focus_areas: string[]
}

export interface InterviewSession {
  session_id: string
  interview_type: string
  difficulty_level: string
  duration: string
  interaction_mode: string
  focus_areas: string[]
  first_question: string
  user_profile: {
    name: string
    experience_level: string
    main_area: string
    skills: string[]
  }
  started_at: string
}

export interface ChatMessage {
  role: 'candidate' | 'interviewer'
  content: string
  timestamp: string
  message_id?: string
}

export interface ChatResponse {
  session_id: string
  interviewer_response: string
  timestamp: string
  message_id: string
}

export interface InterviewFeedback {
  session_id: string
  feedback: string
  completed_at: string
  total_messages: number
  interview_type: string
  difficulty_level: string
}

class InterviewChatbotService {
  private baseUrl = '/api/v1/interview-chatbot'

  async startInterview(config: InterviewConfig): Promise<InterviewSession> {
    try {
      const response = await api.post(`${this.baseUrl}/start-interview`, config)
      return response.data
    } catch (error: any) {
      console.error('Erro ao iniciar entrevista:', error)
      throw new Error(error.response?.data?.detail || 'Erro ao iniciar entrevista')
    }
  }

  async sendMessage(
    sessionId: string,
    message: string,
    config: InterviewConfig,
    conversationHistory: ChatMessage[]
  ): Promise<ChatResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/chat`, {
        session_id: sessionId,
        message,
        config,
        conversation_history: conversationHistory
      })
      return response.data
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      throw new Error(error.response?.data?.detail || 'Erro ao enviar mensagem')
    }
  }

  async endInterview(
    sessionId: string,
    config: InterviewConfig,
    conversationHistory: ChatMessage[]
  ): Promise<InterviewFeedback> {
    try {
      const response = await api.post(`${this.baseUrl}/end-interview`, {
        session_id: sessionId,
        config,
        conversation_history: conversationHistory
      })
      return response.data
    } catch (error: any) {
      console.error('Erro ao finalizar entrevista:', error)
      throw new Error(error.response?.data?.detail || 'Erro ao finalizar entrevista')
    }
  }
}

export const interviewChatbotService = new InterviewChatbotService()
