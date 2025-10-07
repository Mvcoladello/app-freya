import { NextRequest, NextResponse } from 'next/server'
import { sessionStore } from '@/lib/session-store'
import { z } from 'zod'

const addMessageSchema = z.object({
  text: z.string().min(1),
  role: z.enum(['user', 'assistant'])
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { text, role } = addMessageSchema.parse(body)

    const session = sessionStore.addMessage(id, {
      role,
      text,
      timestamp: Date.now()
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ session })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    )
  }
}
