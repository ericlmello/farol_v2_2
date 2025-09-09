'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import Link from 'next/link'

// Interface para o relatório de feedback da IA
interface InterviewFeedback {
  jobTitle: string
  interviewType: string
  scores: {
    clareza: number
    metodologiaStar: number
    profundidadeTecnica: number
    confianca: number
  }
  strengths: string[]
  opportunities: {
    ponto: string
    sugestaoHub: {
      nomeCurso: string
      link: string
    }
  }[]
  detailedAnalysis: {
    clarezaDasRespostas: string
    usoDeExemplos: string
    ritmoDaFala: string
  }
  resumeAlignment: {
    pontosDeSinergia: string[]
    oportunidadesPerdidas: string[]
  }
}

// Dados mockados para demonstração da análise de IA
const MOCK_FEEDBACK: InterviewFeedback = {
  jobTitle: "Desenvolvedor(a) Frontend Acessível",
  interviewType: "Técnica e Comportamental",
  scores: {
    clareza: 85,
    metodologiaStar: 70,
    profundidadeTecnica: 90,
    confianca: 80
  },
  strengths: [
    "Excelente domínio técnico sobre React e TypeScript.",
    "Demonstrou paixão e conhecimento genuíno sobre as práticas de acessibilidade WCAG.",
    "Boa comunicação, com respostas diretas e articuladas."
  ],
  opportunities: [
    {
      ponto: "Estruturar melhor as respostas comportamentais usando o método STAR.",
      sugestaoHub: {
        nomeCurso: "Comunicação Assertiva e o Método STAR",
        link: "/development-hub/course/1"
      }
    },
    {
      ponto: "Quantificar os resultados de projetos anteriores para dar mais impacto às suas conquistas.",
      sugestaoHub: {
        nomeCurso: "Apresentando Resultados com Métricas",
        link: "/development-hub/course/2"
      }
    },
    {
      ponto: "Explorar mais exemplos de trabalho em equipe em cenários de alta pressão.",
      sugestaoHub: {
        nomeCurso: "Inteligência Emocional em Times Ágeis",
        link: "/development-hub/course/3"
      }
    }
  ],
  detailedAnalysis: {
    clarezaDasRespostas: "Suas respostas foram, em geral, muito claras. Em momentos de perguntas complexas, uma pequena pausa para estruturar o pensamento pode ajudar a manter a mesma clareza do início ao fim.",
    usoDeExemplos: "Você utilizou bons exemplos técnicos, mas nas perguntas comportamentais, faltou detalhar a Situação e a Tarefa antes de partir para a Ação. Exemplo: Ao falar sobre liderança, descreva o cenário do projeto antes de explicar sua ação.",
    ritmoDaFala: "Ritmo excelente, transmitindo confiança. Não foram identificados vícios de linguagem relevantes."
  },
  resumeAlignment: {
    pontosDeSinergia: [
      "Você conectou de forma excelente sua experiência na 'InovaTech' com a pergunta sobre testes automatizados.",
      "A habilidade 'TypeScript' listada no currículo foi bem demonstrada na prática durante a pergunta técnica."
    ],
    oportunidadesPerdidas: [
      "Seu currículo menciona experiência com 'AWS', mas você não aproveitou a pergunta sobre infraestrutura para explorar esse ponto forte."
    ]
  }
}

