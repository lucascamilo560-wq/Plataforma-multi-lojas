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
        kicker="Super Admin"
        icon="shield"
        title="Visão executiva da plataforma"
        description="Acompanhe expansão, desempenho e ritmo de pedidos em um painel de gestão central."
      />
      <div className="grid grid-metrics">
        <KpiCard label="Lojas totais" value={summary?.totalStores ?? 0} icon="storefront" />
        <KpiCard label="Lojas ativas" value={summary?.activeStores ?? 0} icon="check" />
        <KpiCard label="Pedidos" value={summary?.totalOrders ?? 0} icon="cart" />
        <KpiCard label="Receita bruta" value={formatCurrency(summary?.grossRevenue ?? 0)} icon="wallet" />
      </div>

      <Card title="Direcionamento rápido" subtitle="Acesso direto às áreas de gestão" variant="accentCorner">
        <div className="grid grid-tiles">
          <ActionTile title="Lojas" description="Ativação e status" icon="storefront" to="/admin/lojas" active />
          <ActionTile title="Lojistas" description="Gestão de contas" icon="user" to="/admin/lojistas" />
          <ActionTile title="Clientes" description="Engajamento" icon="cart" to="/admin/clientes" />
          <ActionTile title="Planos" description="Oferta e receita" icon="wallet" to="/admin/planos" />
          <ActionTile title="Pedidos" description="Monitoramento" icon="clock" to="/admin/pedidos" />
          <ActionTile title="Suporte" description="Atendimento" icon="check" to="/admin/suporte" />
          <ActionTile title="Configurações" description="Parâmetros" icon="shield" to="/admin/configuracoes" />
        </div>
      </Card>
    </section>
  )
}
