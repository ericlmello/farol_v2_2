'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { interviewsService, InterviewResponse, Interview } from '@/lib/interviews'

export default function RealtimeInterviewPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [stats, setStats] = useState({
    totalInterviews: 0,
    upcomingInterviews: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInterviews()
  }, [])

  const loadInterviews = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await interviewsService.getInterviews()
      setInterviews(data.interviews || [])
      setStats({
        totalInterviews: data.total_interviews || 0,
        upcomingInterviews: data.upcoming_interviews || 0
      })
    } catch (err: any) {
      console.error('Erro ao carregar entrevistas:', err)
      setError(err.message || 'Erro ao carregar entrevistas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeUntilInterview = (dateString: string) => {
    const now = new Date()
    const interviewDate = new Date(dateString)
    const diffMs = interviewDate.getTime() - now.getTime()
    
    if (diffMs < 0) {
      return 'Entrevista já passou'
    }
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''} restante${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''} restante${diffHours > 1 ? 's' : ''}`
    } else {
      return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} restante${diffMinutes > 1 ? 's' : ''}`
    }
  }

  const getInterviewTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'técnica':
        return 'bg-blue-100 text-blue-800'
      case 'comportamental':
        return 'bg-green-100 text-green-800'
      case 'mista':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLocationColor = (location: string) => {
    switch (location.toLowerCase()) {
      case 'remoto':
        return 'bg-green-100 text-green-800'
      case 'híbrido':
        return 'bg-blue-100 text-blue-800'
      case 'presencial':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleJoinInterview = async (interview: Interview) => {
    try {
      // Registrar entrada na entrevista
      await fetch(`http://localhost:8000/api/v1/interviews/${interview.id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })

      // Abrir link da entrevista em nova aba
      window.open(interview.meeting_link, '_blank')
    } catch (err) {
      console.error('Erro ao entrar na entrevista:', err)
      // Mesmo assim, abrir o link
      window.open(interview.meeting_link, '_blank')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
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
                    onClick={loadInterviews}
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
              Entrevistas Agendadas
            </h1>
            <p className="text-muted-foreground">
              Suas entrevistas em tempo real com empresas parceiras
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total de Entrevistas</p>
                    <p className="text-2xl font-semibold text-foreground">{interviews.length}</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Próxima Entrevista</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {interviews.length > 0 ? getTimeUntilInterview(interviews[0].interview_date) : 'Nenhuma'}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Empresas Parceiras</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {new Set(interviews.map(i => i.company_name)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interviews List */}
          <div className="space-y-6">
            {interviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {interview.company_logo ? (
                          <img
                            src={interview.company_logo}
                            alt={`Logo ${interview.company_name}`}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground font-medium text-sm">
                              {interview.company_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-foreground mb-1">
                          {interview.job_title}
                        </CardTitle>
                        <p className="text-muted-foreground mb-2">{interview.company_name}</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInterviewTypeColor(interview.interview_type)}`}>
                            {interview.interview_type}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLocationColor(interview.location)}`}>
                            {interview.location}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {interview.duration_minutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(interview.interview_date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeUntilInterview(interview.interview_date)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Interviewer Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Entrevistador</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{interview.interviewer_name}</p>
                          <p className="text-xs text-muted-foreground">{interview.interviewer_role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Info */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Informações da Reunião</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-muted-foreground">ID: {interview.meeting_id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span className="text-sm text-muted-foreground">Senha: {interview.meeting_password}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preparation Notes */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Notas de Preparação</h4>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                      {interview.preparation_notes}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Requisitos</h4>
                    <ul className="space-y-1">
                      {interview.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleJoinInterview(interview)}
                      className="flex-1 px-6 py-3 border border-[#061531] bg-[#f9f7f2] text-[#061531] rounded-md font-medium hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Entrar na Entrevista
                    </button>
                    <button className="px-6 py-3 border border-[#061531] bg-[#f9f7f2] text-[#061531] rounded-md font-medium hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors">
                      Ver Detalhes
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {interviews.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhuma entrevista agendada</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Suas entrevistas agendadas aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
