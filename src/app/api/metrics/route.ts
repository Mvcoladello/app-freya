import { NextResponse } from 'next/server'

const metrics = {
  avgFirstTokenLatencyMs: 120,
  avgTokensPerSec: 25.5,
  errorRatePct: 0.7
}

export async function GET() {
  try {
    const agentUrl = process.env.AGENT_SERVICE_URL || 'http://localhost:8080'
    
    try {
      const response = await fetch(`${agentUrl}/metrics`)
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fallback to mock data
    }

    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
