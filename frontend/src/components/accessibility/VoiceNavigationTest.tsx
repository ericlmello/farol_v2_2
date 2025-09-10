'use client'

import React, { useState, useEffect } from 'react'
import { useAccessibility } from './AccessibilityProvider'
import { Mic, MicOff, Volume2, VolumeX, Eye, EyeOff, TestTube } from 'lucide-react'

const VoiceNavigationTest: React.FC = () => {
  const {
    isVoiceModeActive,
    isListening,
    isSpeaking,
    isMuted,
    lastCommand,
    commandHistory,
    currentPage,
    startListening,
    stopListening,
    toggleVoiceMode,
    toggleMute,
    speak,
    describeCurrentPage,
  } = useAccessibility()

  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunningTest, setIsRunningTest] = useState(false)

  const runAccessibilityTest = async () => {
    setIsRunningTest(true)
    setTestResults([])
    
    const tests = [
      {
        name: 'Teste de Síntese de Voz',
        action: () => speak('Teste de síntese de voz funcionando corretamente.'),
        expected: 'Deveria falar o texto de teste'
      },
      {
        name: 'Teste de Reconhecimento de Voz',
        action: () => {
          if (!isListening) {
            startListening()
            setTimeout(() => {
              if (isListening) {
                stopListening()
                setTestResults(prev => [...prev, '✅ Reconhecimento de voz iniciado e parado com sucesso'])
              }
            }, 2000)
          }
        },
        expected: 'Deveria iniciar e parar o reconhecimento de voz'
      },
      {
        name: 'Teste de Descrição de Página',
        action: () => describeCurrentPage(),
        expected: 'Deveria descrever o conteúdo da página atual'
      },
      {
        name: 'Teste de Navegação',
        action: () => speak('Teste de navegação por voz. Diga "ir para início" para testar.'),
        expected: 'Deveria falar instruções de navegação'
      }
    ]

    for (const test of tests) {
      try {
        setTestResults(prev => [...prev, `🔄 Executando: ${test.name}`])
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        test.action()
        
        setTestResults(prev => [...prev, `✅ ${test.name}: ${test.expected}`])
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        setTestResults(prev => [...prev, `❌ ${test.name}: Erro - ${error}`])
      }
    }
    
    setIsRunningTest(false)
    setTestResults(prev => [...prev, '🎉 Teste de acessibilidade concluído!'])
  }

  const testVoiceCommands = () => {
    const commands = [
      'ir para início',
      'descrever',
      'ajuda',
      'parar'
    ]
    
    speak('Testando comandos de voz. Os comandos disponíveis são: ' + commands.join(', '))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <TestTube className="text-blue-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">Teste de Navegação por Voz</h1>
      </div>

      {/* Status atual */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Status Atual</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isVoiceModeActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">
              Modo de Voz: {isVoiceModeActive ? 'Ativo' : 'Inativo'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">
              Escuta: {isListening ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium">
              Fala: {isSpeaking ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isMuted ? 'bg-gray-400' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium">
              Som: {isMuted ? 'Desativado' : 'Ativo'}
            </span>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <div>Página atual: <span className="font-mono">{currentPage}</span></div>
          {lastCommand && (
            <div>Último comando: <span className="font-mono">"{lastCommand}"</span></div>
          )}
        </div>
      </div>

      {/* Controles de teste */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Controles de Teste</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={runAccessibilityTest}
            disabled={isRunningTest}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isRunningTest 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <TestTube size={18} />
            {isRunningTest ? 'Executando Teste...' : 'Executar Teste Completo'}
          </button>
          
          <button
            onClick={testVoiceCommands}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all font-medium"
          >
            <Mic size={18} />
            Testar Comandos de Voz
          </button>
          
          <button
            onClick={toggleVoiceMode}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isVoiceModeActive 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isVoiceModeActive ? <EyeOff size={18} /> : <Eye size={18} />}
            {isVoiceModeActive ? 'Desativar Modo de Voz' : 'Ativar Modo de Voz'}
          </button>
          
          <button
            onClick={describeCurrentPage}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all font-medium"
          >
            <Eye size={18} />
            Descrever Página
          </button>
        </div>
      </div>

      {/* Resultados do teste */}
      {testResults.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Resultados do Teste</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de comandos */}
      {commandHistory.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Histórico de Comandos</h2>
          <div className="space-y-1">
            {commandHistory.slice(-10).map((cmd, index) => (
              <div key={index} className="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
                {cmd}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800 mb-3">Instruções de Teste</h2>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>1. <strong>Ative o modo de voz</strong> clicando no botão "Ativar Modo de Voz"</p>
          <p>2. <strong>Execute o teste completo</strong> para verificar todas as funcionalidades</p>
          <p>3. <strong>Teste comandos de voz</strong> falando os comandos disponíveis</p>
          <p>4. <strong>Verifique os resultados</strong> na seção de resultados do teste</p>
          <p>5. <strong>Navegue por voz</strong> dizendo "ir para [página]" ou "descrever"</p>
        </div>
      </div>
    </div>
  )
}

export default VoiceNavigationTest
