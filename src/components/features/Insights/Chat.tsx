import { RefreshCw, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/shared/Button'
import { Divider } from '@/components/shared/Divider'
import { Input } from '@/components/shared/Input'
import type { ChatMessage } from '@/data/simulation'
import { useConversation } from '@/hooks/useConversation'

interface ChatProps {
  simulationId: string
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const bubbleClasses = isUser
    ? 'self-end bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
    : 'self-start bg-input text-foreground rounded-2xl rounded-bl-sm'

  return (
    <div
      className={`max-w-[85%] px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${bubbleClasses}`}
    >
      {message.content}
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="bg-input text-muted-foreground self-start rounded-2xl rounded-bl-sm px-4 py-3">
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      </span>
    </div>
  )
}

export function Chat({ simulationId }: ChatProps) {
  const { messages, isLoading, error, sendMessage, retry } =
    useConversation(simulationId)
  const [question, setQuestion] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isLoading, error])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || isLoading) return
    void sendMessage(trimmed)
    setQuestion('')
  }

  return (
    <div className="mt-2">
      <Divider />

      <h3 className="text-foreground mb-3 text-sm leading-relaxed font-semibold">
        💬 Converse com o Educador Financeiro
      </h3>

      <div className="scrollbar-thin [scrollbar-color:var(--border)_transparent] flex max-h-72 flex-col gap-3 overflow-y-auto pr-2">
        {messages.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-sm">
            Faça sua primeira pergunta sobre esta simulação.
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingBubble />}

        {error && (
          <div className="flex items-center gap-2 self-start">
            <p className="text-sm text-red-500">⚠️ {error}</p>
            <Button
              variant="ghost"
              icon={RefreshCw}
              aria-label="Tentar novamente"
              onClick={() => void retry()}
            />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-stretch gap-2">
        <div className="flex-1">
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Pergunte algo sobre sua simulação..."
            disabled={isLoading}
            autoFocus={false}
          />
        </div>
        <Button
          variant="primary"
          icon={Send}
          type="submit"
          aria-label="Enviar pergunta"
          disabled={isLoading || !question.trim()}
        />
      </form>
    </div>
  )
}
