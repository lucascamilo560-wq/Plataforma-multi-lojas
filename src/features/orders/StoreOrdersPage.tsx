import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getStoreById, getStoreOrders, updateOrderStatus } from '../../services/mockData'
import type { Order, OrderStatus, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Aguardando confirmação',
  paid: 'Pagamento confirmado',
  preparing: 'Em preparação',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const statusActions: Array<{ label: string; status: OrderStatus }> = [
  { label: 'Confirmar', status: 'paid' },
  { label: 'Preparando', status: 'preparing' },
  { label: 'Entregue', status: 'delivered' },
  { label: 'Cancelar', status: 'cancelled' },
]

function getStatusVariant(status: OrderStatus): 'accent' | 'success' | 'danger' | 'muted' {
  if (status === 'cancelled') {
    return 'danger'
  }

  if (status === 'delivered') {
    return 'success'
  }

  if (status === 'pending') {
    return 'accent'
  }

  return 'muted'
}

export function StoreOrdersPage() {
  const { storeId } = useMockSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [store, setStore] = useState<Store | undefined>()

  const refreshOrders = () => {
    getStoreOrders(storeId).then(setOrders)
  }

  useEffect(() => {
    refreshOrders()
    getStoreById(storeId).then(setStore)
  }, [storeId])

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  )

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status)
    refreshOrders()
  }

  return (
    <section className="stack-lg">
      <PageHeader
        kicker="Pedidos"
        icon="cart"
        title="Pedidos da sua loja"
        description={`Gerencie o andamento dos pedidos de ${store?.name ?? 'sua loja'} com atualização instantânea de status.`}
      />

      <div className="grid">
        {sortedOrders.map((order) => (
          <Card key={order.id} title={`Pedido ${order.id}`} subtitle={`Cliente: ${order.customerName}`} variant="layered">
            <div className="inline-info">
              <Badge variant={getStatusVariant(order.status)}>{statusLabel[order.status]}</Badge>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
            <small className="muted">Criado em {new Date(order.createdAt).toLocaleString('pt-BR')}</small>
            <div className="inline-info">
              {statusActions.map((action) => (
                <Button
                  key={action.status}
                  type="button"
                  variant={action.status === 'cancelled' ? 'danger' : 'secondary'}
                  onClick={() => handleUpdateStatus(order.id, action.status)}
                  disabled={order.status === action.status}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
