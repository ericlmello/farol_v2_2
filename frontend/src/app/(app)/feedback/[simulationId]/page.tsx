'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function FeedbackDetailsPage() {
  const params = useParams()
  const simulationId = params.simulationId

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Detalhes do Feedback
            </h1>
            <p className="text-muted-foreground">
              ID da Simulação: {simulationId}
            </p>
          </div>

          {/* Conteúdo do Feedback */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">
                Simulação de Entrevista - Desenvolvedor Frontend
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Realizada em 15 de Janeiro de 2024
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Pontuação Geral
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-success">8.5</div>
                  <div className="flex-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">85% de aproveitamento</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Competências Avaliadas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Comunicação</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-foreground">9.0</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Conhecimento Técnico</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-foreground">8.0</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Resolução de Problemas</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-foreground">7.0</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Experiência Prática</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-foreground">8.5</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Pontos Fortes
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Excelente comunicação e clareza nas explicações</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Conhecimento sólido em React e JavaScript</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Experiência prática demonstrada em projetos</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Áreas para Melhoria
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Praticar mais algoritmos e estruturas de dados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Melhorar conhecimento em testes automatizados</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Recomendações
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Continue desenvolvendo projetos práticos e considere fazer cursos específicos 
                    em algoritmos e estruturas de dados. Sua base técnica está sólida, mas há 
                    espaço para crescimento em áreas mais avançadas de programação.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button className="flex-1">
                  Nova Simulação
                </Button>
                <Button variant="outline" className="flex-1">
                  Compartilhar Resultado
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botão Voltar */}
          <div className="text-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              ← Voltar ao Histórico de Feedback
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}