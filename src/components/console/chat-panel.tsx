'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Session } from '@/lib/session-store'
import { Prompt } from '@/lib/prompt-store'
import toast from 'react-hot-toast'

interface ChatPanelProps {
  session: Session | null
  prompt?: Prompt | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
  tokens?: number
}

export function ChatPanel({ session, prompt }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (session) {
      setMessages(session.messages)
    }
  }, [session])

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    
    try {
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        setWsConnected(true)
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'token') {
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1]
            if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.tokens) {
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, text: lastMsg.text + data.token }
              ]
            }
            return [
              ...prev,
              {
                id: `msg_${Date.now()}`,
                role: 'assistant',
                text: data.token,
                timestamp: Date.now()
              }
            ]
          })
        } else if (data.type === 'done') {
          setIsStreaming(false)
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, tokens: data.totalTokens }
              ]
            }
            return prev
          })
        } else if (data.type === 'error') {
          toast.error('Agent error')
          setIsStreaming(false)
        }
      }

      ws.onerror = () => {
        setWsConnected(false)
        toast.error('WebSocket connection error')
      }

      ws.onclose = () => {
        setWsConnected(false)
        setTimeout(connectWebSocket, 3000)
      }

      wsRef.current = ws
    } catch (error) {
      toast.error('Failed to connect to agent')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !session || !wsConnected) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)

    try {
      await fetch(`/api/sessions/${session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          text: inputValue
        })
      })

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'start',
          sessionId: session.id,
          prompt: session.promptSnapshot.body,
          userMessage: inputValue
        }))
      }
    } catch (error) {
      toast.error('Failed to send message')
      setIsStreaming(false)
    }
  }

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-slate-100 mb-2">No Active Session</h3>
          <p className="text-sm text-slate-400">Select a prompt and start a session to begin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">{session.promptSnapshot.title}</h2>
        <p className="text-sm text-slate-400 mt-1">{session.messages.length} messages</p>
        {!wsConnected && (
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-400">
            <AlertCircle className="h-3 w-3" />
            Reconnecting to agent...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                {message.tokens && <span>• {message.tokens} tokens</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isStreaming || !wsConnected}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isStreaming || !wsConnected}
            size="default"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
