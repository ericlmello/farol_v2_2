import { api } from '@/lib/api'

export interface PendingSimulation {
  id: string
  user_id: number
  interview_type: string
  difficulty_level: string
  duration: string
  interaction_mode: string
  focus_areas: string[]
  status: string
  current_question: number
  total_questions: number
  started_at: string
  created_at: string
  updated_at: string
}

export interface PendingSimulationsResponse {
  simulations: PendingSimulation[]
  total_simulations: number
  completed_simulations: number
}

export interface SimulationConfig {
  interview_type: string
  difficulty_level: string
  duration: string
  interaction_mode: string
  focus_areas: string[]
}

export interface SimulationStartResponse {
  id: string
  message: string
}

export const simulationsService = {
  async getPendingSimulations(): Promise<PendingSimulationsResponse> {
    const response = await api.get('/simulations/pending')
    return response.data
  },

  async startSimulation(config: SimulationConfig): Promise<SimulationStartResponse> {
    const response = await api.post('/simulations/start', config)
    return response.data
  }
}
