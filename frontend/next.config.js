/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para deploy no Render
  images: {
    domains: ['localhost', 'farol-backend.onrender.com'],
  },
  
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  
  // Configuração de proxy para evitar CORS
  async rewrites() {
    // Em desenvolvimento local
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:8000/api/v1/:path*',
        },
      ]
    }
    
    // Em produção no Render - usar proxy para evitar CORS
    if (process.env.RENDER) {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'https://farol-backend.onrender.com/api/v1/:path*',
        },
      ]
    }
    
    return []
  },
}

module.exports = nextConfig
