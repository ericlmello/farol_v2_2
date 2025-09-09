/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimização para Docker - build standalone
  output: 'standalone',
  
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Configuração de proxy para API
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://backend:8000/api/v1/:path*',
      },
    ]
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
