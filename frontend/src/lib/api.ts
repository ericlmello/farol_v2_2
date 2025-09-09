import axios from 'axios'

// Configuração para diferentes ambientes
const getApiBaseUrl = () => {
  // Em desenvolvimento local, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/api/v1'
  }
  
  // Em produção, usar proxy local para evitar CORS
  // O Next.js vai fazer o proxy para o backend
  return '/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

// Log para debug (apenas em desenvolvimento e no cliente)
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL)
  console.log('🔗 NODE_ENV:', process.env.NODE_ENV)
  console.log('🔗 RENDER:', process.env.RENDER)
  console.log('🔗 Usando proxy:', process.env.NODE_ENV === 'production' ? 'Sim' : 'Não')
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detalhado para debug
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      })
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
