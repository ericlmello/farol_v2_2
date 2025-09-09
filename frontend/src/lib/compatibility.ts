import { Job } from './jobs'
import { Profile } from './profile'

export interface CompatibilityScore {
  jobId: number
  score: number // 0-100
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
}

export interface JobWithCompatibility extends Job {
  compatibility?: CompatibilityScore
}

// Palavras-chave para diferentes áreas e níveis
const SKILL_KEYWORDS = {
  'frontend': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'frontend', 'ui', 'ux'],
  'backend': ['python', 'node', 'java', 'c#', 'php', 'ruby', 'go', 'rust', 'backend', 'api', 'database', 'sql'],
  'fullstack': ['fullstack', 'full-stack', 'full stack', 'mern', 'mean', 'lamp', 'django', 'express'],
  'mobile': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'mobile'],
  'devops': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'terraform', 'devops'],
  'design': ['figma', 'adobe', 'photoshop', 'illustrator', 'sketch', 'design', 'ui', 'ux', 'prototype'],
  'data': ['python', 'r', 'sql', 'machine learning', 'ai', 'data science', 'analytics', 'pandas', 'numpy'],
  'security': ['security', 'cybersecurity', 'penetration', 'vulnerability', 'compliance', 'iso', 'audit'],
  'management': ['management', 'leadership', 'agile', 'scrum', 'product', 'project', 'team lead'],
  'hr': ['hr', 'human resources', 'recruitment', 'talent', 'diversity', 'inclusion', 'training']
}

const EXPERIENCE_LEVELS = {
  'junior': ['junior', 'júnior', 'entry', 'trainee', 'estagiário', 'iniciante', '1-2 anos', '2 anos'],
  'pleno': ['pleno', 'mid', 'intermediate', '3-5 anos', '4 anos', '5 anos'],
  'senior': ['senior', 'sênior', 'lead', 'principal', 'architect', '5+ anos', '6 anos', '7 anos', '8 anos']
}

export class CompatibilityCalculator {
  private profile: Profile | null = null

  constructor(profile: Profile | null) {
    this.profile = profile
  }

  calculateCompatibility(job: Job): CompatibilityScore {
    if (!this.profile) {
      return this.getDefaultScore(job)
    }

    const factors = {
      skills: this.calculateSkillsMatch(job),
      location: this.calculateLocationMatch(job),
      accessibility: this.calculateAccessibilityMatch(job),
      experience: this.calculateExperienceMatch(job),
      preferences: this.calculatePreferencesMatch(job)
    }

    // Calcular score geral (média ponderada)
    const weights = {
      skills: 0.35,
      location: 0.15,
      accessibility: 0.25,
      experience: 0.15,
      preferences: 0.10
    }

    const score = Math.round(
      factors.skills * weights.skills +
      factors.location * weights.location +
      factors.accessibility * weights.accessibility +
      factors.experience * weights.experience +
      factors.preferences * weights.preferences
    )

    return {
      jobId: job.id,
      score: Math.min(100, Math.max(0, score)),
      factors,
      details: this.getCompatibilityDetails(job)
    }
  }

  private calculateSkillsMatch(job: Job): number {
    if (!this.profile?.experience_summary) return 50

    const jobText = `${job.title} ${job.description} ${job.requirements || ''}`.toLowerCase()
    const profileText = this.profile.experience_summary.toLowerCase()

    let matchCount = 0
    let totalSkills = 0

    // Verificar correspondência de habilidades
    Object.entries(SKILL_KEYWORDS).forEach(([category, keywords]) => {
      const jobHasCategory = keywords.some(keyword => jobText.includes(keyword))
      const profileHasCategory = keywords.some(keyword => profileText.includes(keyword))

      if (jobHasCategory) {
        totalSkills++
        if (profileHasCategory) {
          matchCount++
        }
      }
    })

    return totalSkills > 0 ? Math.round((matchCount / totalSkills) * 100) : 50
  }

  private calculateLocationMatch(job: Job): number {
    if (!this.profile?.location || !job.location) return 75

    const profileLocation = this.profile.location.toLowerCase()
    const jobLocation = job.location.toLowerCase()

    // Verificar se é a mesma cidade/estado
    if (profileLocation.includes(jobLocation.split(',')[0]) || 
        jobLocation.includes(profileLocation.split(',')[0])) {
      return 100
    }

    // Verificar se é o mesmo estado
    const profileState = profileLocation.split(',').pop()?.trim()
    const jobState = jobLocation.split(',').pop()?.trim()
    
    if (profileState && jobState && profileState === jobState) {
      return 80
    }

    // Se é trabalho remoto, dar pontuação alta
    if (job.remote_work) {
      return 90
    }

    return 30
  }

