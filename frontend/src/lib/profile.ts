import { api } from '@/lib/api'

export interface Profile {
  id: number
  user_id: number
  first_name: string
  last_name: string
  phone?: string
  bio?: string
  location?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  has_disability: boolean
  disability_type?: string
  disability_description?: string
  accessibility_needs?: string
  experience_summary?: string
  created_at: string
  updated_at?: string
}

export interface ProfileUpdateRequest {
  first_name?: string
  last_name?: string
  phone?: string
  bio?: string
  location?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  has_disability?: boolean
  disability_type?: string
  disability_description?: string
  accessibility_needs?: string
  experience_summary?: string
}

// Alias para compatibilidade
export type ProfileUpdate = ProfileUpdateRequest

export interface CVAnalysis {
  strengths: string[]
  improvements: string[]
  suggested_skills: string[]
  accessibility_notes: string[]
}

export const profileService = {
  async getProfile(): Promise<Profile> {
    const response = await api.get('/profile/me')
    return response.data
  },

  async updateProfile(data: ProfileUpdateRequest): Promise<Profile> {
    const response = await api.put('/profile/me', data)
    return response.data
  },

  async uploadCV(file: File): Promise<{ message: string; analysis?: CVAnalysis; extracted_text?: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/profile/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async getCVAnalysis(): Promise<CVAnalysis> {
    const response = await api.get('/profile/analysis')
    return response.data
  },

  // Métodos com nomes diferentes para compatibilidade
  async getMyProfile(): Promise<Profile> {
    return this.getProfile()
  },

  async updateMyProfile(data: ProfileUpdateRequest): Promise<Profile> {
    return this.updateProfile(data)
  }
}
