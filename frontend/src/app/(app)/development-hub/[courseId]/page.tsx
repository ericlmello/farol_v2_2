'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function CourseDetailsPage() {
  const params = useParams()
  const courseId = params.courseId

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Detalhes do Curso
            </h1>
            <p className="text-muted-foreground">
              ID do Curso: {courseId}
            </p>
          </div>

          {/* Conteúdo do Curso */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">
                Curso de Desenvolvimento Web
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Aprenda as tecnologias mais demandadas do mercado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Sobre este curso
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Este curso abrange as principais tecnologias de desenvolvimento web, 
                  incluindo HTML, CSS, JavaScript, React e Node.js. Você aprenderá a 
                  criar aplicações web modernas e responsivas.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  O que você vai aprender
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Fundamentos de HTML e CSS</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>JavaScript moderno (ES6+)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>React e componentes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Node.js e Express</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Bancos de dados e APIs</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Informações do Curso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="text-foreground font-medium">40 horas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nível:</span>
                    <span className="text-foreground font-medium">Intermediário</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modalidade:</span>
                    <span className="text-foreground font-medium">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certificado:</span>
                    <span className="text-foreground font-medium">Sim</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button className="flex-1">
                  Iniciar Curso
                </Button>
                <Button variant="outline" className="flex-1">
                  Adicionar aos Favoritos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botão Voltar */}
          <div className="text-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              ← Voltar ao Hub de Desenvolvimento
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
