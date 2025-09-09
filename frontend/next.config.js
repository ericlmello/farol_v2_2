/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para deploy estático no Render
  // output: 'export', // Removido para permitir páginas dinâmicas
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Configuração de imagens para deploy estático
  images: {
    unoptimized: true,
    domains: ['localhost', 'farol-backend.onrender.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
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
  
  // Configurações para Docker - Webpack
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Polling a cada 1 segundo
        aggregateTimeout: 300, // Aguarda 300ms antes de recompilar
      }
    }
    return config
  },
}

module.exports = nextConfig
