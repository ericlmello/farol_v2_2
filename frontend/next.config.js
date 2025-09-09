/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para deploy no Render
  images: {
    domains: ['localhost', 'farol-backend.onrender.com'],
  },
  
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  
  // Configuração de proxy para desenvolvimento local
  async rewrites() {
    // Apenas em desenvolvimento local
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:8000/api/v1/:path*',
        },
      ]
    }
    return []
  },
}

module.exports = nextConfig
