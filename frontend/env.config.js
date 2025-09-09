// Configuração de ambiente para o frontend
module.exports = {
  development: {
    API_URL: 'http://localhost:8000'
  },
  production: {
    API_URL: 'http://backend:8000'
  },
  docker: {
    API_URL: 'http://backend:8000'
  }
}
