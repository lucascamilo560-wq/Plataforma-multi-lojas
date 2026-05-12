import { useEffect, useMemo, useState } from 'react'
import { ActionTile } from '../../components/ui/ActionTile'
import { Badge } from '../../components/ui/Badge'
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
        kicker="Painel"
        icon="chart"
        title={store?.name ? `${store.name} em destaque` : 'Seu painel comercial'}
        description="Acompanhe seus números, acesse atalhos do dia e mantenha sua operação sempre em ritmo de venda."
      />

      <Card
        variant="accentCorner"
        accentColor={storeTheme.accentColor}
        title="Identidade da loja"
        subtitle="Marca, performance e operação no mesmo espaço"
      >
        <div className="inline-info">
          <Badge variant="store" storeColor={storeTheme.primaryColor}>
            Loja ativa
          </Badge>
          <Badge variant="accent">Foco do dia: acelerar conversão</Badge>
        </div>
      </Card>

      <div className="grid grid-metrics">
        <KpiCard label="Pedidos do dia" value={orders.length} icon="clock" />
        <KpiCard label="Produtos disponíveis" value={products.length} icon="package" />
        <KpiCard label="Receita acumulada" value={formatCurrency(revenue)} icon="wallet" />
        <KpiCard
          label="Ticket médio"
          value={formatCurrency(revenue / Math.max(orders.length, 1))}
          icon="tag"
        />
      </div>

      <SectionHeader
        kicker="Atalhos"
        icon="sparkles"
        title="Ações rápidas"
        description="Use tiles de ação para executar as tarefas principais do seu painel."
      />

      <div className="grid grid-tiles">
        <ActionTile
          title="Pedidos"
          description="Atualize status e prioridades"
          icon="cart"
          to="/dashboard/orders"
          accentColor={storeTheme.primaryColor}
        />
        <ActionTile
          title="Catálogo"
          description="Destaque produtos com melhor giro"
          icon="package"
          to="/dashboard/products"
          accentColor={storeTheme.accentColor}
        />
        <ActionTile
          title="Visual da loja"
          description="Ajuste capa, logo e tom da vitrine"
          icon="palette"
          to={`/stores/${storeId}`}
          accentColor={storeTheme.primaryColor}
        />
        <ActionTile
          title="Visão cliente"
          description="Veja como a loja aparece na vitrine"
          icon="storefront"
          to="/stores"
          accentColor={storeTheme.accentColor}
        />
      </div>
    </section>
  )
}