  private calculateAccessibilityMatch(job: Job): number {
    if (!this.profile?.has_disability) return 75

    // Se o candidato tem deficiência, verificar se a empresa é inclusiva
    if (job.company?.is_inclusive) {
      return 100
    }

    // Verificar se a descrição da vaga menciona acessibilidade
    const jobText = `${job.description} ${job.requirements || ''} ${job.benefits || ''}`.toLowerCase()
    const accessibilityKeywords = ['acessível', 'acessibilidade', 'inclusivo', 'inclusão', 'pcd', 'deficiência', 'diversidade']

    const hasAccessibilityMention = accessibilityKeywords.some(keyword => 
      jobText.includes(keyword)
    )

    return hasAccessibilityMention ? 85 : 40
  }

  private calculateExperienceMatch(job: Job): number {
    if (!this.profile?.experience_summary) return 50

    const jobText = `${job.title} ${job.description}`.toLowerCase()
    const profileText = this.profile.experience_summary.toLowerCase()

    // Determinar nível da vaga
    let jobLevel: 'junior' | 'pleno' | 'senior' = 'pleno'
    if (EXPERIENCE_LEVELS.junior.some(keyword => jobText.includes(keyword))) {
      jobLevel = 'junior'
    } else if (EXPERIENCE_LEVELS.senior.some(keyword => jobText.includes(keyword))) {
      jobLevel = 'senior'
    }

    // Determinar nível do candidato
    let candidateLevel: 'junior' | 'pleno' | 'senior' = 'pleno'
    if (EXPERIENCE_LEVELS.junior.some(keyword => profileText.includes(keyword))) {
      candidateLevel = 'junior'
    } else if (EXPERIENCE_LEVELS.senior.some(keyword => profileText.includes(keyword))) {
      candidateLevel = 'senior'
    }

    // Calcular compatibilidade de nível
    if (jobLevel === candidateLevel) return 100
    if (jobLevel === 'pleno' && candidateLevel === 'senior') return 90
    if (jobLevel === 'senior' && candidateLevel === 'pleno') return 70
    if (jobLevel === 'junior' && candidateLevel === 'pleno') return 80
    if (jobLevel === 'pleno' && candidateLevel === 'junior') return 60

    return 50
  }

  private calculatePreferencesMatch(job: Job): number {
    // Verificar preferências de trabalho remoto
    if (job.remote_work) {
      return 90 // Assumir que trabalho remoto é preferido
    }

    return 70
  }

  private getCompatibilityDetails(job: Job) {
    const jobText = `${job.title} ${job.description} ${job.requirements || ''}`.toLowerCase()
    const profileText = this.profile?.experience_summary?.toLowerCase() || ''

    // Encontrar habilidades correspondentes
    const skillsMatch: string[] = []
    const skillsMissing: string[] = []

    Object.entries(SKILL_KEYWORDS).forEach(([category, keywords]) => {
      const jobHasCategory = keywords.some(keyword => jobText.includes(keyword))
      const profileHasCategory = keywords.some(keyword => profileText.includes(keyword))

      if (jobHasCategory) {
        if (profileHasCategory) {
          skillsMatch.push(category)
        } else {
          skillsMissing.push(category)
        }
      }
    })

    // Determinar nível de experiência
    let experienceLevel: 'junior' | 'pleno' | 'senior' = 'pleno'
    if (EXPERIENCE_LEVELS.junior.some(keyword => jobText.includes(keyword))) {
      experienceLevel = 'junior'
    } else if (EXPERIENCE_LEVELS.senior.some(keyword => jobText.includes(keyword))) {
      experienceLevel = 'senior'
    }

    return {
      skillsMatch,
      skillsMissing,
      locationMatch: this.calculateLocationMatch(job) > 70,
      accessibilitySupport: job.company?.is_inclusive || false,
      experienceLevel,
      remoteWorkMatch: job.remote_work
    }
  }

