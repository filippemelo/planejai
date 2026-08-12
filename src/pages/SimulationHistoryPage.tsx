import { useState } from 'react'

import { HistoryCard } from '@/components/features/History/HistoryCard'
import { HistoryEmptyState } from '@/components/features/History/HistoryEmptyState'
import { PageHero } from '@/components/shared/PageHero'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

function sortByNewest(records: SimulationRecord[]) {
  return [...records].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0
    if (!a.createdAt) return 1
    if (!b.createdAt) return -1
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export function SimulationHistoryPage() {
  const { getAllFormData, deleteFormData } = useSimulationStorage()
  const [records, setRecords] = useState<SimulationRecord[]>(() =>
    sortByNewest(getAllFormData()),
  )

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      'Deseja realmente excluir esta simulação? Esta ação não pode ser desfeita.',
    )
    if (!confirmed) return

    deleteFormData(id)
    setRecords((prev) => prev.filter((record) => record.id !== id))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de Simulações"
        subtitle="Consulte, reabra ou remova simulações anteriores."
      />

      {records.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <HistoryCard
              key={record.id}
              record={record}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  )
}
