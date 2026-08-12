import { Eye, Goal, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'
import type { SimulationRecord } from '@/data/simulation'
import { calcMonthlySavings } from '@/utils/simulation'

interface HistoryCardProps {
  record: SimulationRecord
  onDelete: (id: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function HistoryCard({ record, onDelete }: HistoryCardProps) {
  const navigate = useNavigate()
  const monthlySavings = calcMonthlySavings(record)

  return (
    <div className="bg-card flex flex-col rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)]">
      <div className="mb-3 flex items-center gap-2">
        <Goal size={16} className="text-primary" />
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          {record.goalName}
        </span>
      </div>

      {record.createdAt && (
        <p className="text-muted-foreground mb-4 text-xs">
          Criada em {formatDate(record.createdAt)}
        </p>
      )}

      <dl className="mb-6 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <dt className="text-muted-foreground text-sm">Custo</dt>
          <dd className="text-foreground text-base font-semibold">
            R$ {record.goalAmount}
          </dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-muted-foreground text-sm">Prazo</dt>
          <dd className="text-foreground text-base font-semibold">
            {record.goalDeadline} meses
          </dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-muted-foreground text-sm">Economia mensal</dt>
          <dd className="text-primary text-base font-semibold">
            R$ {formatCurrency(monthlySavings)}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center gap-2">
        <Button
          variant="primary"
          icon={Eye}
          className="flex-1"
          onClick={() => void navigate(`/resultado/${record.id}`)}
        >
          Ver detalhes
        </Button>
        <Button
          variant="ghost"
          icon={Trash2}
          aria-label="Excluir simulação"
          onClick={() => onDelete(record.id)}
        />
      </div>
    </div>
  )
}
