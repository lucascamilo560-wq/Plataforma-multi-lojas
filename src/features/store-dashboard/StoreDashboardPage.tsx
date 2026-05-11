import { useEffect, useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getProductsByStore, getStoreOrders } from '../../services/mockData'
import type { Order, Product } from '../../types'
import { formatCurrency } from '../../utils/currency'

const STORE_ID = 'store-1'

export function StoreDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getStoreOrders(STORE_ID).then(setOrders)
    getProductsByStore(STORE_ID).then(setProducts)
  }, [])

  const revenue = useMemo(
    () => orders.reduce((amount, order) => amount + order.total, 0),
    [orders],
  )

  return (
    <section className="stack-lg">
      <PageHeader
        title="Painel do lojista"
        description="Visão rápida da operação da loja com base multi-tenant por store_id."
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
