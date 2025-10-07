'use client'

import { useState, useEffect } from 'react'
import { Activity, Zap, AlertTriangle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Metrics {
  avgFirstTokenLatencyMs: number
  avgTokensPerSec: number
  errorRatePct: number
}

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<Metrics>({
    avgFirstTokenLatencyMs: 0,
    avgTokensPerSec: 0,
    errorRatePct: 0
  })
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
        addLog(`Metrics updated: ${data.avgTokensPerSec} tokens/s`)
      }
    } catch (error) {
      addLog('Failed to fetch metrics')
    }
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50))
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">Metrics & Logs</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-3">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-400">First Token Latency</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {metrics.avgFirstTokenLatencyMs}ms
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium text-slate-400">Tokens per Second</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {metrics.avgTokensPerSec}
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-400">Error Rate</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {metrics.errorRatePct}%
            </div>
          </Card>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-400">Activity Logs</h3>
          </div>
          
          <Card className="p-3 bg-slate-800 border-slate-700">
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">No logs yet</div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="text-xs text-slate-300 font-mono"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
