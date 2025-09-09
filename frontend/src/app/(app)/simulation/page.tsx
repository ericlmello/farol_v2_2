'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { simulationsService, PendingSimulationsResponse, PendingSimulation } from '@/lib/simulations'

export default function SimulationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [simulations, setSimulations] = useState<PendingSimulation[]>([])
  const [stats, setStats] = useState({
    totalSimulations: 0,
    completedSimulations: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPendingSimulations()
  }, [])

  const loadPendingSimulations = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await simulationsService.getPendingSimulations()
      setSimulations(data.simulations || [])
      setStats({
        totalSimulations: data.total_simulations || 0,
        completedSimulations: data.completed_simulations || 0
      })
    } catch (err: any) {
      console.error('Erro ao carregar simulações pendentes:', err)
      setError(err.message || 'Erro ao carregar simulações pendentes. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const pastDate = new Date(dateString)
    const diffMs = now.getTime() - pastDate.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`
    } else {
      return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`
    }
  }

  const getInterviewTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical':
        return 'Técnica'
      case 'behavioral':
        return 'Comportamental'
      case 'mixed':
        return 'Mista'
      default:
        return type
    }
  }

  const getDifficultyLabel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'Iniciante'
      case 'intermediate':
        return 'Intermediário'
      case 'advanced':
        return 'Avançado'
      case 'expert':
        return 'Especialista'
      default:
        return level
    }
  }

  const getInterviewTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical':
        return 'bg-blue-100 text-blue-800'
      case 'behavioral':
        return 'bg-green-100 text-green-800'
      case 'mixed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-orange-100 text-orange-800'
      case 'expert':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100)
  }

  const handleContinueSimulation = (simulationId: string) => {
    router.push(`/simulation/${simulationId}`)
  }

  const handleStartNewSimulation = () => {
    router.push('/simulation/start')
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
                    onClick={loadPendingSimulations}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Simulações em Andamento
            </h1>
            <p className="text-muted-foreground">
              Continue suas simulações de entrevista onde parou
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Simulações Pendentes</p>
                    <p className="text-2xl font-semibold text-gray-900">{simulations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Progresso Médio</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {simulations.length > 0 
                        ? Math.round(simulations.reduce((acc, sim) => acc + getProgressPercentage(sim.current_question, sim.total_questions), 0) / simulations.length)
                        : 0}%
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Tempo Total</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {simulations.reduce((acc, sim) => acc + parseInt(sim.duration), 0)} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Simulations List */}
          {simulations.length > 0 ? (
            <div className="space-y-6">
              {simulations.map((simulation) => (
                <Card key={simulation.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                          Simulação de Entrevista
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInterviewTypeColor(simulation.interview_type)}`}>
                            {getInterviewTypeLabel(simulation.interview_type)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(simulation.difficulty_level)}`}>
                            {getDifficultyLabel(simulation.difficulty_level)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {simulation.duration} min
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {simulation.interaction_mode === 'voice' ? 'Voz' : 'Texto'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Iniciada</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getTimeAgo(simulation.started_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(simulation.started_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Progress */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Progresso</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Perguntas respondidas</span>
                            <span>{simulation.current_question} de {simulation.total_questions}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(simulation.current_question, simulation.total_questions)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getProgressPercentage(simulation.current_question, simulation.total_questions)}% concluído
                          </p>
                        </div>
                      </div>

                      {/* Focus Areas */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Áreas de Foco</h4>
                        <div className="flex flex-wrap gap-1">
                          {simulation.focus_areas.map((area, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => handleContinueSimulation(simulation.id)}
                        className="flex-1 px-6 py-3 border border-[#061531] bg-[#f9f7f2] text-[#061531] rounded-md font-medium hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Continuar Simulação
                      </button>
                      <button 
                        onClick={() => window.open(`/simulation/${simulation.id}`, '_blank')}
                        className="px-6 py-3 border border-[#061531] bg-[#f9f7f2] text-[#061531] rounded-md font-medium hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma simulação em andamento</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Você não possui nenhuma simulação em andamento. Que tal iniciar uma nova?
              </p>
              <div className="mt-6">
                <button
                  onClick={handleStartNewSimulation}
                  className="px-6 py-3 border border-[#061531] bg-[#f9f7f2] text-[#061531] rounded-md font-medium hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors"
                >
                  Iniciar Nova Simulação
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
