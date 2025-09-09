'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { jobsService, type Job, type JobFilters } from '@/lib/jobs'
import { profileService, type Profile } from '@/lib/profile'
import { compatibilityService, type JobWithCompatibility } from '@/lib/compatibilityService'
import { getCompatibilityColor, getCompatibilityText } from '@/lib/compatibility'
import { Button, Input, Select, Label, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import Link from 'next/link'

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsWithCompatibility, setJobsWithCompatibility] = useState<JobWithCompatibility[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Filtros baseados no mockup
  const [filters, setFilters] = useState({
    area: '',
    nivel: '',
    modelo: '',
    acessibilidade: '',
    compatibility: '', // Novo filtro de compatibilidade
    limit: 20,
    offset: 0
  })

  // Carregar perfil do usuário
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await profileService.getProfile()
        setProfile(userProfile)
        // Atualizar o serviço de compatibilidade com o perfil do usuário
        compatibilityService.updateUserProfile(userProfile)
      } catch (err) {
        console.log('Perfil não encontrado ou usuário não é candidato')
        // Usar perfil padrão
        compatibilityService.updateUserProfile(null)
      }
    }
    
    if (user?.user_type === 'candidate') {
      loadProfile()
    } else {
      // Usar perfil padrão para não candidatos
      compatibilityService.updateUserProfile(null)
    }
  }, [user])

  useEffect(() => {
    // Primeira carga não é mudança de filtro
    if (jobs.length === 0 && loading) {
      loadJobs(false)
    } else {
      // Mudanças subsequentes são mudanças de filtro
      loadJobs(true)
    }
  }, [filters])

  const loadJobs = async (isFilterChange = false) => {
    try {
      if (isFilterChange) {
        setFilterLoading(true)
      } else {
        setLoading(true)
      }
      setError('')
      
      // Mapear filtros do mockup para filtros da API
      const apiFilters: JobFilters = {
        limit: filters.limit,
        offset: filters.offset
      }
      
      // Mapear filtros específicos
      if (filters.area) {
        apiFilters.title = filters.area
      }
      if (filters.modelo) {
        if (filters.modelo === 'remoto') {
          apiFilters.remote_work = true
        } else if (filters.modelo === 'presencial') {
          apiFilters.remote_work = false
        }
        // Para híbrido, não filtrar por remote_work (buscar ambos)
      }
      if (filters.nivel) {
        apiFilters.employment_type = filters.nivel
      }
      
      const jobsData = await jobsService.getJobs(apiFilters)
      setJobs(jobsData)
      
      // Calcular compatibilidade usando o serviço
      let jobsWithCompat = compatibilityService.calculateMultipleJobsCompatibility(jobsData)
      
      // Aplicar filtro de compatibilidade
      if (filters.compatibility) {
        const minScore = parseInt(filters.compatibility)
        jobsWithCompat = compatibilityService.filterJobsByCompatibility(jobsWithCompat, minScore)
      }
      
      // Ordenar por compatibilidade se não há outros filtros específicos
      if (!filters.area && !filters.nivel && !filters.modelo) {
        jobsWithCompat = compatibilityService.sortJobsByCompatibility(jobsWithCompat)
      }
      
      setJobsWithCompatibility(jobsWithCompat)
    } catch (err: any) {
      console.error('Erro ao carregar vagas:', err)
      setError('Erro ao carregar vagas. Tente novamente.')
    } finally {
      setLoading(false)
      setFilterLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0
    }))
  }

  const clearFilters = () => {
    setFilters({
      area: '',
      nivel: '',
      modelo: '',
      acessibilidade: '',
      compatibility: '',
      limit: 20,
      offset: 0
    })
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

  if (loading && jobs.length === 0) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-lg shadow p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Buscar Vagas
            </h1>
            <p className="mt-2 text-muted-foreground">
              Encontre a oportunidade perfeita para sua carreira
            </p>
          </div>

          {/* Filtros baseados no mockup */}
          <div className="bg-card shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Área */}
              <div>
                <Label htmlFor="area" className="block text-sm font-medium text-foreground mb-2">
                  Área
                </Label>
                <Select
                  id="area"
                  value={filters.area}
                  onChange={(e) => handleFilterChange('area', e.target.value)}
                  className="w-full"
                >
                  <option value="">Todas as áreas</option>
                  <option value="desenvolvimento">Desenvolvimento</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="vendas">Vendas</option>
                  <option value="rh">Recursos Humanos</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="operacoes">Operações</option>
                </Select>
              </div>

              {/* Nível */}
              <div>
                <Label htmlFor="nivel" className="block text-sm font-medium text-foreground mb-2">
                  Nível
                </Label>
                <Select
                  id="nivel"
                  value={filters.nivel}
                  onChange={(e) => handleFilterChange('nivel', e.target.value)}
                  className="w-full"
                >
                  <option value="">Todos os níveis</option>
                  <option value="junior">Júnior</option>
                  <option value="pleno">Pleno</option>
                  <option value="senior">Sênior</option>
                  <option value="estagio">Estágio</option>
                  <option value="trainee">Trainee</option>
                </Select>
              </div>

              {/* Modelo */}
              <div>
                <Label htmlFor="modelo" className="block text-sm font-medium text-foreground mb-2">
                  Modelo
                </Label>
                <Select
                  id="modelo"
                  value={filters.modelo}
                  onChange={(e) => handleFilterChange('modelo', e.target.value)}
                  className="w-full"
                >
                  <option value="">Todos os modelos</option>
                  <option value="remoto">Remoto</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </Select>
              </div>

              {/* Acessibilidade */}
              <div>
                <Label htmlFor="acessibilidade" className="block text-sm font-medium text-foreground mb-2">
                  Acessibilidade
                </Label>
                <Select
                  id="acessibilidade"
                  value={filters.acessibilidade}
                  onChange={(e) => handleFilterChange('acessibilidade', e.target.value)}
                  className="w-full"
                >
                  <option value="">Todas as vagas</option>
                  <option value="inclusiva">Empresas Inclusivas</option>
                  <option value="pcd">Vagas PCD</option>
                  <option value="acessivel">Totalmente Acessível</option>
                </Select>
              </div>

              {/* Compatibilidade */}
              {profile && (
                <div>
                  <Label htmlFor="compatibility" className="block text-sm font-medium text-foreground mb-2">
                    Compatibilidade
                  </Label>
                  <Select
                    id="compatibility"
                    value={filters.compatibility}
                    onChange={(e) => handleFilterChange('compatibility', e.target.value)}
                    className="w-full"
                  >
                    <option value="">Todas as vagas</option>
                    <option value="80">Alta (80%+)</option>
                    <option value="60">Média (60%+)</option>
                    <option value="40">Baixa (40%+)</option>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={filterLoading}
              >
                Limpar Filtros
              </Button>
              <div className="flex items-center space-x-2">
                {filterLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                <div className="text-sm text-muted-foreground">
                  {jobs.length} vaga(s) encontrada(s)
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
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
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Grid */}
          <div className="relative">
            {filterLoading && (
              <div className="absolute inset-0 bg-background bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Aplicando filtros...</p>
                </div>
              </div>
            )}
            
            {jobsWithCompatibility.length === 0 && !loading ? (
            <div className="bg-card shadow rounded-lg p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">Nenhuma vaga encontrada</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente ajustar os filtros de busca ou verifique novamente mais tarde.
              </p>
              <div className="mt-6">
                <Button onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsWithCompatibility.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                  <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 line-clamp-2">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-sm mb-3">
                            {job.company?.name || 'Empresa não informada'}
                          </CardDescription>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {getWorkModelText(job.remote_work, job.location)}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              {getEmploymentTypeText(job.employment_type)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 flex flex-col items-end space-y-2">
                          {/* Indicador de Compatibilidade */}
                          {job.compatibility && (
                            <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold shadow-sm border ${getCompatibilityColor(job.compatibility.score)}`}>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              <span className="font-bold">{job.compatibility.score}%</span>
                            </div>
                          )}
                          
                          {/* Indicador de Empresa Inclusiva */}
                          {job.company?.is_inclusive && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Inclusiva
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Requisitos principais */}
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {job.requirements ? 
                            job.requirements.substring(0, 150) + (job.requirements.length > 150 ? '...' : '') :
                            job.description.substring(0, 150) + (job.description.length > 150 ? '...' : '')
                          }
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {formatSalary(job.salary_min, job.salary_max)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          </div>

          {/* Load More Button */}
          {jobsWithCompatibility.length > 0 && jobsWithCompatibility.length >= (filters.limit || 20) && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({ ...prev, offset: (prev.offset || 0) + (prev.limit || 20) }))}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Carregar Mais'}
              </Button>
            </div>
          )}
      </div>
    </ProtectedRoute>
  )
}
