/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para deploy no Render
  images: {
    domains: ['localhost', 'farol-backend.onrender.com'],
  },
  
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  
  // Configuração de proxy apenas para desenvolvimento local
  async rewrites() {
    // Em desenvolvimento local, usar proxy para evitar CORS
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:8000/api/v1/:path*',
        },
      ]
    }
    
    // Em produção, usar URL absoluta (sem proxy)
    return []
  },
}

module.exports = nextConfig
