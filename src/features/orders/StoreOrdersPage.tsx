import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { getStoreOrders } from '../../services/mockData'
import type { Order } from '../../types'
import { formatCurrency } from '../../utils/currency'

const STORE_ID = 'store-1'

export function StoreOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    getStoreOrders(STORE_ID).then(setOrders)
  }, [])

  return (
    <section className="stack-lg">
      <PageHeader
        title="Pedidos do lojista"
        description="Pipeline de pedidos mockado para evoluir com status em tempo real."
      />

      <div className="grid">
        {orders.map((order) => (
          <Card
            key={order.id}
            title={`Pedido ${order.id}`}
            subtitle={`Cliente: ${order.customerName}`}
          >
            <div className="inline-info">
              <span className="badge badge-muted">{order.status}</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
