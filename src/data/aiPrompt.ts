import { parseCurrency } from '@/utils/currency'
import { calcMonthlySavings } from '@/utils/simulation'

import type { ChatMessage, SimulationRecord } from './simulation'

const RESPONSE_SCHEMA = `{
  "feasibility": {
    "status": "viable" | "needs_adjustment" | "unfeasible",
    "content": "<Análise objetiva sobre se a meta é atingível no prazo com o valor disponível. Mencione os números relevantes.>"
  },
  "diagnosis": {
    "content": "<Diagnóstico focado no comprometimento do orçamento: quanto % da renda está comprometida com gastos e dívidas, e o que isso representa para a saúde financeira.>"
  },
  "suggestions": {
    "items": ["<Sugestão prática e concreta para reduzir gastos ou reorganizar o orçamento>"]
  },
  "extraIncome": {
    "items": ["<Ideia prática para gerar renda extra compatível com a realidade brasileira>"]
  },
  "investment": {
    "items": ["<Sugestão de investimento acessível para o perfil apresentado, com foco em atingir a meta>"]
  },
  "motivation": {
    "content": "<Mensagem final motivacional e personalizada, citando a meta pelo nome.>"
  }
}`

export function buildAIPrompt(simulation: SimulationRecord) {
  const { income, expenses, debts, goalName, goalAmount, goalDeadline } =
    simulation

  const monthlySavings = calcMonthlySavings(simulation)
  const monthlySavingsNeeded =
    parseCurrency(goalAmount) / parseInt(goalDeadline)

  return `Você é um educador financeiro especializado em finanças pessoais.
    Analise os dados abaixo e gere um diagnóstico financeiro personalizado com linguagem clara, didática e encorajadora,
    voltado para pessoas sem conhecimento financeiro. O diagnóstico será exibido diretamente ao usuário no app,
    fale sempre em segunda pessoa ("você tem...", "sua meta...").

    Dados da simulação:
    - Renda mensal bruta: ${income}
    - Custos fixos essenciais: ${expenses}
    - Dívidas e parcelas mensais: ${debts}
    - Valor disponível por mês: ${monthlySavings} reais
    - Meta: ${goalName}
    - Custo da meta: ${goalAmount}
    - Prazo desejado: ${goalDeadline} meses
    - Economia mensal necessária para atingir a meta no prazo: ${monthlySavingsNeeded} reais
    - Saldo após reserva para a meta: ${monthlySavings - monthlySavingsNeeded} reais

    Retorne APENAS um JSON válido, sem texto adicional, sem blocos de código, neste formato exato:

    ${RESPONSE_SCHEMA}

    Regras:
    - Todos os textos em português do Brasil
    - Máximo de 4 itens por lista
    - Seja específico ao citar valores calculados
    - Não repita informações entre seções
    - Nunca use markdown dentro dos valores do JSON
    - Para o campo "feasibility.status", use os seguintes critérios:
      - "viable": saldo após reserva para a meta é maior ou igual a 0
      - "needs_adjustment": saldo negativo de até 20% do valor da economia mensal necessária
      - "unfeasible": saldo negativo superior a 20% do valor da economia mensal necessária`
}

function serializeInsight(insight: SimulationRecord['insight']) {
  if (!insight) {
    return 'Diagnóstico ainda não gerado.'
  }

  const statusLabels = {
    viable: 'Viável no prazo',
    needs_adjustment: 'Precisa de ajuste',
    unfeasible: 'Inviável no prazo',
  }

  return [
    `Viabilidade (${statusLabels[insight.feasibility.status]}): ${insight.feasibility.content}`,
    `Diagnóstico: ${insight.diagnosis.content}`,
    `Sugestões práticas: ${insight.suggestions.items.join(' | ')}`,
    `Ideias de renda extra: ${insight.extraIncome.items.join(' | ')}`,
    `Sugestões de investimento: ${insight.investment.items.join(' | ')}`,
    `Mensagem motivacional: ${insight.motivation.content}`,
  ].join('\n')
}

function serializeConversation(conversation: ChatMessage[]) {
  if (conversation.length === 0) {
    return 'Nenhuma pergunta feita ainda.'
  }

  return conversation
    .map((message) => {
      const speaker = message.role === 'user' ? 'Usuário' : 'Educador'
      return `${speaker}: ${message.content}`
    })
    .join('\n')
}

export function buildChatPrompt(
  simulation: SimulationRecord,
  conversation: ChatMessage[],
  question: string,
) {
  const { income, expenses, debts, goalName, goalAmount, goalDeadline } =
    simulation

  const monthlySavings = calcMonthlySavings(simulation)
  const monthlySavingsNeeded =
    parseCurrency(goalAmount) / parseInt(goalDeadline)

  return `Você é um educador financeiro especializado em finanças pessoais.
    Responda à pergunta do usuário de forma clara, didática e encorajadora, em português do Brasil,
    sempre em segunda pessoa ("você tem...", "sua meta..."). A resposta deve considerar o contexto
    completo da simulação e das perguntas anteriores.

    Dados da simulação:
    - Renda mensal bruta: ${income}
    - Custos fixos essenciais: ${expenses}
    - Dívidas e parcelas mensais: ${debts}
    - Valor disponível por mês: ${monthlySavings} reais
    - Meta: ${goalName}
    - Custo da meta: ${goalAmount}
    - Prazo desejado: ${goalDeadline} meses
    - Economia mensal necessária para atingir a meta no prazo: ${monthlySavingsNeeded} reais
    - Saldo após reserva para a meta: ${monthlySavings - monthlySavingsNeeded} reais

    Diagnóstico anterior gerado para esta simulação:
    ${serializeInsight(simulation.insight)}

    Histórico da conversa até aqui:
    ${serializeConversation(conversation)}

    Nova pergunta do usuário:
    ${question}

    Regras da resposta:
    - Retorne apenas texto simples, sem markdown, sem JSON, sem blocos de código
    - Use no máximo 150 palavras
    - Seja específico ao citar valores calculados quando fizer sentido
    - Não repita informações já ditas em respostas anteriores; complemente ou aprofunde
    - Se a pergunta fugir do tema financeiro ou da simulação, redirecione com gentileza para o objetivo do usuário
    - Use parágrafos curtos separados por quebras de linha quando ajudar na leitura`
}
