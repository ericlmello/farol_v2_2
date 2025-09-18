'use client'

import { useState } from 'react'
import { Award, Building, MessageSquare, ShieldCheck, ThumbsUp, User, Users } from 'lucide-react'

// Componente de Card para os Níveis do Selo
const SealLevelCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
    <div className={`p-6 border-l-4 ${color}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
)

// Componente de Card para os Critérios de Avaliação
const CriteriaCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 text-indigo-500 mt-1">{icon}</div>
            <div>
                <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
                <div className="mt-2 text-gray-600 space-y-2">{children}</div>
            </div>
        </div>
    </div>
)


export default function InclusiveCompanySealPage() {
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [testimonial, setTestimonial] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você adicionaria a lógica para enviar os dados para o backend
    console.log({
      name: isAnonymous ? 'Anônimo' : name,
      companyName,
      testimonial,
    })
    setIsSubmitted(true)
    // Resetar o formulário após um tempo
    setTimeout(() => {
        setIsSubmitted(false)
        setName('')
        setCompanyName('')
        setTestimonial('')
        setIsAnonymous(false)
    }, 5000)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <ShieldCheck className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Selo Empresa Inclusiva
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Reconhecemos e celebramos as empresas que constroem um futuro de trabalho mais justo e acessível para todos.
          </p>
        </div>

        {/* Níveis do Selo */}
        <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Nossos Selos de Reconhecimento</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SealLevelCard
                    icon={<Award className="h-8 w-8 text-yellow-700" />}
                    title="Bronze"
                    description="Para empresas que iniciaram sua jornada na inclusão, cumprindo os requisitos fundamentais de acessibilidade e representatividade."
                    color="border-yellow-700"
                />
                <SealLevelCard
                    icon={<Award className="h-8 w-8 text-gray-500" />}
                    title="Prata"
                    description="Concedido a empresas com práticas de inclusão consolidadas, que demonstram progresso contínuo e desenvolvem planos de carreira para PCDs."
                    color="border-gray-500"
                />
                <SealLevelCard
                    icon={<Award className="h-8 w-8 text-yellow-500" />}
                    title="Ouro"
                    description="O mais alto nível de reconhecimento, para empresas que são referência em inclusão, com liderança diversa e impacto positivo validado pela comunidade."
                    color="border-yellow-500"
                />
            </div>
        </div>

        {/* Critérios de Avaliação */}
        <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Como Obter o Selo?</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CriteriaCard icon={<Building size={24} />} title="Estrutura e Acessibilidade">
                    <p>Avaliamos a acessibilidade física e digital da empresa, garantindo que os ambientes e ferramentas de trabalho sejam utilizáveis por todos.</p>
                </CriteriaCard>
                <CriteriaCard icon={<Users size={24} />} title="Representatividade e Carreira">
                    <ul className="list-disc pl-5">
                        <li><strong>Quantidade de Pessoas com Deficiência (PCDs):</strong> Análise do percentual de colaboradores com deficiência no quadro total.</li>
                        <li><strong>Liderança Inclusiva:</strong> Presença de PCDs em cargos de gestão e liderança.</li>
                        <li><strong>Plano de Carreira:</strong> Existência e aplicação de um plano de desenvolvimento profissional claro e equitativo para colaboradores com deficiência.</li>
                    </ul>
                </CriteriaCard>
                <CriteriaCard icon={<ThumbsUp size={24} />} title="Vozes da Comunidade">
                    <p>A percepção da comunidade é fundamental. O selo é diretamente influenciado por avaliações e depoimentos de:</p>
                     <ul className="list-disc pl-5">
                        <li>Funcionários e ex-funcionários com deficiência.</li>
                        <li>Candidatos com deficiência que participaram de processos seletivos.</li>
                    </ul>
                </CriteriaCard>
                 <div className="bg-indigo-50 p-6 rounded-lg shadow-sm flex items-center">
                    <div className="flex-shrink-0 text-indigo-500 mr-4">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900">A Importância dos Depoimentos</h4>
                        <p className="mt-2 text-gray-600">As experiências vividas são o termômetro mais fiel da cultura de uma empresa. Por isso, os depoimentos têm um peso significativo em nossa avaliação.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Formulário de Depoimento */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-800">Faça a Diferença: Envie seu Depoimento</h2>
          <p className="mt-3 text-center text-gray-600 max-w-xl mx-auto">
            Sua experiência ajuda a construir um mercado de trabalho mais transparente e inclusivo. Compartilhe sua vivência em uma empresa.
          </p>

          {isSubmitted ? (
            <div className="mt-8 text-center bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md">
              <h3 className="font-bold">Obrigado!</h3>
              <p>Seu depoimento foi enviado com sucesso e contribuirá para nossa avaliação.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 max-w-xl mx-auto">
              <div className="grid grid-cols-1 gap-y-6">
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                    Nome da Empresa
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="company-name"
                      id="company-name"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Seu Nome <span className="text-gray-500">(Opcional)</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isAnonymous}
                      className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                    <input
                        id="anonymous"
                        name="anonymous"
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                        Quero enviar meu depoimento de forma anônima
                    </label>
                </div>
                <div>
                  <label htmlFor="testimonial" className="block text-sm font-medium text-gray-700">
                    Depoimento
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="testimonial"
                      name="testimonial"
                      rows={5}
                      required
                      value={testimonial}
                      onChange={(e) => setTestimonial(e.target.value)}
                      className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enviar Depoimento
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


