import { OptimizedImage } from './OptimizedImage'

interface HeroBannerProps {
  className?: string
}

export function HeroBanner({ className }: HeroBannerProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Imagem principal do banner */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Imagem real do escritório inclusivo */}
        <OptimizedImage
          src="/images/office-inclusive-team.jpg"
          alt="Equipe diversa trabalhando em escritório moderno e acessível, com pessoas em cadeiras de rodas colaborando em tecnologia"
          fill
          priority
          quality={90}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
          className="object-cover"
        />
        
        {/* Overlay com gradiente sutil para melhorar legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>
      </div>
      
      {/* Badge de acessibilidade */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-primary text-primary-foreground px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
        <span className="hidden sm:inline">♿ Inclusivo</span>
        <span className="sm:hidden">♿</span>
      </div>
      
      {/* Badge de tecnologia */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-background/90 text-foreground px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg">
        <span className="hidden sm:inline">🤖 IA + Acessibilidade</span>
        <span className="sm:hidden">🤖</span>
      </div>
    </div>
  )
}
