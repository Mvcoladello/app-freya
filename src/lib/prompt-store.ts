export interface Prompt {
  id: string
  title: string
  body: string
  tags: string[]
  versions: PromptVersion[]
  createdAt: number
  updatedAt: number
}

export interface PromptVersion {
  version: number
  body: string
  updatedAt: number
}

class PromptStore {
  private prompts: Map<string, Prompt> = new Map()

  constructor() {
    this.seedData()
  }

  private seedData() {
    const samplePrompts = [
      {
        title: 'Customer Support Assistant',
        body: 'You are a helpful customer support assistant. Always be polite and professional.',
        tags: ['support', 'customer-service']
      },
      {
        title: 'Code Review Expert',
        body: 'Review the following code and provide constructive feedback on improvements.',
        tags: ['code', 'review', 'development']
      },
      {
        title: 'Technical Writer',
        body: 'Write clear and concise technical documentation.',
        tags: ['documentation', 'technical-writing']
      }
    ]

    samplePrompts.forEach(data => {
      const id = this.generateId()
      const now = Date.now()
      
      this.prompts.set(id, {
        id,
        title: data.title,
        body: data.body,
        tags: data.tags,
        versions: [{ version: 1, body: data.body, updatedAt: now }],
        createdAt: now,
        updatedAt: now
      })
    })
  }

  private generateId(): string {
    return `prompt_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  getAll(): Prompt[] {
    return Array.from(this.prompts.values()).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  getById(id: string): Prompt | undefined {
    return this.prompts.get(id)
  }

  create(data: Omit<Prompt, 'id' | 'versions' | 'createdAt' | 'updatedAt'>): Prompt {
    const id = this.generateId()
    const now = Date.now()
    
    const prompt: Prompt = {
      id,
      ...data,
      versions: [{ version: 1, body: data.body, updatedAt: now }],
      createdAt: now,
      updatedAt: now
    }

    this.prompts.set(id, prompt)
    return prompt
  }

  update(id: string, data: Partial<Omit<Prompt, 'id' | 'versions' | 'createdAt' | 'updatedAt'>>): Prompt | null {
    const prompt = this.prompts.get(id)
    if (!prompt) return null

    const now = Date.now()
    const updated: Prompt = {
      ...prompt,
      ...data,
      updatedAt: now
    }

    if (data.body && data.body !== prompt.body) {
      updated.versions = [
        ...prompt.versions,
        {
          version: prompt.versions.length + 1,
          body: data.body,
          updatedAt: now
        }
      ]
    }

    this.prompts.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.prompts.delete(id)
  }

  search(query: string, tags?: string[]): Prompt[] {
    const allPrompts = this.getAll()
    
    return allPrompts.filter(prompt => {
      const matchesQuery = !query || 
        prompt.title.toLowerCase().includes(query.toLowerCase()) ||
        prompt.body.toLowerCase().includes(query.toLowerCase())
      
      const matchesTags = !tags || tags.length === 0 ||
        tags.some(tag => prompt.tags.includes(tag))
      
      return matchesQuery && matchesTags
    })
  }
}

export const promptStore = new PromptStore()
