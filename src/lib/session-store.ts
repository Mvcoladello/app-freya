import fs from 'fs'
import path from 'path'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  tokens?: number
  timestamp: number
}

export interface Session {
  id: string
  promptId: string
  promptSnapshot: {
    title: string
    body: string
  }
  messages: Message[]
  createdAt: number
  updatedAt: number
}

class SessionStore {
  private sessions: Map<string, Session> = new Map()
  private dataFile: string

  constructor() {
    const dataDir = path.join(process.cwd(), 'data')
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    this.dataFile = path.join(dataDir, 'sessions.json')
    this.load()
  }

  private load() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8')
        const sessions: Session[] = JSON.parse(data)
        sessions.forEach(session => {
          this.sessions.set(session.id, session)
        })
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  private save() {
    try {
      const sessions = Array.from(this.sessions.values())
      fs.writeFileSync(this.dataFile, JSON.stringify(sessions, null, 2))
    } catch (error) {
      console.error('Failed to save sessions:', error)
    }
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  create(promptId: string, promptSnapshot: { title: string; body: string }): Session {
    const id = this.generateId()
    const now = Date.now()

    const session: Session = {
      id,
      promptId,
      promptSnapshot,
      messages: [],
      createdAt: now,
      updatedAt: now
    }

    this.sessions.set(id, session)
    this.save()

    return session
  }

  getById(id: string): Session | undefined {
    return this.sessions.get(id)
  }

  getRecent(limit: number = 10): Session[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit)
  }

  addMessage(sessionId: string, message: Omit<Message, 'id'>): Session | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const messageWithId: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`
    }

    session.messages.push(messageWithId)
    session.updatedAt = Date.now()

    this.sessions.set(sessionId, session)
    this.save()

    return session
  }

  delete(id: string): boolean {
    const deleted = this.sessions.delete(id)
    if (deleted) {
      this.save()
    }
    return deleted
  }
}

export const sessionStore = new SessionStore()