  private getDefaultScore(job: Job): CompatibilityScore {
    // Perfil padrão para programador backend Python
    const defaultProfile: Profile = {
      id: 0,
      user_id: 0,
      first_name: 'Programador',
      last_name: 'Python',
      has_disability: false,
      experience_summary: 'Desenvolvedor backend Python com 4 anos de experiência em Django, FastAPI, PostgreSQL, Redis, Docker, AWS. Conhecimento em testes automatizados, APIs REST, microserviços e CI/CD. Experiência com metodologias ágeis e trabalho remoto.',
      location: 'São Paulo, SP',
      created_at: new Date().toISOString()
    }

    // Calcular compatibilidade com perfil padrão
    return this.calculateCompatibilityWithProfile(defaultProfile, job)
  }

  private calculateCompatibilityWithProfile(profile: Profile, job: Job): CompatibilityScore {
    
    const factors = {
      skills: this.calculateSkillsMatchWithProfile(profile, job),
      location: this.calculateLocationMatchWithProfile(profile, job),
      accessibility: this.calculateAccessibilityMatchWithProfile(profile, job),
      experience: this.calculateExperienceMatchWithProfile(profile, job),
      preferences: this.calculatePreferencesMatchWithProfile(profile, job)
    }

    // Calcular score geral (média ponderada)
    const weights = {
      skills: 0.35,
      location: 0.15,
      accessibility: 0.25,
      experience: 0.15,
      preferences: 0.10
    }

    const score = Math.round(
      factors.skills * weights.skills +
      factors.location * weights.location +
      factors.accessibility * weights.accessibility +
      factors.experience * weights.experience +
      factors.preferences * weights.preferences
    )

    return {
      jobId: job.id,
      score: Math.min(100, Math.max(0, score)),
      factors,
      details: this.getCompatibilityDetailsWithProfile(profile, job)
    }
  }

  private calculateSkillsMatchWithProfile(profile: Profile, job: Job): number {
    if (!profile?.experience_summary) return 50

    const jobText = `${job.title} ${job.description} ${job.requirements || ''}`.toLowerCase()
    const profileText = profile.experience_summary.toLowerCase()

    let matchCount = 0
    let totalSkills = 0

    // Verificar correspondência de habilidades
    Object.entries(SKILL_KEYWORDS).forEach(([category, keywords]) => {
      const jobHasCategory = keywords.some(keyword => jobText.includes(keyword))
      const profileHasCategory = keywords.some(keyword => profileText.includes(keyword))

      if (jobHasCategory) {
        totalSkills++
        if (profileHasCategory) {
          matchCount++
        }
      }
    })

    return totalSkills > 0 ? Math.round((matchCount / totalSkills) * 100) : 50
  }

  private calculateLocationMatchWithProfile(profile: Profile, job: Job): number {
    if (!profile?.location || !job.location) return 75

    const profileLocation = profile.location.toLowerCase()
    const jobLocation = job.location.toLowerCase()

    // Verificar se é a mesma cidade/estado
    if (profileLocation.includes(jobLocation.split(',')[0]) || 
        jobLocation.includes(profileLocation.split(',')[0])) {
      return 100
    }

    // Verificar se é o mesmo estado
    const profileState = profileLocation.split(',').pop()?.trim()
    const jobState = jobLocation.split(',').pop()?.trim()
    
    if (profileState && jobState && profileState === jobState) {
      return 80
    }

    // Se é trabalho remoto, dar pontuação alta
    if (job.remote_work) {
      return 90
    }

    return 30
  }

  private calculateAccessibilityMatchWithProfile(profile: Profile, job: Job): number {
    if (!profile?.has_disability) return 75

    // Se o candidato tem deficiência, verificar se a empresa é inclusiva
    if (job.company?.is_inclusive) {
      return 100
    }

    // Verificar se a descrição da vaga menciona acessibilidade
    const jobText = `${job.description} ${job.requirements || ''} ${job.benefits || ''}`.toLowerCase()
    const accessibilityKeywords = ['acessível', 'acessibilidade', 'inclusivo', 'inclusão', 'pcd', 'deficiência', 'diversidade']

    const hasAccessibilityMention = accessibilityKeywords.some(keyword => 
      jobText.includes(keyword)
    )

    return hasAccessibilityMention ? 85 : 40
  }