export default function FeedbackPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const simulationId = params.simulationId as string
  
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (simulationId) {
      loadFeedback()
    } else {
      setError('ID da simulação não encontrado.')
      setLoading(false)
    }
  }, [simulationId])

  const loadFeedback = async () => {
    try {
      setLoading(true)
      
      // Simular delay de carregamento para demonstração
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Usar dados mockados em vez da API
      setFeedback(MOCK_FEEDBACK)
      setError('')
    } catch (err: any) {
      console.error('Erro ao carregar feedback:', err)
      setError(err.message || 'Erro ao carregar feedback da simulação')
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

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
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
          <div className="max-w-4xl mx-auto">
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
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className=""
                  >
                    Voltar ao Dashboard
                  </Button>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Relatório de Feedback da IA
                </h1>
                <p className="text-muted-foreground">
                  Análise detalhada do seu desempenho na entrevista
                </p>
                {feedback && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {feedback.jobTitle}
                    </span>
                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {feedback.interviewType}
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </div>

          {feedback && (
            <div className="space-y-8">
              {/* Scores Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(feedback.scores.clareza)} mb-2`}>
                      <span className={`text-lg font-bold ${getScoreColor(feedback.scores.clareza)}`}>
                        {feedback.scores.clareza}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Clareza</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getScoreBarColor(feedback.scores.clareza)}`}
                        style={{ width: `${feedback.scores.clareza}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(feedback.scores.metodologiaStar)} mb-2`}>
                      <span className={`text-lg font-bold ${getScoreColor(feedback.scores.metodologiaStar)}`}>
                        {feedback.scores.metodologiaStar}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Método STAR</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getScoreBarColor(feedback.scores.metodologiaStar)}`}
                        style={{ width: `${feedback.scores.metodologiaStar}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(feedback.scores.profundidadeTecnica)} mb-2`}>
                      <span className={`text-lg font-bold ${getScoreColor(feedback.scores.profundidadeTecnica)}`}>
                        {feedback.scores.profundidadeTecnica}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Profundidade Técnica</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getScoreBarColor(feedback.scores.profundidadeTecnica)}`}
                        style={{ width: `${feedback.scores.profundidadeTecnica}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(feedback.scores.confianca)} mb-2`}>
                      <span className={`text-lg font-bold ${getScoreColor(feedback.scores.confianca)}`}>
                        {feedback.scores.confianca}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Confiança</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getScoreBarColor(feedback.scores.confianca)}`}
                        style={{ width: `${feedback.scores.confianca}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Feedback Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pontos Fortes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pontos Fortes
                    </CardTitle>
                    <CardDescription>
                      Aspectos positivos identificados na sua entrevista
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-foreground">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Oportunidades de Melhoria */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Oportunidades de Melhoria
                    </CardTitle>
                    <CardDescription>
                      Áreas que podem ser aprimoradas para destacar seu perfil
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {feedback.opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <span className="text-foreground block mb-2">{opportunity.ponto}</span>
                            <Link 
                              href={opportunity.sugestaoHub.link}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {opportunity.sugestaoHub.nomeCurso}
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Análise Detalhada */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Análise Detalhada
                  </CardTitle>
                  <CardDescription>
                    Avaliação específica por categoria de desempenho
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <h4 className="font-medium text-foreground">Clareza das Respostas</h4>
                      </div>
                      <p className="text-muted-foreground">{feedback.detailedAnalysis.clarezaDasRespostas}</p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h4 className="font-medium text-foreground">Uso de Exemplos</h4>
                      </div>
                      <p className="text-muted-foreground">{feedback.detailedAnalysis.usoDeExemplos}</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <h4 className="font-medium text-foreground">Ritmo da Fala</h4>
                      </div>
                      <p className="text-muted-foreground">{feedback.detailedAnalysis.ritmoDaFala}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alinhamento com Currículo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pontos de Sinergia */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pontos de Sinergia
                    </CardTitle>
                    <CardDescription>
                      Conexões positivas entre sua entrevista e currículo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedback.resumeAlignment.pontosDeSinergia.map((ponto, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-foreground">{ponto}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Oportunidades Perdidas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Oportunidades Perdidas
                    </CardTitle>
                    <CardDescription>
                      Pontos do currículo que poderiam ter sido explorados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedback.resumeAlignment.oportunidadesPerdidas.map((oportunidade, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-foreground">{oportunidade}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-4 pt-6">
                <Button
                  onClick={() => router.push('/simulation/start')}
                  variant="outline"
                >
                  Nova Simulação
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className=""
                >
                  Ir para Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

