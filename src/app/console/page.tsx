'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, CheckCircle2 } from 'lucide-react'

export default function ConsolePage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Verifica se há um token no localStorage
    const storedToken = localStorage.getItem('token')
    
    if (!storedToken) {
      // Se não houver token, redireciona para a página de login
      router.push('/')
    } else {
      setToken(storedToken)
    }
  }, [router])

  const handleLogout = () => {
    // Remove o token do localStorage
    localStorage.removeItem('token')
    // Redireciona para a página de login
    router.push('/')
  }

  if (!token) {
    return null // Ou um loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Console</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle>Login Realizado com Sucesso</CardTitle>
              </div>
              <CardDescription>
                Você está autenticado no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Token de Autenticação:
                  </p>
                  <code className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm font-mono">
                    {token}
                  </code>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Este é um ambiente de desenvolvimento. O token foi salvo no localStorage
                    e será usado para autenticação nas próximas requisições.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao Console</CardTitle>
              <CardDescription>
                Aqui você pode gerenciar seu sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Esta é a página protegida do console. Somente usuários autenticados podem acessá-la.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
