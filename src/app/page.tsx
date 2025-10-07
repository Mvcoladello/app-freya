'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDevLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Login successful')
        router.push('/console')
      } else {
        toast.error('Login failed')
      }
    } catch (error) {
      toast.error('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Agent Console</CardTitle>
          <CardDescription>
            Development mode authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleDevLogin}
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            {loading ? 'Logging in...' : 'Dev Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
