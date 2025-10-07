'use client'

import { useState } from 'react'
import { PromptLibrary } from '@/components/console/prompt-library'
import { ChatPanel } from '@/components/console/chat-panel'
import { MetricsPanel } from '@/components/console/metrics-panel'
import type { Prompt } from '@/lib/prompt-store'
import type { Session } from '@/lib/session-store'

export default function ConsolePage() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [activeSession, setActiveSession] = useState<Session | null>(null)

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <header className="h-14 border-b border-slate-800 flex items-center px-4">
        <h1 className="text-lg font-semibold text-slate-100">Agent Console</h1>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-800 overflow-hidden">
          <PromptLibrary 
            onSelectPrompt={setSelectedPrompt}
            onStartSession={setActiveSession}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatPanel 
            session={activeSession}
            prompt={selectedPrompt}
          />
        </div>

        <div className="w-80 border-l border-slate-800 overflow-hidden">
          <MetricsPanel />
        </div>
      </div>
    </div>
  )
}
