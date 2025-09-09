'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { profileService, type Profile, type ProfileUpdate } from '@/lib/profile'
import { Button, Input } from '@/components/ui'

export default function ProfileEditPage() {
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
    disability_description: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
        disability_description: profile.disability_description || ''
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
        disability_description: formData.disability_description || undefined
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
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cadastro Guiado
              </h1>
              <p className="text-muted-foreground">
                Complete seu perfil profissional para ter acesso a oportunidades personalizadas
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Completo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
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
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome *
                  </label>
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
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivo/Cargo Desejado *
                </label>
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
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferência de Local/Remote/Híbrido
                </label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: São Paulo - SP, Remoto, Híbrido, etc."
                  className="w-full"
                />
              </div>

              {/* Necessidades de Acessibilidade */}
              <div>
                <label htmlFor="accessibility_needs" className="block text-sm font-medium text-gray-700 mb-2">
                  Necessidades de Acessibilidade
                </label>
                <select
                  id="accessibility_needs"
                  name="accessibility_needs"
                  value={formData.accessibility_needs}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {accessibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                <label htmlFor="has_disability" className="ml-2 block text-sm text-gray-700">
                  Declaro que tenho deficiência e gostaria de receber suporte específico
                </label>
              </div>

              {/* Campos condicionais para deficiência */}
              {formData.has_disability && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  <div>
                    <label htmlFor="disability_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Deficiência
                    </label>
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
                    <label htmlFor="disability_description" className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição Adicional
                    </label>
                    <textarea
                      id="disability_description"
                      name="disability_description"
                      rows={3}
                      value={formData.disability_description}
                      onChange={handleInputChange}
                      placeholder="Descreva suas necessidades específicas ou adaptações necessárias..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Resumo da Experiência */}
              <div>
                <label htmlFor="experience_summary" className="block text-sm font-medium text-gray-700 mb-2">
                  Resumo da Experiência
                </label>
                <textarea
                  id="experience_summary"
                  name="experience_summary"
                  rows={4}
                  placeholder="Conte-nos sobre sua experiência profissional, projetos relevantes e conquistas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="px-6 py-2 border-[#061531] bg-[#f9f7f2] text-[#061531] hover:bg-[#061531] hover:text-[#f9f7f2]"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
