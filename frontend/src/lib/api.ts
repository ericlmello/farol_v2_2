import axios from 'axios'

// Configuração para diferentes ambientes
const getApiBaseUrl = () => {
  // Priorizar variável de ambiente se definida
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL
  }

  // Para evitar problemas de hidratação, usar uma configuração consistente
  // Em desenvolvimento local, usar localhost com prefixo da API
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/api/v1'
  }
  
  // Em produção ou Docker, usar o nome do serviço com prefixo da API
  return 'http://backend:8000/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

// Log para debug (apenas em desenvolvimento e no cliente)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL)
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
