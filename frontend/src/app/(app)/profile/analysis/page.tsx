'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { profileService, CVAnalysis } from '@/lib/profile'

interface LocalCVAnalysis {
  strengths: string[]
  improvements: string[]
  suggested_skills: string[]
  accessibility_notes: string[]
}

export default function CVAnalysisPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [analysis, setAnalysis] = useState<LocalCVAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalysis()
  }, [])

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await profileService.getCVAnalysis()
      setAnalysis(data)
    } catch (err: any) {
      console.error('Erro ao carregar análise:', err)
      setError(err.message || 'Erro ao carregar análise do currículo')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
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
                    onClick={() => router.push('/profile')}
                    className=""
                  >
                    Voltar ao Perfil
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Análise do Currículo
                </h1>
                <p className="text-muted-foreground">
                  Análise detalhada do seu currículo com foco em acessibilidade e inclusão
                </p>
              </div>
              <Button
                onClick={() => router.push('/profile')}
                variant="outline"
              >
                Voltar ao Perfil
              </Button>
            </div>
          </div>

          {analysis && (
            <div className="space-y-6">
              {/* Análise Geral */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Análise Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      Análise completa do seu currículo realizada por nossa IA, identificando pontos fortes, 
                      oportunidades de melhoria e sugestões personalizadas para o seu desenvolvimento profissional.
                    </p>
                  </div>
                </CardContent>
              </Card>

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
                    Aspectos positivos identificados no seu currículo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{strength}</span>
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
                  <ul className="space-y-3">
                    {analysis.improvements.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Habilidades Sugeridas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Habilidades Sugeridas
                  </CardTitle>
                  <CardDescription>
                    Competências recomendadas para desenvolvimento profissional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggested_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notas sobre Acessibilidade */}
              {analysis.accessibility_notes && analysis.accessibility_notes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-indigo-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Notas sobre Acessibilidade
                    </CardTitle>
                    <CardDescription>
                      Considerações específicas sobre inclusão e acessibilidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis.accessibility_notes.map((note, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-indigo-800">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Ações */}
              <div className="flex justify-center space-x-4 pt-6">
                <Button
                  onClick={() => router.push('/profile')}
                  variant="outline"
                >
                  Editar Perfil
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

