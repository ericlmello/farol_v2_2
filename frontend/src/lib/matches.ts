import { api } from '@/lib/api'

export interface Match {
  id: number
  job_title: string
  company_name: string
  candidate_name: string
  compatibility_score: number
  skills_tags: string[]
  location: string
  work_model: string
  salary_range: string
  match_reason: string
  created_at: string
}

export interface MatchResponse {
  matches: Match[]
  total_matches: number
  avg_compatibility: number
}

export const matchesService = {
  async getMatches(): Promise<Match[]> {
    const response = await api.get('/matches/')
    return response.data
  }
}
