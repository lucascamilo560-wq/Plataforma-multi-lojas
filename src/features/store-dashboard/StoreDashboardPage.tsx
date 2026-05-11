import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getProductsByStore, getStoreOrders } from '../../services/mockData'
import type { Order, Product } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function StoreDashboardPage() {
  const { storeId } = useMockSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getStoreOrders(storeId).then(setOrders)
    getProductsByStore(storeId).then(setProducts)
  }, [storeId])

  const revenue = useMemo(
    () => orders.reduce((amount, order) => amount + order.total, 0),
    [orders],
  )

  return (
    <section className="stack-lg">
      <PageHeader
        title="Painel do lojista"
        description={`Visão rápida da operação da loja ${storeId} com base multi-tenant por store_id.`}
      />

      <div className="grid grid-metrics">
        <Card title="Pedidos hoje">
          <strong className="metric">{orders.length}</strong>
        </Card>
        <Card title="Produtos ativos">
          <strong className="metric">{products.length}</strong>
        </Card>
        <Card title="Faturamento">
          <strong className="metric">{formatCurrency(revenue)}</strong>
        </Card>
      </div>
    </section>
  )
}
