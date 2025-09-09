// Configuração de variáveis de ambiente para diferentes ambientes
const config = {
  development: {
    NEXT_PUBLIC_API_URL: 'http://localhost:8000',
    NODE_ENV: 'development'
  },
  production: {
    NEXT_PUBLIC_API_URL: 'https://farol-backend.onrender.com',
    NODE_ENV: 'production'
  },
  render: {
    NEXT_PUBLIC_API_URL: 'https://farol-backend.onrender.com',
    NODE_ENV: 'production'
  }
}

// Determinar ambiente
const environment = process.env.NODE_ENV || 'development'
const isRender = process.env.RENDER === 'true'

// Selecionar configuração
const selectedConfig = isRender ? config.render : config[environment]

// Exportar configuração
module.exports = selectedConfig