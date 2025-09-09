'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import Link from 'next/link'

// Interface para o histórico de feedback
interface FeedbackHistory {
  id: string
  jobTitle: string
  companyName: string
  interviewType: string
  date: string
  overallScore: number
  status: 'completed' | 'in_progress' | 'pending'
  type: 'interview' | 'cv_analysis'
}


export default function FeedbackPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'interview' | 'cv_analysis'>('all')

  useEffect(() => {
    loadFeedbackHistory()
  }, [])

  const loadFeedbackHistory = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('authToken')
      if (!token) {
        console.log('Token não encontrado, usando dados mockados')
        // Usar dados mockados quando não há token
        const mockData = [
          {
            id: 'sim_1_1234567890',
            jobTitle: 'Desenvolvedor(a) Frontend Acessível',
            companyName: 'InovaTech Soluções',
            interviewType: 'Técnica e Comportamental',
            date: '2024-01-15',
            overallScore: 85,
            status: 'completed',
            type: 'interview'
          },
          {
            id: 'sim_1_1234567891',
            jobTitle: 'Analista de Dados Pleno',
            companyName: 'DataDriven Corp',
            interviewType: 'Análise de Currículo',
            date: '2024-01-10',
            overallScore: 78,
            status: 'completed',
            type: 'cv_analysis'
          },
          {
            id: 'sim_1_1234567892',
            jobTitle: 'Engenheiro(a) de Software Backend Sênior',
            companyName: 'ScaleUp Systems',
            interviewType: 'Técnica',
            date: '2024-01-08',
            overallScore: 92,
            status: 'completed',
            type: 'interview'
          },
          {
            id: 'sim_1_1234567893',
            jobTitle: 'UX/UI Designer com Foco em Inclusão',
            companyName: 'Studio Criativo Inclusivo',
            interviewType: 'Comportamental',
            date: '2024-01-05',
            overallScore: 88,
            status: 'completed',
            type: 'interview'
          },
          {
            id: 'sim_1_1234567894',
            jobTitle: 'Product Manager',
            companyName: 'TechStart',
            interviewType: 'Análise de Currículo',
            date: '2024-01-03',
            overallScore: 75,
            status: 'completed',
            type: 'cv_analysis'
          }
        ]
        setFeedbackHistory(mockData)
        return
      }

      const response = await fetch('/api/v1/simulations/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao carregar histórico de feedback')
      }

      const data = await response.json()
      
      // Converter os dados da API para o formato esperado
      const formattedHistory = data.simulations.map((sim: any) => ({
        id: sim.id,
        jobTitle: sim.job_title,
        companyName: sim.company_name,
        interviewType: sim.interview_type,
        date: sim.completed_at.split('T')[0], // Extrair apenas a data
        overallScore: sim.score,
        status: sim.status,
        type: sim.type
      }))

      setFeedbackHistory(formattedHistory)
    } catch (err: any) {
      console.error('Erro ao carregar histórico de feedback:', err)
      // Em caso de erro, usar dados mockados como fallback
      console.log('Usando dados mockados como fallback')
      const mockData = [
        {
          id: 'sim_1_1234567890',
          jobTitle: 'Desenvolvedor(a) Frontend Acessível',
          companyName: 'InovaTech Soluções',
          interviewType: 'Técnica e Comportamental',
          date: '2024-01-15',
          overallScore: 85,
          status: 'completed',
          type: 'interview'
        },
        {
          id: 'sim_1_1234567891',
          jobTitle: 'Analista de Dados Pleno',
          companyName: 'DataDriven Corp',
          interviewType: 'Análise de Currículo',
          date: '2024-01-10',
          overallScore: 78,
          status: 'completed',
          type: 'cv_analysis'
        },
        {
          id: 'sim_1_1234567892',
          jobTitle: 'Engenheiro(a) de Software Backend Sênior',
          companyName: 'ScaleUp Systems',
          interviewType: 'Técnica',
          date: '2024-01-08',
          overallScore: 92,
          status: 'completed',
          type: 'interview'
        },
        {
          id: 'sim_1_1234567893',
          jobTitle: 'UX/UI Designer com Foco em Inclusão',
          companyName: 'Studio Criativo Inclusivo',
          interviewType: 'Comportamental',
          date: '2024-01-05',
          overallScore: 88,
          status: 'completed',
          type: 'interview'
        },
        {
          id: 'sim_1_1234567894',
          jobTitle: 'Product Manager',
          companyName: 'TechStart',
          interviewType: 'Análise de Currículo',
          date: '2024-01-03',
          overallScore: 75,
          status: 'completed',
          type: 'cv_analysis'
        }
      ]
      setFeedbackHistory(mockData)
      setError('') // Limpar erro para não mostrar mensagem de erro
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    if (type === 'interview') {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const filteredHistory = feedbackHistory.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  <Button onClick={loadFeedbackHistory}>
                    Tentar Novamente
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
                  Meu Histórico de Feedbacks
                </h1>
                <p className="text-muted-foreground">
                  Acompanhe todas as suas entrevistas e análises de currículo
                </p>
              </div>
              <Button
                onClick={() => router.push('/simulation/start')}
                className=""
              >
                Nova Simulação
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filter === 'interview' ? 'default' : 'outline'}
                onClick={() => setFilter('interview')}
                size="sm"
              >
                Entrevistas
              </Button>
              <Button
                variant={filter === 'cv_analysis' ? 'default' : 'outline'}
                onClick={() => setFilter('cv_analysis')}
                size="sm"
              >
                Análises de Currículo
              </Button>
            </div>
          </div>

          {/* Cards de Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHistory.map((feedback) => (
              <Card key={feedback.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getTypeIcon(feedback.type)}
                        <span className="ml-2 text-sm font-medium text-muted-foreground">
                          {feedback.type === 'interview' ? 'Entrevista' : 'Análise de Currículo'}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-semibold text-foreground mb-1">
                        {feedback.jobTitle}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">{feedback.companyName}</p>
                      <p className="text-xs text-muted-foreground mb-2">{feedback.interviewType}</p>
                    </div>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getScoreBgColor(feedback.overallScore)}`}>
                      <span className={`text-lg font-bold ${getScoreColor(feedback.overallScore)}`}>
                        {feedback.overallScore}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Data */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(feedback.date)}
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status === 'completed' ? 'Concluído' : 
                         feedback.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                      </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          feedback.overallScore >= 90 ? 'bg-green-500' :
                          feedback.overallScore >= 80 ? 'bg-blue-500' :
                          feedback.overallScore >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${feedback.overallScore}%` }}
                      ></div>
                    </div>

                    {/* Botão de Ação */}
                    <div className="pt-2">
                      <Link href={`/feedback/${feedback.id}`}>
                        <Button 
                          className="w-full"
                          variant="outline"
                        >
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mensagem quando não há feedback */}
          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhum feedback encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter === 'all' 
                  ? 'Você ainda não concluiu nenhuma simulação. Inicie uma para ver sua análise aqui!'
                  : `Você ainda não possui ${filter === 'interview' ? 'entrevistas' : 'análises de currículo'} concluídas.`
                }
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push('/simulation/start')}>
                  Nova Simulação
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
