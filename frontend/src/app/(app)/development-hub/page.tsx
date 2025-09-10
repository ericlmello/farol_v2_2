'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'
import Link from 'next/link'

interface Course {
  id: number
  title: string
  description: string
  duration: string
  level: string
  category: string
  progress?: number
  isCompleted?: boolean
  isRecommended?: boolean
}

interface LearningPath {
  id: number
  title: string
  description: string
  courses: Course[]
  progress: number
  estimatedTime: string
}

export default function DevelopmentHubPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadHubData()
  }, [])

  const loadHubData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Simular carregamento de dados (em produção, viria da API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados mockados baseados no mockup
      const mockCourses: Course[] = [
        {
          id: 1,
          title: "Fundamentos de React",
          description: "Aprenda os conceitos básicos do React, componentes, props e estado.",
          duration: "4 semanas",
          level: "Iniciante",
          category: "Desenvolvimento Frontend",
          progress: 75,
          isRecommended: true
        },
        {
          id: 2,
          title: "Acessibilidade Web",
          description: "Desenvolva interfaces inclusivas seguindo as diretrizes WCAG.",
          duration: "3 semanas",
          level: "Intermediário",
          category: "Acessibilidade",
          progress: 0,
          isRecommended: true
        },
        {
          id: 3,
          title: "TypeScript Avançado",
          description: "Domine TypeScript com tipos avançados, generics e decorators.",
          duration: "5 semanas",
          level: "Avançado",
          category: "Desenvolvimento Frontend",
          progress: 30,
          isRecommended: false
        },
        {
          id: 4,
          title: "Comunicação Eficaz",
          description: "Melhore suas habilidades de comunicação em ambiente profissional.",
          duration: "2 semanas",
          level: "Iniciante",
          category: "Soft Skills",
          progress: 100,
          isCompleted: true,
          isRecommended: true
        }
      ]

      const mockLearningPaths: LearningPath[] = [
        {
          id: 1,
          title: "Trilha Frontend Inclusivo",
          description: "Desenvolva interfaces acessíveis e inclusivas com as melhores práticas.",
          courses: mockCourses.filter(c => c.category === "Desenvolvimento Frontend" || c.category === "Acessibilidade"),
          progress: 60,
          estimatedTime: "12 semanas"
        },
        {
          id: 2,
          title: "Trilha Soft Skills",
          description: "Desenvolva habilidades interpessoais essenciais para o mercado de trabalho.",
          courses: mockCourses.filter(c => c.category === "Soft Skills"),
          progress: 100,
          estimatedTime: "4 semanas"
        }
      ]

      setCourses(mockCourses)
      setLearningPaths(mockLearningPaths)
    } catch (err: any) {
      console.error('Erro ao carregar dados do hub:', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'iniciante':
        return 'bg-green-100 text-green-800'
      case 'intermediário':
        return 'bg-yellow-100 text-yellow-800'
      case 'avançado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-muted text-foreground'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Desenvolvimento Frontend':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )
      case 'Acessibilidade':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )
      case 'Soft Skills':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded"></div>
                  ))}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hub de Desenvolvimento
          </h1>
          <p className="text-muted-foreground">
            Desenvolva suas habilidades com trilhas personalizadas e cursos recomendados
          </p>
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
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trilhas de Aprendizagem */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Trilhas de Aprendizagem
            </h2>
            
            <div className="space-y-6">
              {learningPaths.map((path) => (
                <Card key={path.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{path.title}</CardTitle>
                        <CardDescription className="mb-4">{path.description}</CardDescription>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Progresso</span>
                            <span>{path.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${path.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{path.courses.length} cursos</span>
                      <span>{path.estimatedTime}</span>
                    </div>
                    
                    {/* Course List */}
                    <div className="space-y-2">
                      {path.courses.slice(0, 3).map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center">
                            {getCategoryIcon(course.category)}
                            <span className="ml-2 text-sm font-medium">{course.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {course.isCompleted ? (
                              <span className="text-green-600 text-xs">✓ Concluído</span>
                            ) : (
                              <span className="text-blue-600 text-xs">{course.progress}%</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {path.courses.length > 3 && (
                        <div className="text-center text-sm text-muted-foreground">
                          +{path.courses.length - 3} cursos adicionais
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Link href={`/development-hub/path/${path.id}`} className="w-full">
                      <Button className="w-full">
                        {path.progress === 100 ? 'Revisar Trilha' : 'Continuar Trilha'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Cursos Recomendados */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Cursos Recomendados
            </h2>
            
            <div className="space-y-4">
              {courses.filter(course => course.isRecommended).map((course) => (
                <Card key={course.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getCategoryIcon(course.category)}
                          <span className="ml-2 text-sm text-muted-foreground">{course.category}</span>
                        </div>
                        <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                        <CardDescription className="mb-3">{course.description}</CardDescription>
                      </div>
                      {course.isCompleted && (
                        <div className="ml-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Concluído
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                        <span className="text-sm text-muted-foreground">{course.duration}</span>
                      </div>
                    </div>
                    
                    {!course.isCompleted && course.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>Progresso</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Link href={`/development-hub/${course.id}`} className="w-full">
                      <Button 
                        className="w-full border-[#061531] hover:bg-[#061531] hover:text-[#f9f7f2] transition-colors duration-200" 
                        variant={course.isCompleted ? "outline" : "default"}
                      >
                        {course.isCompleted ? 'Revisar Curso' : course.progress && course.progress > 0 ? 'Continuar Curso' : 'Iniciar Curso'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
