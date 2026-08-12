import { Inbox, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'

export function HistoryEmptyState() {
  const navigate = useNavigate()

  return (
    <div className="bg-card flex flex-col items-center rounded-2xl px-6 py-16 text-center shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)]">
      <div className="bg-primary/10 mb-5 flex h-16 w-16 items-center justify-center rounded-full">
        <Inbox size={28} className="text-primary" />
      </div>
      <h2 className="text-foreground mb-2 text-lg font-semibold">
        Nenhuma simulação por aqui ainda
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">
        Suas simulações salvas aparecerão nesta página. Comece agora e planeje o
        próximo passo do seu objetivo.
      </p>
      <Button
        variant="primary"
        icon={TrendingUp}
        onClick={() => void navigate('/')}
      >
        Fazer primeira simulação
      </Button>
    </div>
  )
}
