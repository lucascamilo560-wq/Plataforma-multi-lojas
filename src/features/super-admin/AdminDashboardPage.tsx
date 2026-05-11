import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getAdminSummary } from '../../services/mockData'
import type { AdminSummary } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary>()

  useEffect(() => {
    getAdminSummary().then(setSummary)
  }, [])

  return (
    <section className="stack-lg">
      <PageHeader
        title="Dashboard Super Admin"
        description="Acompanhamento global da plataforma e saúde do ecossistema de lojas."
      />
      <div className="grid grid-metrics">
        <Card title="Lojas totais">
          <strong className="metric">{summary?.totalStores ?? 0}</strong>
        </Card>
        <Card title="Lojas ativas">
          <strong className="metric">{summary?.activeStores ?? 0}</strong>
        </Card>
        <Card title="Pedidos">
          <strong className="metric">{summary?.totalOrders ?? 0}</strong>
        </Card>
        <Card title="Receita bruta">
          <strong className="metric">{formatCurrency(summary?.grossRevenue ?? 0)}</strong>
        </Card>
      </div>
    </section>
  )
}