  private calculateExperienceMatchWithProfile(profile: Profile, job: Job): number {
    if (!profile?.experience_summary) return 50

    const jobText = `${job.title} ${job.description}`.toLowerCase()
    const profileText = profile.experience_summary.toLowerCase()

    // Determinar nível da vaga
    let jobLevel: 'junior' | 'pleno' | 'senior' = 'pleno'
    if (EXPERIENCE_LEVELS.junior.some(keyword => jobText.includes(keyword))) {
      jobLevel = 'junior'
    } else if (EXPERIENCE_LEVELS.senior.some(keyword => jobText.includes(keyword))) {
      jobLevel = 'senior'
    } else if (EXPERIENCE_LEVELS.pleno.some(keyword => jobText.includes(keyword))) {
      jobLevel = 'pleno'
    }

    // Determinar nível do candidato (4 anos = pleno)
    let candidateLevel: 'junior' | 'pleno' | 'senior' = 'pleno'

    // Calcular compatibilidade de nível
    if (jobLevel === candidateLevel) return 100
    if ((jobLevel as string) === 'pleno' && (candidateLevel as string) === 'senior') return 90
    if ((jobLevel as string) === 'senior' && (candidateLevel as string) === 'pleno') return 70
    if ((jobLevel as string) === 'junior' && (candidateLevel as string) === 'pleno') return 80
    if ((jobLevel as string) === 'pleno' && (candidateLevel as string) === 'junior') return 60

    return 50
  }

  private calculatePreferencesMatchWithProfile(profile: Profile, job: Job): number {
    // Verificar preferências de trabalho remoto
    if (job.remote_work) {
      return 90 // Assumir que trabalho remoto é preferido
    }

    return 70
  }

  private getCompatibilityDetailsWithProfile(profile: Profile, job: Job) {
    const jobText = `${job.title} ${job.description} ${job.requirements || ''}`.toLowerCase()
    const profileText = profile?.experience_summary?.toLowerCase() || ''

    // Encontrar habilidades correspondentes
    const skillsMatch: string[] = []
    const skillsMissing: string[] = []

    Object.entries(SKILL_KEYWORDS).forEach(([category, keywords]) => {
      const jobHasCategory = keywords.some(keyword => jobText.includes(keyword))
      const profileHasCategory = keywords.some(keyword => profileText.includes(keyword))

      if (jobHasCategory) {
        if (profileHasCategory) {
          skillsMatch.push(category)
        } else {
          skillsMissing.push(category)
        }
      }
    })

    // Determinar nível de experiência
    let experienceLevel: 'junior' | 'pleno' | 'senior' = 'pleno'
    if (EXPERIENCE_LEVELS.junior.some(keyword => jobText.includes(keyword))) {
      experienceLevel = 'junior'
    } else if (EXPERIENCE_LEVELS.senior.some(keyword => jobText.includes(keyword))) {
      experienceLevel = 'senior'
    }

    return {
      skillsMatch,
      skillsMissing,
      locationMatch: this.calculateLocationMatchWithProfile(profile, job) > 70,
      accessibilitySupport: job.company?.is_inclusive || false,
      experienceLevel,
      remoteWorkMatch: job.remote_work
    }
  }

  // Método para calcular compatibilidade para múltiplas vagas
  calculateMultipleJobs(jobs: Job[]): JobWithCompatibility[] {
    return jobs.map(job => ({
      ...job,
      compatibility: this.calculateCompatibility(job)
    }))
  }

  // Método para ordenar vagas por compatibilidade
  sortByCompatibility(jobs: JobWithCompatibility[]): JobWithCompatibility[] {
    return [...jobs].sort((a, b) => {
      const scoreA = a.compatibility?.score || 0
      const scoreB = b.compatibility?.score || 0
      return scoreB - scoreA
    })
  }
}

// Função utilitária para obter cor da compatibilidade
export function getCompatibilityColor(score: number): string {
  if (score >= 80) return 'text-green-800 bg-green-100 border-green-200'
  if (score >= 60) return 'text-yellow-800 bg-yellow-100 border-yellow-200'
  if (score >= 40) return 'text-orange-800 bg-orange-100 border-orange-200'
  return 'text-red-800 bg-red-100 border-red-200'
}

// Função utilitária para obter texto da compatibilidade
export function getCompatibilityText(score: number): string {
  if (score >= 80) return 'Alta compatibilidade'
  if (score >= 60) return 'Compatibilidade média'
  if (score >= 40) return 'Compatibilidade baixa'
  return 'Baixa compatibilidade'
}
