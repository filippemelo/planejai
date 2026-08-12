import { useState } from 'react'

import { buildChatPrompt } from '@/data/aiPrompt'
import type { ChatMessage } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { askEducator } from '@/services/aiService'

export const useConversation = (simulationId: string) => {
  const { getFormData, updateSimulation } = useSimulationStorage()

  const [messages, setMessages] = useState<ChatMessage[]>(
    () => getFormData(simulationId)?.conversation ?? [],
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)

  const persist = (nextMessages: ChatMessage[]) => {
    const simulation = getFormData(simulationId)
    if (!simulation) return
    updateSimulation(simulationId, {
      ...simulation,
      conversation: nextMessages,
    })
  }

  const requestAnswer = async (
    history: ChatMessage[],
    question: string,
  ): Promise<void> => {
    const simulation = getFormData(simulationId)
    if (!simulation) {
      setError('Simulação não encontrada.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const prompt = buildChatPrompt(simulation, history, question)
      const answer = await askEducator(prompt)

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
      }

      const updated = [...history, assistantMessage]
      setMessages((prev) => [...prev, assistantMessage])
      persist(updated)
      setLastQuestion(null)
    } catch {
      setError('Não foi possível obter uma resposta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    const history = [...messages, userMessage]
    setMessages(history)
    persist(history)
    setLastQuestion(trimmed)

    await requestAnswer(history, trimmed)
  }

  const retry = async () => {
    if (!lastQuestion || isLoading) return
    await requestAnswer(messages, lastQuestion)
  }

  return { messages, isLoading, error, sendMessage, retry }
}
