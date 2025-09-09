import axios from 'axios'

// Configuração para diferentes ambientes
const getApiBaseUrl = () => {
  // Priorizar variável de ambiente se definida
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL + '/api/v1'
  }

  // Para evitar problemas de hidratação, usar uma configuração consistente
  // Em desenvolvimento local, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000/api/v1'
  }
  
  // Em produção no Render, usar a URL do backend
  if (process.env.RENDER) {
    return 'https://farol-backend.onrender.com/api/v1'
  }
  
  // Fallback para Docker ou outras configurações
  return 'http://backend:8000/api/v1'
}

const API_BASE_URL = getApiBaseUrl()

// Log para debug (apenas em desenvolvimento e no cliente)
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL)
  console.log('🔗 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
  console.log('🔗 NODE_ENV:', process.env.NODE_ENV)
  console.log('🔗 RENDER:', process.env.RENDER)
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
