'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Select, Label } from '@/components/ui'
import { simulationsService, SimulationConfig } from '@/lib/simulations'

interface LocalSimulationConfig {
  interviewType: string
  difficultyLevel: string
  duration: string
  interactionMode: string
  focusAreas: string[]
}

export default function SimulationStartPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [config, setConfig] = useState<LocalSimulationConfig>({
    interviewType: '',
    difficultyLevel: '',
    duration: '30',
    interactionMode: 'text',
    focusAreas: []
  })
  
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  const interviewTypes = [
    { value: 'technical', label: 'Entrevista Técnica', description: 'Foco em habilidades técnicas e conhecimento específico' },
    { value: 'behavioral', label: 'Entrevista Comportamental', description: 'Avaliação de soft skills e experiências passadas' },
    { value: 'mixed', label: 'Entrevista Mista', description: 'Combinação de aspectos técnicos e comportamentais' },
    { value: 'case_study', label: 'Estudo de Caso', description: 'Resolução de problemas práticos e análise de cenários' }
  ]

  const difficultyLevels = [
    { value: 'beginner', label: 'Iniciante', description: 'Perguntas básicas e conceitos fundamentais' },
    { value: 'intermediate', label: 'Intermediário', description: 'Conceitos intermediários e aplicação prática' },
    { value: 'advanced', label: 'Avançado', description: 'Conceitos complexos e resolução de problemas avançados' },
    { value: 'expert', label: 'Especialista', description: 'Conceitos especializados e arquitetura de sistemas' }
  ]

  const durations = [
    { value: '15', label: '15 minutos' },
    { value: '30', label: '30 minutos' },
    { value: '45', label: '45 minutos' },
    { value: '60', label: '1 hora' }
  ]

  const interactionModes = [
    { value: 'text', label: 'Modo Texto', description: 'Digite suas respostas' },
    { value: 'voice', label: 'Modo Voz', description: 'Fale suas respostas (em breve)' }
  ]

  const focusAreas = [
    { value: 'frontend', label: 'Frontend Development' },
    { value: 'backend', label: 'Backend Development' },
    { value: 'fullstack', label: 'Full Stack Development' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'devops', label: 'DevOps & Infrastructure' },
    { value: 'data', label: 'Data Science & Analytics' },
    { value: 'ai', label: 'AI & Machine Learning' },
    { value: 'security', label: 'Cybersecurity' }
  ]

  const handleConfigChange = (key: keyof LocalSimulationConfig, value: string | string[]) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
    
    if (error) setError('')
  }

  const handleFocusAreaToggle = (area: string) => {
    setConfig(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }))
  }

  const handleStartSimulation = async () => {
    if (!config.interviewType || !config.difficultyLevel) {
      setError('Por favor, selecione o tipo de entrevista e o nível de dificuldade.')
      return
    }

    setIsStarting(true)
    setError('')

    try {
      const simulationConfig: SimulationConfig = {
        interview_type: config.interviewType,
        difficulty_level: config.difficultyLevel,
        duration: config.duration,
        interaction_mode: config.interactionMode,
        focus_areas: config.focusAreas
      }

      // Salvar configuração no localStorage
      localStorage.setItem('simulationConfig', JSON.stringify(simulationConfig))
      
      // Redirecionar para a tela ativa com a configuração
      const configParam = encodeURIComponent(JSON.stringify(simulationConfig))
      router.push(`/simulation/active?config=${configParam}`)
    } catch (err: any) {
      console.error('Erro ao iniciar simulação:', err)
      setError(err.message || 'Erro ao iniciar simulação. Tente novamente.')
    } finally {
      setIsStarting(false)
    }
  }

  const isConfigValid = config.interviewType && config.difficultyLevel

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuração da Simulação
            </h1>
            <p className="text-muted-foreground">
              Configure sua simulação de entrevista personalizada e pratique suas habilidades
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erro</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Tipo de Entrevista
                  </CardTitle>
                  <CardDescription>
                    Escolha o tipo de entrevista que deseja praticar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {interviewTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          config.interviewType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleConfigChange('interviewType', type.value)}
                      >
                        <div className="flex items-start">
                          <div className={`w-4 h-4 rounded-full border-2 mt-1 mr-3 ${
                            config.interviewType === type.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {config.interviewType === type.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{type.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Nível de Dificuldade
                  </CardTitle>
                  <CardDescription>
                    Selecione o nível de dificuldade das perguntas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {difficultyLevels.map((level) => (
                      <div
                        key={level.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          config.difficultyLevel === level.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleConfigChange('difficultyLevel', level.value)}
                      >
                        <div className="flex items-start">
                          <div className={`w-4 h-4 rounded-full border-2 mt-1 mr-3 ${
                            config.difficultyLevel === level.value
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {config.difficultyLevel === level.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{level.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Duração da Simulação
                          </CardTitle>
                          <CardDescription>
                            Escolha quanto tempo deseja dedicar à simulação
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Select
                            value={config.duration}
                            onChange={(e) => handleConfigChange('duration', e.target.value)}
                            className="w-full"
                          >
                            {durations.map((duration) => (
                              <option key={duration.value} value={duration.value}>
                                {duration.label}
                              </option>
                            ))}
                          </Select>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Modo de Interação
                          </CardTitle>
                          <CardDescription>
                            Escolha como deseja interagir durante a simulação
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {interactionModes.map((mode) => (
                              <div
                                key={mode.value}
                                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                                  config.interactionMode === mode.value
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleConfigChange('interactionMode', mode.value)}
                              >
                                <div className="flex items-start">
                                  <div className={`w-4 h-4 rounded-full border-2 mt-1 mr-3 ${
                                    config.interactionMode === mode.value
                                      ? 'border-indigo-500 bg-indigo-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {config.interactionMode === mode.value && (
                                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{mode.label}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Áreas de Foco (Opcional)
                  </CardTitle>
                  <CardDescription>
                    Selecione as áreas que deseja focar durante a simulação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {focusAreas.map((area) => (
                      <div
                        key={area.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          config.focusAreas.includes(area.value)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleFocusAreaToggle(area.value)}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded border-2 mr-2 ${
                            config.focusAreas.includes(area.value)
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-300'
                          }`}>
                            {config.focusAreas.includes(area.value) && (
                              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium">{area.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStartSimulation}
              disabled={!isConfigValid || isStarting}
              className="px-6 py-2 border-[#061531] bg-[#f9f7f2] text-[#061531] hover:bg-[#061531] hover:text-[#f9f7f2]"
            >
              {isStarting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Iniciar Simulação
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
