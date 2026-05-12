import { useEffect, useState } from 'react'
import { ActionTile } from '../../components/ui/ActionTile'
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
        kicker="Gestão"
        icon="shield"
        title="Visão executiva da plataforma"
        description="Acompanhe expansão, performance e ritmo de pedidos em um painel comercial com leitura imediata."
      />
      <div className="grid grid-metrics">
        <KpiCard label="Lojas totais" value={summary?.totalStores ?? 0} icon="storefront" />
        <KpiCard label="Lojas em operação" value={summary?.activeStores ?? 0} icon="check" />
        <KpiCard label="Pedidos" value={summary?.totalOrders ?? 0} icon="cart" />
        <KpiCard label="Receita bruta" value={formatCurrency(summary?.grossRevenue ?? 0)} icon="wallet" />
      </div>

      <Card title="Direcionamento rápido" subtitle="Acesso direto às áreas de gestão" variant="accentCorner">
        <div className="grid grid-tiles">
          <ActionTile title="Lojas" description="Ativação e status" icon="storefront" to="/admin/stores" active />
          <ActionTile title="Catálogo" description="Saúde dos produtos" icon="package" to="/dashboard/products" />
          <ActionTile title="Pedidos" description="Fluxo operacional" icon="cart" to="/dashboard/orders" />
          <ActionTile title="Vitrine" description="Experiência do cliente" icon="sparkles" to="/stores" />
        </div>
      </Card>
    </section>
  )
}
