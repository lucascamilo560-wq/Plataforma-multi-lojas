import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { KpiCard } from '../../components/ui/KpiCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getProductsByStore, getStoreById, getStoreOrders } from '../../services/mockData'
import { getStoreTheme } from '../../styles/storeTheme'
import type { Order, Product, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StoreDashboardPage() {
  const { storeId } = useMockSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [store, setStore] = useState<Store | undefined>()

  useEffect(() => {
    getStoreOrders(storeId).then(setOrders)
    getProductsByStore(storeId).then(setProducts)
    getStoreById(storeId).then(setStore)
  }, [storeId])

  const revenue = useMemo(() => orders.reduce((amount, order) => amount + order.total, 0), [orders])
  const storeTheme = getStoreTheme(store)

  return (
    <section className="stack-xl">
      <SectionHeader
        kicker="Painel do lojista"
        title={`Operação da loja ${storeId}`}
        description="Métricas-chave e visão rápida da operação sem alterar a lógica atual de dados mockados."
      />

      <div className="grid grid-metrics">
        <KpiCard label="Pedidos hoje" value={orders.length} />
        <KpiCard label="Produtos ativos" value={products.length} />
        <KpiCard label="Faturamento" value={formatCurrency(revenue)} />
        <KpiCard label="Ticket médio" value={formatCurrency(revenue / Math.max(orders.length, 1))} />
      </div>

      <Card
        title="Ações rápidas"
        subtitle="Atalhos para próxima etapa do painel"
        variant="accentCorner"
        accentColor={storeTheme.accentColor}
      >
        <div className="inline-info">
          <span className="muted">Tema da loja aplicado em botões e destaques visuais.</span>
        </div>
      </Card>
    </section>
  )
}
