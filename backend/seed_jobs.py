#!/usr/bin/env python3
"""
Script para inserir vagas de exemplo no banco de dados
"""

import sys
import os
from datetime import datetime

# Adicionar o diretório backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user import User, Company, Job, UserType
from sqlalchemy.orm import Session

def create_sample_companies_and_jobs():
    """Cria empresas e vagas de exemplo"""
    
    db = SessionLocal()
    
    try:
        # Verificar se já existem empresas
        existing_companies = db.query(Company).count()
        if existing_companies > 0:
            print("✅ Empresas já existem no banco de dados")
            return
        
        # Criar usuários para as empresas
        companies_data = [
            {
                "email": "techcorp@example.com",
                "password": "techcorp123",
                "company_name": "TechCorp Inovação",
                "description": "Empresa de tecnologia focada em soluções inovadoras e inclusivas",
                "website": "https://techcorp.com",
                "industry": "Tecnologia",
                "size": "51-200",
                "location": "São Paulo, SP",
                "is_inclusive": True,
                "inclusion_policies": "Política de inclusão ativa, ambiente acessível, suporte para PCDs"
            },
            {
                "email": "startupdev@example.com", 
                "password": "startup123",
                "company_name": "StartupDev",
                "description": "Startup de desenvolvimento de software com foco em acessibilidade",
                "website": "https://startupdev.com",
                "industry": "Desenvolvimento de Software",
                "size": "11-50",
                "location": "Rio de Janeiro, RJ",
                "is_inclusive": True,
                "inclusion_policies": "Ambiente totalmente inclusivo, flexibilidade de horários, suporte completo"
            },
            {
                "email": "consulting@example.com",
                "password": "consulting123", 
                "company_name": "Consulting & Co",
                "description": "Consultoria empresarial com foco em diversidade e inclusão",
                "website": "https://consultingco.com",
                "industry": "Consultoria",
                "size": "201-500",
                "location": "Belo Horizonte, MG",
                "is_inclusive": True,
                "inclusion_policies": "Programa de inclusão robusto, mentoria para PCDs, ambiente adaptado"
            },
            {
                "email": "fintech@example.com",
                "password": "fintech123",
                "company_name": "FinTech Solutions",
                "description": "Soluções financeiras digitais com tecnologia acessível",
                "website": "https://fintechsolutions.com",
                "industry": "Fintech",
                "size": "51-200",
                "location": "São Paulo, SP",
                "is_inclusive": True,
                "inclusion_policies": "Tecnologia assistiva, ambiente inclusivo, políticas de diversidade"
            },
            {
                "email": "healthtech@example.com",
                "password": "healthtech123",
                "company_name": "HealthTech Brasil",
                "description": "Tecnologia em saúde com foco em acessibilidade universal",
                "website": "https://healthtechbrasil.com",
                "industry": "Saúde",
                "size": "11-50",
                "location": "Porto Alegre, RS",
                "is_inclusive": True,
                "inclusion_policies": "Ambiente totalmente acessível, suporte especializado, flexibilidade total"
            }
        ]
        
        created_companies = []
        
        for company_data in companies_data:
            # Criar usuário da empresa
            user = User(
                email=company_data["email"],
                password_hash=company_data["password"],  # Em produção, seria hash
                user_type=UserType.COMPANY,
                is_active=True,
                is_verified=True
            )
            db.add(user)
            db.flush()  # Para obter o ID do usuário
            
            # Criar empresa
            company = Company(
                user_id=user.id,
                name=company_data["company_name"],
                description=company_data["description"],
                website=company_data["website"],
                industry=company_data["industry"],
                size=company_data["size"],
                location=company_data["location"],
                is_inclusive=company_data["is_inclusive"],
                inclusion_policies=company_data["inclusion_policies"]
            )
            db.add(company)
            db.flush()  # Para obter o ID da empresa
            
            created_companies.append(company)
        
        # Criar vagas de exemplo
        jobs_data = [
            # TechCorp Inovação
            {
                "company": created_companies[0],
                "title": "Desenvolvedor Full Stack Sênior",
                "description": "Buscamos um desenvolvedor full stack sênior para trabalhar em projetos inovadores de tecnologia. Você fará parte de uma equipe diversa e inclusiva, desenvolvendo soluções que impactam milhares de usuários.",
                "requirements": "• 5+ anos de experiência em desenvolvimento\n• Conhecimento em React, Node.js, Python\n• Experiência com bancos de dados (PostgreSQL, MongoDB)\n• Conhecimento em cloud (AWS, Azure)\n• Experiência com metodologias ágeis\n• Inglês intermediário",
                "benefits": "• Plano de saúde e odontológico\n• Vale refeição R$ 800\n• Vale transporte\n• Home office 3x por semana\n• Ambiente totalmente acessível\n• Suporte para PCDs\n• Programa de mentoria\n• Desenvolvimento profissional",
                "location": "São Paulo, SP",
                "remote_work": True,
                "salary_min": 8000,
                "salary_max": 12000,
                "employment_type": "full-time"
            },
            {
                "company": created_companies[0],
                "title": "UX/UI Designer",
                "description": "Procuramos um designer UX/UI criativo e apaixonado por criar experiências inclusivas. Você trabalhará em produtos digitais que priorizam a acessibilidade e usabilidade para todos os usuários.",
                "requirements": "• 3+ anos de experiência em UX/UI\n• Conhecimento em Figma, Adobe Creative Suite\n• Experiência com design system\n• Conhecimento em acessibilidade (WCAG)\n• Experiência com pesquisa de usuários\n• Portfolio demonstrando projetos inclusivos",
                "benefits": "• Plano de saúde e odontológico\n• Vale refeição R$ 600\n• Vale transporte\n• Home office 4x por semana\n• Ambiente acessível\n• Ferramentas de design\n• Participação em eventos\n• Desenvolvimento contínuo",
                "location": "São Paulo, SP",
                "remote_work": True,
                "salary_min": 5000,
                "salary_max": 8000,
                "employment_type": "full-time"
            },
            
            # StartupDev
            {
                "company": created_companies[1],
                "title": "Desenvolvedor Frontend React",
                "description": "Vaga para desenvolvedor frontend especializado em React. Trabalharemos em projetos inovadores com foco em acessibilidade e experiência do usuário. Ambiente startup dinâmico e inclusivo.",
                "requirements": "• 2+ anos de experiência com React\n• Conhecimento em TypeScript\n• Experiência com CSS/SASS\n• Conhecimento em testes (Jest, Testing Library)\n• Experiência com Git\n• Conhecimento básico em acessibilidade",
                "benefits": "• Plano de saúde\n• Vale refeição R$ 500\n• Home office total\n• Ambiente flexível\n• Equipamentos fornecidos\n• Horário flexível\n• Participação nos lucros\n• Ambiente inclusivo",
                "location": "Rio de Janeiro, RJ",
                "remote_work": True,
                "salary_min": 4000,
                "salary_max": 7000,
                "employment_type": "full-time"
            },
            {
                "company": created_companies[1],
                "title": "DevOps Engineer",
                "description": "Procuramos um DevOps Engineer para gerenciar nossa infraestrutura cloud e implementar práticas de CI/CD. Ambiente startup com foco em inovação e inclusão.",
                "requirements": "• 3+ anos de experiência em DevOps\n• Conhecimento em AWS/Azure\n• Experiência com Docker, Kubernetes\n• Conhecimento em Terraform\n• Experiência com CI/CD (GitHub Actions, Jenkins)\n• Conhecimento em monitoramento (Prometheus, Grafana)",
                "benefits": "• Plano de saúde\n• Vale refeição R$ 500\n• Home office total\n• Ambiente flexível\n• Equipamentos fornecidos\n• Horário flexível\n• Participação nos lucros\n• Ambiente inclusivo",
                "location": "Rio de Janeiro, RJ",
                "remote_work": True,
                "salary_min": 6000,
                "salary_max": 10000,
                "employment_type": "full-time"
            },
            
            # Consulting & Co
            {
                "company": created_companies[2],
                "title": "Consultor de Diversidade e Inclusão",
                "description": "Vaga para consultor especializado em diversidade e inclusão. Você ajudará empresas a implementar políticas inclusivas e criar ambientes de trabalho mais diversos e acessíveis.",
                "requirements": "• Formação em RH, Psicologia ou áreas afins\n• 3+ anos de experiência em D&I\n• Conhecimento em legislação trabalhista\n• Experiência com treinamentos corporativos\n• Habilidades de comunicação\n• Inglês avançado",
                "benefits": "• Plano de saúde e odontológico\n• Vale refeição R$ 700\n• Vale transporte\n• Home office 3x por semana\n• Ambiente totalmente acessível\n• Suporte para PCDs\n• Programa de mentoria\n• Desenvolvimento profissional",
                "location": "Belo Horizonte, MG",
                "remote_work": True,
                "salary_min": 5500,
                "salary_max": 8500,
                "employment_type": "full-time"
            },
            {
                "company": created_companies[2],
                "title": "Analista de Recursos Humanos",
                "description": "Buscamos um analista de RH para trabalhar em processos de recrutamento inclusivo e gestão de pessoas. Foco em criar processos que promovam diversidade e inclusão.",
                "requirements": "• Formação em RH, Administração ou áreas afins\n• 2+ anos de experiência em RH\n• Conhecimento em recrutamento e seleção\n• Experiência com sistemas de RH\n• Habilidades interpessoais\n• Conhecimento em legislação trabalhista",
                "benefits": "• Plano de saúde e odontológico\n• Vale refeição R$ 600\n• Vale transporte\n• Home office 2x por semana\n• Ambiente acessível\n• Suporte para PCDs\n• Desenvolvimento profissional\n• Programa de mentoria",
                "location": "Belo Horizonte, MG",
                "remote_work": True,
                "salary_min": 3500,
                "salary_max": 5500,
                "employment_type": "full-time"
            },
            
            # FinTech Solutions
            {
                "company": created_companies[3],
                "title": "Desenvolvedor Backend Python",
                "description": "Vaga para desenvolvedor backend Python em fintech. Trabalharemos em soluções financeiras inovadoras com foco em segurança, performance e acessibilidade.",
                "requirements": "• 3+ anos de experiência com Python\n• Conhecimento em Django/FastAPI\n• Experiência com bancos de dados\n• Conhecimento em APIs REST\n• Experiência com testes automatizados\n• Conhecimento em segurança de dados",
                "benefits": "• Plano de saúde e odontológico\n• Vale refeição R$ 800\n• Vale transporte\n• Home office 3x por semana\n• Ambiente acessível\n• Suporte para PCDs\n• Participação nos lucros\n• Desenvolvimento profissional",
                "location": "São Paulo, SP",
                "remote_work": True,
                "salary_min": 6000,
                "salary_max": 10000,
                "employment_type": "full-time"
            },
            {
                "company": created_companies[3],
                "title": "Analista de Segurança da Informação",
                "description": "Procuramos um analista de segurança para proteger nossos sistemas financeiros. Ambiente inovador com foco em tecnologia acessível e inclusiva.",
                "requirements": "• Formação em TI, Segurança ou áreas afins\n• 2+ anos de experiência em segurança\n• Conhecimento em ISO 27001\n• Experiência com ferramentas de segurança\n• Conhecimento em compliance\n• Certificações em segurança (diferencial)",
                "benefits": "• Plano de saúde e odontológico\n• Vale refeição R$ 700\n• Vale transporte\n• Home office 2x por semana\n• Ambiente acessível\n• Suporte para PCDs\n• Desenvolvimento profissional\n• Certificações pagas",
                "location": "São Paulo, SP",
                "remote_work": True,
                "salary_min": 5000,
                "salary_max": 8000,
                "employment_type": "full-time"
            },
            
            # HealthTech Brasil
            {
                "company": created_companies[4],
                "title": "Desenvolvedor Mobile React Native",
                "description": "Vaga para desenvolvedor mobile especializado em React Native. Desenvolveremos aplicativos de saúde acessíveis que impactam a vida de milhares de pessoas.",
                "requirements": "• 2+ anos de experiência com React Native\n• Conhecimento em JavaScript/TypeScript\n• Experiência com APIs REST\n• Conhecimento em testes mobile\n• Experiência com publicação de apps\n• Conhecimento em acessibilidade mobile",
                "benefits": "• Plano de saúde e odontológico\n• Vale refeição R$ 600\n• Home office total\n• Ambiente flexível\n• Equipamentos fornecidos\n• Horário flexível\n• Ambiente inclusivo\n• Desenvolvimento profissional",
                "location": "Porto Alegre, RS",
                "remote_work": True,
                "salary_min": 4500,
                "salary_max": 7500,
                "employment_type": "full-time"
            },
            {
                "company": created_companies[4],
                "title": "Product Manager",
                "description": "Buscamos um Product Manager para liderar o desenvolvimento de produtos de saúde digitais. Foco em criar soluções acessíveis e inclusivas para o mercado de saúde.",
                "requirements": "• Formação em TI, Administração ou áreas afins\n• 3+ anos de experiência em Product Management\n• Conhecimento em metodologias ágeis\n• Experiência com produtos digitais\n• Habilidades de liderança\n• Conhecimento em métricas de produto",
                "benefits": "• Plano de saúde e odontológico\n• Vale refeição R$ 800\n• Home office 3x por semana\n• Ambiente acessível\n• Suporte para PCDs\n• Participação nos lucros\n• Desenvolvimento profissional\n• Programa de mentoria",
                "location": "Porto Alegre, RS",
                "remote_work": True,
                "salary_min": 7000,
                "salary_max": 11000,
                "employment_type": "full-time"
            }
        ]
        
        # Inserir vagas
        for job_data in jobs_data:
            job = Job(
                company_id=job_data["company"].id,
                title=job_data["title"],
                description=job_data["description"],
                requirements=job_data["requirements"],
                benefits=job_data["benefits"],
                location=job_data["location"],
                remote_work=job_data["remote_work"],
                salary_min=job_data["salary_min"],
                salary_max=job_data["salary_max"],
                employment_type=job_data["employment_type"],
                is_active=True
            )
            db.add(job)
        
        # Commit das alterações
        db.commit()
        
        print("✅ Empresas e vagas de exemplo criadas com sucesso!")
        print(f"📊 {len(companies_data)} empresas criadas")
        print(f"💼 {len(jobs_data)} vagas criadas")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar dados de exemplo: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Iniciando criação de dados de exemplo...")
    create_sample_companies_and_jobs()
    print("🎉 Processo concluído!")
