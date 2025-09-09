'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { profileService, type Profile, type ProfileUpdate } from '@/lib/profile'
import { Button, Input, Textarea, Select, Label, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    accessibility_needs: '',
    has_disability: false,
    disability_type: '',
    disability_description: '',
    experience_summary: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados para upload de currículo
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [cvAnalysis, setCvAnalysis] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carregar dados do perfil ao montar o componente
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const profile = await profileService.getMyProfile()
      
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        accessibility_needs: profile.accessibility_needs || '',
        has_disability: profile.has_disability || false,
        disability_type: profile.disability_type || '',
        disability_description: profile.disability_description || '',
        experience_summary: profile.experience_summary || ''
      })
    } catch (err: any) {
      console.error('Erro ao carregar perfil:', err)
      // Se o perfil não existe, continuar com formulário vazio
      if (err.response?.status !== 404) {
        setError('Erro ao carregar dados do perfil')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Limpar mensagens de erro/sucesso quando usuário começar a digitar
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // Preparar dados para envio
      const profileUpdate: ProfileUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio,
        location: formData.location,
        accessibility_needs: formData.accessibility_needs,
        has_disability: formData.has_disability,
        disability_type: formData.disability_type || undefined,
        disability_description: formData.disability_description || undefined,
        experience_summary: formData.experience_summary || undefined
      }

      await profileService.updateMyProfile(profileUpdate)
      
      setSuccess('Perfil salvo com sucesso!')
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err)
      setError(
        err.response?.data?.detail || 
        'Erro ao salvar perfil. Tente novamente.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou TXT.')
      return
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Máximo 10MB.')
      return
    }

    try {
      setIsUploading(true)
      setUploadError('')
      setUploadSuccess('')

      const result = await profileService.uploadCV(file)
      setUploadSuccess('Currículo enviado e analisado com sucesso!')
      setCvAnalysis(result.analysis)
      
      // Atualizar o campo de experiência com o texto extraído
      setFormData(prev => ({
        ...prev,
        experience_summary: result.extracted_text || ''
      }))

    } catch (err: any) {
      console.error('Erro ao fazer upload:', err)
      setUploadError(err.message || 'Erro ao fazer upload do arquivo. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleViewAnalysis = () => {
    router.push('/profile/analysis')
  }

  const workModelOptions = [
    { value: '', label: 'Selecione uma opção' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'remoto', label: 'Remoto' },
    { value: 'hibrido', label: 'Híbrido' },
    { value: 'flexivel', label: 'Flexível' }
  ]

  const accessibilityOptions = [
    { value: '', label: 'Selecione uma opção' },
    { value: 'none', label: 'Nenhuma necessidade específica' },
    { value: 'visual', label: 'Suporte visual (leitor de tela, alto contraste)' },
    { value: 'auditory', label: 'Suporte auditivo (legendas, intérprete de libras)' },
    { value: 'motor', label: 'Suporte motor (teclado, mouse adaptado)' },
    { value: 'cognitive', label: 'Suporte cognitivo (instruções claras, tempo extra)' },
    { value: 'other', label: 'Outras necessidades' }
  ]

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={['candidate']}>
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                ))}
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Cadastro Guiado
            </h1>
            <p className="text-muted-foreground">
              Complete seu perfil profissional para ter acesso a oportunidades personalizadas
            </p>
          </div>

          {/* Upload de Currículo */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload de Currículo
              </CardTitle>
              <CardDescription>
                Faça upload do seu currículo para análise automática com IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-muted-foreground" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-sm text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Clique para fazer upload
                      </button>
                      {' '}ou arraste e solte
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX ou TXT (máximo 10MB)
                    </p>
                  </div>
                </div>

                {/* Mensagens de Upload */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Erro no Upload</h3>
                        <div className="mt-2 text-sm text-red-700">{uploadError}</div>
                      </div>
                    </div>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Upload Realizado</h3>
                        <div className="mt-2 text-sm text-green-700">{uploadSuccess}</div>
                        {cvAnalysis && (
                          <div className="mt-3">
                            <Button
                              type="button"
                              onClick={handleViewAnalysis}
                              className=""
                            >
                              Ver Análise Completa
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Analisando currículo...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome Completo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-2">
                  Nome *
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Seu nome"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="block text-sm font-medium text-foreground mb-2">
                  Sobrenome *
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Seu sobrenome"
                  className="w-full"
                />
              </div>
            </div>

            {/* Objetivo/Cargo Desejado */}
            <div>
              <Label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                Objetivo/Cargo Desejado *
              </Label>
              <Input
                id="bio"
                name="bio"
                type="text"
                required
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Ex: Desenvolvedor Frontend, Analista de Dados, etc."
                className="w-full"
              />
            </div>

            {/* Preferência de Local/Remote/Híbrido */}
            <div>
              <Label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                Preferência de Local/Remote/Híbrido
              </Label>
              <Select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full"
              >
                {workModelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Necessidades de Acessibilidade */}
            <div>
              <Label htmlFor="accessibility_needs" className="block text-sm font-medium text-foreground mb-2">
                Necessidades de Acessibilidade
              </Label>
              <Select
                id="accessibility_needs"
                name="accessibility_needs"
                value={formData.accessibility_needs}
                onChange={handleInputChange}
                className="w-full"
              >
                {accessibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Checkbox para Deficiência */}
            <div className="flex items-center">
              <input
                id="has_disability"
                name="has_disability"
                type="checkbox"
                checked={formData.has_disability}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="has_disability" className="ml-2 block text-sm text-foreground">
                Declaro que tenho deficiência e gostaria de receber suporte específico
              </Label>
            </div>

            {/* Campos condicionais para deficiência */}
            {formData.has_disability && (
              <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                <div>
                  <Label htmlFor="disability_type" className="block text-sm font-medium text-foreground mb-2">
                    Tipo de Deficiência
                  </Label>
                  <Input
                    id="disability_type"
                    name="disability_type"
                    type="text"
                    value={formData.disability_type}
                    onChange={handleInputChange}
                    placeholder="Ex: Visual, Auditiva, Motora, etc."
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="disability_description" className="block text-sm font-medium text-foreground mb-2">
                    Descrição Adicional
                  </Label>
                  <Textarea
                    id="disability_description"
                    name="disability_description"
                    rows={3}
                    value={formData.disability_description}
                    onChange={handleInputChange}
                    placeholder="Descreva suas necessidades específicas ou adaptações necessárias..."
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Resumo da Experiência */}
            <div>
              <Label htmlFor="experience_summary" className="block text-sm font-medium text-foreground mb-2">
                Resumo da Experiência
              </Label>
              <Textarea
                id="experience_summary"
                name="experience_summary"
                rows={4}
                value={formData.experience_summary}
                onChange={handleInputChange}
                placeholder="Conte-nos sobre sua experiência profissional, projetos relevantes e conquistas..."
                className="w-full"
              />
            </div>

            {/* Mensagens de Erro e Sucesso */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
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

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 7.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Sucesso
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      {success}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  'Salvar e continuar'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
