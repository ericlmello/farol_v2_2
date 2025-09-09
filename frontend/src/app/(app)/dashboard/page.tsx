'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { profileService, Profile } from '@/lib/profile'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true)
      const profileData = await profileService.getMyProfile()
      setProfile(profileData)
    } catch (err: any) {
      console.error('Erro ao carregar perfil:', err)
      // Se o perfil não existe, continuar sem erro
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    } else if (profile?.first_name) {
      return profile.first_name
    } else if (user?.email) {
      // Fallback para o e-mail se não houver nome
      return user.email.split('@')[0] // Pega a parte antes do @
    }
    return 'Usuário'
  }

  const mainCards = [
    {
      title: 'Cadastro guiado',
      description: 'Complete seu perfil profissional de forma interativa e personalizada',
      href: '/profile',
      icon: (
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgGradient: 'from-blue-50 to-blue-100',
      hoverColor: 'hover:from-blue-100 hover:to-blue-200'
    },
    {
      title: 'Assistente de carreira',
      description: 'Encontre as melhores oportunidades de trabalho personalizadas para você',
      href: '/jobs',
      icon: (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      ),
      bgGradient: 'from-green-50 to-green-100',
      hoverColor: 'hover:from-green-100 hover:to-green-200'
    },
    {
      title: 'Simulador de entrevista',
      description: 'Pratique entrevistas com IA e melhore suas habilidades de comunicação',
      href: '/simulation/start',
      icon: (
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      bgGradient: 'from-purple-50 to-purple-100',
      hoverColor: 'hover:from-purple-100 hover:to-purple-200'
    }
  ]

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              Bem-vindo ao Farol
            </h1>
            <p className="text-2xl text-primary font-medium mb-4">
              Conectando Talentos. Removendo Barreiras.
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Olá, <span className="font-semibold text-foreground">
                {isLoadingProfile ? '...' : getUserDisplayName()}
              </span>! 
              Escolha uma das opções abaixo para começar sua jornada profissional.
            </p>
          </div>

          {/* Main Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {mainCards.map((card, index) => (
              <Link key={index} href={card.href} className="group block">
                <Card className={`h-full bg-gradient-to-br ${card.bgGradient} ${card.hoverColor} border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group-hover:ring-2 group-hover:ring-blue-300 group-hover:ring-opacity-50`}>
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-white rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        {card.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <CardDescription className="text-gray-700 leading-relaxed mb-6">
                      {card.description}
                    </CardDescription>
                    <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                      <span className="text-sm font-semibold mr-2">Começar agora</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Additional Info Section */}
          <div className="text-center">
            <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Sua jornada profissional começa aqui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  O Farol IA utiliza inteligência artificial para personalizar sua experiência, 
                  conectando você com as melhores oportunidades e desenvolvendo suas habilidades 
                  profissionais de forma eficiente e inovadora. Nossa plataforma foi criada 
                  especialmente para promover a inclusão e acessibilidade no mercado de trabalho.
                </CardDescription>
                
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                    <div className="text-sm text-muted-foreground">Vagas disponíveis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                    <div className="text-sm text-muted-foreground">Candidatos conectados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                    <div className="text-sm text-muted-foreground">Taxa de satisfação</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
