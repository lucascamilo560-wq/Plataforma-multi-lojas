import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { KpiCard } from '../../components/ui/KpiCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { getAdminSummary } from '../../services/mockData'
import type { AdminSummary } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary>()

  useEffect(() => {
    getAdminSummary().then(setSummary)
  }, [])

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Super Admin"
        title="Visão global da plataforma"
        description="Monitoramento da saúde comercial e operação geral das lojas em um painel único."
      />
      <div className="grid grid-metrics">
        <KpiCard label="Lojas totais" value={summary?.totalStores ?? 0} />
        <KpiCard label="Lojas ativas" value={summary?.activeStores ?? 0} />
        <KpiCard label="Pedidos" value={summary?.totalOrders ?? 0} />
        <KpiCard label="Receita bruta" value={formatCurrency(summary?.grossRevenue ?? 0)} />
      </div>

      <Card title="Estado da plataforma" subtitle="Resumo visual para gestão executiva" variant="layered">
        <p className="muted">
          Base preparada para evoluir com governança multi-tenant sem alterar rotas e sem trocar mocks por
          Supabase neste PR.
        </p>
      </Card>
    </section>
  )
}
