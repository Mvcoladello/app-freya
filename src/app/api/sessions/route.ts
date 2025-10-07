import { NextRequest, NextResponse } from 'next/server'
import { sessionStore } from '@/lib/session-store'
import { promptStore } from '@/lib/prompt-store'
import { z } from 'zod'

const createSessionSchema = z.object({
  promptId: z.string()
})

export async function GET() {
  try {
    const sessions = sessionStore.getRecent(10)
    return NextResponse.json({ sessions })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { promptId } = createSessionSchema.parse(body)

    const prompt = promptStore.getById(promptId)
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    const session = sessionStore.create(promptId, {
      title: prompt.title,
      body: prompt.body
    })

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
