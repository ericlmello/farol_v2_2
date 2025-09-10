import { api } from '@/lib/api'

export interface Interview {
  id: number
  job_title: string
  company_name: string
  company_logo?: string
  interview_date: string
  duration_minutes: number
  interview_type: string
  meeting_link: string
  meeting_id: string
  meeting_password: string
  status: string
  location: string
  interviewer_name: string
  interviewer_role: string
  preparation_notes: string
  requirements: string[]
  created_at: string
}

export interface InterviewResponse {
  interviews: Interview[]
  total_interviews: number
  upcoming_interviews: number
}

export const interviewsService = {
  async getInterviews(): Promise<InterviewResponse> {
    const response = await api.get('/interviews/')
    return response.data
  }
}
