'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui'

export function ConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string>('')

  const testConnection = async () => {
    setTesting(true)
    setResult('')
    
    try {
      const response = await api.get('/health')
      setResult(`✅ Sucesso! Status: ${response.status}, Data: ${JSON.stringify(response.data)}`)
    } catch (error: any) {
      setResult(`❌ Erro: ${error.message}`)
      if (error.response) {
        setResult(prev => prev + `\nStatus: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`)
      }
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Teste de Conectividade</h3>
      <Button 
        onClick={testConnection} 
        disabled={testing}
        className="mb-2"
      >
        {testing ? 'Testando...' : 'Testar Conexão'}
      </Button>
      {result && (
        <pre className="text-sm bg-white p-2 rounded border overflow-auto">
          {result}
        </pre>
      )}
    </div>
  )
}
