'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { matchesService, MatchResponse, Match } from '@/lib/matches'

// Interface para os dados mockados de análise de matches
interface MatchAnalysis {
  id: number
  jobTitle: string
  companyName: string
  compatibilityScore: number
  skillsTags: string[]
  matchReason: string
  workModel: 'Remoto' | 'Híbrido' | 'Presencial'
  level: 'Júnior' | 'Pleno' | 'Sênior'
}

// Dados mockados para demonstração da IA de compatibilidade
const MOCK_MATCHES: MatchAnalysis[] = [
  {
    id: 1,
    jobTitle: "Desenvolvedor(a) Frontend Acessível",
    companyName: "InovaTech Soluções",
    compatibilityScore: 95,
    skillsTags: ['React', 'TypeScript', 'WCAG 2.2', 'Testes Automatizados'],
    matchReason: "Alta compatibilidade devido à sua experiência comprovada com React e profundo conhecimento das diretrizes de acessibilidade WCAG, um requisito chave para esta vaga.",
    workModel: 'Remoto',
    level: 'Pleno'
  },
  {
    id: 2,
    jobTitle: "Analista de Dados Pleno",
    companyName: "DataDriven Corp",
    compatibilityScore: 88,
    skillsTags: ['Python', 'SQL', 'Power BI', 'Comunicação'],
    matchReason: "Excelente alinhamento com as habilidades técnicas de Python e SQL. A vaga oferece uma ótima oportunidade para desenvolver sua experiência com Power BI.",
    workModel: 'Híbrido',
    level: 'Pleno'
  },
  {
    id: 3,
    jobTitle: "Engenheiro(a) de Software Backend Sênior",
    companyName: "ScaleUp Systems",
    compatibilityScore: 91,
    skillsTags: ['Node.js', 'PostgreSQL', 'AWS', 'Microserviços'],
    matchReason: "Compatibilidade forte com a stack de tecnologia da empresa. Sua experiência prévia com arquitetura de microserviços é um grande diferencial para os desafios deste cargo.",
    workModel: 'Remoto',
    level: 'Sênior'
  },
  {
    id: 4,
    jobTitle: "UX/UI Designer com Foco em Inclusão",
    companyName: "Studio Criativo Inclusivo",
    compatibilityScore: 97,
    skillsTags: ['Figma', 'Design System', 'Pesquisa com Usuários', 'Acessibilidade'],
    matchReason: "Perfil perfeitamente alinhado com a missão da vaga. A combinação de habilidades em Design System e conhecimento específico em acessibilidade é exatamente o que a empresa procura.",
    workModel: 'Híbrido',
    level: 'Pleno'
  }
]

export default function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<MatchAnalysis[]>([])
  const [stats, setStats] = useState({
    totalMatches: 0,
    avgCompatibility: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError('')

      // Simular delay de carregamento para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Usar dados mockados em vez da API
      setMatches(MOCK_MATCHES)
      
      // Calcular estatísticas dos dados mockados
      const totalMatches = MOCK_MATCHES.length
      const avgCompatibility = Math.round(
        MOCK_MATCHES.reduce((sum, match) => sum + match.compatibilityScore, 0) / totalMatches
      )
      
      setStats({
        totalMatches,
        avgCompatibility
      })
    } catch (err: any) {
      console.error('Erro ao carregar matches:', err)
      setError(err.message || 'Erro ao carregar matches. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-800'
    if (score >= 80) return 'text-blue-800'
    if (score >= 70) return 'text-yellow-800'
    return 'text-orange-800'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-blue-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-orange-100'
  }

  const getWorkModelColor = (model: string) => {
    switch (model) {
      case 'Remoto': return 'bg-blue-100 text-blue-800'
      case 'Híbrido': return 'bg-purple-100 text-purple-800'
      case 'Presencial': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Júnior': return 'bg-green-100 text-green-800'
      case 'Pleno': return 'bg-blue-100 text-blue-800'
      case 'Sênior': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-md p-6">
                <div className="flex justify-center">
                  <svg className="h-12 w-12 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-red-800">Erro</h3>
                <p className="mt-2 text-red-700">{error}</p>
                <div className="mt-6">
                  <button
                    onClick={loadMatches}
                    className="px-4 py-2 border border-[#061531] bg-[#f9f7f2] text-[#061531] rounded-md text-sm font-medium hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Análise de Matches
            </h1>
            <p className="text-muted-foreground">
              Encontre as melhores oportunidades baseadas no seu perfil e habilidades
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total de Matches</p>
                    <p className="text-2xl font-semibold text-foreground">{matches.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Alta Compatibilidade</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {matches.filter(m => m.compatibilityScore >= 90).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Salário Médio</p>
                    <p className="text-2xl font-semibold text-foreground">R$ 7.500</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-foreground mb-1">
                        {match.jobTitle}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">{match.companyName}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWorkModelColor(match.workModel)}`}>
                          {match.workModel}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(match.level)}`}>
                          {match.level}
                        </span>
                      </div>
                    </div>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(match.compatibilityScore)}`}>
                      <span className={`text-lg font-bold ${getScoreColor(match.compatibilityScore)}`}>
                        {match.compatibilityScore}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Compatibilidade</span>
                      <span>{match.compatibilityScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          match.compatibilityScore >= 90 ? 'bg-green-500' :
                          match.compatibilityScore >= 80 ? 'bg-blue-500' :
                          match.compatibilityScore >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${match.compatibilityScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{match.companyName}</p>
                        <p className="text-xs text-muted-foreground">{match.level} • {match.workModel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Habilidades Alinhadas</p>
                    <div className="flex flex-wrap gap-1">
                      {match.skillsTags.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {match.skillsTags.length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-muted-foreground">
                          +{match.skillsTags.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Reason */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-md">
                      <span className="font-medium">Por que é um match:</span> {match.matchReason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => window.open(`/jobs/${match.id}`, '_blank')}
                      className="flex-1 px-4 py-2 border border-[#061531] bg-[#f9f7f2] text-[#061531] rounded-md text-sm font-medium hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors"
                    >
                      Ver Detalhes
                    </button>
                    <button 
                      onClick={() => window.open(`/jobs/${match.id}`, '_blank')}
                      className="flex-1 px-4 py-2 border border-[#061531] bg-[#f9f7f2] text-[#061531] rounded-md text-sm font-medium hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors"
                    >
                      Conectar
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {matches.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhum match encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete seu perfil para receber matches personalizados.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
