# Sistema de Navegação por Voz - Farol Acessível

## Visão Geral

O sistema de navegação por voz do Farol foi desenvolvido para proporcionar uma experiência completa de acessibilidade para usuários com deficiência visual. O sistema permite navegação total por voz, descrição automática de conteúdo e interação com elementos da interface.

## Funcionalidades Principais

### 1. **Reconhecimento de Voz**
- Captura comandos de voz em português brasileiro
- Processamento contínuo de comandos
- Validação e interpretação de comandos

### 2. **Síntese de Voz**
- Leitura de conteúdo da página
- Descrição de elementos interativos
- Feedback de ações realizadas

### 3. **Navegação por Comandos**
- Navegação entre páginas por voz
- Ativação de elementos da interface
- Controle total da aplicação

### 4. **Descrição Automática**
- Descrição do conteúdo da página atual
- Identificação de elementos interativos
- Contexto da navegação

## Como Usar

### Ativação do Modo de Voz

1. **Clique no botão "Ativar Voz"** na barra superior
2. **Ou diga "Ativar modo de voz"** se já estiver em uma sessão ativa
3. O sistema irá confirmar a ativação e descrever a página atual

### Comandos Disponíveis

#### Navegação
- `"Ir para [página]"` - Navegar para uma página específica
- `"Navegar para [página]"` - Alternativa para navegação
- `"Voltar"` - Retornar à página anterior

#### Descrição
- `"Descrever"` - Descrever o conteúdo da página atual
- `"O que tem aqui"` - Alternativa para descrição
- `"Conteúdo"` - Descrever elementos da página

#### Controle
- `"Ajuda"` - Ouvir todos os comandos disponíveis
- `"Parar"` - Parar o modo de voz
- `"Sair"` - Desativar navegação por voz
- `"Repetir"` - Repetir o último comando

#### Interação com Elementos
- `"Botão [nome]"` - Clicar em um botão específico
- `"Link [nome]"` - Clicar em um link específico
- `"Clicar em [elemento]"` - Ativar elemento específico

### Páginas Disponíveis para Navegação

- `"Início"` ou `"Home"` - Página inicial
- `"Simulação"` ou `"Entrevista"` - Configuração de entrevista
- `"Histórico"` - Simulações anteriores
- `"Hub"` ou `"Desenvolvimento"` - Cursos e recursos
- `"Perfil"` - Perfil do usuário
- `"Configurações"` - Configurações da conta
- `"Login"` - Página de login
- `"Cadastro"` - Criação de conta

## Exemplos de Uso

### Navegação Básica
```
Usuário: "Ir para simulação"
Sistema: "Navegando para /simulation/start"
```

### Descrição de Conteúdo
```
Usuário: "Descrever"
Sistema: "Página de configuração de simulação de entrevista. Configure o tipo de entrevista, dificuldade e áreas de foco. Esta página tem 5 botões, 3 links e 4 campos de entrada."
```

### Interação com Elementos
```
Usuário: "Botão iniciar"
Sistema: "Clicando em Iniciar Simulação"
```

## Arquitetura Técnica

### Componentes Principais

1. **VoiceNavigation** - Componente principal de navegação
2. **AccessibilityProvider** - Contexto de acessibilidade
3. **AccessibilityBar** - Barra de controles
4. **AccessibilityOverlay** - Overlay de informações
5. **useVoiceNavigation** - Hook personalizado

### APIs Utilizadas

- **SpeechRecognition API** - Reconhecimento de voz
- **SpeechSynthesis API** - Síntese de voz
- **Next.js Router** - Navegação entre páginas
- **React Context** - Gerenciamento de estado

### Fluxo de Funcionamento

1. **Inicialização**: Verificação de suporte às APIs de voz
2. **Ativação**: Configuração do reconhecimento e síntese
3. **Captura**: Processamento contínuo de comandos de voz
4. **Interpretação**: Análise e validação dos comandos
5. **Execução**: Realização das ações solicitadas
6. **Feedback**: Confirmação e descrição das ações

## Configurações

### Parâmetros de Voz

- **Idioma**: Português brasileiro (pt-BR)
- **Velocidade**: 0.9 (ligeiramente mais lenta)
- **Tom**: 1.0 (tom normal)
- **Volume**: 0.8 (80% do volume máximo)

### Configurações de Reconhecimento

- **Contínuo**: true (escuta contínua)
- **Resultados intermediários**: true
- **Idioma**: pt-BR

## Testes

### Página de Teste

Acesse `/accessibility-test` para:
- Executar testes automatizados
- Verificar funcionalidades
- Testar comandos de voz
- Visualizar status do sistema

### Testes Disponíveis

1. **Teste de Síntese de Voz**
2. **Teste de Reconhecimento de Voz**
3. **Teste de Descrição de Página**
4. **Teste de Navegação**
5. **Teste de Comandos de Voz**

## Compatibilidade

### Navegadores Suportados

- **Chrome**: Suporte completo
- **Edge**: Suporte completo
- **Safari**: Suporte limitado
- **Firefox**: Suporte limitado

### Requisitos

- **HTTPS**: Necessário para APIs de voz
- **Microfone**: Acesso ao microfone do dispositivo
- **Alto-falantes**: Para síntese de voz

## Troubleshooting

### Problemas Comuns

1. **Microfone não funciona**
   - Verificar permissões do navegador
   - Testar em ambiente HTTPS
   - Verificar configurações do sistema

2. **Voz não é ouvida**
   - Verificar volume do sistema
   - Testar síntese de voz
   - Verificar configurações de acessibilidade

3. **Comandos não são reconhecidos**
   - Falar claramente e pausadamente
   - Usar comandos exatos
   - Verificar idioma configurado

### Logs e Debug

- Console do navegador para erros
- Página de teste para diagnóstico
- Status visual na barra de acessibilidade

## Contribuição

Para melhorar o sistema de acessibilidade:

1. Teste em diferentes navegadores
2. Adicione novos comandos de voz
3. Melhore descrições de conteúdo
4. Otimize performance
5. Adicione suporte a mais idiomas

## Recursos Adicionais

- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Acessibilidade Web](https://www.w3.org/WAI/fundamentals/accessibility-intro/)
