import { Job } from './jobs'
import { Profile } from './profile'
import { CompatibilityCalculator, type CompatibilityScore, type JobWithCompatibility } from './compatibility'

// Re-exportar o tipo para facilitar importação
export type { JobWithCompatibility } from './compatibility'

// Perfil padrão para programador backend Python
const DEFAULT_PYTHON_PROFILE: Profile = {
  id: 0,
  user_id: 0,
  first_name: 'Programador',
  last_name: 'Python',
  has_disability: false,
  experience_summary: 'Desenvolvedor backend Python com 4 anos de experiência em Django, FastAPI, PostgreSQL, Redis, Docker, AWS. Conhecimento em testes automatizados, APIs REST, microserviços e CI/CD. Experiência com metodologias ágeis e trabalho remoto.',
  location: 'São Paulo, SP',
  created_at: new Date().toISOString()
}

export class CompatibilityService {
  private static instance: CompatibilityService
  private calculator: CompatibilityCalculator

  private constructor() {
    this.calculator = new CompatibilityCalculator(DEFAULT_PYTHON_PROFILE)
  }

  public static getInstance(): CompatibilityService {
    if (!CompatibilityService.instance) {
      CompatibilityService.instance = new CompatibilityService()
    }
    return CompatibilityService.instance
  }

  /**
   * Calcula a compatibilidade de uma vaga específica
   */
  public calculateJobCompatibility(job: Job): CompatibilityScore {
    return this.calculator.calculateCompatibility(job)
  }

  /**
   * Calcula a compatibilidade de múltiplas vagas
   */
  public calculateMultipleJobsCompatibility(jobs: Job[]): JobWithCompatibility[] {
    return this.calculator.calculateMultipleJobs(jobs)
  }

  /**
   * Ordena vagas por compatibilidade
   */
  public sortJobsByCompatibility(jobs: JobWithCompatibility[]): JobWithCompatibility[] {
    return this.calculator.sortByCompatibility(jobs)
  }

  /**
   * Filtra vagas por score mínimo de compatibilidade
   */
  public filterJobsByCompatibility(jobs: JobWithCompatibility[], minScore: number): JobWithCompatibility[] {
    return jobs.filter(job => (job.compatibility?.score || 0) >= minScore)
  }

  /**
   * Obtém detalhes de compatibilidade para uma vaga
   */
  public getCompatibilityDetails(job: Job): {
    score: number
    factors: {
      skills: number
      location: number
      accessibility: number
      experience: number
      preferences: number
    }
    details: {
      skillsMatch: string[]
      skillsMissing: string[]
      locationMatch: boolean
      accessibilitySupport: boolean
      experienceLevel: 'junior' | 'pleno' | 'senior'
      remoteWorkMatch: boolean
    }
  } {
    const compatibility = this.calculateJobCompatibility(job)
    
    return {
      score: compatibility.score,
      factors: compatibility.factors,
      details: compatibility.details
    }
  }

  /**
   * Atualiza o perfil do usuário (se disponível)
   */
  public updateUserProfile(profile: Profile | null): void {
    this.calculator = new CompatibilityCalculator(profile || DEFAULT_PYTHON_PROFILE)
  }
}

// Instância singleton
export const compatibilityService = CompatibilityService.getInstance()
