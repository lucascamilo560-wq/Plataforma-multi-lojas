import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getStoreById, getStoreOrders } from '../../services/mockData'
import type { Order, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

const statusLabel: Record<Order['status'], string> = {
  pending: 'Aguardando confirmação',
  paid: 'Pagamento confirmado',
  preparing: 'Em preparação',
  delivered: 'Entregue',
}

export function StoreOrdersPage() {
  const { storeId } = useMockSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [store, setStore] = useState<Store | undefined>()

  useEffect(() => {
    getStoreOrders(storeId).then(setOrders)
    getStoreById(storeId).then(setStore)
  }, [storeId])

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Pedidos"
        icon="cart"
        title="Pedidos da sua loja"
        description={`Gerencie o andamento dos pedidos de ${store?.name ?? 'sua loja'} com visão clara de prioridade.`}
      />

      <div className="grid">
        {orders.map((order) => (
          <Card key={order.id} title={`Pedido ${order.id}`} subtitle={`Cliente: ${order.customerName}`} variant="layered">
            <div className="inline-info">
              <Badge variant={order.status === 'pending' ? 'accent' : 'success'}>{statusLabel[order.status]}</Badge>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
