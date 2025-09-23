'use client'


import { useState } from 'react'
import { Award, Building, MessageSquare, ShieldCheck, ThumbsUp, User, Users, ChevronDown, TrendingUp, Star, Rocket } from 'lucide-react'

// --- DADOS E TIPOS PARA A NOVA SEÇÃO DE RANKING ---
type SealType = 'gold' | 'silver' | 'bronze';
type Testimonial = {
  quote: string;
  author: string;
  role: 'Funcionário(a) Atual' | 'Ex-Funcionário(a)' | 'Candidato(a)' | 'Super usuário';
  avatarUrl: string;
};
type CompanyRanking = {
  rank: number;
  name: string;
  seal: SealType;
  score: number;
  testimonials: Testimonial[];
};

const fakeRankingData: CompanyRanking[] = [
  {
    rank: 1,
    name: 'InovaTech Soluções',
    seal: 'gold',
    score: 98,
    testimonials: [
      { quote: 'O processo seletivo foi super humano e transparente. A InovaTech realmente se preocupa com a inclusão.', author: 'Maria S.', role: 'Candidato(a)', avatarUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%234f46e5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" fill="%23e0e7ff" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`},
      { quote: 'Ambiente de trabalho excelente, com plano de carreira claro para todos.', author: 'João P.', role: 'Super usuário', avatarUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23065f46" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" fill="%23d1fae5" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`},
    ]
  },
  {
    rank: 2,
    name: 'DataMax Analytics',
    seal: 'silver',
    score: 89,
    testimonials: [
      { quote: 'A empresa ofereceu todo o suporte de acessibilidade que precisei durante a entrevista. Me senti muito acolhido.', author: 'Carlos P.', role: 'Funcionário(a) Atual', avatarUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%231e40af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" fill="%23dbeafe" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`},
      { quote: 'O processo de feedback após a entrevista poderia ser mais claro, mas a equipe foi muito respeitosa.', author: 'Anônimo', role: 'Candidato(a)', avatarUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%234b5563" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" fill="%23e5e7eb" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`},
    ]
  },
  {
    rank: 3,
    name: 'CriaDesign Studio',
    seal: 'bronze',
    score: 76,
    testimonials: [
      { quote: 'A equipe de RH foi muito atenciosa. O desafio técnico foi relevante para a vaga e bem estruturado.', author: 'Juliano M.', role: 'Candidato(a)', avatarUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2392400e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" fill="%23fef3c7" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>` },
      { quote: 'É um bom lugar para começar, mas sinto que o plano de carreira para PCDs poderia ser mais claro.', author: 'Anônimo', role: 'Super usuário', avatarUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23991b1b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" fill="%23fee2e2" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>` },
    ]
  }
];
// --- FIM DOS DADOS E TIPOS ---


// --- COMPONENTE PARA O CARD DE RANKING ---
const CompanyRankingCard = ({ company }: { company: CompanyRanking }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const sealConfig = {
        gold: { text: 'Ouro', iconColor: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-400' },
        silver: { text: 'Prata', iconColor: 'text-gray-500', bgColor: 'bg-gray-200', borderColor: 'border-gray-400' },
        bronze: { text: 'Bronze', iconColor: 'text-amber-600', bgColor: 'bg-amber-100', borderColor: 'border-amber-500' },
    };

    const config = sealConfig[company.seal];

    return (
        <div className={`bg-white rounded-lg shadow-sm border ${isExpanded ? config.borderColor : 'border-gray-200'} transition-all duration-300`}>
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center mb-4 sm:mb-0">
                    <span className="text-2xl font-bold text-gray-400 w-10">{company.rank}º</span>
                    <div className="ml-4">
                        <h4 className="font-bold text-lg text-gray-800">{company.name}</h4>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${config.bgColor} text-gray-800`}>
                             <Award className={`-ml-0.5 mr-1.5 h-4 w-4 ${config.iconColor}`} />
                             Selo {config.text}
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                     <div className="text-center mx-4">
                        <span className="font-bold text-2xl text-indigo-600">{company.score}</span>
                        <span className="text-xs block text-gray-500">Pontos</span>
                    </div>
                    <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 bg-gray-50/70 border-t border-gray-200">
                    <h5 className="flex items-center text-md font-semibold text-gray-800 mb-4">
                        <MessageSquare className="h-5 w-5 mr-2 text-indigo-500" />
                        O que a comunidade diz
                    </h5>
                     {company.testimonials.length > 0 ? (
                         <div className="space-y-4">
                             {company.testimonials.map((testimonial, index) => (
                                 <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start space-x-4">
                                     <img src={testimonial.avatarUrl} alt={`Avatar de ${testimonial.author}`} className="w-12 h-12 rounded-full flex-shrink-0 bg-gray-100 p-1" />
                                     <div className="flex-1">
                                         <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                                         <div className="text-right mt-2">
                                             <div className="text-sm font-semibold text-gray-800">- {testimonial.author}</div>
                                             <div className="text-xs text-gray-500 flex items-center justify-end">
                                                {testimonial.role === 'Super usuário' && <Star className="w-3.5 h-3.5 text-yellow-500 mr-1" fill="currentColor" />}
                                                {testimonial.role}
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <p className="text-sm text-gray-500 text-center py-4">Ainda não há depoimentos para esta empresa.</p>
                     )}
                </div>
            )}
        </div>
    )
}
// --- FIM DO COMPONENTE ---


// Componente de Card para os Níveis do Selo
const SealLevelCard = ({ icon, title, description, color, benefits }: { icon: React.ReactNode, title: string, description: React.ReactNode, color: string, benefits?: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
    <div className={`p-6 border-l-4 ${color} flex-grow`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <div className="text-gray-600">{description}</div>
    </div>
    {benefits && (
        <div className="bg-gray-50 p-4 border-t">
            <h4 className="font-bold text-sm text-gray-800 mb-2">Benefícios Exclusivos:</h4>
            <div className="text-gray-700 text-sm space-y-2">{benefits}</div>
        </div>
    )}
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
          <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
            Promovemos a <strong>transparência</strong> e celebramos as empresas que constroem um futuro de trabalho mais justo e acessível para todos.
          </p>
        </div>

        {/* Seção Missão */}
        <div className="mb-20 bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
                 <Rocket className="mx-auto h-10 w-10 text-indigo-600" />
                <h2 className="text-3xl font-bold text-gray-800 mt-4">Nossa Missão</h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 italic">
                  "Transformar inclusão em vantagem competitiva, conectando empresas a talentos com deficiência em busca de uma oportunidade."
                </p>
            </div>
        </div>

        {/* Níveis do Selo */}
        <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Nossos Selos de Reconhecimento</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SealLevelCard
                    icon={<Award className="h-8 w-8 text-amber-700" />}
                    title="Bronze"
                    description="Para empresas que iniciaram sua jornada na inclusão, cumprindo os requisitos fundamentais de acessibilidade e representatividade."
                    color="border-amber-700"
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
                    description="O mais alto nível de reconhecimento para empresas que são referência em inclusão e transparência."
                    color="border-yellow-500"
                    benefits={
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Consultoria com Especialistas</strong> para criar planos de carreira e de negócios focados em talentos com deficiência.</li>
                            <li><strong>Acompanhamento pós-seleção</strong> para garantir a evolução contínua do profissional contratado.</li>
                            <li><strong>Parceria estratégica</strong> com empresas de desenvolvimento de tecnologias assistivas, reduzindo seus custos.</li>
                             <li><strong>Suporte humanizado</strong> Para acompanhamento do empregado em sua carreira.</li>
                        </ul>
                    }
                />
            </div>
        </div>

        {/* Critérios de Avaliação */}
        <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Como Construímos um Processo Transparente?</h2>
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
                <CriteriaCard icon={<ThumbsUp size={24} />} title="Vozes da Comunidade: A Prova Real">
                    <p>A percepção da comunidade é fundamental. O selo é diretamente influenciado por avaliações e depoimentos que validam a transparência do processo seletivo e a cultura da empresa:</p>
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
                        <p className="mt-2 text-gray-600">As experiências vividas são o termômetro mais fiel da cultura e <strong>transparência</strong> de uma empresa. Por isso, os depoimentos têm um peso significativo em nossa avaliação.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* NOVA SEÇÃO: Ranking e Voz da Comunidade */}
        <div className="mb-20">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800">Ranking de Transparência e Inclusão</h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
                    Veja o desempenho das empresas e o que os talentos com deficiência estão falando sobre a transparência de seus processos seletivos.
                </p>
            </div>
            <div className="space-y-4">
                {fakeRankingData.map(company => (
                    <CompanyRankingCard key={company.rank} company={company} />
                ))}
            </div>
        </div>
        {/* FIM DA NOVA SEÇÃO */}


        {/* Formulário de Depoimento */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center text-gray-800">Faça a Diferença com sua Voz</h2>
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


