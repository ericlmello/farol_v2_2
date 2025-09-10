import { api } from '@/lib/api'

export interface Job {
  id: number
  title: string
  description: string
  requirements?: string
  benefits?: string
  location?: string
  remote_work: boolean
  salary_min?: number
  salary_max?: number
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
  company_id: number
  is_active: boolean
  created_at: string
  updated_at?: string
  company?: {
    id: number
    name: string
    industry?: string
    size?: string
    location?: string
    is_inclusive: boolean
  }
  application_count?: number
}

export interface JobFilters {
  title?: string
  location?: string
  remote_work?: boolean
  employment_type?: string
  salary_min?: number
  salary_max?: number
  company_id?: number
  limit?: number
  offset?: number
}

export interface ApplicationCreate {
  cover_letter?: string
  resume_url?: string
}

export interface Application {
  id: number
  candidate_id: number
  job_id: number
  status: string
  cover_letter?: string
  resume_url?: string
  applied_at: string
  job?: Job
}

export const jobsService = {
  async getJobs(filters: JobFilters = {}): Promise<Job[]> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const response = await api.get(`/jobs?${params.toString()}`)
    return response.data
  },

  async getJob(jobId: number): Promise<Job> {
    const response = await api.get(`/jobs/${jobId}`)
    return response.data
  },

  async applyToJob(jobId: number, applicationData: ApplicationCreate): Promise<any> {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData)
    return response.data
  },

  async getMyApplications(): Promise<{ applications: Application[] }> {
    const response = await api.get('/jobs/my-applications')
    return response.data
  },

  async getJobApplications(jobId: number): Promise<{ applications: any[] }> {
    const response = await api.get(`/jobs/${jobId}/applications`)
    return response.data
  }
}
