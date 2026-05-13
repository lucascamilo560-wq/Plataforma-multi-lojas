import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { useMockSession } from '../../hooks/useMockSession'
import { getStoreById, getStoreOrders, updateOrderPaymentStatus, updateOrderStatus } from '../../services/mockData'
import type { Order, OrderStatus, PaymentStatus, Store } from '../../types'
import { formatCurrency } from '../../utils/currency'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Aguardando confirmação',
  paid: 'Confirmado',
  preparing: 'Em preparação',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const paymentStatusLabel: Record<PaymentStatus, string> = {
  awaiting_payment: 'Aguardando pagamento',
  to_be_arranged: 'A combinar',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Reembolsado',
}

const orderStatusActions: Array<{ label: string; status: OrderStatus }> = [
  { label: 'Confirmar pedido', status: 'paid' },
  { label: 'Preparando', status: 'preparing' },
  { label: 'Entregue', status: 'delivered' },
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

function getPaymentStatusVariant(status: PaymentStatus): 'accent' | 'success' | 'danger' | 'muted' {
  if (status === 'paid') return 'success'
  if (status === 'failed' || status === 'refunded') return 'danger'
  if (status === 'to_be_arranged') return 'accent'
  return 'muted'
}

export function StoreOrdersPage() {
  const { storeId } = useMockSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [store, setStore] = useState<Store | undefined>()

  const refreshOrders = useCallback(() => {
    getStoreOrders(storeId).then(setOrders)
  }, [storeId])

  useEffect(() => {
    refreshOrders()
    getStoreById(storeId).then(setStore)
  }, [refreshOrders, storeId])

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  )

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status)
    refreshOrders()
  }

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    await updateOrderPaymentStatus(orderId, paymentStatus)
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
              <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>{paymentStatusLabel[order.paymentStatus]}</Badge>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
            <small className="muted">Criado em {new Date(order.createdAt).toLocaleString('pt-BR')}</small>
            {order.paidAt && (
              <small className="muted">Pago em {new Date(order.paidAt).toLocaleString('pt-BR')}</small>
            )}

            {order.customerPhone && (
              <p className="muted">Telefone: {order.customerPhone}</p>
            )}
            {order.deliveryType && (
              <p className="muted">
                {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
                {order.address ? ` — ${order.address}` : ''}
              </p>
            )}
            {order.paymentMethod && (
              <p className="muted">Pagamento: {order.paymentMethod}</p>
            )}
            {order.notes && (
              <p className="muted">Obs: {order.notes}</p>
            )}

            {order.items && order.items.length > 0 && (
              <div className="stack" style={{ gap: '0.25rem', marginTop: '0.5rem' }}>
                <small className="muted" style={{ fontWeight: 600 }}>Itens:</small>
                {order.items.map((item) => (
                  <small key={item.product_id} className="muted">
                    {item.productName} × {item.quantity} — {formatCurrency(item.price * item.quantity)}
                  </small>
                ))}
              </div>
            )}

            <div className="inline-info" style={{ flexWrap: 'wrap' }}>
              {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleUpdatePaymentStatus(order.id, 'paid')}
                >
                  Confirmar pagamento
                </Button>
              )}
              {order.paymentStatus === 'paid' && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleUpdatePaymentStatus(order.id, 'refunded')}
                  disabled={order.status === 'cancelled'}
                >
                  Estornar pagamento
                </Button>
              )}
              {orderStatusActions.map((action) => (
                <Button
                  key={action.status}
                  type="button"
                  variant="secondary"
                  onClick={() => handleUpdateStatus(order.id, action.status)}
                  disabled={order.status === action.status || order.status === 'cancelled'}
                >
                  {action.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="danger"
                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                disabled={order.status === 'cancelled'}
              >
                Cancelar pedido
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
