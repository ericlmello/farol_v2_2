import { api } from './api'

export interface LoginRequest {
  username: string // O backend espera 'username' para o OAuth2PasswordRequestForm
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  user_type: 'candidate' | 'company' | 'admin'
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: number
  email: string
  user_type: 'candidate' | 'company' | 'admin'
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at?: string
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  },

  getToken(): string | null {
    return localStorage.getItem('authToken')
  },

  setToken(token: string) {
    localStorage.setItem('authToken', token)
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
