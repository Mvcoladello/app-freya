'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Prompt } from '@/lib/prompt-store'
import { Session } from '@/lib/session-store'
import toast from 'react-hot-toast'

interface PromptLibraryProps {
  onSelectPrompt: (prompt: Prompt) => void
  onStartSession: (session: Session) => void
}

export function PromptLibrary({ onSelectPrompt, onStartSession }: PromptLibraryProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)

  useEffect(() => {
    loadPrompts()
    loadSessions()
  }, [])

  const loadPrompts = async () => {
    try {
      const response = await fetch('/api/prompts')
      if (response.ok) {
        const data = await response.json()
        setPrompts(data.prompts)
      }
    } catch (error) {
      toast.error('Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Failed to load sessions')
    }
  }

  const handleStartSession = async (prompt: Prompt) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId: prompt.id })
      })

      if (response.ok) {
        const data = await response.json()
        onStartSession(data.session)
        loadSessions()
        toast.success('Session started')
      }
    } catch (error) {
      toast.error('Failed to start session')
    }
  }

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id)
    onSelectPrompt(prompt)
  }

  const filteredPrompts = prompts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 space-y-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Prompts
          </h3>
          
          {loading ? (
            <div className="text-sm text-slate-400 text-center py-8">Loading...</div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">No prompts found</div>
          ) : (
            filteredPrompts.map(prompt => (
              <Card
                key={prompt.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedPromptId === prompt.id
                    ? 'bg-blue-500/10 border-blue-500/50'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
                onClick={() => handleSelectPrompt(prompt)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-100">{prompt.title}</h4>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{prompt.body}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {prompt.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartSession(prompt)
                    }}
                    className="h-7 text-xs"
                  >
                    Start
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="p-4 space-y-2 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Recent Sessions
          </h3>
          
          {sessions.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-4">No sessions yet</div>
          ) : (
            sessions.map(session => (
              <Card
                key={session.id}
                className="p-2 bg-slate-800 border-slate-700 hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => onStartSession(session)}
              >
                <div className="text-xs font-medium text-slate-200 mb-1">
                  {session.promptSnapshot.title}
                </div>
                <div className="text-xs text-slate-400">
                  {session.messages.length} messages
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
