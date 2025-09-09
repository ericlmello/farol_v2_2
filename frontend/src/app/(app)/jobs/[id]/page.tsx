'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { jobsService, type Job } from '@/lib/jobs'
import { compatibilityService } from '@/lib/compatibilityService'
import { getCompatibilityColor, getCompatibilityText } from '@/lib/compatibility'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

export default function JobDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [compatibilityScore, setCompatibilityScore] = useState<number | null>(null)
  const [calculatingCompatibility, setCalculatingCompatibility] = useState(false)

  useEffect(() => {
    if (jobId) {
      loadJob()
    }
  }, [jobId])

  const loadJob = async () => {
    try {
      setLoading(true)
      setError('')
      const jobData = await jobsService.getJob(parseInt(jobId))
      setJob(jobData)
      
      // Calcular compatibilidade automaticamente
      if (jobData) {
        calculateCompatibility(jobData)
      }
    } catch (err: any) {
      console.error('Erro ao carregar vaga:', err)
      setError('Erro ao carregar vaga. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const calculateCompatibility = async (jobData: Job) => {
    try {
      setCalculatingCompatibility(true)
      
      // Usar o serviço de compatibilidade
      const compatibility = compatibilityService.calculateJobCompatibility(jobData)
      setCompatibilityScore(compatibility.score)
    } catch (err) {
      console.error('Erro ao calcular compatibilidade:', err)
    } finally {
      setCalculatingCompatibility(false)
    }
  }

  const handleApply = async () => {
    if (!job) return
    
    const confirmed = confirm(
      `Tem certeza que deseja se candidatar para a vaga de "${job.title}" na empresa ${job.company?.name || 'não informada'}?`
    )
    
    if (!confirmed) return
    
    try {
      setApplying(true)
      await jobsService.applyToJob(job.id, {
        cover_letter: `Candidatura para a vaga de ${job.title}`
      })
      
      // Mostrar feedback de sucesso
      alert('🎉 Candidatura enviada com sucesso!\n\nVocê receberá um email de confirmação em breve.')
      router.push('/jobs')
    } catch (err: any) {
      console.error('Erro ao se candidatar:', err)
      
      // Tratar diferentes tipos de erro
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('já se aplicou')) {
        alert('Você já se candidatou para esta vaga anteriormente.')
      } else {
        alert('❌ Erro ao se candidatar. Tente novamente mais tarde.')
      }
    } finally {
      setApplying(false)
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salário a combinar'
    if (min && max) return `R$ ${min.toLocaleString('pt-BR')} - R$ ${max.toLocaleString('pt-BR')}`
    if (min) return `A partir de R$ ${min.toLocaleString('pt-BR')}`
    if (max) return `Até R$ ${max.toLocaleString('pt-BR')}`
    return 'Salário a combinar'
  }

  const getEmploymentTypeText = (type: string) => {
    switch (type) {
      case 'junior':
        return 'Júnior'
      case 'pleno':
        return 'Pleno'
      case 'senior':
        return 'Sênior'
      case 'full-time':
        return 'Tempo Integral'
      case 'part-time':
        return 'Meio Período'
      case 'contract':
        return 'Contrato'
      case 'internship':
        return 'Estágio'
      case 'freelance':
        return 'Freelance'
      default:
        return type
    }
  }

  const getWorkModelText = (remote: boolean, location?: string) => {
    if (remote) return 'Remoto'
    if (location) return location
    return 'Presencial'
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    if (score >= 60) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getCompatibilityText = (score: number) => {
    if (score >= 90) return 'Excelente Compatibilidade'
    if (score >= 80) return 'Boa Compatibilidade'
    if (score >= 70) return 'Compatibilidade Moderada'
    if (score >= 60) return 'Compatibilidade Básica'
    return 'Baixa Compatibilidade'
  }

  const getCompatibilityDescription = (score: number) => {
    if (score >= 90) return 'Esta vaga é altamente compatível com seu perfil e objetivos profissionais.'
    if (score >= 80) return 'Esta vaga tem boa compatibilidade com suas habilidades e experiência.'
    if (score >= 70) return 'Esta vaga apresenta compatibilidade moderada com seu perfil atual.'
    if (score >= 60) return 'Esta vaga tem compatibilidade básica, mas pode exigir desenvolvimento adicional.'
    return 'Esta vaga pode não ser a melhor opção para seu perfil atual.'
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !job) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erro
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error || 'Vaga não encontrada'}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => router.push('/jobs')}>
                Voltar para Vagas
              </Button>
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
            <Button
              variant="outline"
              onClick={() => router.push('/jobs')}
              className="mb-4"
            >
              ← Voltar para Vagas
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {job.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {job.company?.name || 'Empresa não informada'}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {getWorkModelText(job.remote_work, job.location)}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {getEmploymentTypeText(job.employment_type)}
              </span>
              {job.company?.is_inclusive && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  Empresa Inclusiva
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descrição */}
              <Card>
                <CardHeader>
                  <CardTitle>Descrição da Vaga</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Requisitos */}
              {job.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requisitos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {job.requirements}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Benefícios */}
              {job.benefits && (
                <Card>
                  <CardHeader>
                    <CardTitle>Benefícios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {job.benefits}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Índice de Compatibilidade Farol */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Índice de Compatibilidade Farol
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {calculatingCompatibility ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Calculando compatibilidade...</p>
                    </div>
                  ) : compatibilityScore !== null ? (
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold mb-4 ${getCompatibilityColor(compatibilityScore)}`}>
                        {compatibilityScore}%
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {getCompatibilityText(compatibilityScore)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {getCompatibilityDescription(compatibilityScore)}
                      </p>
                      
                      {/* Fatores de Compatibilidade */}
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Experiência</span>
                          <span className="font-medium text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Habilidades</span>
                          <span className="font-medium text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Localização</span>
                          <span className="font-medium text-green-600">✓</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Acessibilidade</span>
                          <span className="font-medium text-green-600">✓</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">Compatibilidade não calculada</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informações da Vaga */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Vaga</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Salário</h4>
                    <p className="text-gray-600">{formatSalary(job.salary_min, job.salary_max)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Localização</h4>
                    <p className="text-gray-600">
                      {job.remote_work ? 'Remoto' : (job.location || 'Não informado')}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Tipo de Emprego</h4>
                    <p className="text-gray-600">{getEmploymentTypeText(job.employment_type)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Data de Publicação</h4>
                    <p className="text-gray-600">
                      {new Date(job.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Informações da Empresa */}
              {job.company && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Nome</h4>
                      <p className="text-gray-600">{job.company.name}</p>
                    </div>
                    
                    {job.company.industry && (
                      <div>
                        <h4 className="font-medium text-gray-900">Setor</h4>
                        <p className="text-gray-600">{job.company.industry}</p>
                      </div>
                    )}
                    
                    {job.company.size && (
                      <div>
                        <h4 className="font-medium text-gray-900">Tamanho</h4>
                        <p className="text-gray-600">{job.company.size}</p>
                      </div>
                    )}
                    
                    {job.company.location && (
                      <div>
                        <h4 className="font-medium text-gray-900">Localização</h4>
                        <p className="text-gray-600">{job.company.location}</p>
                      </div>
                    )}
                    
                    {job.company.is_inclusive && (
                      <div>
                        <h4 className="font-medium text-gray-900">Inclusão</h4>
                        <p className="text-green-600 font-medium">Empresa Inclusiva</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Botão de Candidatura */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full"
                    size="lg"
                  >
                    {applying ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Candidatando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Candidatar-se
                      </>
                    )}
                  </Button>
                  
                  {compatibilityScore !== null && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 text-center">
                        <strong>Compatibilidade:</strong> {compatibilityScore}% - {getCompatibilityText(compatibilityScore)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
