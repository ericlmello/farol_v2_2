'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface Message {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
}

interface Question {
  id: number
  question_text: string
  question_type: string
  difficulty: string
  time_limit: number
  order: number
}

interface SimulationResponse {
  response_id: string
  ai_feedback: string
  next_question: Question | null
  is_complete: boolean
  progress: {
    current: number
    total: number
  }
}

export default function SimulationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const simulationId = params.simulationId as string
  
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState({ current: 0, total: 6 })
  const [isComplete, setIsComplete] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (simulationId) {
      startSimulation()
    }
  }, [simulationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startSimulation = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Simular primeira pergunta
      const firstQuestion: Question = {
        id: 1,
        question_text: "Olá! Vamos começar nossa entrevista. Primeiro, me conte um pouco sobre você e sua experiência profissional.",
        question_type: "behavioral",
        difficulty: "beginner",
        time_limit: 300,
        order: 1
      }

      setCurrentQuestion(firstQuestion)
      setMessages([{
        id: '1',
        type: 'ai',
        content: firstQuestion.question_text,
        timestamp: new Date()
      }])
      setProgress({ current: 1, total: 6 })

    } catch (err: any) {
      console.error('Erro ao iniciar simulação:', err)
      setError('Erro ao iniciar simulação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Por favor, digite sua resposta.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      // Adicionar resposta do usuário ao chat
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: userAnswer,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Enviar resposta para a API
      const response = await fetch(`/api/v1/simulations/${simulationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          answer_text: userAnswer,
          current_question: progress.current
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao enviar resposta')
      }

      const result: SimulationResponse = await response.json()

      // Adicionar feedback da IA
      const aiFeedbackMessage: Message = {
        id: `ai_feedback_${Date.now()}`,
        type: 'ai',
        content: result.ai_feedback,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiFeedbackMessage])

      // Atualizar progresso
      setProgress(result.progress)

      if (result.is_complete) {
        setIsComplete(true)
        // Redirecionar para feedback após 2 segundos
        setTimeout(() => {
          router.push(`/feedback/${simulationId}`)
        }, 2000)
      } else if (result.next_question) {
        // Adicionar próxima pergunta
        const nextQuestionMessage: Message = {
          id: `ai_question_${Date.now()}`,
          type: 'ai',
          content: result.next_question.question_text,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, nextQuestionMessage])
        setCurrentQuestion(result.next_question)
      }

      setUserAnswer('')

    } catch (err: any) {
      console.error('Erro ao enviar resposta:', err)
      setError(err.message || 'Erro ao enviar resposta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Preparando sua simulação...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedUserTypes={['candidate']}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Simulador de Entrevista</h1>
              <p className="text-sm text-muted-foreground">
                Pergunta {progress.current} de {progress.total}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Progress Bar */}
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="text-sm"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isComplete && (
              <div className="flex justify-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-green-800">Simulação Concluída!</h3>
                  </div>
                  <p className="text-green-700">Redirecionando para o feedback...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {!isComplete && (
            <div className="border-t border-gray-200 p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua resposta aqui..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isSubmitting}
                  className="px-6 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Pressione Enter para enviar, Shift+Enter para nova linha
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
